import uuid
import enum
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, DateTime, Enum as SAEnum
from sqlalchemy.dialects.postgresql import UUID
from app.db.base import Base


class OTPPurpose(str, enum.Enum):
    LOGIN = "login"
    RESET = "reset"
    VERIFY = "verify"


class OTP(Base):
    __tablename__ = "otps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    phone = Column(String(15), nullable=False, index=True)
    code = Column(String(6), nullable=False)
    purpose = Column(SAEnum(OTPPurpose), nullable=False)
    is_used = Column(Boolean, default=False)
    expires_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    def __repr__(self):
        return f"<OTP {self.phone} - {self.purpose}>"
