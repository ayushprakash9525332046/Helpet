import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Integer, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


class OTPPurpose(str, enum.Enum):
    LOGIN = "login"
    RESET = "reset"
    VERIFY = "verify"


class OTP(Base):
    __tablename__ = "otps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), nullable=True, index=True)
    phone = Column(String(15), nullable=True, index=True)
    code = Column(String(6), nullable=False)
    purpose = Column(SAEnum(OTPPurpose), nullable=False)
    is_used = Column(Boolean, default=False)
    attempts = Column(Integer, default=0, nullable=False, server_default="0")
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    def __repr__(self):
        return f"<OTP {self.phone} - {self.purpose}>"
