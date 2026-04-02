from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.payment import PaymentStatus


class PaymentOrderCreate(BaseModel):
    booking_id: UUID


class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class PaymentResponse(BaseModel):
    id: UUID
    booking_id: UUID
    user_id: UUID
    amount: float
    status: PaymentStatus
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class RazorpayOrderResponse(BaseModel):
    razorpay_order_id: str
    amount: int          # in paise
    currency: str
    payment_id: UUID     # our internal Payment record id
