from pydantic import BaseModel
from app.models.otp import OTPPurpose


class OTPSendRequest(BaseModel):
    phone: str
    purpose: OTPPurpose = OTPPurpose.LOGIN


class OTPVerifyRequest(BaseModel):
    phone: str
    code: str


class PasswordResetConfirm(BaseModel):
    phone: str
    code: str
    new_password: str
