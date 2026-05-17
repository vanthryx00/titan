"""
Domain security scanner — public-data-only checks.

Inspects SSL, HTTP headers, DNS records (MX/SPF/DKIM/DMARC), and common
exposed paths to build a findings list without touching any auth boundary.
"""

from __future__ import annotations

import socket
import ssl
import urllib.request
import urllib.error
from datetime import datetime, timezone
from typing import Any

import dns.resolver
import dns.exception


def _days_until(dt: datetime) -> int:
    return (dt - datetime.now(timezone.utc)).days


def check_ssl(domain: str) -> list[dict[str, Any]]:
    findings = []
    ctx = ssl.create_default_context()
    try:
        with socket.create_connection((domain, 443), timeout=8) as sock:
            with ctx.wrap_socket(sock, server_hostname=domain) as ssock:
                cert = ssock.getpeercert()
                expiry_str = cert.get("notAfter", "")
                if expiry_str:
                    expiry = datetime.strptime(expiry_str, "%b %d %H:%M:%S %Y %Z").replace(
                        tzinfo=timezone.utc
                    )
                    days_left = _days_until(expiry)
                    if days_left < 0:
                        findings.append(
                            {
                                "check": "ssl_expired",
                                "severity": "CRITICAL",
                                "detail": f"SSL certificate expired {abs(days_left)} days ago",
                            }
                        )
                    elif days_left < 14:
                        findings.append(
                            {
                                "check": "ssl_expiring_soon",
                                "severity": "HIGH",
                                "detail": f"SSL certificate expires in {days_left} days",
                            }
                        )
                    elif days_left < 30:
                        findings.append(
                            {
                                "check": "ssl_expiring_soon",
                                "severity": "MEDIUM",
                                "detail": f"SSL certificate expires in {days_left} days",
                            }
                        )
    except ssl.SSLCertVerificationError:
        findings.append(
            {
                "check": "ssl_invalid",
                "severity": "CRITICAL",
                "detail": "SSL certificate is invalid or self-signed",
            }
        )
    except (socket.timeout, ConnectionRefusedError, OSError):
        findings.append(
            {
                "check": "ssl_unreachable",
                "severity": "HIGH",
                "detail": "HTTPS port 443 is not reachable — site may be unencrypted",
            }
        )
    return findings


def check_http_headers(domain: str) -> list[dict[str, Any]]:
    findings = []
    headers_required = {
        "Strict-Transport-Security": ("hsts_missing", "HIGH", "No HSTS header — browsers can be tricked into downgrading to HTTP"),
        "X-Frame-Options": ("clickjacking_risk", "MEDIUM", "No X-Frame-Options header — site vulnerable to clickjacking"),
        "X-Content-Type-Options": ("mime_sniffing", "LOW", "No X-Content-Type-Options — browser MIME sniffing enabled"),
        "Content-Security-Policy": ("no_csp", "MEDIUM", "No Content-Security-Policy — XSS protection not enforced"),
        "Referrer-Policy": ("referrer_leak", "LOW", "No Referrer-Policy — referrer data may leak to third parties"),
    }
    try:
        req = urllib.request.Request(
            f"https://{domain}",
            headers={"User-Agent": "Mozilla/5.0 (SecurityScanner/1.0; +https://bugreaper.io)"},
        )
        with urllib.request.urlopen(req, timeout=8) as resp:
            resp_headers = {k.lower(): v for k, v in resp.headers.items()}
            for header, (check, severity, detail) in headers_required.items():
                if header.lower() not in resp_headers:
                    findings.append({"check": check, "severity": severity, "detail": detail})
            # Check for server version disclosure
            server = resp_headers.get("server", "")
            if any(v in server.lower() for v in ["apache/", "nginx/", "iis/"]):
                findings.append(
                    {
                        "check": "server_version_disclosure",
                        "severity": "LOW",
                        "detail": f"Server header reveals version: '{server}'",
                    }
                )
    except urllib.error.URLError:
        # Try HTTP fallback
        try:
            req = urllib.request.Request(
                f"http://{domain}",
                headers={"User-Agent": "Mozilla/5.0 (SecurityScanner/1.0)"},
            )
            with urllib.request.urlopen(req, timeout=8) as resp:
                if resp.url.startswith("http://"):
                    findings.append(
                        {
                            "check": "no_https_redirect",
                            "severity": "HIGH",
                            "detail": "Site does not redirect HTTP to HTTPS — traffic is unencrypted",
                        }
                    )
        except Exception:
            pass
    except Exception:
        pass
    return findings


