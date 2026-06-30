"""
PDF Security Report Generator — the product customers pay $297 for.

Usage:
  python report.py <domain> "<Business Name>" <email>
  python report.py acmeplumbing.ca "Acme Plumbing" owner@acmeplumbing.ca

Generates a professional PDF report and emails it as an attachment.
If lead_id is provided (called from webhook.py), retrieves stored findings
from Supabase. Otherwise runs a fresh extended scan.
"""

from __future__ import annotations

import os
import smtplib
import ssl
import sys
import tempfile
import time
from datetime import datetime, timezone
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Any

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASS = os.getenv("SMTP_PASS", "")
FROM_NAME = os.getenv("FROM_NAME", "Bug Reaper Security")
FROM_EMAIL = os.getenv("FROM_EMAIL", SMTP_USER)

# Hardcoded remediation steps per finding type (Gemini enhances these if available)
_REMEDIATIONS: dict[str, list[str]] = {
    "ssl_expired": [
        "Log in to your hosting control panel (cPanel, Plesk, etc.)",
        "Navigate to SSL/TLS → Manage SSL Sites",
        "Renew or replace the certificate — free options: Let's Encrypt via your host",
        "Verify renewal at https://www.ssllabs.com/ssltest/",
    ],
    "ssl_expiring_soon": [
        "Set a calendar reminder to renew 30 days before expiry",
        "Most hosts offer auto-renewal — enable it in your control panel",
        "Consider Let's Encrypt for free 90-day auto-renewing certificates",
    ],
    "ssl_invalid": [
        "Replace the self-signed or invalid certificate with a trusted CA certificate",
        "Use Let's Encrypt (free) or purchase from DigiCert, Sectigo, etc.",
        "Verify with https://www.ssllabs.com/ssltest/ after installation",
    ],
    "hsts_missing": [
        "Add 'Strict-Transport-Security: max-age=31536000; includeSubDomains' to your web server config",
        "Apache: add to .htaccess or httpd.conf under your HTTPS VirtualHost",
        "Nginx: add to your server {} block",
        "Cloudflare users: enable HSTS in SSL/TLS → Edge Certificates settings",
    ],
    "no_csp": [
        "Add a Content-Security-Policy header to your web server",
        "Start with: Content-Security-Policy: default-src 'self'",
        "Use https://csp-evaluator.withgoogle.com/ to test your policy",
        "Gradually tighten the policy — a permissive CSP is still better than none",
    ],
    "clickjacking_risk": [
        "Add 'X-Frame-Options: SAMEORIGIN' to your web server response headers",
        "Or use CSP: frame-ancestors 'self' as a modern equivalent",
    ],
    "spf_missing": [
        "Add a TXT record to your DNS: v=spf1 include:yourmailprovider.com ~all",
        "For Gmail: v=spf1 include:_spf.google.com ~all",
        "For Microsoft 365: v=spf1 include:spf.protection.outlook.com ~all",
        "Verify at https://mxtoolbox.com/spf.aspx",
    ],
    "dmarc_missing": [
        "Add a TXT record to _dmarc.yourdomain.com: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com",
        "Start with p=none to collect reports without blocking email",
        "Escalate to p=quarantine then p=reject as confidence grows",
        "Monitor reports at https://dmarc.postmarkapp.com/",
    ],
    "dmarc_policy_none": [
        "Update your DMARC record to p=quarantine or p=reject",
        "p=quarantine sends suspicious emails to spam instead of inbox",
        "p=reject blocks them entirely — the strongest protection",
        "Make the change only after reviewing DMARC aggregate reports",
    ],
    "git_exposed": [
        "Immediately block access to /.git/ in your web server config",
        "Apache .htaccess: RedirectMatch 404 /\\.git",
        "Nginx: location ~ /\\.git { deny all; }",
        "Audit what was in the repository and rotate any exposed credentials",
    ],
    "env_exposed": [
        "Block access to /.env immediately in your web server config",
        "Apache: <Files .env> deny from all </Files>",
        "Rotate ALL credentials found in the .env file (database passwords, API keys)",
        "Move secrets to environment variables set in your hosting panel, not a file",
    ],
    "cookie_no_httponly": [
        "Set the HttpOnly flag on all session cookies in your application code",
        "PHP: session_set_cookie_params(['httponly' => true])",
        "Node.js/Express: res.cookie('session', value, { httpOnly: true })",
    ],
    "cookie_no_secure": [
        "Set the Secure flag on all session cookies — this prevents transmission over HTTP",
        "PHP: session_set_cookie_params(['secure' => true])",
        "Node.js/Express: res.cookie('session', value, { secure: true })",
    ],
    "open_redirect": [
        "Validate redirect destinations — only allow URLs matching your own domain",
        "Use an allowlist of permitted redirect paths rather than accepting any URL",
        "Example check: if not redirect_url.startswith('/') and not redirect_url.startswith(YOUR_DOMAIN): abort()",
    ],
    "cms_version_exposed": [
        "Remove or suppress the <meta name='generator'> tag from your CMS theme",
        "WordPress: use a plugin like 'Remove Generator' or add to functions.php: remove_action('wp_head', 'wp_generator')",
        "Update your CMS, themes, and plugins to the latest version regardless",
    ],
    "phpinfo_exposed": [
        "Delete phpinfo.php from your web server immediately",
        "Search for any similar diagnostic files: info.php, test.php, check.php",
        "Never leave diagnostic scripts on a production server",
    ],
}

