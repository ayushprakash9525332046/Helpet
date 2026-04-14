from pydantic import BaseModel, EmailStr
from app.models.otp import OTPPurpose


class OTPSendRequest(BaseModel):
    email: EmailStr
    purpose: OTPPurpose = OTPPurpose.LOGIN


class OTPVerifyRequest(BaseModel):
    email: EmailStr
    code: str


class PasswordResetConfirm(BaseModel):
    email: EmailStr
    code: str
    new_password: str
