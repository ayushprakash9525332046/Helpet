import stripe
from app.core.config import settings

stripe.api_key = settings.STRIPE_SECRET_KEY
stripe.max_network_retries = 2


def create_payment_intent(amount: float, booking_id: str) -> stripe.PaymentIntent:
    """Create a Stripe PaymentIntent. Amount is in INR (rupees); Stripe needs paise."""
    return stripe.PaymentIntent.create(
        amount=int(amount * 100),
        currency="inr",
        metadata={"booking_id": booking_id},
        automatic_payment_methods={"enabled": True},
    )


def retrieve_payment_intent(payment_intent_id: str) -> stripe.PaymentIntent:
    return stripe.PaymentIntent.retrieve(payment_intent_id)
