"""
Extended domain scanner — builds on top of run.py's scan() function.

scan_extended(domain) returns the same dict as scan() but with additional checks:
- Cookie security flags (HttpOnly, Secure, SameSite)
- Open redirect vulnerability
- CMS detection + version disclosure
- Exposed admin panels
- Mixed content on HTTPS pages
- IP reputation via AbuseIPDB (optional)
"""

from __future__ import annotations

import os
import re
import socket
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

# Import base scan from run.py
from run import scan as _base_scan

ABUSEIPDB_API_KEY = os.getenv("ABUSEIPDB_API_KEY", "")

_HEADERS = {"User-Agent": "Mozilla/5.0 (SecurityScanner/1.0; +https://bugreaper.io)"}


def scan_extended(domain: str) -> dict[str, Any]:
    """Full extended scan — superset of run.py scan()."""
    result = _base_scan(domain)
    domain = result["domain"]  # normalised by base scan

    extra: list[tuple[str, str, str]] = []
    extra += _check_cookies(domain)
    extra += _check_open_redirect(domain)
    extra += _check_cms(domain)
    extra += _check_admin_panels(domain)
    extra += _check_mixed_content(domain)
    if ABUSEIPDB_API_KEY:
        extra += _check_ip_reputation(domain)

    for sev, key, msg in extra:
        result["findings"].append({"severity": sev, "check": key, "detail": msg})

    weights = {"CRITICAL": 40, "HIGH": 20, "MEDIUM": 8, "LOW": 2}
    result["score_pct"] = min(100, sum(weights.get(f["severity"], 0) for f in result["findings"]))

    if result["score_pct"] >= 60:
        result["verdict"] = "HIGH_RISK"
    elif result["score_pct"] >= 30:
        result["verdict"] = "MODERATE_RISK"
    elif result["score_pct"] >= 10:
        result["verdict"] = "LOW_RISK"
    else:
        result["verdict"] = "MINIMAL_RISK"

    # Keep score key consistent (base scan uses "score", extended adds "score_pct")
    result["score"] = result["score_pct"]
    result["finding_count"] = len(result["findings"])
    result["critical_count"] = sum(1 for f in result["findings"] if f["severity"] == "CRITICAL")
    result["high_count"] = sum(1 for f in result["findings"] if f["severity"] == "HIGH")
    return result


# ─── Individual checks ────────────────────────────────────────────────────────

def _fetch(url: str, timeout: int = 8) -> tuple[dict[str, str], str, int] | None:
    """Returns (headers_lower, body_text, status) or None on error."""
    try:
        req = urllib.request.Request(url, headers=_HEADERS)
        with urllib.request.urlopen(req, timeout=timeout) as r:
            headers = {k.lower(): v for k, v in r.headers.items()}
            body = r.read(32_768).decode("utf-8", errors="replace")
            return headers, body, r.status
    except Exception:
        return None


def _check_cookies(domain: str) -> list[tuple[str, str, str]]:
    findings = []
    res = _fetch(f"https://{domain}")
    if not res:
        return findings
    headers, _, _ = res
    raw_cookies = headers.get("set-cookie", "")
    if not raw_cookies:
        return findings
    cookie_lower = raw_cookies.lower()
    if "httponly" not in cookie_lower:
        findings.append(("MEDIUM", "cookie_no_httponly",
                         "Session cookies lack HttpOnly flag — JavaScript can steal them (XSS)"))
    if "secure" not in cookie_lower:
        findings.append(("MEDIUM", "cookie_no_secure",
                         "Session cookies lack Secure flag — sent over HTTP, interceptable"))
    if "samesite" not in cookie_lower:
        findings.append(("LOW", "cookie_no_samesite",
                         "Cookies lack SameSite attribute — vulnerable to CSRF attacks"))
    return findings


