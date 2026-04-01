# SQLAlchemy base

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import all models here so Alembic can detect them
from app.models.user import User  # noqa
from app.models.service import ServiceCategory, Service  # noqa
from app.models.booking import Booking  # noqa
