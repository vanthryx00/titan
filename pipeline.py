"""
Bug Reaper batch pipeline — autonomous lead-to-email orchestrator.

Usage:
  python pipeline.py                           # auto-picks vertical + city, 10 leads
  python pipeline.py --vertical dentist --limit 20
  python pipeline.py --city Edmonton --limit 5
  python pipeline.py --dry-run                 # scan + print, no emails sent

What it does per lead:
  1. Discover leads via Google Places API
  2. Check suppression list + dedup
  3. Scan domain for security issues
  4. Gate: skip if score < MIN_SCORE
  5. Create Stripe checkout link
  6. Generate + send personalised email
  7. Log to outreach_log + lead_pipeline in Supabase
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
import time
from datetime import datetime, timedelta, timezone
from typing import Any

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("bugreaper.pipeline")

MIN_SCORE = 20
BATCH_LIMIT = 50


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _is_suppressed(email: str) -> bool:
    if not email:
        return False
    try:
        from supabase_client import get_client
        sb = get_client()
        sup = sb.table("suppression_list").select("id").eq("email", email.lower()).limit(1).execute()
        if sup.data:
            return True
        unsub = (
            sb.table("outreach_log")
            .select("id")
            .eq("email_template", email.lower())  # stored in email field via join
            .eq("unsubscribed", True)
            .limit(1)
            .execute()
        )
        return bool(unsub.data)
    except Exception:
        return False


def _already_contacted(lead_id: int) -> bool:
    try:
        from supabase_client import get_client
        res = (
            get_client()
            .table("outreach_log")
            .select("id")
            .eq("lead_id", lead_id)
            .limit(1)
            .execute()
        )
        return bool(res.data)
    except Exception:
        return False


def _log_outreach(lead_id: int, subject: str, step: int = 0) -> None:
    try:
        from supabase_client import get_client
        due = (_now() + timedelta(days=3)).isoformat()
        get_client().table("outreach_log").insert({
            "lead_id": lead_id,
            "email_subject": subject,
            "email_template": f"cold_scan_step{step}",
            "sent_at": _now().isoformat(),
            "follow_up_due_date": due,
        }).execute()
    except Exception as exc:
        log.warning("outreach_log insert failed: %s", exc)


def _log_pipeline(lead_id: int) -> None:
    try:
        from supabase_client import get_client
        due = (_now() + timedelta(days=3)).isoformat()
        get_client().table("lead_pipeline").upsert({
            "lead_id": lead_id,
            "status": "contacted",
            "follow_up_step": 1,
            "last_contacted": _now().isoformat(),
            "sequence_complete": False,
        }, on_conflict="lead_id").execute()
    except Exception as exc:
        log.warning("lead_pipeline insert failed: %s", exc)


def _log_scan(lead_id: int, result: dict) -> None:
    try:
        import db
        row = db.insert_scan_result(
            scan_type="external_domain_scan",
            target=result["domain"],
            engine="bugreaper_v1",
            lead_id=lead_id,
            triggered_by="pipeline",
        )
        db.complete_scan_result(
            row["id"],
            findings=result["findings"],
            score=int(result.get("score_pct", result.get("score", 0))),
            score_pct=result.get("score_pct", result.get("score", 0)),
            verdict=result.get("verdict", "UNKNOWN").replace(" ", "_"),
            severity=_top_severity(result["findings"]),
        )
    except Exception as exc:
        log.warning("scan_results insert failed: %s", exc)


def _top_severity(findings: list[dict]) -> str | None:
    for s in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]:
        if any(f.get("severity") == s for f in findings):
            return s
    return None


def run_lead(lead: dict, dry_run: bool = False) -> dict[str, Any]:
    """Process a single lead through the full pipeline. Returns status dict."""
    from run import scan, checkout_link, build_email, send

    lead_id = lead.get("id")
    email = lead.get("email", "")
    website = lead.get("website", "")
    business = lead.get("business_name", "")

    domain = (
        website.lower()
        .removeprefix("https://")
        .removeprefix("http://")
        .split("/")[0]
        .strip()
    )
    if not domain or "." not in domain:
        return {"skipped": "no_domain", "lead_id": lead_id}

    if not email:
        return {"skipped": "no_email", "lead_id": lead_id}

    if _is_suppressed(email):
        return {"skipped": "suppressed", "lead_id": lead_id}

    if lead_id and _already_contacted(lead_id):
        return {"skipped": "already_contacted", "lead_id": lead_id}

    # ── Scan ──────────────────────────────────────────────────────────────────
    log.info("Scanning %s ...", domain)
    result = scan(domain)

    if result["score"] < MIN_SCORE:
        try:
            import db
            if lead_id:
                db.update_lead_status(lead_id, "too_clean")
        except Exception:
            pass
        return {"skipped": "score_too_low", "score": result["score"], "lead_id": lead_id}

    # ── Stripe ────────────────────────────────────────────────────────────────
    try:
        link = checkout_link(domain=domain, email=email, business_name=business)
    except Exception:
        link = f"https://bugreaper.io/checkout?lead={lead_id}"

    # ── Email ─────────────────────────────────────────────────────────────────
    subject, html_body = build_email(
        domain=domain,
        business=business,
        result=result,
        link=link,
    )

    if dry_run:
        print(f"\n[DRY RUN] {business} <{email}>")
        print(f"  Domain: {domain} | Score: {result['score']}/100 | Findings: {len(result['findings'])}")
        print(f"  Subject: {subject}")
        print(f"  Link: {link}")
        return {"dry_run": True, "lead_id": lead_id, "score": result["score"]}

    # ── Send ──────────────────────────────────────────────────────────────────
    sent = False
    try:
        send(email, subject, html_body)
        sent = True
    except EnvironmentError:
        log.warning("SMTP not configured — skipping send for %s", email)
    except Exception as exc:
        log.error("Send failed for %s: %s", email, exc)

    # ── Log ───────────────────────────────────────────────────────────────────
    if lead_id:
        _log_scan(lead_id, result)
        _log_outreach(lead_id, subject)
        _log_pipeline(lead_id)
        try:
            import db
            db.update_lead_status(lead_id, "contacted")
        except Exception:
            pass

    return {
        "success": True,
        "lead_id": lead_id,
        "domain": domain,
        "score": result["score"],
        "findings": len(result["findings"]),
        "email_sent": sent,
    }


def run_pipeline(
    vertical: str | None = None,
    city: str | None = None,
    limit: int = 10,
    min_score: int = MIN_SCORE,
    dry_run: bool = False,
) -> dict[str, Any]:
    """
    Full pipeline run: discover leads → scan → email → log.
    Returns summary dict.
    """
    from sources.places import discover_leads, upsert_leads

    global MIN_SCORE
    MIN_SCORE = min_score

    log.info("Starting pipeline: vertical=%s city=%s limit=%d dry_run=%s",
             vertical or "auto", city or "auto", limit, dry_run)

    # 1. Discover
    raw_leads = discover_leads(vertical=vertical, city=city, max_results=limit)
    if not raw_leads:
        log.warning("No leads discovered — check GOOGLE_PLACES_API_KEY")
        return {"discovered": 0, "scanned": 0, "emailed": 0, "skipped": 0}

    # 2. Upsert to DB (get IDs)
    if not dry_run:
        ids = upsert_leads(raw_leads)
        # Reload from DB to get assigned IDs
        try:
            from supabase_client import get_client
            websites = [l["website"] for l in raw_leads if l.get("website")]
            db_leads = []
            for website in websites:
                res = get_client().table("leads").select("*").eq("website", website).limit(1).execute()
                if res.data:
                    db_leads.append(res.data[0])
            leads_to_process = db_leads[:limit]
        except Exception:
            leads_to_process = raw_leads[:limit]
    else:
        leads_to_process = raw_leads[:limit]

    # 3. Process each lead
    summary = {"discovered": len(raw_leads), "scanned": 0, "emailed": 0, "skipped": 0, "errors": 0}

    for lead in leads_to_process:
        try:
            result = run_lead(lead, dry_run=dry_run)
            summary["scanned"] += 1
            if result.get("skipped"):
                summary["skipped"] += 1
                log.debug("Lead %s skipped: %s", lead.get("id", "?"), result["skipped"])
            elif result.get("email_sent") or result.get("dry_run"):
                summary["emailed"] += 1
                log.info("✓ %s (%s) — score %s | findings %s",
                         lead.get("business_name", "?"),
                         result.get("domain", "?"),
                         result.get("score", "?"),
                         result.get("findings", "?"))
        except Exception as exc:
            log.exception("Error processing lead %s: %s", lead.get("id"), exc)
            summary["errors"] += 1

        time.sleep(1)  # polite gap between SMTP sends

    log.info("Pipeline done: %s", summary)
    return summary


def main() -> None:
    p = argparse.ArgumentParser(description="Bug Reaper batch pipeline")
    p.add_argument("--vertical", help="Business vertical (e.g. plumber, dentist)")
    p.add_argument("--city", help="Alberta city (default: auto-picked)")
    p.add_argument("--limit", type=int, default=10, help="Max leads to process")
    p.add_argument("--min-score", type=int, default=MIN_SCORE, dest="min_score",
                   help="Minimum risk score to email (default: 20)")
    p.add_argument("--dry-run", action="store_true", dest="dry_run",
                   help="Scan and print without sending emails or saving to DB")
    args = p.parse_args()

    result = run_pipeline(
        vertical=args.vertical,
        city=args.city,
        limit=args.limit,
        min_score=args.min_score,
        dry_run=args.dry_run,
    )
    print(f"\nSummary: {result}")


if __name__ == "__main__":
    main()
