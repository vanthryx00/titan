"""
Autonomous revenue pipeline.

One call to `run_lead(lead_id)` takes a prospect all the way from
"has a domain" → scan → score filter → email sent → logged.

`run_batch()` processes all unsent leads in the database.
"""

from __future__ import annotations

import logging
import time
from typing import Any

import db
from engine.scanner import scan_domain
from engine.outreach import generate_email, send_email
from engine.checkout import create_checkout_link

logger = logging.getLogger(__name__)

# Only reach out to leads with a risk score above this threshold.
# Below this the scan didn't find enough problems to justify cold email.
MIN_SCORE_TO_OUTREACH = 15

# Max emails per run to avoid hammering SMTP limits
BATCH_LIMIT = 50


def run_lead(lead_id: int) -> dict[str, Any]:
    """
    Full pipeline for a single lead. Returns a status dict.
    Raises on hard failures; returns {"skipped": reason} for soft skips.
    """
    lead = db.get_lead(lead_id)
    if not lead:
        return {"skipped": "lead_not_found", "lead_id": lead_id}

    email = lead.get("email")
    website = lead.get("website") or ""
    domain = _extract_domain(website)

    if not domain:
        return {"skipped": "no_domain", "lead_id": lead_id}

    if not email:
        return {"skipped": "no_email", "lead_id": lead_id}

    # ── 1. Scan ──────────────────────────────────────────────────────────────
    logger.info("Scanning %s (lead %s)", domain, lead_id)
    scan = scan_domain(domain)

    # Persist scan result
    result_row = db.insert_scan_result(
        scan_type="external_domain_scan",
        target=domain,
        engine="bugreaper_v1",
        lead_id=lead_id,
        triggered_by="pipeline",
    )
    db.complete_scan_result(
        result_row["id"],
        findings=scan["findings"],
        score=scan["score_pct"],
        score_pct=scan["score_pct"],
        verdict=scan["verdict"],
        severity=_top_severity(scan["findings"]),
    )

    # ── 2. Score gate ────────────────────────────────────────────────────────
    if scan["score_pct"] < MIN_SCORE_TO_OUTREACH:
        db.update_lead_status(lead_id, "low_risk_skipped")
        return {"skipped": "score_too_low", "score": scan["score_pct"], "lead_id": lead_id}

    # ── 3. Checkout link ─────────────────────────────────────────────────────
    try:
        checkout_url = create_checkout_link(
            lead_id=lead_id,
            domain=domain,
            business_name=lead["business_name"],
            email=email,
        )
    except EnvironmentError as exc:
        # Stripe not configured yet — use placeholder so we can still test emails
        checkout_url = f"https://bugreaper.io/checkout?lead={lead_id}"
        logger.warning("Stripe not configured (%s) — using placeholder URL", exc)

    # ── 4. Generate email ────────────────────────────────────────────────────
    subject, html_body = generate_email(
        business_name=lead["business_name"],
        domain=domain,
        contact_name=lead.get("contact_name"),
        vertical=lead.get("vertical", "business"),
        score_pct=scan["score_pct"],
        verdict=scan["verdict"],
        findings=scan["findings"],
        checkout_url=checkout_url,
    )

    # ── 5. Send ──────────────────────────────────────────────────────────────
    try:
        send_email(email, subject, html_body)
        sent = True
    except EnvironmentError as exc:
        logger.warning("SMTP not configured (%s) — logging email only", exc)
        sent = False
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", email, exc)
        sent = False

    # ── 6. Log outreach ──────────────────────────────────────────────────────
    from supabase_client import get_client
    get_client().table("outreach_log").insert(
        {
            "lead_id": lead_id,
            "email_subject": subject,
            "email_template": "cold_scan_v1",
        }
    ).execute()

    # Mark lead as contacted
    db.update_lead_status(lead_id, "contacted")

    return {
        "success": True,
        "lead_id": lead_id,
        "domain": domain,
        "score_pct": scan["score_pct"],
        "verdict": scan["verdict"],
        "findings": len(scan["findings"]),
        "email_sent": sent,
        "checkout_url": checkout_url,
    }


def run_batch(limit: int = BATCH_LIMIT) -> list[dict[str, Any]]:
    """
    Pull unsent leads from the database and run each through the pipeline.
    Respects BATCH_LIMIT and adds a small delay between sends.
    """
    leads = db.get_leads(status="new", limit=limit)
    results = []
    for lead in leads:
        try:
            result = run_lead(lead["id"])
        except Exception as exc:
            logger.exception("Pipeline error for lead %s", lead.get("id"))
            result = {"error": str(exc), "lead_id": lead.get("id")}
        results.append(result)
        time.sleep(2)  # Avoid hammering SMTP / Stripe
    return results


# ── Helpers ───────────────────────────────────────────────────────────────────

def _extract_domain(url: str) -> str | None:
    if not url:
        return None
    domain = (
        url.lower()
        .removeprefix("https://")
        .removeprefix("http://")
        .split("/")[0]
        .strip()
    )
    return domain if "." in domain else None


def _top_severity(findings: list[dict[str, Any]]) -> str | None:
    order = ["CRITICAL", "HIGH", "MEDIUM", "LOW"]
    severities = {f["severity"] for f in findings}
    for s in order:
        if s in severities:
            return s
    return None
