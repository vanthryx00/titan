"""
Bug Reaper — Interactive Setup Wizard

Run this first, before anything else:
  python setup.py

Guides you through every credential, tests each connection live,
and writes your .env file. Re-run anytime to update settings.
"""

from __future__ import annotations

import getpass
import importlib
import json
import os
import smtplib
import socket
import ssl
import subprocess
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

# ─── Bootstrap rich before anything else ──────────────────────────────────────

def _ensure_rich() -> None:
    try:
        import rich  # noqa: F401
    except ImportError:
        print("Installing rich for setup UI...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "rich>=13.0.0", "-q"])

_ensure_rich()

from rich.console import Console
from rich.panel import Panel
from rich.progress import Progress, SpinnerColumn, TextColumn
from rich.prompt import Confirm, Prompt
from rich.table import Table
from rich.text import Text

console = Console()
ENV_PATH = Path(__file__).parent / ".env"


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _load_existing_env() -> dict[str, str]:
    """Load existing .env values so we can show them as defaults."""
    vals: dict[str, str] = {}
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text().splitlines():
            line = line.strip()
            if line and not line.startswith("#") and "=" in line:
                k, _, v = line.partition("=")
                vals[k.strip()] = v.strip()
    return vals


def _mask(value: str) -> str:
    """Show first 4 and last 4 chars, rest as *."""
    if not value or len(value) < 10:
        return "****"
    return value[:4] + "*" * (len(value) - 8) + value[-4:]


def _spin(label: str, fn, *args, **kwargs):
    """Run fn(*args) inside a spinner. Returns (success, result)."""
    with Progress(SpinnerColumn(), TextColumn("{task.description}"), console=console, transient=True) as p:
        p.add_task(label)
        try:
            result = fn(*args, **kwargs)
            return True, result
        except Exception as exc:
            return False, str(exc)


def _ask(label: str, default: str = "", secret: bool = False, optional: bool = False) -> str:
    """Prompt the user for a value. Returns the entered string (or default)."""
    tag = "[dim][optional][/dim] " if optional else ""
    disp_default = _mask(default) if (secret and default) else (default or "")
    prompt_text = f"{tag}[bold]{label}[/bold]" + (f" [dim]({disp_default})[/dim]" if disp_default else "")

    if secret:
        console.print(f"  {prompt_text}")
        val = getpass.getpass("  → ")
    else:
        val = Prompt.ask(f"  {prompt_text}", default=default or ("" if not optional else ""))

    return val.strip() or default


def _ok(msg: str) -> None:
    console.print(f"  [bold green]✓[/bold green] {msg}")


def _fail(msg: str) -> None:
    console.print(f"  [bold red]✗[/bold red] {msg}")


def _warn(msg: str) -> None:
    console.print(f"  [bold yellow]⚠[/bold yellow] {msg}")


def _info(msg: str) -> None:
    console.print(f"  [dim]ℹ[/dim] {msg}")


# ─── Step 1: Welcome ──────────────────────────────────────────────────────────

def step_welcome() -> None:
    console.print()
    console.print(Panel.fit(
        "[bold white]🔍  BUG REAPER — SETUP WIZARD[/bold white]\n\n"
        "This wizard will configure every credential, test each connection,\n"
        "and write your [bold].env[/bold] file. Takes about 5 minutes.\n\n"
        "[dim]Press Ctrl+C at any time to exit without saving.[/dim]",
        border_style="white",
        padding=(1, 4),
    ))
    console.print()

    # Python version check
    v = sys.version_info
    if v < (3, 11):
        _warn(f"Python {v.major}.{v.minor} detected — Python 3.11+ recommended")
    else:
        _ok(f"Python {v.major}.{v.minor}.{v.micro}")


# ─── Step 2: Dependencies ─────────────────────────────────────────────────────

def step_install_deps() -> None:
    console.print("\n[bold]Step 1 — Install dependencies[/bold]")
    req_path = Path(__file__).parent / "requirements.txt"
    if not req_path.exists():
        _warn("requirements.txt not found — skipping")
        return

    if not Confirm.ask("  Install / update Python packages now?", default=True):
        _warn("Skipped — run [bold]pip install -r requirements.txt[/bold] before using Bug Reaper")
        return

    console.print("  [dim]Running pip install...[/dim]")
    result = subprocess.run(
        [sys.executable, "-m", "pip", "install", "-r", str(req_path), "-q"],
        capture_output=True, text=True
    )
    if result.returncode == 0:
        _ok("All packages installed")
    else:
        _fail("pip install failed")
        console.print(f"  [dim]{result.stderr[:300]}[/dim]")


# ─── Step 3: Supabase ─────────────────────────────────────────────────────────

def test_supabase(url: str, key: str) -> bool:
    import urllib.request, json
    req = urllib.request.Request(
        f"{url.rstrip('/')}/rest/v1/leads?limit=1",
        headers={"apikey": key, "Authorization": f"Bearer {key}"},
    )
    with urllib.request.urlopen(req, timeout=8) as r:
        data = json.loads(r.read())
        return isinstance(data, list)


def step_supabase(existing: dict) -> dict:
    console.print("\n[bold]Step 2 — Supabase database[/bold]")
    _info("Your project URL and anon key are in the Supabase dashboard → Settings → API")

    url = _ask("Supabase URL", existing.get("SUPABASE_URL", "https://occgwktryhynxonuyixm.supabase.co"))
    key = _ask("Anon Key", existing.get("SUPABASE_ANON_KEY", ""), secret=True)

    if not key:
        _warn("Skipped — Supabase is required for the pipeline to work")
        return {"SUPABASE_URL": url, "SUPABASE_ANON_KEY": key}

    ok, err = _spin("  Testing connection...", test_supabase, url, key)
    if ok:
        _ok("Connected to Supabase")
    else:
        _fail(f"Connection failed: {err}")
        _info("Check your URL and key at supabase.com → your project → Settings → API")

    return {"SUPABASE_URL": url, "SUPABASE_ANON_KEY": key}


# ─── Step 4: Stripe ───────────────────────────────────────────────────────────

def test_stripe_key(key: str) -> bool:
    import stripe as _stripe
    _stripe.api_key = key
    _stripe.Account.retrieve()
    return True


def fetch_stripe_price(key: str, price_id: str) -> dict:
    import stripe as _stripe
    _stripe.api_key = key
    return _stripe.Price.retrieve(price_id)


def create_stripe_product(key: str) -> str:
    import stripe as _stripe
    _stripe.api_key = key
    product = _stripe.Product.create(
        name="Security Report — Starter",
        description="External domain security assessment with remediation guide",
    )
    price = _stripe.Price.create(
        product=product.id,
        unit_amount=29700,
        currency="cad",
        metadata={"product": "starter_report"},
    )
    return price.id


def step_stripe(existing: dict) -> dict:
    console.print("\n[bold]Step 3 — Stripe payments[/bold]")
    _info("Find your secret key at dashboard.stripe.com → Developers → API keys")

    key = _ask("Secret Key (sk_live_... or sk_test_...)", existing.get("STRIPE_SECRET_KEY", ""), secret=True)
    if not key:
        _warn("Skipped — Stripe required to generate payment links")
        return {"STRIPE_SECRET_KEY": "", "STRIPE_STARTER_PRICE_ID": "", "STRIPE_WEBHOOK_SECRET": ""}

    ok, err = _spin("  Testing Stripe key...", test_stripe_key, key)
    if not ok:
        _fail(f"Invalid key: {err}")
        _info("Make sure you're using the secret key, not the publishable key")
    else:
        _ok("Stripe key valid")

    # Price ID
    price_id = _ask(
        "Starter Price ID (price_...)",
        existing.get("STRIPE_STARTER_PRICE_ID", ""),
        optional=True,
    )

    if price_id:
        ok2, res = _spin("  Verifying price...", fetch_stripe_price, key, price_id)
        if ok2:
            amount = res.get("unit_amount", 0) / 100
            currency = res.get("currency", "").upper()
            _ok(f"Price found: {currency} ${amount:.2f}")
        else:
            _fail(f"Price not found: {res}")
            price_id = ""

    if not price_id and ok:
        if Confirm.ask(
            "  [bold]Create the $297 CAD Security Report product in Stripe now?[/bold]",
            default=True
        ):
            ok3, res3 = _spin("  Creating product + price...", create_stripe_product, key)
            if ok3:
                price_id = res3
                _ok(f"Created! Price ID: [bold]{price_id}[/bold]")
            else:
                _fail(f"Creation failed: {res3}")

    # Webhook secret
    console.print()
    _info("Webhook secret: Stripe dashboard → Developers → Webhooks → your endpoint → Signing secret")
    _info("If you haven't created a webhook yet, you can add it after setup")
    webhook_secret = _ask("Webhook Secret (whsec_...)", existing.get("STRIPE_WEBHOOK_SECRET", ""), secret=True, optional=True)

    return {
        "STRIPE_SECRET_KEY": key,
        "STRIPE_STARTER_PRICE_ID": price_id,
        "STRIPE_WEBHOOK_SECRET": webhook_secret,
        "STRIPE_SUCCESS_URL": existing.get("STRIPE_SUCCESS_URL", "https://bugreaper.io/report/delivered"),
        "STRIPE_CANCEL_URL": existing.get("STRIPE_CANCEL_URL", "https://bugreaper.io/"),
    }


# ─── Step 5: SMTP ─────────────────────────────────────────────────────────────

def test_smtp(host: str, port: int, user: str, pwd: str) -> bool:
    ctx = ssl.create_default_context()
    with smtplib.SMTP(host, port, timeout=10) as s:
        s.ehlo()
        s.starttls(context=ctx)
        s.login(user, pwd)
    return True


def step_smtp(existing: dict) -> dict:
    console.print("\n[bold]Step 4 — Email (SMTP)[/bold]")
    _info("Gmail users: create an App Password at myaccount.google.com → Security → App Passwords")
    _info("Other providers: use your normal SMTP credentials")

    host = _ask("SMTP Host", existing.get("SMTP_HOST", "smtp.gmail.com"))
    port = int(_ask("SMTP Port", existing.get("SMTP_PORT", "587")))
    user = _ask("SMTP Username (your email)", existing.get("SMTP_USER", ""))
    pwd  = _ask("SMTP Password / App Password", existing.get("SMTP_PASS", ""), secret=True)

    if not user or not pwd:
        _warn("Skipped — SMTP required to send emails")
        return {"SMTP_HOST": host, "SMTP_PORT": str(port), "SMTP_USER": user, "SMTP_PASS": pwd,
                "FROM_NAME": existing.get("FROM_NAME", "Bug Reaper Security"), "FROM_EMAIL": user}

    ok, err = _spin("  Testing SMTP connection...", test_smtp, host, port, user, pwd)
    if ok:
        _ok(f"Connected to {host}:{port}")
        if Confirm.ask(f"  Send a test email to [bold]{user}[/bold]?", default=True):
            try:
                import smtplib
                from email.mime.text import MIMEText
                msg = MIMEText("Bug Reaper SMTP test — your email is configured correctly!")
                msg["Subject"] = "✅ Bug Reaper SMTP test"
                msg["From"] = user
                msg["To"] = user
                ctx2 = ssl.create_default_context()
                with smtplib.SMTP(host, port, timeout=10) as s:
                    s.starttls(context=ctx2)
                    s.login(user, pwd)
                    s.sendmail(user, user, msg.as_string())
                _ok("Test email sent — check your inbox")
            except Exception as exc:
                _warn(f"Test email failed: {exc}")
    else:
        _fail(f"SMTP failed: {err}")
        if "gmail" in host.lower():
            _info("Gmail tip: use an App Password, NOT your Google account password")
            _info("Enable 2FA first, then: myaccount.google.com → Security → App Passwords")

    from_name = _ask("From Name (shown in emails)", existing.get("FROM_NAME", "Bug Reaper Security"))
    return {
        "SMTP_HOST": host,
        "SMTP_PORT": str(port),
        "SMTP_USER": user,
        "SMTP_PASS": pwd,
        "FROM_NAME": from_name,
        "FROM_EMAIL": existing.get("FROM_EMAIL", user),
    }


# ─── Step 6: Optional services ────────────────────────────────────────────────

def test_gemini(key: str) -> bool:
    import google.generativeai as genai
    genai.configure(api_key=key)
    model = genai.GenerativeModel("gemini-2.0-flash")
    r = model.generate_content("Reply with just the word: OK")
    return bool(r.text)


def test_places(key: str) -> bool:
    url = (
        "https://maps.googleapis.com/maps/api/place/textsearch/json"
        f"?query=plumber+Calgary+Alberta&key={key}&fields=name"
    )
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req, timeout=8) as r:
        data = json.loads(r.read())
    return data.get("status") in ("OK", "ZERO_RESULTS")


