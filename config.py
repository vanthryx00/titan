"""
Bug Reaper configuration loader.
Reads settings from environment variables (populated via .env file).
"""

import os
from pathlib import Path

# Load .env if python-dotenv is available
try:
    from dotenv import load_dotenv
    load_dotenv(Path(__file__).parent / ".env")
except ImportError:
    pass  # Rely on environment variables set by the shell / container


def _require(key: str) -> str:
    """Return the value of a required env var, raising if missing."""
    value = os.getenv(key)
    if not value:
        raise EnvironmentError(
            f"Required environment variable '{key}' is not set. "
            "Copy .env.example to .env and fill in your values."
        )
    return value


# ─── Google Gemini ────────────────────────────────────────────────────────────
GEMINI_API_KEY: str = _require("GEMINI_API_KEY")

# ─── Database ─────────────────────────────────────────────────────────────────
DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://localhost:5432/bugreaper")

# ─── Redis ────────────────────────────────────────────────────────────────────
REDIS_URL: str = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# ─── Notifications (all optional) ─────────────────────────────────────────────
SLACK_WEBHOOK_URL: str | None = os.getenv("SLACK_WEBHOOK_URL")
PAGERDUTY_API_KEY: str | None = os.getenv("PAGERDUTY_API_KEY")
JIRA_API_TOKEN: str | None = os.getenv("JIRA_API_TOKEN")
JIRA_BASE_URL: str | None = os.getenv("JIRA_BASE_URL")
DISCORD_WEBHOOK_URL: str | None = os.getenv("DISCORD_WEBHOOK_URL")

# ─── GitHub ───────────────────────────────────────────────────────────────────
GITHUB_TOKEN: str | None = os.getenv("GITHUB_TOKEN")

# ─── App ──────────────────────────────────────────────────────────────────────
APP_ENV: str = os.getenv("APP_ENV", "development")
LOG_LEVEL: str = os.getenv("LOG_LEVEL", "INFO")
