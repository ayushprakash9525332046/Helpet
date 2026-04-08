from pydantic import BaseModel, EmailStr
from typing import Optional
from uuid import UUID
from datetime import datetime
from app.models.user import UserRole, UserStatus

# ── What client SENDS ────────────────────────────────────────


class UserRegister(BaseModel):
    """Data needed to register"""

    full_name: str
    phone: str
    email: Optional[EmailStr] = None
    password: str
    role: UserRole = UserRole.CUSTOMER


class UserLogin(BaseModel):
    """Data needed to login"""

    phone: str
    password: str


class UserUpdate(BaseModel):
    """Data to update profile"""

    full_name: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None


# ── What server RETURNS ──────────────────────────────────────
class UserResponse(BaseModel):
    """User data returned to client — never includes password!"""

    id: UUID
    full_name: str
    phone: str
    email: Optional[str] = None
    role: UserRole
    status: UserStatus
    is_verified: bool
    created_at: datetime
    profile_picture: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    pincode: Optional[str] = None

    class Config:
        from_attributes = True


class TokenResponse(BaseModel):
    """JWT token returned after login"""

    access_token: str
    token_type: str = "bearer"
    user: UserResponse