def step_optional(existing: dict) -> dict:
    console.print("\n[bold]Step 5 — Optional services[/bold]")
    console.print("  [dim]Press Enter to skip any of these[/dim]\n")
    vals: dict[str, str] = {}

    # Gemini
    _info("Gemini makes cold emails smarter and personalises PDF remediation steps")
    _info("Get a free key at: aistudio.google.com/app/apikey")
    gemini = _ask("Gemini API Key", existing.get("GEMINI_API_KEY", ""), secret=True, optional=True)
    if gemini:
        ok, err = _spin("  Testing Gemini...", test_gemini, gemini)
        _ok("Gemini working") if ok else _fail(f"Gemini failed: {err}")
    vals["GEMINI_API_KEY"] = gemini

    # Google Places
    console.print()
    _info("Google Places lets the pipeline discover leads automatically")
    _info("Enable 'Places API' in Google Cloud Console → APIs & Services")
    places = _ask("Google Places API Key", existing.get("GOOGLE_PLACES_API_KEY", ""), secret=True, optional=True)
    if places:
        ok2, err2 = _spin("  Testing Places API...", test_places, places)
        _ok("Places API working") if ok2 else _fail(f"Places API failed: {err2}")
    vals["GOOGLE_PLACES_API_KEY"] = places

    # AbuseIPDB
    console.print()
    _info("AbuseIPDB adds IP reputation checks to domain scans (free: 1000/day)")
    _info("Get a key at: abuseipdb.com")
    vals["ABUSEIPDB_API_KEY"] = _ask(
        "AbuseIPDB API Key", existing.get("ABUSEIPDB_API_KEY", ""), secret=True, optional=True
    )

    # Yelp
    vals["YELP_API_KEY"] = _ask(
        "Yelp API Key (fallback lead source)", existing.get("YELP_API_KEY", ""), secret=True, optional=True
    )

    vals["WEBHOOK_PORT"] = _ask("Webhook server port", existing.get("WEBHOOK_PORT", "8080"))
    vals["APP_ENV"] = existing.get("APP_ENV", "production")
    vals["LOG_LEVEL"] = existing.get("LOG_LEVEL", "INFO")

    return vals


