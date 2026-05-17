"""
Bug Reaper — one-file revenue runner.

Usage:
  python run.py <domain> <email> "<Business Name>"

Example:
  python run.py acme-plumbing.ca owner@acme-plumbing.ca "Acme Plumbing"

What it does:
  1. Scans the domain for real security gaps (public info only)
  2. Prints a risk report in your terminal
  3. Creates a $297 Stripe payment link
  4. Sends a personalised email to the prospect

Required in .env:
  STRIPE_SECRET_KEY
  STRIPE_STARTER_PRICE_ID   (or STRIPE_STARTER_PAYMENT_LINK)
  SMTP_USER
  SMTP_PASS

Optional in .env:
  GEMINI_API_KEY            (makes emails smarter)
  SUPABASE_ANON_KEY         (logs results to database)
"""

from __future__ import annotations

import os
import re
import smtplib
import socket
import ssl as ssl_lib
import sys
import urllib.error
import urllib.request
from datetime import datetime, timezone
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from dotenv import load_dotenv

load_dotenv()


# ─── 1. SCAN ──────────────────────────────────────────────────────────────────

def scan(domain: str) -> dict:
    domain = domain.lower().removeprefix("https://").removeprefix("http://").split("/")[0]
    findings = []

    # SSL
    try:
        ctx = ssl_lib.create_default_context()
        with socket.create_connection((domain, 443), timeout=8) as sock:
            with ctx.wrap_socket(sock, server_hostname=domain) as s:
                cert = s.getpeercert()
                expiry = datetime.strptime(cert["notAfter"], "%b %d %H:%M:%S %Y %Z").replace(tzinfo=timezone.utc)
                days = (expiry - datetime.now(timezone.utc)).days
                if days < 0:
                    findings.append(("CRITICAL", "ssl", f"SSL certificate EXPIRED {abs(days)} days ago"))
                elif days < 30:
                    findings.append(("HIGH", "ssl", f"SSL certificate expires in {days} days"))
    except ssl_lib.SSLCertVerificationError:
        findings.append(("CRITICAL", "ssl", "SSL certificate is invalid or self-signed"))
    except Exception:
        findings.append(("HIGH", "ssl", "Site may not support HTTPS — traffic is unencrypted"))

    # HTTP security headers
    try:
        req = urllib.request.Request(f"https://{domain}", headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=8) as r:
            h = {k.lower(): v for k, v in r.headers.items()}
            if "strict-transport-security" not in h:
                findings.append(("HIGH", "hsts", "No HSTS — browsers can be tricked onto unencrypted HTTP"))
            if "content-security-policy" not in h:
                findings.append(("MEDIUM", "csp", "No Content-Security-Policy — XSS attacks not blocked"))
            if "x-frame-options" not in h:
                findings.append(("MEDIUM", "clickjacking", "No X-Frame-Options — site can be embedded in phishing frames"))
            server = h.get("server", "")
            if any(v in server.lower() for v in ["apache/", "nginx/", "iis/"]):
                findings.append(("LOW", "server_version", f"Server version exposed in header: {server}"))
    except Exception:
        pass

    # DNS email security
    try:
        import dns.resolver, dns.exception
        r = dns.resolver.Resolver(); r.lifetime = 5
        try:
            txts = [str(x) for x in r.resolve(domain, "TXT")]
            if not any("v=spf1" in t.lower() for t in txts):
                findings.append(("HIGH", "spf", "No SPF record — anyone can send email pretending to be you"))
        except Exception:
            findings.append(("HIGH", "spf", "No SPF record — domain open to email spoofing"))
        try:
            txts = [str(x) for x in r.resolve(f"_dmarc.{domain}", "TXT")]
            dmarc = next((t for t in txts if "v=dmarc1" in t.lower()), "")
            if not dmarc:
                findings.append(("HIGH", "dmarc", "No DMARC record — phishing using your domain goes unreported"))
            elif "p=none" in dmarc.lower():
                findings.append(("MEDIUM", "dmarc_none", "DMARC policy is 'none' — spoofed emails still get delivered"))
        except Exception:
            findings.append(("HIGH", "dmarc", "No DMARC record — phishing attacks using your domain go unreported"))
    except ImportError:
        pass  # dnspython not installed

    # Exposed sensitive files
    for path, check, sev, msg in [
        ("/.git/config",  "git",     "CRITICAL", "Git config exposed — source code may be downloadable"),
        ("/.env",         "env",     "CRITICAL", ".env file public — API keys and passwords may be leaked"),
        ("/phpinfo.php",  "phpinfo", "HIGH",     "phpinfo() page live — exposes server internals to attackers"),
    ]:
        try:
            req = urllib.request.Request(f"https://{domain}{path}", headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, timeout=5) as r:
                if r.status == 200:
                    findings.append((sev, check, msg))
        except Exception:
            pass

    # Score
    weights = {"CRITICAL": 40, "HIGH": 20, "MEDIUM": 8, "LOW": 2}
    score = min(100, sum(weights.get(s, 0) for s, *_ in findings))
    verdict = "HIGH RISK" if score >= 60 else "MODERATE RISK" if score >= 30 else "LOW RISK"

    return {"domain": domain, "findings": findings, "score": score, "verdict": verdict}


# ─── 2. STRIPE LINK ───────────────────────────────────────────────────────────

