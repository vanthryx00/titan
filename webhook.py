"""
Stripe webhook server — payment → PDF report delivery → client record creation.

Handles: payment_intent.succeeded, checkout.session.completed

Usage:
  python webhook.py              # starts on port 8080
  python webhook.py --port 9000

Local testing:
  stripe listen --forward-to localhost:8080/webhook
  stripe trigger payment_intent.succeeded

Required env vars:
  STRIPE_WEBHOOK_SECRET   (whsec_... from Stripe dashboard)
  STRIPE_SECRET_KEY
  SMTP_USER, SMTP_PASS    (to email the PDF)
  SUPABASE_ANON_KEY
"""

from __future__ import annotations

import argparse
import hashlib
import hmac
import json
import logging
import os
import time
from datetime import datetime, timezone
from http.server import BaseHTTPRequestHandler, HTTPServer
from typing import Any

log = logging.getLogger("bugreaper.webhook")
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s [%(levelname)s] %(message)s",
)

WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
STRIPE_KEY = os.getenv("STRIPE_SECRET_KEY", "")
WEBHOOK_PORT = int(os.getenv("WEBHOOK_PORT", "8080"))


def _verify_stripe_signature(payload: bytes, sig_header: str, secret: str) -> bool:
    """Verify Stripe webhook signature using stdlib hmac + hashlib."""
    if not secret:
        log.warning("STRIPE_WEBHOOK_SECRET not set — skipping signature verification")
        return True

    try:
        # sig_header: t=1234,v1=abc123,v1=def456,...
        parts = dict(item.split("=", 1) for item in sig_header.split(",") if "=" in item)
        timestamp = parts.get("t", "")
        signatures = [v for k, v in parts.items() if k == "v1"]

        signed_payload = f"{timestamp}.".encode() + payload
        expected = hmac.new(secret.encode(), signed_payload, hashlib.sha256).hexdigest()
        return any(hmac.compare_digest(expected, sig) for sig in signatures)
    except Exception as exc:
        log.error("Signature verification error: %s", exc)
        return False


def _extract_metadata(event: dict) -> dict[str, str]:
    """Pull customer_email, domain, business from various event structures."""
    obj = event.get("data", {}).get("object", {})
    meta = obj.get("metadata", {})

    # checkout.session.completed
    if event.get("type") == "checkout.session.completed":
        return {
            "email": obj.get("customer_email") or obj.get("customer_details", {}).get("email", ""),
            "domain": meta.get("domain", ""),
            "business": meta.get("business_name") or meta.get("business", ""),
            "lead_id": meta.get("lead_id", ""),
            "amount": str(obj.get("amount_total", 0)),
        }

    # payment_intent.succeeded
    return {
        "email": obj.get("receipt_email") or "",
        "domain": meta.get("domain", ""),
        "business": meta.get("business_name") or meta.get("business", ""),
        "lead_id": meta.get("lead_id", ""),
        "amount": str(obj.get("amount", 0)),
    }


def _create_client_record(email: str, business: str, domain: str) -> int | None:
    """Create or update client record and mark lead as converted."""
    try:
        from supabase_client import get_client
        sb = get_client()

        # Look up lead by email or domain
        lead_res = sb.table("leads").select("id").eq("email", email).limit(1).execute()
        lead_id = lead_res.data[0]["id"] if lead_res.data else None

        if not lead_id:
            # Try by website containing the domain
            lead_res2 = sb.table("leads").select("id").ilike("website", f"%{domain}%").limit(1).execute()
            lead_id = lead_res2.data[0]["id"] if lead_res2.data else None

        # Insert client
        sb.table("clients").upsert({
            "business_name": business or domain,
            "contact_email": email,
            "status": "active",
            "mrr": 0,
            "ltv": 297,
            **({"lead_id": lead_id} if lead_id else {}),
        }, on_conflict="contact_email").execute()

        # Update lead
        if lead_id:
            sb.table("leads").update({"status": "client"}).eq("id", lead_id).execute()
            sb.table("lead_pipeline").update({
                "status": "converted",
                "sequence_complete": True,
                "converted": True,
            }).eq("lead_id", lead_id).execute()

        log.info("Client record created for %s (%s)", business, email)
        return lead_id
    except Exception as exc:
        log.error("create_client_record failed: %s", exc)
        return None


