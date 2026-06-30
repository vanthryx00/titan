"""
Bug Reaper terminal dashboard — live revenue and pipeline stats.

Usage:
  python dashboard.py           # one-shot render
  python dashboard.py --watch   # auto-refresh every 30 seconds

Requires: rich>=13.0.0
"""

from __future__ import annotations

import argparse
import os
import sys
from datetime import datetime, timedelta, timezone
from typing import Any


def _now() -> datetime:
    return datetime.now(timezone.utc)


def _today_start() -> str:
    t = _now().replace(hour=0, minute=0, second=0, microsecond=0)
    return t.isoformat()


def _week_start() -> str:
    t = _now() - timedelta(days=_now().weekday())
    t = t.replace(hour=0, minute=0, second=0, microsecond=0)
    return t.isoformat()


def _month_start() -> str:
    t = _now().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    return t.isoformat()


def get_stats() -> dict[str, Any]:
    """Pull all dashboard metrics from Supabase."""
    from supabase_client import get_client
    sb = get_client()
    stats: dict[str, Any] = {}

    # Revenue from stripe_events
    try:
        today = sb.table("stripe_events").select("amount").gte("created_at", _today_start()).eq("event_type", "payment_intent.succeeded").execute()
        week  = sb.table("stripe_events").select("amount").gte("created_at", _week_start()).eq("event_type", "payment_intent.succeeded").execute()
        month = sb.table("stripe_events").select("amount").gte("created_at", _month_start()).eq("event_type", "payment_intent.succeeded").execute()
        stats["revenue_today"]  = sum(r.get("amount", 0) for r in (today.data or []))
        stats["revenue_week"]   = sum(r.get("amount", 0) for r in (week.data or []))
        stats["revenue_month"]  = sum(r.get("amount", 0) for r in (month.data or []))
    except Exception:
        stats["revenue_today"] = stats["revenue_week"] = stats["revenue_month"] = 0

    # Clients
    try:
        clients = sb.table("clients").select("mrr,ltv,status").execute()
        active = [c for c in (clients.data or []) if c.get("status") == "active"]
        stats["active_clients"] = len(active)
        stats["mrr"]  = sum(c.get("mrr", 0) for c in active)
        stats["ltv"]  = sum(c.get("ltv", 0) for c in (clients.data or []))
    except Exception:
        stats["active_clients"] = stats["mrr"] = stats["ltv"] = 0

    # Pipeline stages
    try:
        leads_all = sb.table("leads").select("status", count="exact").execute()
        stats["leads_total"] = leads_all.count or 0
        for status in ["new", "contacted", "client", "too_clean"]:
            res = sb.table("leads").select("id", count="exact").eq("status", status).execute()
            stats[f"leads_{status}"] = res.count or 0
    except Exception:
        stats["leads_total"] = 0

    # Pipeline steps
    try:
        for step in [1, 2, 3]:
            res = sb.table("lead_pipeline").select("id", count="exact").eq("follow_up_step", step).eq("sequence_complete", False).execute()
            stats[f"pipeline_step{step}"] = res.count or 0
        converted = sb.table("lead_pipeline").select("id", count="exact").eq("converted", True).execute()
        stats["pipeline_converted"] = converted.count or 0
    except Exception:
        pass

    # Outreach stats
    try:
        sent_today = sb.table("outreach_log").select("id", count="exact").gte("sent_at", _today_start()).execute()
        sent_total = sb.table("outreach_log").select("id,opened,clicked,bounced").execute()
        rows = sent_total.data or []
        opened = sum(1 for r in rows if r.get("opened"))
        clicked = sum(1 for r in rows if r.get("clicked"))
        bounced = sum(1 for r in rows if r.get("bounced"))
        total = len(rows)
        stats["emails_today"] = sent_today.count or 0
        stats["emails_total"] = total
        stats["open_rate"]    = round(opened / total * 100, 1) if total else 0
        stats["click_rate"]   = round(clicked / total * 100, 1) if total else 0
        stats["bounce_rate"]  = round(bounced / total * 100, 1) if total else 0
        converted_count = stats.get("pipeline_converted", 0)
        stats["conversion_rate"] = round(converted_count / total * 100, 1) if total else 0
    except Exception:
        stats["emails_today"] = stats["emails_total"] = 0
        stats["open_rate"] = stats["click_rate"] = stats["bounce_rate"] = stats["conversion_rate"] = 0

    # Top verticals
    try:
        from supabase_client import get_client as _gc
        from collections import Counter
        vres = sb.table("leads").select("vertical").execute()
        vcounts = Counter(r.get("vertical", "unknown") for r in (vres.data or []))
        stats["top_verticals"] = vcounts.most_common(5)
    except Exception:
        stats["top_verticals"] = []

    # Scan health
    try:
        scan_res = sb.table("scan_results").select("score_pct,verdict").execute()
        rows = scan_res.data or []
        stats["total_scans"] = len(rows)
        if rows:
            scores = [r.get("score_pct", 0) for r in rows if r.get("score_pct") is not None]
            stats["avg_score"] = round(sum(scores) / len(scores), 1) if scores else 0
            stats["high_risk_pct"] = round(
                sum(1 for r in rows if r.get("verdict", "").upper() == "HIGH_RISK") / len(rows) * 100, 1
            )
        else:
            stats["avg_score"] = stats["high_risk_pct"] = 0
    except Exception:
        stats["total_scans"] = stats["avg_score"] = stats["high_risk_pct"] = 0

    # Recent activity
    try:
        recent_emails = sb.table("outreach_log").select("email_subject,sent_at,lead_id").order("sent_at", desc=True).limit(3).execute()
        recent_payments = sb.table("stripe_events").select("customer_email,created_at,amount").eq("event_type", "payment_intent.succeeded").order("created_at", desc=True).limit(3).execute()
        activity = []
        for r in (recent_payments.data or []):
            ts = r.get("created_at", "")[:16].replace("T", " ")
            activity.append(f"💰 {ts}  Payment ${r.get('amount',0):.0f} — {r.get('customer_email','?')}")
        for r in (recent_emails.data or []):
            ts = r.get("sent_at", "")[:16].replace("T", " ")
            subj = (r.get("email_subject") or "")[:40]
            activity.append(f"📧 {ts}  {subj}")
        activity.sort(reverse=True)
        stats["recent_activity"] = activity[:6]
    except Exception:
        stats["recent_activity"] = []

    stats["updated_at"] = _now().strftime("%H:%M:%S UTC")
    return stats


