# Service categories & listings

from sqlalchemy import (
    Column,
    String,
    Boolean,
    Numeric,
    Text,
    Integer,
    ForeignKey,
    DateTime,
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.db.base import Base
from datetime import datetime, timezone
import uuid


# ── Service Category (Cleaning, Plumbing etc.) ──────────────────
class ServiceCategory(Base):
    __tablename__ = "service_categories"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(100), nullable=False)  # "Home Cleaning"
    description = Column(Text, nullable=True)
    icon = Column(Text, nullable=True)  # icon image URL or base64
    is_active = Column(Boolean, default=True)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # One category has many services (like populate in mongoose)
    services = relationship("Service", back_populates="category")


# ── Individual Service ───────────────────────────────────────────
class Service(Base):
    __tablename__ = "services"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    # Foreign Key (like ref in mongoose)
    category_id = Column(
        UUID(as_uuid=True), ForeignKey("service_categories.id"), nullable=False
    )

    name = Column(String(200), nullable=False)  # "Deep Clean 2BHK"
    description = Column(Text, nullable=True)
    image = Column(Text, nullable=True)
    price = Column(Numeric(10, 2), nullable=False)  # 499.00
    duration_minutes = Column(Integer, default=60)  # 60 mins
    is_active = Column(Boolean, default=True)
    created_at = Column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    category = relationship("ServiceCategory", back_populates="services")
    bookings = relationship("Booking", back_populates="service")