def _log_stripe_event(stripe_event_id: str, event_type: str, meta: dict) -> None:
    try:
        from supabase_client import get_client
        get_client().table("stripe_events").upsert({
            "stripe_event_id": stripe_event_id,
            "event_type": event_type,
            "customer_email": meta.get("email", ""),
            "amount": float(meta.get("amount", 0)) / 100,
            "currency": "CAD",
            "processed": True,
            **({"lead_id": int(meta["lead_id"])} if meta.get("lead_id") else {}),
        }, on_conflict="stripe_event_id").execute()
    except Exception as exc:
        log.warning("stripe_events log failed: %s", exc)


def _handle_payment(event: dict) -> None:
    """Core handler: generate PDF, email it, create client record."""
    meta = _extract_metadata(event)
    email = meta.get("email", "")
    domain = meta.get("domain", "")
    business = meta.get("business", "") or domain

    log.info("Payment received: %s (%s)", business, email)

    if not email:
        log.warning("No email in payment event — cannot deliver report")
        return

    # Generate PDF (domain may be empty if metadata wasn't passed through)
    if domain:
        from report import generate_report, email_report
        try:
            lead_id = int(meta["lead_id"]) if meta.get("lead_id") else None
            pdf_path = generate_report(domain, business, email, lead_id=lead_id)
            email_report(pdf_path, email, business, domain)
        except Exception as exc:
            log.error("Report generation/delivery failed: %s", exc)
    else:
        log.warning("No domain in payment metadata — sending acknowledgement only")
        # Send simple confirmation email
        try:
            from run import send as smtp_send
            smtp_send(
                email,
                "Your Bug Reaper Security Report",
                "<p>Thank you for your purchase. We'll prepare your report and send it within 24 hours. "
                "Reply to this email with your domain if you haven't already.</p>"
            )
        except Exception:
            pass

    # Create client record
    _create_client_record(email, business, domain)

    # Log event
    _log_stripe_event(
        event.get("id", f"manual_{int(time.time())}"),
        event.get("type", "payment"),
        meta,
    )


class WebhookHandler(BaseHTTPRequestHandler):
    def log_message(self, fmt: str, *args: Any) -> None:
        log.debug(fmt % args)  # Suppress default HTTP log spam

    def do_GET(self) -> None:
        if self.path == "/health":
            self._respond(200, b"OK")
        else:
            self._respond(404, b"Not Found")

    def do_POST(self) -> None:
        if self.path != "/webhook":
            self._respond(404, b"Not Found")
            return

        length = int(self.headers.get("Content-Length", 0))
        payload = self.rfile.read(length)
        sig = self.headers.get("Stripe-Signature", "")

        if not _verify_stripe_signature(payload, sig, WEBHOOK_SECRET):
            log.warning("Invalid Stripe signature — rejecting webhook")
            self._respond(400, b"Invalid signature")
            return

        try:
            event = json.loads(payload)
        except json.JSONDecodeError:
            self._respond(400, b"Invalid JSON")
            return

        event_type = event.get("type", "")
        log.info("Received event: %s", event_type)

        if event_type in ("payment_intent.succeeded", "checkout.session.completed"):
            try:
                _handle_payment(event)
            except Exception as exc:
                log.exception("Error handling payment event: %s", exc)
                # Still return 200 to Stripe — we'll handle delivery manually
                # Returning 5xx would cause Stripe to retry

        self._respond(200, b"OK")

    def _respond(self, status: int, body: bytes) -> None:
        self.send_response(status)
        self.send_header("Content-Type", "text/plain")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


def run_server(port: int = WEBHOOK_PORT) -> None:
    server = HTTPServer(("0.0.0.0", port), WebhookHandler)
    log.info("Webhook server listening on port %d", port)
    log.info("Health check: http://localhost:%d/health", port)
    log.info("Webhook endpoint: http://localhost:%d/webhook", port)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        log.info("Shutting down")
        server.shutdown()


if __name__ == "__main__":
    p = argparse.ArgumentParser(description="Bug Reaper Stripe webhook server")
    p.add_argument("--port", type=int, default=WEBHOOK_PORT)
    args = p.parse_args()
    run_server(args.port)
