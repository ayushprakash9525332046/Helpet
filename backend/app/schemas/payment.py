from pydantic import BaseModel
from typing import Literal, Optional
from uuid import UUID
from datetime import datetime
from app.models.payment import PaymentStatus


class PaymentIntentCreate(BaseModel):
    booking_id: UUID


class PaymentConfirm(BaseModel):
    payment_intent_id: str


class OfflinePaymentCreate(BaseModel):
    booking_id: UUID
    method: Literal["cod"]


class PaymentResponse(BaseModel):
    id: UUID
    booking_id: UUID
    user_id: UUID
    amount: float
    status: PaymentStatus
    created_at: datetime

    class Config:
        from_attributes = True


class TransactionResponse(BaseModel):
    transaction_id: str
    amount: int   # in paise
    payment_id: UUID
