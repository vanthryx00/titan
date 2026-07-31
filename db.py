"""
Typed data-access helpers for Bug Reaper → Supabase.

Each function returns raw dicts from PostgREST; callers can cast them to the
dataclasses defined at the top of this module.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any
from uuid import UUID

from supabase_client import get_client


# ─── Dataclasses ──────────────────────────────────────────────────────────────

@dataclass
class ScanResult:
    id: UUID
    scan_type: str
    target: str
    status: str
    severity: str | None
    findings: list[dict[str, Any]]
    score: int | None
    score_pct: float | None
    verdict: str | None
    engine: str | None
    lead_id: int | None
    client_id: UUID | None
    created_at: datetime | None


@dataclass
class AgentTask:
    id: UUID
    agent_name: str
    task_type: str
    priority: int
    status: str
    payload: dict[str, Any]
    result: dict[str, Any] | None
    error: str | None
    retries: int
    max_retries: int
    created_at: datetime | None


@dataclass
class AgentRun:
    id: UUID
    command: str
    agent_bus_xml: str
    worker_count: int | None
    status: str | None
    total_tokens: int | None
    duration_ms: int | None
    created_at: datetime | None


@dataclass
class SecurityEvent:
    id: UUID
    event_id: str
    threat_level: str
    source_ip: str | None
    attack_vector: str | None
    blocked: bool
    response_time_ms: int | None
    payload_hash: str | None
    created_at: datetime | None


@dataclass
class Lead:
    id: int
    business_name: str
    vertical: str
    status: str
    lead_score: int
    email: str | None
    phone: str | None
    website: str | None
    city: str | None
    province: str | None
    created_at: datetime | None


@dataclass
class Client:
    id: UUID
    business_name: str
    contact_email: str
    status: str
    mrr: float
    ltv: float
    lead_id: int | None
    created_at: datetime | None


# ─── scan_results ─────────────────────────────────────────────────────────────

def insert_scan_result(
    *,
    scan_type: str,
    target: str,
    engine: str | None = None,
    lead_id: int | None = None,
    client_id: str | None = None,
    triggered_by: str | None = None,
) -> dict[str, Any]:
    row = {
        "scan_type": scan_type,
        "target": target,
        "status": "pending",
        "findings": [],
        **({"engine": engine} if engine else {}),
        **({"lead_id": lead_id} if lead_id else {}),
        **({"client_id": client_id} if client_id else {}),
        **({"triggered_by": triggered_by} if triggered_by else {}),
    }
    res = get_client().table("scan_results").insert(row).execute()
    return res.data[0]


def complete_scan_result(
    scan_id: str,
    *,
    findings: list[dict[str, Any]],
    score: int | None = None,
    score_pct: float | None = None,
    verdict: str | None = None,
    severity: str | None = None,
    raw_output: str | None = None,
) -> dict[str, Any]:
    updates: dict[str, Any] = {
        "status": "complete",
        "findings": findings,
        **({"score": score} if score is not None else {}),
        **({"score_pct": score_pct} if score_pct is not None else {}),
        **({"verdict": verdict} if verdict else {}),
        **({"severity": severity} if severity else {}),
        **({"raw_output": raw_output} if raw_output else {}),
    }
    res = (
        get_client()
        .table("scan_results")
        .update(updates)
        .eq("id", scan_id)
        .execute()
    )
    return res.data[0]


def get_scan_results(
    *,
    lead_id: int | None = None,
    client_id: str | None = None,
    status: str | None = None,
    limit: int = 50,
) -> list[dict[str, Any]]:
    q = get_client().table("scan_results").select("*").limit(limit)
    if lead_id is not None:
        q = q.eq("lead_id", lead_id)
    if client_id is not None:
        q = q.eq("client_id", client_id)
    if status is not None:
        q = q.eq("status", status)
    return q.order("created_at", desc=True).execute().data


# ─── agent_tasks ──────────────────────────────────────────────────────────────

def enqueue_task(
    agent_name: str,
    task_type: str,
    payload: dict[str, Any],
    *,
    priority: int = 5,
) -> dict[str, Any]:
    res = (
        get_client()
        .table("agent_tasks")
        .insert(
            {
                "agent_name": agent_name,
                "task_type": task_type,
                "payload": payload,
                "priority": priority,
                "status": "queued",
            }
        )
        .execute()
    )
    return res.data[0]


def claim_next_task(agent_name: str) -> dict[str, Any] | None:
    res = (
        get_client()
        .table("agent_tasks")
        .select("*")
        .eq("agent_name", agent_name)
        .eq("status", "queued")
        .order("priority", desc=False)
        .order("created_at", desc=False)
        .limit(1)
        .execute()
    )
    if not res.data:
        return None
    task = res.data[0]
    get_client().table("agent_tasks").update({"status": "running"}).eq(
        "id", task["id"]
    ).execute()
    return task


def finish_task(
    task_id: str,
    *,
    result: dict[str, Any] | None = None,
    error: str | None = None,
) -> dict[str, Any]:
    status = "failed" if error else "done"
    updates: dict[str, Any] = {"status": status}
    if result is not None:
        updates["result"] = result
    if error is not None:
        updates["error"] = error
    res = (
        get_client()
        .table("agent_tasks")
        .update(updates)
        .eq("id", task_id)
        .execute()
    )
    return res.data[0]


# ─── agent_runs ───────────────────────────────────────────────────────────────

def log_agent_run(
    command: str,
    agent_bus_xml: str,
    *,
    worker_count: int | None = None,
    status: str = "running",
) -> dict[str, Any]:
    res = (
        get_client()
        .table("agent_runs")
        .insert(
            {
                "command": command,
                "agent_bus_xml": agent_bus_xml,
                **({"worker_count": worker_count} if worker_count else {}),
                "status": status,
            }
        )
        .execute()
    )
    return res.data[0]


def finish_agent_run(
    run_id: str,
    *,
    status: str,
    total_tokens: int | None = None,
    duration_ms: int | None = None,
) -> dict[str, Any]:
    updates: dict[str, Any] = {"status": status}
    if total_tokens is not None:
        updates["total_tokens"] = total_tokens
    if duration_ms is not None:
        updates["duration_ms"] = duration_ms
    res = (
        get_client()
        .table("agent_runs")
        .update(updates)
        .eq("id", run_id)
        .execute()
    )
    return res.data[0]


# ─── security_events ──────────────────────────────────────────────────────────

def log_security_event(
    event_id: str,
    threat_level: str,
    *,
    source_ip: str | None = None,
    attack_vector: str | None = None,
    blocked: bool = False,
    response_time_ms: int | None = None,
    payload_hash: str | None = None,
) -> dict[str, Any]:
    res = (
        get_client()
        .table("security_events")
        .insert(
            {
                "event_id": event_id,
                "threat_level": threat_level,
                "blocked": blocked,
                **({"source_ip": source_ip} if source_ip else {}),
                **({"attack_vector": attack_vector} if attack_vector else {}),
                **({"response_time_ms": response_time_ms} if response_time_ms is not None else {}),
                **({"payload_hash": payload_hash} if payload_hash else {}),
            }
        )
        .execute()
    )
    return res.data[0]


# ─── leads ────────────────────────────────────────────────────────────────────

def get_leads(
    *,
    status: str | None = None,
    vertical: str | None = None,
    limit: int = 100,
) -> list[dict[str, Any]]:
    q = get_client().table("leads").select("*").limit(limit)
    if status:
        q = q.eq("status", status)
    if vertical:
        q = q.eq("vertical", vertical)
    return q.order("created_at", desc=True).execute().data


def get_lead(lead_id: int) -> dict[str, Any] | None:
    res = (
        get_client().table("leads").select("*").eq("id", lead_id).limit(1).execute()
    )
    return res.data[0] if res.data else None


def update_lead_status(lead_id: int, status: str) -> dict[str, Any]:
    res = (
        get_client()
        .table("leads")
        .update({"status": status})
        .eq("id", lead_id)
        .execute()
    )
    return res.data[0]


# ─── clients ──────────────────────────────────────────────────────────────────

def get_clients(
    *,
    status: str | None = None,
    limit: int = 100,
) -> list[dict[str, Any]]:
    q = get_client().table("clients").select("*").limit(limit)
    if status:
        q = q.eq("status", status)
    return q.order("created_at", desc=True).execute().data


def get_client_record(client_id: str) -> dict[str, Any] | None:
    res = (
        get_client()
        .table("clients")
        .select("*")
        .eq("id", client_id)
        .limit(1)
        .execute()
    )
    return res.data[0] if res.data else None