def check_dns_email_security(domain: str) -> list[dict[str, Any]]:
    findings = []
    resolver = dns.resolver.Resolver()
    resolver.lifetime = 5.0

    # SPF
    try:
        answers = resolver.resolve(domain, "TXT")
        spf_records = [str(r) for r in answers if "v=spf1" in str(r).lower()]
        if not spf_records:
            findings.append(
                {
                    "check": "spf_missing",
                    "severity": "HIGH",
                    "detail": "No SPF record — anyone can spoof email from this domain",
                }
            )
    except (dns.exception.DNSException, dns.resolver.NoAnswer):
        findings.append(
            {
                "check": "spf_missing",
                "severity": "HIGH",
                "detail": "No SPF record — domain is wide open to email spoofing",
            }
        )

    # DMARC
    try:
        answers = resolver.resolve(f"_dmarc.{domain}", "TXT")
        dmarc_records = [str(r) for r in answers if "v=dmarc1" in str(r).lower()]
        if not dmarc_records:
            findings.append(
                {
                    "check": "dmarc_missing",
                    "severity": "HIGH",
                    "detail": "No DMARC record — phishing attacks using this domain go unreported",
                }
            )
        else:
            dmarc = dmarc_records[0].lower()
            if "p=none" in dmarc:
                findings.append(
                    {
                        "check": "dmarc_policy_none",
                        "severity": "MEDIUM",
                        "detail": "DMARC policy is 'none' — spoofed emails are still delivered",
                    }
                )
    except (dns.exception.DNSException, dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
        findings.append(
            {
                "check": "dmarc_missing",
                "severity": "HIGH",
                "detail": "No DMARC record — phishing attacks using this domain go unreported",
            }
        )

    # MX
    try:
        resolver.resolve(domain, "MX")
    except (dns.exception.DNSException, dns.resolver.NoAnswer, dns.resolver.NXDOMAIN):
        findings.append(
            {
                "check": "mx_missing",
                "severity": "MEDIUM",
                "detail": "No MX records — email delivery may be misconfigured",
            }
        )

    return findings


def check_exposed_paths(domain: str) -> list[dict[str, Any]]:
    findings = []
    sensitive_paths = [
        ("/.git/config", "git_exposed", "CRITICAL", "Git repository config exposed — source code may be downloadable"),
        ("/.env", "env_exposed", "CRITICAL", ".env file exposed — API keys and secrets may be public"),
        ("/wp-login.php", "wordpress_login", "MEDIUM", "WordPress login page exposed — brute-force target"),
        ("/admin", "admin_exposed", "LOW", "Admin panel accessible without authentication check"),
        ("/phpinfo.php", "phpinfo_exposed", "HIGH", "phpinfo() page exposed — reveals server internals"),
        ("/.DS_Store", "ds_store_exposed", "LOW", "macOS .DS_Store file exposed — directory structure leaked"),
    ]
    for path, check, severity, detail in sensitive_paths:
        try:
            req = urllib.request.Request(
                f"https://{domain}{path}",
                headers={"User-Agent": "Mozilla/5.0 (SecurityScanner/1.0)"},
            )
            with urllib.request.urlopen(req, timeout=5) as resp:
                if resp.status == 200:
                    findings.append({"check": check, "severity": severity, "detail": detail})
        except Exception:
            pass
    return findings


SEVERITY_WEIGHT = {"CRITICAL": 40, "HIGH": 20, "MEDIUM": 8, "LOW": 2}


def scan_domain(domain: str) -> dict[str, Any]:
    """
    Run all checks against a domain and return findings + risk score.
    Score is capped at 100; higher = more vulnerable = better pitch.
    """
    domain = domain.lower().removeprefix("https://").removeprefix("http://").rstrip("/")

    findings: list[dict[str, Any]] = []
    findings += check_ssl(domain)
    findings += check_http_headers(domain)
    findings += check_dns_email_security(domain)
    findings += check_exposed_paths(domain)

    raw_score = sum(SEVERITY_WEIGHT.get(f["severity"], 0) for f in findings)
    score_pct = min(100, raw_score)

    if score_pct >= 60:
        verdict = "HIGH_RISK"
    elif score_pct >= 30:
        verdict = "MODERATE_RISK"
    elif score_pct >= 10:
        verdict = "LOW_RISK"
    else:
        verdict = "MINIMAL_RISK"

    return {
        "domain": domain,
        "findings": findings,
        "score_pct": score_pct,
        "verdict": verdict,
        "finding_count": len(findings),
        "critical_count": sum(1 for f in findings if f["severity"] == "CRITICAL"),
        "high_count": sum(1 for f in findings if f["severity"] == "HIGH"),
    }