# ─── Step 7: Write .env ───────────────────────────────────────────────────────

def write_env(values: dict) -> None:
    lines = [
        "# Bug Reaper — generated by setup.py",
        f"# Created: {time.strftime('%Y-%m-%d %H:%M:%S')}",
        "",
        "# ── Supabase ──────────────────────────────────────────────────",
        f"SUPABASE_URL={values.get('SUPABASE_URL', '')}",
        f"SUPABASE_ANON_KEY={values.get('SUPABASE_ANON_KEY', '')}",
        "",
        "# ── Stripe ────────────────────────────────────────────────────",
        f"STRIPE_SECRET_KEY={values.get('STRIPE_SECRET_KEY', '')}",
        f"STRIPE_STARTER_PRICE_ID={values.get('STRIPE_STARTER_PRICE_ID', '')}",
        f"STRIPE_WEBHOOK_SECRET={values.get('STRIPE_WEBHOOK_SECRET', '')}",
        f"STRIPE_SUCCESS_URL={values.get('STRIPE_SUCCESS_URL', 'https://bugreaper.io/report/delivered')}",
        f"STRIPE_CANCEL_URL={values.get('STRIPE_CANCEL_URL', 'https://bugreaper.io/')}",
        "",
        "# ── SMTP ──────────────────────────────────────────────────────",
        f"SMTP_HOST={values.get('SMTP_HOST', 'smtp.gmail.com')}",
        f"SMTP_PORT={values.get('SMTP_PORT', '587')}",
        f"SMTP_USER={values.get('SMTP_USER', '')}",
        f"SMTP_PASS={values.get('SMTP_PASS', '')}",
        f"FROM_NAME={values.get('FROM_NAME', 'Bug Reaper Security')}",
        f"FROM_EMAIL={values.get('FROM_EMAIL', values.get('SMTP_USER', ''))}",
        "",
        "# ── Optional ──────────────────────────────────────────────────",
        f"GEMINI_API_KEY={values.get('GEMINI_API_KEY', '')}",
        f"GOOGLE_PLACES_API_KEY={values.get('GOOGLE_PLACES_API_KEY', '')}",
        f"ABUSEIPDB_API_KEY={values.get('ABUSEIPDB_API_KEY', '')}",
        f"YELP_API_KEY={values.get('YELP_API_KEY', '')}",
        "",
        "# ── App ───────────────────────────────────────────────────────",
        f"WEBHOOK_PORT={values.get('WEBHOOK_PORT', '8080')}",
        f"APP_ENV={values.get('APP_ENV', 'production')}",
        f"LOG_LEVEL={values.get('LOG_LEVEL', 'INFO')}",
    ]
    ENV_PATH.write_text("\n".join(lines) + "\n")