_DEFAULT_REMEDIATIONS = [
    "Consult your web developer or hosting provider about this issue",
    "Review the OWASP Top 10 guidance at https://owasp.org/www-project-top-ten/",
    "Consider scheduling a quarterly security review",
]


def _get_remediation(check: str) -> list[str]:
    """Return remediation steps for a finding. Falls back to default."""
    base = _REMEDIATIONS.get(check, _DEFAULT_REMEDIATIONS)

    gemini_key = os.getenv("GEMINI_API_KEY", "")
    if not gemini_key:
        return base

    try:
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        r = model.generate_content(
            f"Write exactly 4 concise remediation steps for fixing '{check}' on a small business website. "
            f"Plain English, no markdown, numbered 1-4. Each step under 20 words."
        )
        lines = [l.strip() for l in r.text.strip().split("\n") if l.strip() and l[0].isdigit()]
        # Strip leading "1. " etc.
        steps = [l.split(". ", 1)[-1] for l in lines if ". " in l]
        return steps[:4] if len(steps) >= 2 else base
    except Exception:
        return base


def _generate_summary(business: str, domain: str, scan: dict) -> str:
    """Generate executive summary paragraph."""
    counts = {s: sum(1 for f in scan["findings"] if f.get("severity") == s)
              for s in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]}
    default = (
        f"This report presents the findings of an external security assessment conducted on {domain}, "
        f"the web presence of {business}. The assessment identified {len(scan['findings'])} security issues: "
        f"{counts.get('CRITICAL',0)} critical, {counts.get('HIGH',0)} high, "
        f"{counts.get('MEDIUM',0)} medium, and {counts.get('LOW',0)} low severity.\n\n"
        f"These findings represent real risks — attackers continuously and automatically scan for exactly "
        f"these patterns. Unaddressed, they can lead to data breaches, customer trust erosion, regulatory "
        f"penalties, and business disruption. This report provides specific, actionable steps to resolve each issue."
    )
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    if not gemini_key:
        return default
    try:
        import google.generativeai as genai
        genai.configure(api_key=gemini_key)
        model = genai.GenerativeModel("gemini-2.0-flash")
        r = model.generate_content(
            f"Write a 3-sentence executive summary for a security report for {business} ({domain}). "
            f"Findings: {counts.get('CRITICAL',0)} critical, {counts.get('HIGH',0)} high, "
            f"{counts.get('MEDIUM',0)} medium, {counts.get('LOW',0)} low. "
            f"Explain business risk in plain English. No markdown."
        )
        return r.text.strip()
    except Exception:
        return default


# ─── PDF Builder ─────────────────────────────────────────────────────────────

