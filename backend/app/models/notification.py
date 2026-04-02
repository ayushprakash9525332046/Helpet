# Notifications model

from sqlalchemy import Column, String, Boolean, Text, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime, timezone
import uuid
import enum


class NotificationType(str, enum.Enum):
    BOOKING = "booking"
    PAYMENT = "payment"
    REVIEW = "review"
    GENERAL = "general"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    title = Column(String(200), nullable=False)
    message = Column(Text, nullable=False)
    type = Column(Enum(NotificationType), default=NotificationType.GENERAL, nullable=False)
    is_read = Column(Boolean, default=False)

    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    user = relationship("User")

    def __repr__(self):
        return f"<Notification {self.title} -> user={self.user_id}>"