# ─── Step 8: Test scan + summary ──────────────────────────────────────────────

def run_test_scan() -> None:
    console.print("\n[bold]Running a test scan on example.com...[/bold]")
    try:
        # Reload env so the newly written .env is picked up
        from dotenv import load_dotenv
        load_dotenv(ENV_PATH, override=True)
        from run import scan
        result = scan("example.com")
        score = result.get("score", result.get("score_pct", 0))
        findings = result.get("findings", [])
        _ok(f"Scan complete — example.com scored {score}/100, {len(findings)} findings")
    except Exception as exc:
        _warn(f"Test scan failed: {exc} (this is OK — scan requires network access)")


def show_summary(all_values: dict, results: dict[str, bool]) -> None:
    console.print()
    t = Table(title="Setup Summary", border_style="white", show_lines=False)
    t.add_column("Service", style="bold", min_width=20)
    t.add_column("Status", min_width=10)
    t.add_column("Details", style="dim")

    rows = [
        ("Supabase", results.get("supabase"), all_values.get("SUPABASE_URL", "—")),
        ("Stripe", results.get("stripe"), all_values.get("STRIPE_STARTER_PRICE_ID") or "No price ID"),
        ("SMTP", results.get("smtp"), all_values.get("SMTP_USER", "—")),
        ("Gemini", results.get("gemini"), "optional"),
        ("Google Places", results.get("places"), "optional"),
    ]
    for name, status, detail in rows:
        if status is True:
            icon = "[bold green]✅ Ready[/bold green]"
        elif status is False:
            icon = "[bold red]❌ Failed[/bold red]"
        else:
            icon = "[dim]⬜ Skipped[/dim]"
        t.add_row(name, icon, detail)

    console.print(t)


