import re
from pydantic import BaseModel, EmailStr, field_validator
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.user import UserRole, UserStatus


# ── What client SENDS ────────────────────────────────────────

class UserRegister(BaseModel):
    full_name: str
    phone: str
    email: EmailStr
    password: str
    role: UserRole = UserRole.CUSTOMER

    @field_validator("phone")
    @classmethod
    def validate_indian_phone(cls, v: str) -> str:
        v = v.strip()
        if not re.match(r"^[6-9]\d{9}$", v):
            raise ValueError("Enter a valid 10-digit Indian mobile number (starts with 6-9)")
        return v


class UserLogin(BaseModel):
    phone: str
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None


class UserStatusUpdate(BaseModel):
    status: UserStatus


class UserRoleUpdate(BaseModel):
    role: UserRole


# ── What server RETURNS ──────────────────────────────────────
class UserResponse(BaseModel):
    id: UUID
    full_name: str
    phone: str
    email: str
    role: UserRole
    status: UserStatus
    is_verified: bool
    is_email_verified: bool
    created_at: datetime
    profile_picture: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