def render(stats: dict[str, Any]) -> None:
    from rich.console import Console
    from rich.layout import Layout
    from rich.panel import Panel
    from rich.table import Table
    from rich.text import Text

    console = Console()

    def money(v: float) -> str:
        return f"${v:,.0f}"

    def pct(v: float) -> str:
        return f"{v:.1f}%"

    # Revenue panel
    rev = (
        f"[bold green]{money(stats.get('revenue_today',0))}[/] today\n"
        f"[green]{money(stats.get('revenue_week',0))}[/] this week\n"
        f"[green]{money(stats.get('revenue_month',0))}[/] this month\n\n"
        f"Active clients: [bold]{stats.get('active_clients',0)}[/]\n"
        f"MRR: [bold]{money(stats.get('mrr',0))}[/]\n"
        f"LTV total: [bold]{money(stats.get('ltv',0))}[/]"
    )
    rev_panel = Panel(rev, title="[bold]💰 REVENUE[/]", border_style="green")

    # Pipeline panel
    pip = (
        f"Total leads: [bold]{stats.get('leads_total',0)}[/]\n"
        f"  New:        {stats.get('leads_new',0)}\n"
        f"  Contacted:  {stats.get('leads_contacted',0)}\n"
        f"  Day 3 seq:  {stats.get('pipeline_step1',0)}\n"
        f"  Day 7 seq:  {stats.get('pipeline_step2',0)}\n"
        f"  Day 14 seq: {stats.get('pipeline_step3',0)}\n"
        f"  [bold green]Converted:  {stats.get('pipeline_converted',0)}[/]"
    )
    pip_panel = Panel(pip, title="[bold]🔄 PIPELINE[/]", border_style="blue")

    # Outreach panel
    out = (
        f"Sent today:  [bold]{stats.get('emails_today',0)}[/]\n"
        f"Sent total:  {stats.get('emails_total',0)}\n"
        f"Open rate:   [bold]{pct(stats.get('open_rate',0))}[/]\n"
        f"Click rate:  {pct(stats.get('click_rate',0))}\n"
        f"Bounce rate: {pct(stats.get('bounce_rate',0))}\n"
        f"Conversion:  [bold green]{pct(stats.get('conversion_rate',0))}[/]"
    )
    out_panel = Panel(out, title="[bold]📧 OUTREACH[/]", border_style="yellow")

    # Scan health panel
    scn = (
        f"Total scans:   [bold]{stats.get('total_scans',0)}[/]\n"
        f"Avg risk score: {stats.get('avg_score',0)}/100\n"
        f"High risk:     [bold red]{pct(stats.get('high_risk_pct',0))}[/]"
    )
    scn_panel = Panel(scn, title="[bold]🔍 SCAN HEALTH[/]", border_style="red")

    # Top verticals
    v_lines = "\n".join(
        f"  {v}: {c}" for v, c in (stats.get("top_verticals") or [])
    ) or "  (no data)"
    vert_panel = Panel(v_lines, title="[bold]📊 TOP VERTICALS[/]", border_style="cyan")

    # Recent activity
    act_lines = "\n".join(stats.get("recent_activity") or ["  (no activity yet)"])
    act_panel = Panel(act_lines, title="[bold]⚡ RECENT ACTIVITY[/]", border_style="magenta")

    # Header
    console.print(f"\n[bold white on black]  🔍 BUG REAPER — REVENUE DASHBOARD   [/]"
                  f"[dim]  Updated {stats.get('updated_at','')}[/]\n")

    # Layout: 2 columns, 3 rows
    from rich.columns import Columns
    console.print(Columns([rev_panel, pip_panel], equal=True))
    console.print(Columns([out_panel, scn_panel], equal=True))
    console.print(Columns([vert_panel, act_panel], equal=True))
    console.print()


def main() -> None:
    p = argparse.ArgumentParser(description="Bug Reaper revenue dashboard")
    p.add_argument("--watch", action="store_true", help="Auto-refresh every 30 seconds")
    args = p.parse_args()

    if args.watch:
        try:
            from rich.live import Live
            import time
            with Live(refresh_per_second=1) as live:
                while True:
                    try:
                        stats = get_stats()
                        # Clear and re-render
                        from rich.console import Console
                        import io
                        buf = io.StringIO()
                        # Just re-render every 30s
                    except Exception as exc:
                        pass
                    time.sleep(30)
                    # Simpler: just clear and reprint
                    os.system("clear")
                    render(get_stats())
        except KeyboardInterrupt:
            pass
    else:
        try:
            stats = get_stats()
            render(stats)
        except Exception as exc:
            print(f"Dashboard error: {exc}")
            print("Make sure SUPABASE_ANON_KEY is set in your .env file")
            sys.exit(1)


if __name__ == "__main__":
    main()
