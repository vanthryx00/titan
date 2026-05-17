"""
Outreach email generator + sender.

Generates a personalized cold email that references the prospect's actual
security gaps discovered by the scanner, with a Stripe checkout link as the CTA.
"""

from __future__ import annotations

import os
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

import google.generativeai as genai

# ─── Config ───────────────────────────────────────────────────────────────────

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
FROM_NAME = os.getenv("FROM_NAME", "Ryan — Bug Reaper Security")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY:
    genai.configure(api_key=GEMINI_API_KEY)


def _finding_bullets(findings: list[dict[str, Any]]) -> str:
    """Format top findings as plain-text bullets for the email body."""
    priority_order = {"CRITICAL": 0, "HIGH": 1, "MEDIUM": 2, "LOW": 3}
    top = sorted(findings, key=lambda f: priority_order.get(f["severity"], 9))[:4]
    lines = []
    for f in top:
        emoji = {"CRITICAL": "🔴", "HIGH": "🟠", "MEDIUM": "🟡", "LOW": "🔵"}.get(f["severity"], "•")
        lines.append(f"  {emoji} {f['detail']}")
    return "\n".join(lines)


def generate_email(
    *,
    business_name: str,
    domain: str,
    contact_name: str | None,
    vertical: str,
    score_pct: float,
    verdict: str,
    findings: list[dict[str, Any]],
    checkout_url: str,
) -> tuple[str, str]:
    """
    Return (subject, html_body) for the outreach email.
    Uses Gemini to personalise the body; falls back to a template if API unavailable.
    """
    greeting = f"Hi {contact_name.split()[0]}," if contact_name else f"Hi there,"
    bullets = _finding_bullets(findings)
    critical = sum(1 for f in findings if f["severity"] == "CRITICAL")
    high = sum(1 for f in findings if f["severity"] == "HIGH")

    subject = f"Security gaps found on {domain} ({score_pct:.0f}/100 risk score)"
    if critical:
        subject = f"[CRITICAL] {critical} critical security issue{'s' if critical > 1 else ''} found on {domain}"

    if GEMINI_API_KEY:
        prompt = f"""You are a cybersecurity consultant writing a brief, professional cold email to a business owner.

Business: {business_name} (vertical: {vertical})
Domain: {domain}
Risk score: {score_pct:.0f}/100 — {verdict.replace('_', ' ')}
Issues found:
{bullets}

Write a 3-paragraph email (NO subject line, just body):
1. Brief intro: you scanned their domain and found {len(findings)} issues including {critical} critical and {high} high severity
2. Highlight the 2 most damaging issues in plain business terms (lost revenue, customer trust, regulatory risk)
3. CTA: offer a full Security Report for $297 CAD that details every issue with step-by-step fixes. Link: {checkout_url}

Tone: direct, professional, no fluff. Under 200 words total. Do not use markdown."""

        try:
            model = genai.GenerativeModel("gemini-2.0-flash")
            response = model.generate_content(prompt)
            body_text = response.text.strip()
        except Exception:
            body_text = _fallback_body(
                greeting, business_name, domain, bullets, len(findings), checkout_url
            )
    else:
        body_text = _fallback_body(
            greeting, business_name, domain, bullets, len(findings), checkout_url
        )

    html = _wrap_html(body_text, business_name, domain, score_pct, checkout_url)
    return subject, html


def _fallback_body(
    greeting: str,
    business_name: str,
    domain: str,
    bullets: str,
    finding_count: int,
    checkout_url: str,
) -> str:
    return f"""{greeting}

I ran a quick external security scan on {domain} and found {finding_count} issues that could expose {business_name} to data breaches, phishing attacks, or downtime:

{bullets}

These aren't theoretical risks — attackers actively scan for exactly these gaps. A breach can cost tens of thousands in recovery, customer loss, and regulatory fines.

For $297 CAD I'll send you a full Security Report: every issue explained in plain English, ranked by impact, with step-by-step fixes your IT team can action today.

Get the report here: {checkout_url}

No subscription. No sales call needed. Just the report.

— Ryan
Bug Reaper Security"""


def _wrap_html(
    body_text: str,
    business_name: str,
    domain: str,
    score_pct: float,
    checkout_url: str,
) -> str:
    paragraphs = "".join(
        f"<p style='margin:0 0 14px;'>{p.strip()}</p>"
        for p in body_text.split("\n\n")
        if p.strip()
    )
    bar_color = "#ef4444" if score_pct >= 60 else "#f97316" if score_pct >= 30 else "#eab308"
    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"/></head>
<body style="font-family:Arial,sans-serif;font-size:15px;color:#1a1a1a;max-width:560px;margin:0 auto;padding:24px;">
  <div style="background:#111;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
    <span style="color:#fff;font-weight:700;font-size:17px;">🔍 Bug Reaper Security</span>
    <span style="float:right;color:#9ca3af;font-size:13px;">{domain} — {score_pct:.0f}/100 risk</span>
  </div>
  <div style="background:#fef2f2;border-left:4px solid {bar_color};padding:12px 16px;border-radius:4px;margin-bottom:20px;">
    <span style="font-size:13px;color:#991b1b;font-weight:600;">Risk Score: {score_pct:.0f} / 100</span>
  </div>
  {paragraphs}
  <div style="text-align:center;margin:28px 0;">
    <a href="{checkout_url}"
       style="background:#111;color:#fff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:700;font-size:16px;display:inline-block;">
      Get the Security Report — $297 CAD
    </a>
  </div>
  <p style="font-size:12px;color:#9ca3af;border-top:1px solid #e5e7eb;padding-top:16px;margin-top:24px;">
    Bug Reaper Security · Alberta, Canada<br>
    <a href="{{unsubscribe_url}}" style="color:#9ca3af;">Unsubscribe</a>
  </p>
</body>
</html>"""


def send_email(to_email: str, subject: str, html_body: str) -> bool:
    """Send via SMTP. Returns True on success."""
    if not SMTP_USER or not SMTP_PASS:
        raise EnvironmentError("SMTP_USER and SMTP_PASS must be set in .env")

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
    msg["To"] = to_email
    msg["X-Mailer"] = "BugReaper/1.0"

    # Strip HTML for plain-text part (basic)
    import re
    plain = re.sub(r"<[^>]+>", "", html_body).strip()
    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html_body, "html"))

    ctx = ssl.create_default_context()
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls(context=ctx)
        server.login(SMTP_USER, SMTP_PASS)
        server.sendmail(FROM_EMAIL, to_email, msg.as_string())
    return True
