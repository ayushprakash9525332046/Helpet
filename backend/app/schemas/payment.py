from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.payment import PaymentStatus


class PaymentIntentCreate(BaseModel):
    booking_id: UUID


class PaymentConfirm(BaseModel):
    payment_intent_id: str


class PaymentResponse(BaseModel):
    id: UUID
    booking_id: UUID
    user_id: UUID
    amount: float
    status: PaymentStatus
    stripe_payment_intent_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class StripeIntentResponse(BaseModel):
    client_secret: str
    payment_intent_id: str
    amount: int   # in paise
    payment_id: UUID