def show_next_steps() -> None:
    cwd = Path(__file__).parent
    console.print()
    console.print(Panel(
        "[bold]You're ready. Here's what to run:[/bold]\n\n"
        "[bold white]One lead (manual):[/bold white]\n"
        f"  python run.py domain.com owner@domain.com \"Business Name\"\n\n"
        "[bold white]Batch pipeline:[/bold white]\n"
        f"  python pipeline.py --dry-run --limit 5   # preview\n"
        f"  python pipeline.py --limit 20            # go live\n\n"
        "[bold white]Follow-up sequences:[/bold white]\n"
        f"  python sequences.py\n\n"
        "[bold white]Revenue dashboard:[/bold white]\n"
        f"  python dashboard.py --watch\n\n"
        "[bold white]Stripe webhook server:[/bold white]\n"
        f"  python webhook.py\n\n"
        "[bold white]Cron setup (add to crontab -e):[/bold white]\n"
        f"  0 8 * * *  cd {cwd} && python pipeline.py --limit 20\n"
        f"  0 9 * * *  cd {cwd} && python sequences.py\n"
        f"  @reboot    cd {cwd} && python webhook.py &",
        title="[bold green]🚀 Next Steps[/bold green]",
        border_style="green",
        padding=(1, 3),
    ))
    console.print()