def _check_open_redirect(domain: str) -> list[tuple[str, str, str]]:
    canary = "https://evil-canary-bugreaper.io"
    for param in ["next", "url", "redirect", "return", "returnUrl", "redirect_uri"]:
        test_url = f"https://{domain}/?{param}={urllib.parse.quote(canary)}"
        try:
            req = urllib.request.Request(test_url, headers=_HEADERS)
            # Don't follow redirects — check Location header manually
            import http.client
            parsed = urllib.parse.urlparse(test_url)
            conn = http.client.HTTPSConnection(parsed.netloc, timeout=5)
            conn.request("GET", parsed.path + "?" + parsed.query, headers=_HEADERS)
            resp = conn.getresponse()
            if resp.status in (301, 302, 303, 307, 308):
                loc = resp.getheader("Location", "")
                if "evil-canary-bugreaper.io" in loc:
                    return [("CRITICAL", "open_redirect",
                             f"Open redirect via ?{param}= — attackers can send victims to phishing sites using your trusted domain")]
        except Exception:
            pass
    return []


def _check_cms(domain: str) -> list[tuple[str, str, str]]:
    findings = []
    res = _fetch(f"https://{domain}")
    if not res:
        return findings
    headers, body, _ = res

    # Generator meta tag
    match = re.search(r'<meta[^>]+name=["\']generator["\'][^>]+content=["\']([^"\']+)["\']',
                      body, re.IGNORECASE)
    if not match:
        match = re.search(r'content=["\']([^"\']+)["\'][^>]+name=["\']generator["\']',
                          body, re.IGNORECASE)
    if match:
        generator = match.group(1)
        findings.append(("MEDIUM", "cms_version_exposed",
                         f"CMS version disclosed in HTML: '{generator}' — attackers can target known CVEs"))

    # WordPress specific
    if "wp-content" in body or "wp-includes" in body:
        ver_match = re.search(r'ver=(\d+\.\d+[\.\d]*)', body)
        ver = ver_match.group(1) if ver_match else "unknown"
        findings.append(("MEDIUM", "wordpress_detected",
                         f"WordPress detected (v{ver}) — ensure core, themes, and plugins are up to date"))

    return findings


def _check_admin_panels(domain: str) -> list[tuple[str, str, str]]:
    findings = []
    panels = [
        ("/wp-admin",     "wp_admin_exposed",    "WordPress admin panel publicly reachable"),
        ("/phpmyadmin",   "phpmyadmin_exposed",   "phpMyAdmin exposed — direct database access panel"),
        ("/administrator","joomla_admin_exposed", "Joomla admin panel publicly reachable"),
        ("/cpanel",       "cpanel_exposed",       "cPanel hosting control panel publicly reachable"),
        ("/adminer.php",  "adminer_exposed",      "Adminer DB tool exposed — direct database access"),
    ]
    for path, key, msg in panels:
        res = _fetch(f"https://{domain}{path}", timeout=5)
        if res and res[2] == 200:
            findings.append(("MEDIUM", key, msg))
    return findings


def _check_mixed_content(domain: str) -> list[tuple[str, str, str]]:
    res = _fetch(f"https://{domain}")
    if not res:
        return []
    _, body, _ = res
    # Look for HTTP (not HTTPS) asset references on an HTTPS page
    http_assets = re.findall(r'(?:src|href)=["\']http://[^"\']+["\']', body, re.IGNORECASE)
    if http_assets:
        return [("LOW", "mixed_content",
                 f"Mixed content: {len(http_assets)} HTTP asset(s) loaded on HTTPS page — blocks browser security")]
    return []


def _check_ip_reputation(domain: str) -> list[tuple[str, str, str]]:
    try:
        ip = socket.gethostbyname(domain)
        req = urllib.request.Request(
            f"https://api.abuseipdb.com/api/v2/check?ipAddress={ip}&maxAgeInDays=90",
            headers={"Key": ABUSEIPDB_API_KEY, "Accept": "application/json"},
        )
        with urllib.request.urlopen(req, timeout=6) as r:
            import json
            data = json.loads(r.read())
        score = data.get("data", {}).get("abuseConfidenceScore", 0)
        if score > 25:
            return [("HIGH", "ip_reputation",
                     f"Domain IP ({ip}) has an AbuseIPDB confidence score of {score}% — associated with malicious activity")]
    except Exception:
        pass
    return []