def checkout_link(domain: str, email: str, business: str) -> str:
    # Try Stripe Checkout Session first
    key = os.getenv("STRIPE_SECRET_KEY", "")
    price_id = os.getenv("STRIPE_STARTER_PRICE_ID", "")
    if key and price_id:
        import stripe
        stripe.api_key = key
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[{"price": price_id, "quantity": 1}],
            customer_email=email or None,
            success_url=os.getenv("STRIPE_SUCCESS_URL", "https://bugreaper.io/report/delivered"),
            cancel_url=os.getenv("STRIPE_CANCEL_URL", "https://bugreaper.io/"),
            metadata={"domain": domain, "business": business},
        )
        return session.url

    # Fall back to a pre-built Payment Link
    link = os.getenv("STRIPE_STARTER_PAYMENT_LINK", "")
    if link:
        return link

    print("⚠️  No Stripe config — set STRIPE_SECRET_KEY + STRIPE_STARTER_PRICE_ID in .env")
    return "https://bugreaper.io/checkout"


# ─── 3. EMAIL ─────────────────────────────────────────────────────────────────

def build_email(domain: str, business: str, result: dict, link: str) -> tuple[str, str]:
    findings = result["findings"]
    score = result["score"]

    top = sorted(findings, key=lambda f: {"CRITICAL":0,"HIGH":1,"MEDIUM":2,"LOW":3}.get(f[0],9))[:4]
    bullets = "\n".join(
        f"  {'🔴' if s=='CRITICAL' else '🟠' if s=='HIGH' else '🟡' if s=='MEDIUM' else '🔵'} {msg}"
        for s, _, msg in top
    )

    subject = (
        f"[CRITICAL] Security issue on {domain} needs attention"
        if any(s == "CRITICAL" for s, *_ in findings)
        else f"Security gaps found on {domain} — {score}/100 risk score"
    )

    # Try Gemini for a smarter body
    body = ""
    gemini_key = os.getenv("GEMINI_API_KEY", "")
    if gemini_key:
        try:
            import google.generativeai as genai
            genai.configure(api_key=gemini_key)
            model = genai.GenerativeModel("gemini-2.0-flash")
            resp = model.generate_content(
                f"Write a 3-paragraph cold email to the owner of {business} ({domain}).\n"
                f"Risk score: {score}/100. Issues:\n{bullets}\n"
                f"Para 1: what you found. Para 2: business impact in plain English. "
                f"Para 3: offer a $297 CAD Security Report with fix steps. CTA link: {link}\n"
                f"Tone: direct, no fluff. Under 180 words. No subject line."
            )
            body = resp.text.strip()
        except Exception:
            pass

    if not body:
        body = (
            f"Hi,\n\n"
            f"I scanned {domain} and found {len(findings)} security issues your team should know about:\n\n"
            f"{bullets}\n\n"
            f"Left unfixed, these expose {business} to data breaches, phishing attacks, and potential fines. "
            f"Attackers scan for exactly these gaps automatically.\n\n"
            f"For $297 CAD I'll send you a full Security Report — every issue explained in plain English "
            f"with step-by-step fixes. No subscription, no sales call.\n\n"
            f"Get the report: {link}\n\n"
            f"— Ryan\nBug Reaper Security"
        )

    return subject, body


def send(to: str, subject: str, body: str) -> None:
    user = os.getenv("SMTP_USER", "")
    pwd  = os.getenv("SMTP_PASS", "")
    if not user or not pwd:
        print("\n📧 Email preview (SMTP not configured):")
        print(f"   To: {to}")
        print(f"   Subject: {subject}")
        print("─" * 60)
        print(body)
        return

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{os.getenv('FROM_NAME','Bug Reaper Security')} <{user}>"
    msg["To"] = to
    msg.attach(MIMEText(body, "plain"))

    ctx = ssl_lib.create_default_context()
    with smtplib.SMTP(os.getenv("SMTP_HOST", "smtp.gmail.com"), int(os.getenv("SMTP_PORT","587"))) as s:
        s.starttls(context=ctx)
        s.login(user, pwd)
        s.sendmail(user, to, msg.as_string())
    print(f"✅ Email sent to {to}")


# ─── 4. RUN ───────────────────────────────────────────────────────────────────

def main(domain: str, email: str, business: str) -> None:
    print(f"\n🔍 Scanning {domain}...")
    result = scan(domain)

    # Print report
    print(f"\n{'─'*50}")
    print(f"  {business} — {domain}")
    print(f"  Risk Score: {result['score']}/100  [{result['verdict']}]")
    print(f"  Findings: {len(result['findings'])}")
    print(f"{'─'*50}")
    for sev, _, msg in sorted(result["findings"], key=lambda f: {"CRITICAL":0,"HIGH":1,"MEDIUM":2,"LOW":3}.get(f[0],9)):
        icon = {"CRITICAL":"🔴","HIGH":"🟠","MEDIUM":"🟡","LOW":"🔵"}.get(sev,"•")
        print(f"  {icon} [{sev}] {msg}")
    print(f"{'─'*50}\n")

    if result["score"] < 10:
        print("✅ Score too low to pitch — this site is reasonably secure.")
        return

    print("💳 Generating Stripe link...")
    link = checkout_link(domain, email, business)
    print(f"   {link}\n")

    print("✍️  Writing email...")
    subject, body = build_email(domain, business, result, link)

    print(f"   Subject: {subject}\n")
    send(email, subject, body)

    # Optional: log to Supabase
    try:
        from supabase_client import get_client
        sb = get_client()
        sb.table("scan_results").insert({
            "scan_type": "external_domain_scan",
            "target": domain,
            "engine": "bugreaper_v1",
            "status": "complete",
            "findings": [{"severity": s, "check": c, "detail": m} for s, c, m in result["findings"]],
            "score_pct": result["score"],
            "verdict": result["verdict"].replace(" ", "_"),
        }).execute()
        print("📊 Logged to Supabase")
    except Exception:
        pass  # Supabase is optional


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python run.py <domain> <email> \"<Business Name>\"")
        print('Example: python run.py acme.ca owner@acme.ca "Acme Plumbing"')
        sys.exit(1)
    main(sys.argv[1], sys.argv[2], sys.argv[3])