# ─── Main ─────────────────────────────────────────────────────────────────────

def main() -> None:
    existing = _load_existing_env()
    if existing:
        console.print()
        console.print("[dim]Existing .env found — current values shown as defaults.[/dim]")

    step_welcome()

    try:
        step_install_deps()

        sb     = step_supabase(existing)
        stripe = step_stripe(existing)
        smtp   = step_smtp(existing)
        opt    = step_optional(existing)

        all_values = {**sb, **stripe, **smtp, **opt}

        # Write .env
        console.print("\n[bold]Writing .env...[/bold]")
        write_env(all_values)
        _ok(f".env written to {ENV_PATH}")

        # Track which connections passed for the summary
        # (We re-test quickly to populate results dict without re-prompting)
        results: dict[str, bool | None] = {
            "supabase": None, "stripe": None, "smtp": None, "gemini": None, "places": None
        }
        if sb.get("SUPABASE_ANON_KEY"):
            ok, _ = _spin("  Verifying Supabase...", test_supabase, sb["SUPABASE_URL"], sb["SUPABASE_ANON_KEY"])
            results["supabase"] = ok
        if stripe.get("STRIPE_SECRET_KEY"):
            ok2, _ = _spin("  Verifying Stripe...", test_stripe_key, stripe["STRIPE_SECRET_KEY"])
            results["stripe"] = ok2
        if smtp.get("SMTP_USER") and smtp.get("SMTP_PASS"):
            ok3, _ = _spin("  Verifying SMTP...", test_smtp,
                           smtp["SMTP_HOST"], int(smtp["SMTP_PORT"]), smtp["SMTP_USER"], smtp["SMTP_PASS"])
            results["smtp"] = ok3
        if opt.get("GEMINI_API_KEY"):
            ok4, _ = _spin("  Verifying Gemini...", test_gemini, opt["GEMINI_API_KEY"])
            results["gemini"] = ok4
        if opt.get("GOOGLE_PLACES_API_KEY"):
            ok5, _ = _spin("  Verifying Places...", test_places, opt["GOOGLE_PLACES_API_KEY"])
            results["places"] = ok5

        run_test_scan()
        show_summary(all_values, results)
        show_next_steps()

    except KeyboardInterrupt:
        console.print("\n\n[dim]Setup cancelled — .env not saved.[/dim]\n")
        sys.exit(0)


if __name__ == "__main__":
    main()
