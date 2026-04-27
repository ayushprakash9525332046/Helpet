from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.booking import BookingStatus


from app.schemas.user import UserResponse


class BookingCreate(BaseModel):
    service_id: UUID
    sub_service_id: Optional[UUID] = None
    scheduled_at: datetime
    address: str
    notes: Optional[str] = None


class BookingUpdate(BaseModel):
    status: Optional[BookingStatus] = None
    provider_id: Optional[UUID] = None
    scheduled_at: Optional[datetime] = None


class ServiceCategoryInBooking(BaseModel):
    id: UUID
    name: str

    class Config:
        from_attributes = True


class ServiceInBooking(BaseModel):
    id: UUID
    name: str
    duration_minutes: int
    category: ServiceCategoryInBooking

    class Config:
        from_attributes = True


class BookingResponse(BaseModel):
    id: UUID
    customer_id: UUID
    customer: Optional[UserResponse] = None
    provider_id: Optional[UUID] = None
    provider: Optional[UserResponse] = None
    service_id: UUID
    service: ServiceInBooking
    sub_service_id: Optional[UUID] = None
    sub_service_name: Optional[str] = None
    status: BookingStatus
    scheduled_at: datetime
    address: str
    total_amount: float
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
