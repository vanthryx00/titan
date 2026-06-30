"""
Google Places API lead scraper for Alberta SMBs.

discover_leads(vertical, city) → list of business dicts
upsert_leads(leads)            → saves to Supabase leads table, returns IDs

Requires: GOOGLE_PLACES_API_KEY in .env
Optional: YELP_API_KEY as fallback
"""

from __future__ import annotations

import json
import os
import time
import urllib.parse
import urllib.request
from typing import Any

from supabase_client import get_client

GOOGLE_PLACES_KEY = os.getenv("GOOGLE_PLACES_API_KEY", "")
YELP_API_KEY = os.getenv("YELP_API_KEY", "")

VERTICALS = [
    "plumber", "electrician", "HVAC contractor", "roofer", "landscaper",
    "dentist", "chiropractor", "optometrist", "physiotherapist",
    "auto repair", "car dealership", "accountant", "lawyer",
    "mortgage broker", "restaurant", "hotel",
]

CITIES = ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "Medicine Hat"]


def _pick_vertical() -> str:
    """Return the vertical with fewest leads already in the database."""
    try:
        sb = get_client()
        counts: dict[str, int] = {}
        for v in VERTICALS:
            res = sb.table("leads").select("id", count="exact").eq("vertical", v).execute()
            counts[v] = res.count or 0
        return min(counts, key=counts.get)  # type: ignore[arg-type]
    except Exception:
        return VERTICALS[0]


def _pick_city() -> str:
    """Return the city with fewest leads already in the database."""
    try:
        sb = get_client()
        counts: dict[str, int] = {}
        for c in CITIES:
            res = sb.table("leads").select("id", count="exact").eq("city", c).execute()
            counts[c] = res.count or 0
        return min(counts, key=counts.get)  # type: ignore[arg-type]
    except Exception:
        return CITIES[0]


def _normalise_url(url: str) -> str:
    url = url.strip()
    if url and not url.startswith(("http://", "https://")):
        url = "https://" + url
    return url


def _extract_domain(url: str) -> str | None:
    if not url:
        return None
    domain = (
        url.lower()
        .removeprefix("https://")
        .removeprefix("http://")
        .split("/")[0]
        .strip()
    )
    return domain if "." in domain else None


# ─── Google Places ────────────────────────────────────────────────────────────

def _places_page(query: str, page_token: str | None = None) -> dict:
    params: dict[str, str] = {
        "query": query,
        "key": GOOGLE_PLACES_KEY,
        "fields": "name,website,formatted_phone_number,formatted_address,place_id",
    }
    if page_token:
        params["pagetoken"] = page_token
    url = "https://maps.googleapis.com/maps/api/place/textsearch/json?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={"User-Agent": "BugReaper/1.0"})
    with urllib.request.urlopen(req, timeout=10) as r:
        return json.loads(r.read())


def _from_google_places(vertical: str, city: str, max_results: int) -> list[dict]:
    if not GOOGLE_PLACES_KEY:
        return []

    query = f"{vertical} in {city} Alberta Canada"
    results = []
    page_token = None

    while len(results) < max_results:
        try:
            data = _places_page(query, page_token)
        except Exception:
            break

        for place in data.get("results", []):
            website = place.get("website", "")
            if not website:
                continue  # can't scan without a domain
            domain = _extract_domain(website)
            if not domain:
                continue
            # Extract city from formatted_address
            address = place.get("formatted_address", "")
            lead_city = city
            for c in CITIES:
                if c.lower() in address.lower():
                    lead_city = c
                    break
            results.append({
                "business_name": place.get("name", ""),
                "vertical": vertical,
                "website": _normalise_url(website),
                "phone": place.get("formatted_phone_number"),
                "city": lead_city,
                "province": "AB",
                "status": "new",
                "source": "google_places",
            })
            if len(results) >= max_results:
                break

        page_token = data.get("next_page_token")
        if not page_token:
            break
        time.sleep(2)  # Google requires 2s between page_token requests

    return results


# ─── Yelp fallback ────────────────────────────────────────────────────────────

def _from_yelp(vertical: str, city: str, max_results: int) -> list[dict]:
    if not YELP_API_KEY:
        return []
    params = {
        "term": vertical,
        "location": f"{city}, AB, Canada",
        "limit": min(max_results, 50),
    }
    url = "https://api.yelp.com/v3/businesses/search?" + urllib.parse.urlencode(params)
    req = urllib.request.Request(url, headers={
        "Authorization": f"Bearer {YELP_API_KEY}",
        "User-Agent": "BugReaper/1.0",
    })
    try:
        with urllib.request.urlopen(req, timeout=10) as r:
            data = json.loads(r.read())
    except Exception:
        return []

    results = []
    for biz in data.get("businesses", []):
        url_field = biz.get("url", "")  # Yelp URL, not business website
        # Yelp doesn't return the business website directly on search — skip without website
        website = biz.get("attributes", {}).get("business_url", "")
        if not website:
            continue
        results.append({
            "business_name": biz.get("name", ""),
            "vertical": vertical,
            "website": _normalise_url(website),
            "phone": biz.get("phone"),
            "city": biz.get("location", {}).get("city", city),
            "province": "AB",
            "status": "new",
            "source": "yelp",
        })
    return results


# ─── Public API ───────────────────────────────────────────────────────────────

def discover_leads(
    vertical: str | None = None,
    city: str | None = None,
    max_results: int = 20,
) -> list[dict[str, Any]]:
    """
    Discover Alberta SMB leads by vertical + city.
    Auto-picks the least-represented vertical/city if not specified.
    Returns raw list of lead dicts (not yet saved to DB).
    """
    v = vertical or _pick_vertical()
    c = city or _pick_city()

    leads = _from_google_places(v, c, max_results)
    if not leads and YELP_API_KEY:
        leads = _from_yelp(v, c, max_results)

    print(f"  Discovered {len(leads)} '{v}' leads in {c}")
    return leads


def upsert_leads(leads: list[dict[str, Any]]) -> list[int]:
    """
    Upsert leads to Supabase. Deduplicates on (website).
    Returns list of lead IDs (new + existing).
    """
    if not leads:
        return []

    # Remove email-less leads are fine — we'll try to find emails during outreach
    # Remove leads with duplicate websites in this batch
    seen: set[str] = set()
    deduped = []
    for lead in leads:
        key = lead.get("website", "").lower()
        if key and key not in seen:
            seen.add(key)
            deduped.append(lead)

    try:
        res = (
            get_client()
            .table("leads")
            .upsert(deduped, on_conflict="website")
            .execute()
        )
        return [row["id"] for row in (res.data or [])]
    except Exception as exc:
        print(f"  Warning: upsert_leads error — {exc}")
        return []
