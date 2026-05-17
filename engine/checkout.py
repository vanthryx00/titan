"""
Stripe checkout link generator.

Creates a Stripe Payment Link (or Checkout Session) for the Starter security
report ($297 CAD), attaches lead metadata, and returns the URL to embed in the
outreach email.
"""

from __future__ import annotations

import os

import stripe

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
# Create this product once in your Stripe dashboard, then set the price ID:
STARTER_PRICE_ID = os.getenv("STRIPE_STARTER_PRICE_ID", "")
SUCCESS_URL = os.getenv("STRIPE_SUCCESS_URL", "https://bugreaper.io/report/delivered")
CANCEL_URL = os.getenv("STRIPE_CANCEL_URL", "https://bugreaper.io/report/cancelled")


def _client() -> stripe.Stripe:
    if not STRIPE_SECRET_KEY:
        raise EnvironmentError("STRIPE_SECRET_KEY must be set in .env")
    stripe.api_key = STRIPE_SECRET_KEY
    return stripe


def create_checkout_link(
    *,
    lead_id: int,
    domain: str,
    business_name: str,
    email: str | None = None,
) -> str:
    """
    Create a Stripe Checkout Session and return the URL.
    Falls back to a static payment link if price_id not configured.
    """
    _client()

    if not STRIPE_PRICE_ID_CONFIGURED():
        fallback = os.getenv("STRIPE_STARTER_PAYMENT_LINK", "")
        if fallback:
            return fallback
        raise EnvironmentError(
            "Set STRIPE_STARTER_PRICE_ID or STRIPE_STARTER_PAYMENT_LINK in .env"
        )

    params: dict = {
        "mode": "payment",
        "line_items": [{"price": STARTER_PRICE_ID, "quantity": 1}],
        "success_url": SUCCESS_URL + f"?session_id={{CHECKOUT_SESSION_ID}}&lead_id={lead_id}",
        "cancel_url": CANCEL_URL,
        "metadata": {
            "lead_id": str(lead_id),
            "domain": domain,
            "business_name": business_name,
            "product": "starter_report",
        },
        "payment_intent_data": {
            "metadata": {
                "lead_id": str(lead_id),
                "domain": domain,
            }
        },
    }

    if email:
        params["customer_email"] = email

    session = stripe.checkout.Session.create(**params)
    return session.url  # type: ignore[return-value]


def STRIPE_PRICE_ID_CONFIGURED() -> bool:
    return bool(STARTER_PRICE_ID)
