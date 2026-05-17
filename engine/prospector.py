"""
Lead prospector — imports and seeds new leads into the database.

Supports two modes:
  1. CSV import (business_name, website, email, vertical, city, province)
  2. Manual seed for testing

Future: Google Maps API scraping, LinkedIn, Yellow Pages — add here.
"""

from __future__ import annotations

import csv
import io
import logging
from typing import Any

from supabase_client import get_client

logger = logging.getLogger(__name__)


def import_csv(csv_text: str, default_province: str = "AB") -> list[dict[str, Any]]:
    """
    Parse a CSV string and upsert leads into the database.
    Expected columns (case-insensitive): business_name, website, email,
    vertical, city, province, phone, contact_name.
    Returns a list of inserted/updated lead rows.
    """
    reader = csv.DictReader(io.StringIO(csv_text.strip()))
    rows = []
    for raw in reader:
        row = {k.lower().strip(): v.strip() for k, v in raw.items()}
        if not row.get("business_name") or not row.get("website"):
            continue
        lead = {
            "business_name": row["business_name"],
            "vertical": row.get("vertical", "SMB"),
            "website": _normalise_url(row.get("website", "")),
            "status": "new",
        }
        if row.get("email"):
            lead["email"] = row["email"].lower()
        if row.get("phone"):
            lead["phone"] = row["phone"]
        if row.get("contact_name"):
            lead["contact_name"] = row["contact_name"]
        if row.get("city"):
            lead["city"] = row["city"]
        lead["province"] = row.get("province", default_province)
        rows.append(lead)

    if not rows:
        return []

    res = (
        get_client()
        .table("leads")
        .upsert(rows, on_conflict="email")
        .execute()
    )
    logger.info("Imported %d leads", len(res.data))
    return res.data


def seed_test_leads() -> list[dict[str, Any]]:
    """Insert a handful of fake Alberta businesses for pipeline testing."""
    test_leads = [
        {
            "business_name": "Calgary Plumbing Co.",
            "vertical": "trades",
            "website": "https://example-plumbing.ca",
            "email": "owner@example-plumbing.ca",
            "city": "Calgary",
            "province": "AB",
            "status": "new",
        },
        {
            "business_name": "Red Deer Dental",
            "vertical": "healthcare",
            "website": "https://example-dental.ca",
            "email": "admin@example-dental.ca",
            "city": "Red Deer",
            "province": "AB",
            "status": "new",
        },
        {
            "business_name": "Edmonton Auto Body",
            "vertical": "automotive",
            "website": "https://example-autobody.ca",
            "email": "info@example-autobody.ca",
            "city": "Edmonton",
            "province": "AB",
            "status": "new",
        },
    ]
    res = (
        get_client()
        .table("leads")
        .upsert(test_leads, on_conflict="email")
        .execute()
    )
    return res.data


def _normalise_url(url: str) -> str:
    url = url.strip()
    if url and not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url
