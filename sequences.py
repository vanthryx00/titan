"""
Multi-touch follow-up sequence runner.

Run this daily via cron at 9am:
  python sequences.py
  python sequences.py --dry-run

Checks lead_pipeline for records where follow_up_due_date <= now()
and sequence_complete = false, then sends the appropriate follow-up email.

4-step sequence:
  Step 0: Initial cold email (sent by pipeline.py, not this file)
  Step 1 (Day +3): Urgency — repeat top 2 findings
  Step 2 (Day +4): Pattern interrupt — 3 sentences
  Step 3 (Day +7): Final close — "closing your file"
"""

from __future__ import annotations

import argparse
import logging
import os
import time
from datetime import datetime, timedelta, timezone
from typing import Any

logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s [%(levelname)s] %(message)s",
)
log = logging.getLogger("bugreaper.sequences")

STEP_DELAYS = {1: 3, 2: 4, 3: 7}  # days until next step after current


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _get_due_followups() -> list[dict]:
    """Return lead_pipeline rows where a follow-up is due."""
    try:
        from supabase_client import get_client
        now_iso = _now().isoformat()
        res = (
            get_client()
            .table("lead_pipeline")
            .select("*, leads(*)")
            .lte("follow_up_due_date", now_iso)
            .eq("sequence_complete", False)
            .neq("status", "client")
            .execute()
        )
        return res.data or []
    except Exception as exc:
        log.error("Failed to fetch due followups: %s", exc)
        return []