def build_pdf(
    domain: str,
    business_name: str,
    scan: dict,
    output_path: str,
) -> str:
    """Build the PDF report. Returns output_path."""
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import (
        Paragraph, Spacer, Table, TableStyle, PageBreak, SimpleDocTemplate, HRFlowable
    )

    styles = getSampleStyleSheet()
    doc = SimpleDocTemplate(output_path, pagesize=letter,
                            rightMargin=0.75*inch, leftMargin=0.75*inch,
                            topMargin=0.75*inch, bottomMargin=0.75*inch)

    # Custom styles
    h1 = ParagraphStyle("h1", parent=styles["Heading1"], fontSize=22, spaceAfter=6,
                        textColor=colors.HexColor("#111111"))
    h2 = ParagraphStyle("h2", parent=styles["Heading2"], fontSize=14, spaceAfter=4,
                        textColor=colors.HexColor("#111111"))
    h3 = ParagraphStyle("h3", parent=styles["Heading3"], fontSize=11, spaceAfter=3,
                        textColor=colors.HexColor("#374151"))
    body = ParagraphStyle("body", parent=styles["Normal"], fontSize=10, spaceAfter=6,
                          leading=15, textColor=colors.HexColor("#374151"))
    small = ParagraphStyle("small", parent=styles["Normal"], fontSize=9,
                           textColor=colors.HexColor("#6b7280"))
    code_style = ParagraphStyle("code", parent=styles["Normal"], fontSize=9,
                                fontName="Courier", backColor=colors.HexColor("#f3f4f6"),
                                leftIndent=12, spaceAfter=4)

    SEV_COLORS = {
        "CRITICAL": colors.HexColor("#dc2626"),
        "HIGH":     colors.HexColor("#ea580c"),
        "MEDIUM":   colors.HexColor("#d97706"),
        "LOW":      colors.HexColor("#2563eb"),
    }

    score = int(scan.get("score_pct", scan.get("score", 0)))
    verdict = scan.get("verdict", "UNKNOWN").replace("_", " ")
    score_color = (
        colors.HexColor("#dc2626") if score >= 60 else
        colors.HexColor("#ea580c") if score >= 30 else
        colors.HexColor("#2563eb")
    )
    date_str = datetime.now(timezone.utc).strftime("%B %d, %Y")

    findings = sorted(
        scan.get("findings", []),
        key=lambda f: {"CRITICAL":0,"HIGH":1,"MEDIUM":2,"LOW":3}.get(f.get("severity","LOW"),9)
    )
    story = []

    # ── Cover ─────────────────────────────────────────────────────────────────
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph("🔍 BUG REAPER SECURITY", ParagraphStyle(
        "brand", parent=styles["Normal"], fontSize=13, textColor=colors.HexColor("#6b7280"),
        fontName="Helvetica-Bold"
    )))
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("Security Assessment Report", h1))
    story.append(HRFlowable(width="100%", thickness=2, color=colors.HexColor("#111111")))
    story.append(Spacer(1, 0.3*inch))

    cover_data = [
        ["Business:", business_name],
        ["Domain:", domain],
        ["Date:", date_str],
        ["Risk Score:", f"{score} / 100"],
        ["Verdict:", verdict],
        ["Total Findings:", str(len(findings))],
    ]
    cover_table = Table(cover_data, colWidths=[1.5*inch, 4.5*inch])
    cover_table.setStyle(TableStyle([
        ("FONTNAME", (0,0), (0,-1), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 11),
        ("TEXTCOLOR", (0,0), (0,-1), colors.HexColor("#374151")),
        ("TEXTCOLOR", (1,3), (1,3), score_color),
        ("FONTNAME", (1,3), (1,3), "Helvetica-Bold"),
        ("TEXTCOLOR", (1,4), (1,4), score_color),
        ("BOTTOMPADDING", (0,0), (-1,-1), 8),
    ]))
    story.append(cover_table)
    story.append(Spacer(1, 0.5*inch))
    story.append(Paragraph("Prepared by Bug Reaper Security | bugreaper.io", small))
    story.append(PageBreak())

    # ── Executive Summary ────────────────────────────────────────────────────
    story.append(Paragraph("Executive Summary", h1))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e5e7eb")))
    story.append(Spacer(1, 0.15*inch))
    summary_text = _generate_summary(business_name, domain, scan)
    for para in summary_text.split("\n\n"):
        if para.strip():
            story.append(Paragraph(para.strip(), body))
    story.append(PageBreak())

    # ── Findings Table ────────────────────────────────────────────────────────
    story.append(Paragraph("All Findings", h1))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e5e7eb")))
    story.append(Spacer(1, 0.15*inch))

    tbl_data = [["Severity", "Category", "Issue"]]
    tbl_styles = [
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#111111")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#e5e7eb")),
        ("ROWBACKGROUNDS", (0,1), (-1,-1), [colors.white, colors.HexColor("#f9fafb")]),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING", (0,0), (-1,-1), 6),
        ("LEFTPADDING", (0,0), (-1,-1), 8),
    ]
    for i, f in enumerate(findings, 1):
        sev = f.get("severity", "LOW")
        tbl_data.append([sev, f.get("check", "").replace("_", " ").title(), f.get("detail", "")])
        tbl_styles.append(("TEXTCOLOR", (0, i), (0, i), SEV_COLORS.get(sev, colors.black)))
        tbl_styles.append(("FONTNAME", (0, i), (0, i), "Helvetica-Bold"))

    tbl = Table(tbl_data, colWidths=[0.85*inch, 1.4*inch, 4.5*inch])
    tbl.setStyle(TableStyle(tbl_styles))
    story.append(tbl)
    story.append(PageBreak())

    # ── Finding Deep-Dives ────────────────────────────────────────────────────
    critical_high = [f for f in findings if f.get("severity") in ("CRITICAL", "HIGH")]
    other = [f for f in findings if f.get("severity") in ("MEDIUM", "LOW")]

    for f in critical_high:
        sev = f.get("severity", "HIGH")
        check = f.get("check", "")
        detail = f.get("detail", "")
        color = SEV_COLORS.get(sev, colors.black)

        story.append(Paragraph(f"[{sev}] {check.replace('_',' ').title()}", h2))
        story.append(HRFlowable(width="100%", thickness=2, color=color))
        story.append(Spacer(1, 0.1*inch))

        story.append(Paragraph("<b>Finding:</b>", h3))
        story.append(Paragraph(detail, body))

        story.append(Paragraph("<b>Business Impact:</b>", h3))
        impact_map = {
            "CRITICAL": "An attacker who exploits this issue could gain full control over the affected system, steal customer data, or take your website offline completely.",
            "HIGH": "This vulnerability gives attackers a significant foothold. If exploited, it could result in data theft, customer-facing outages, or regulatory penalties.",
        }
        story.append(Paragraph(impact_map.get(sev, "This issue increases your attack surface and should be addressed promptly."), body))

        story.append(Paragraph("<b>Remediation Steps:</b>", h3))
        steps = _get_remediation(check)
        for idx, step in enumerate(steps, 1):
            story.append(Paragraph(f"{idx}. {step}", body))

        story.append(Spacer(1, 0.2*inch))
        story.append(PageBreak())

    # Grouped medium/low page
    if other:
        story.append(Paragraph("Medium & Low Severity Findings", h1))
        story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e5e7eb")))
        story.append(Spacer(1, 0.15*inch))
        for f in other:
            sev = f.get("severity", "LOW")
            check = f.get("check", "")
            story.append(Paragraph(
                f"<font color='{'#d97706' if sev=='MEDIUM' else '#2563eb'}'><b>[{sev}]</b></font> "
                f"{check.replace('_',' ').title()}", body
            ))
            story.append(Paragraph(f.get("detail", ""), small))
            steps = _get_remediation(check)
            for s in steps[:2]:
                story.append(Paragraph(f"  → {s}", small))
            story.append(Spacer(1, 0.1*inch))
        story.append(PageBreak())

    # ── Next Steps / Upsell ───────────────────────────────────────────────────
    story.append(Paragraph("Next Steps", h1))
    story.append(HRFlowable(width="100%", thickness=1, color=colors.HexColor("#e5e7eb")))
    story.append(Spacer(1, 0.15*inch))
    story.append(Paragraph(
        f"You now have a complete picture of {business_name}'s external security posture. "
        f"Here's how to prioritise:", body
    ))
    priority_data = [["Priority", "Finding", "Est. Time"]]
    time_estimates = {
        "CRITICAL": "1–4 hours", "HIGH": "2–8 hours", "MEDIUM": "30 min–2 hours", "LOW": "30 min"
    }
    for f in findings[:8]:
        priority_data.append([
            f.get("severity", ""),
            f.get("check", "").replace("_", " ").title(),
            time_estimates.get(f.get("severity","LOW"), "1 hour"),
        ])
    pt = Table(priority_data, colWidths=[0.85*inch, 4.5*inch, 1.4*inch])
    pt.setStyle(TableStyle([
        ("BACKGROUND", (0,0), (-1,0), colors.HexColor("#111111")),
        ("TEXTCOLOR", (0,0), (-1,0), colors.white),
        ("FONTNAME", (0,0), (-1,0), "Helvetica-Bold"),
        ("FONTSIZE", (0,0), (-1,-1), 9),
        ("GRID", (0,0), (-1,-1), 0.5, colors.HexColor("#e5e7eb")),
        ("BOTTOMPADDING", (0,0), (-1,-1), 6),
        ("TOPPADDING", (0,0), (-1,-1), 6),
    ]))
    story.append(pt)
    story.append(Spacer(1, 0.4*inch))

    story.append(Paragraph("Need Help Implementing These Fixes?", h2))
    story.append(Paragraph(
        "Bug Reaper Security offers ongoing monitoring and remediation support starting at $497/month. "
        "This includes monthly scans, continuous monitoring, priority support, and incident alerts. "
        "Reply to the email that delivered this report to get started.",
        body
    ))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(
        "Thank you for trusting Bug Reaper Security with your assessment.",
        ParagraphStyle("closing", parent=styles["Normal"], fontSize=10,
                       textColor=colors.HexColor("#6b7280"), alignment=1)
    ))

    doc.build(story)
    return output_path


