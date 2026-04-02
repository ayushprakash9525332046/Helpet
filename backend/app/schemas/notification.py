from pydantic import BaseModel
from uuid import UUID
from datetime import datetime
from app.models.notification import NotificationType


class NotificationResponse(BaseModel):
    id: UUID
    user_id: UUID
    title: str
    message: str
    type: NotificationType
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
