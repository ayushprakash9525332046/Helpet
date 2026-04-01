from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.booking import BookingStatus


class BookingCreate(BaseModel):
    service_id: UUID
    scheduled_at: datetime
    address: str
    notes: Optional[str] = None


class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None
    provider_id: Optional[UUID] = None
    scheduled_at: Optional[datetime] = None


class BookingResponse(BaseModel):
    id: UUID
    customer_id: UUID
    provider_id: Optional[UUID] = None
    service_id: UUID
    status: BookingStatus
    scheduled_at: datetime
    address: str
    total_amount: float
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