# ─── Public API ───────────────────────────────────────────────────────────────

def generate_report(
    domain: str,
    business_name: str,
    contact_email: str,
    lead_id: int | None = None,
    output_path: str | None = None,
) -> str:
    """
    Generate a PDF security report.
    Returns the path to the generated PDF file.
    """
    # Get scan data
    scan_data = None
    if lead_id:
        try:
            from supabase_client import get_client
            res = (
                get_client()
                .table("scan_results")
                .select("*")
                .eq("lead_id", lead_id)
                .order("created_at", desc=True)
                .limit(1)
                .execute()
            )
            if res.data:
                row = res.data[0]
                scan_data = {
                    "domain": domain,
                    "findings": row.get("findings", []),
                    "score_pct": row.get("score_pct", 0),
                    "score": row.get("score_pct", 0),
                    "verdict": row.get("verdict", "UNKNOWN"),
                }
        except Exception:
            pass

    if not scan_data:
        # Run fresh scan
        try:
            from scanner import scan_extended
            scan_data = scan_extended(domain)
        except ImportError:
            from run import scan
            scan_data = scan(domain)

    if output_path is None:
        ts = int(time.time())
        safe_domain = domain.replace(".", "_").replace("/", "_")
        fd, output_path = tempfile.mkstemp(suffix=".pdf", prefix=f"bugreaper_{safe_domain}_{ts}_")
        os.close(fd)

    build_pdf(domain, business_name, scan_data, output_path)
    print(f"Report generated: {output_path}")
    return output_path


