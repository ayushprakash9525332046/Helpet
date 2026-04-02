# Razorpay order creation & signature verification

import hmac
import hashlib
import razorpay
from app.core.config import settings

client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


def create_razorpay_order(amount: float, receipt: str) -> dict:
    """Create a Razorpay order. Amount is in rupees; Razorpay needs paise."""
    order = client.order.create({
        "amount": int(amount * 100),  # convert to paise
        "currency": "INR",
        "receipt": receipt,
        "payment_capture": 1,
    })
    return order


def verify_signature(razorpay_order_id: str, razorpay_payment_id: str, razorpay_signature: str) -> bool:
    """Verify Razorpay webhook/callback signature using HMAC-SHA256."""
    msg = f"{razorpay_order_id}|{razorpay_payment_id}"
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode(),
        msg.encode(),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, razorpay_signature)