def _get_scan_findings(lead_id: int) -> list[dict]:
    """Retrieve the most recent scan findings for a lead."""
    try:
        from supabase_client import get_client
        res = (
            get_client()
            .table("scan_results")
            .select("findings,score_pct,verdict")
            .eq("lead_id", lead_id)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        if res.data:
            return res.data[0].get("findings", [])
    except Exception:
        pass
    return []


def _get_checkout_link(lead: dict) -> str:
    """Re-generate or retrieve the Stripe checkout link."""
    try:
        from run import checkout_link
        website = lead.get("website", "")
        domain = (
            website.lower()
            .removeprefix("https://")
            .removeprefix("http://")
            .split("/")[0]
        )
        return checkout_link(
            domain=domain,
            email=lead.get("email", ""),
            business_name=lead.get("business_name", ""),
        )
    except Exception:
        return f"https://bugreaper.io/checkout?lead={lead.get('id','')}"


def _build_step_email(
    step: int,
    lead: dict,
    findings: list[dict],
    link: str,
) -> tuple[str, str]:
    """Return (subject, plain_text_body) for the given step."""
    business = lead.get("business_name", "your business")
    domain = (lead.get("website", "") or "").replace("https://", "").replace("http://", "").split("/")[0]
    name = (lead.get("contact_name") or "").split()[0] if lead.get("contact_name") else ""
    greeting = f"Hi {name}," if name else "Hi,"

    top_findings = sorted(
        findings,
        key=lambda f: {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}.get(f.get("severity", "LOW"), 9),
    )[:2]
    bullets = "\n".join(f"  • {f.get('detail', '')}" for f in top_findings)

    if step == 1:
        subject = f"Still exposed: {domain} — quick update"
        body = (
            f"{greeting}\n\n"
            f"I wanted to follow up on the security issues I found on {domain} last week.\n\n"
            f"The two most critical problems are still present:\n{bullets}\n\n"
            f"Research shows 90% of businesses that experience a breach had at least one of these gaps "
            f"open for more than 30 days before the attack. The longer this sits, the higher the risk.\n\n"
            f"The full Security Report ($297 CAD) walks through every issue with step-by-step fixes:\n{link}\n\n"
            f"— Ryan\nBug Reaper Security"
        )
    elif step == 2:
        subject = f"Quick question — {domain}"
        body = (
            f"{greeting}\n\n"
            f"Did my last two emails land in your spam folder? "
            f"I found some security issues on {domain} I think you'd want to know about.\n\n"
            f"Just reply 'not interested' and I won't send another one.\n\n"
            f"— Ryan\nBug Reaper Security"
        )
    else:  # step == 3
        subject = f"Closing your file — {business}"
        body = (
            f"{greeting}\n\n"
            f"I'm closing your file today — I don't want to keep filling your inbox.\n\n"
            f"If the security gaps on {domain} aren't a priority right now, no hard feelings. "
            f"The report link stays valid for 30 days if you change your mind:\n{link}\n\n"
            f"Stay safe out there.\n\n"
            f"— Ryan\nBug Reaper Security"
        )

    # Try to enhance with Gemini
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    if gemini_key and step != 2:  # step 2 is intentionally short — don't expand it
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-2.0-flash")
            prompt = (
                f"Rewrite this follow-up email (step {step} of 3) to be more compelling. "
                f"Keep the same structure and facts, improve the persuasion. Under 150 words. "
                f"Do not add subject line:\n\n{body}"
            )
            result = model.generate_content(prompt)
            body = result.text.strip()
        except Exception:
            pass

    return subject, body


def _advance_pipeline(pipeline_id: int | str, step: int) -> None:
    """Update lead_pipeline to the next step."""
    try:
        from supabase_client import get_client
        if step >= 3:
            get_client().table("lead_pipeline").update({
                "sequence_complete": True,
                "status": "sequence_done",
                "follow_up_step": step + 1,
            }).eq("id", pipeline_id).execute()
        else:
            next_due = (_now() + timedelta(days=STEP_DELAYS.get(step + 1, 7))).isoformat()
            get_client().table("lead_pipeline").update({
                "follow_up_step": step + 1,
            }).eq("id", pipeline_id).execute()
    except Exception as exc:
        log.warning("advance_pipeline failed: %s", exc)


def _add_to_suppression(email: str, reason: str) -> None:
    try:
        from supabase_client import get_client
        get_client().table("suppression_list").upsert(
            {"email": email.lower(), "reason": reason},
            on_conflict="email",
        ).execute()
    except Exception:
        pass


def _log_followup(lead_id: int, subject: str, step: int) -> None:
    try:
        from supabase_client import get_client
        get_client().table("outreach_log").insert({
            "lead_id": lead_id,
            "email_subject": subject,
            "email_template": f"followup_step{step}",
            "sent_at": _now().isoformat(),
        }).execute()
    except Exception as exc:
        log.warning("outreach_log insert failed: %s", exc)


def run_sequences(dry_run: bool = False) -> dict[str, int]:
    """Process all due follow-ups. Returns summary dict."""
    from run import send

    due = _get_due_followups()
    log.info("Found %d due follow-ups", len(due))

    summary = {"processed": 0, "sent": 0, "completed": 0, "skipped": 0, "errors": 0}

    for record in due:
        lead = record.get("leads") or {}
        if isinstance(lead, list):
            lead = lead[0] if lead else {}

        lead_id = record.get("lead_id")
        pipeline_id = record.get("id")
        step = record.get("follow_up_step", 1)
        email = lead.get("email", "")

        if not email or not lead_id:
            summary["skipped"] += 1
            continue

        # Check for bounces → suppress
        try:
            from supabase_client import get_client
            bounce = (
                get_client()
                .table("outreach_log")
                .select("id")
                .eq("lead_id", lead_id)
                .eq("bounced", True)
                .limit(1)
                .execute()
            )
            if bounce.data:
                _add_to_suppression(email, "bounce")
                _advance_pipeline(pipeline_id, 3)  # Mark sequence done
                summary["skipped"] += 1
                continue
        except Exception:
            pass

        findings = _get_scan_findings(lead_id)
        link = _get_checkout_link(lead)
        subject, body = _build_step_email(step, lead, findings, link)

        if dry_run:
            print(f"\n[DRY RUN] Step {step} → {lead.get('business_name')} <{email}>")
            print(f"  Subject: {subject}")
            summary["processed"] += 1
            summary["sent"] += 1
            continue

        try:
            send(email, subject, body)
            _log_followup(lead_id, subject, step)
            _advance_pipeline(pipeline_id, step)
            if step >= 3:
                summary["completed"] += 1
            summary["sent"] += 1
            log.info("Step %d sent → %s (%s)", step, lead.get("business_name"), email)
        except EnvironmentError:
            log.warning("SMTP not configured — skipping %s", email)
            summary["skipped"] += 1
        except Exception as exc:
            log.error("Send failed for %s: %s", email, exc)
            summary["errors"] += 1

        summary["processed"] += 1
        time.sleep(1)

    log.info("Sequences done: %s", summary)
    return summary


def main() -> None:
    p = argparse.ArgumentParser(description="Bug Reaper follow-up sequence runner")
    p.add_argument("--dry-run", action="store_true", dest="dry_run",
                   help="Preview emails without sending")
    args = p.parse_args()
    result = run_sequences(dry_run=args.dry_run)
    print(f"\nSummary: {result}")


if __name__ == "__main__":
    main()
