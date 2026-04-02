from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID
from datetime import datetime


class ReviewCreate(BaseModel):
    booking_id: UUID
    provider_id: UUID
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewResponse(BaseModel):
    id: UUID
    booking_id: UUID
    customer_id: UUID
    provider_id: UUID
    rating: int
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
