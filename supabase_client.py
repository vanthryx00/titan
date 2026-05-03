"""
Supabase client for Bug Reaper.
Provides a lazy-initialized client instance backed by project config.
"""

from __future__ import annotations

from functools import lru_cache
from typing import TYPE_CHECKING

from config import SUPABASE_ANON_KEY, SUPABASE_URL

if TYPE_CHECKING:
    from supabase import Client


@lru_cache(maxsize=1)
def get_client() -> "Client":
    """Return a cached Supabase client instance."""
    try:
        from supabase import create_client
    except ImportError as exc:
        raise ImportError(
            "supabase-py is not installed. Run: pip install supabase"
        ) from exc

    return create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