def email_report(pdf_path: str, to_email: str, business_name: str, domain: str) -> None:
    """Email the PDF report as an attachment, then delete the temp file."""
    if not SMTP_USER or not SMTP_PASS:
        print(f"SMTP not configured — report saved at {pdf_path}")
        return

    msg = MIMEMultipart()
    msg["Subject"] = f"Your Security Report — {domain}"
    msg["From"] = f"{FROM_NAME} <{FROM_EMAIL}>"
    msg["To"] = to_email

    body = MIMEText(
        f"Hi,\n\n"
        f"Thank you for your purchase. Please find your Security Assessment Report for "
        f"{business_name} ({domain}) attached.\n\n"
        f"The report includes every finding with step-by-step remediation instructions. "
        f"If you have questions or need help implementing the fixes, simply reply to this email.\n\n"
        f"If you'd like ongoing monitoring and support, our Basic Retainer ($497/month) "
        f"includes monthly scans, continuous monitoring, and priority support.\n\n"
        f"— Ryan\nBug Reaper Security",
        "plain"
    )
    msg.attach(body)

    with open(pdf_path, "rb") as f:
        attachment = MIMEBase("application", "octet-stream")
        attachment.set_payload(f.read())
    encoders.encode_base64(attachment)
    attachment.add_header(
        "Content-Disposition",
        f'attachment; filename="BugReaper_SecurityReport_{domain}.pdf"'
    )
    msg.attach(attachment)

    ctx = ssl.create_default_context()
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as s:
        s.starttls(context=ctx)
        s.login(SMTP_USER, SMTP_PASS)
        s.sendmail(FROM_EMAIL, to_email, msg.as_string())

    print(f"Report emailed to {to_email}")

    # Clean up temp file
    try:
        os.unlink(pdf_path)
    except Exception:
        pass


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python report.py <domain> \"<Business Name>\" <email> [lead_id]")
        sys.exit(1)
    domain = sys.argv[1]
    business = sys.argv[2]
    email = sys.argv[3]
    lead_id = int(sys.argv[4]) if len(sys.argv) > 4 else None

    pdf = generate_report(domain, business, email, lead_id=lead_id)
    email_report(pdf, email, business, domain)
