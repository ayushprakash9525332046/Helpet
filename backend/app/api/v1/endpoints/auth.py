# /auth/register, /auth/login, /auth/otp/*, /auth/password-reset/*

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from app.db.session import get_db
from app.models.user import User
from app.models.otp import OTP, OTPPurpose
from app.schemas.user import UserRegister, TokenResponse, UserResponse
from app.schemas.otp import OTPSendRequest, OTPVerifyRequest, PasswordResetConfirm
from app.core.security import hash_password, verify_password, create_access_token
from app.core.sms import generate_otp, send_otp_sms
from app.core.config import settings
from app.core.dependencies import get_current_user

from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

OTP_EXPIRE_MINUTES = 10
OTP_RESEND_COOLDOWN_SECONDS = 60


# ── Register ─────────────────────────────────────────────────────
@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.phone == user_data.phone).first()
    if existing:
        raise HTTPException(status_code=400, detail="Phone number already registered")

    new_user = User(
        full_name=user_data.full_name,
        phone=user_data.phone,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        role=user_data.role,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# ── Password Login ───────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.phone == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid phone or password")
    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}


# ── Current User ─────────────────────────────────────────────────
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


# ── OTP: Send ────────────────────────────────────────────────────
@router.post("/otp/send")
def send_otp(data: OTPSendRequest, db: Session = Depends(get_db)):
    # For login/reset, verify user exists
    if data.purpose in (OTPPurpose.LOGIN, OTPPurpose.RESET):
        user = db.query(User).filter(User.phone == data.phone).first()
        if not user:
            raise HTTPException(status_code=404, detail="No account found with this phone number")

    # Rate-limit: one OTP per phone per purpose per 60 seconds
    cooldown_cutoff = datetime.now(timezone.utc) - timedelta(seconds=OTP_RESEND_COOLDOWN_SECONDS)
    recent = (
        db.query(OTP)
        .filter(OTP.phone == data.phone, OTP.purpose == data.purpose, OTP.created_at > cooldown_cutoff)
        .first()
    )
    if recent:
        raise HTTPException(status_code=429, detail="Please wait 60 seconds before requesting another OTP")

    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)
    otp = OTP(phone=data.phone, code=code, purpose=data.purpose, expires_at=expires_at)
    db.add(otp)
    db.commit()

    send_otp_sms(data.phone, code, data.purpose.value)
    return {"message": "OTP sent successfully"}


# ── OTP: Verify Login ────────────────────────────────────────────
@router.post("/otp/verify-login", response_model=TokenResponse)
def verify_otp_login(data: OTPVerifyRequest, db: Session = Depends(get_db)):
    otp = (
        db.query(OTP)
        .filter(
            OTP.phone == data.phone,
            OTP.code == data.code,
            OTP.purpose == OTPPurpose.LOGIN,
            OTP.is_used == False,
            OTP.expires_at > datetime.now(timezone.utc),
        )
        .order_by(OTP.created_at.desc())
        .first()
    )
    if not otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.phone == data.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this phone number")

    otp.is_used = True
    user.is_phone_verified = True
    db.commit()

    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}


# ── OTP: Verify Phone (registration) ────────────────────────────
@router.post("/otp/verify-phone")
def verify_phone_otp(data: OTPVerifyRequest, db: Session = Depends(get_db)):
    otp = (
        db.query(OTP)
        .filter(
            OTP.phone == data.phone,
            OTP.code == data.code,
            OTP.purpose == OTPPurpose.VERIFY,
            OTP.is_used == False,
            OTP.expires_at > datetime.now(timezone.utc),
        )
        .order_by(OTP.created_at.desc())
        .first()
    )
    if not otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    otp.is_used = True
    user = db.query(User).filter(User.phone == data.phone).first()
    if user:
        user.is_phone_verified = True
    db.commit()
    return {"message": "Phone verified successfully"}


# ── Password Reset: Request ──────────────────────────────────────
@router.post("/password-reset/request")
def request_password_reset(data: OTPSendRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.phone == data.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this phone number")

    cooldown_cutoff = datetime.now(timezone.utc) - timedelta(seconds=OTP_RESEND_COOLDOWN_SECONDS)
    recent = (
        db.query(OTP)
        .filter(OTP.phone == data.phone, OTP.purpose == OTPPurpose.RESET, OTP.created_at > cooldown_cutoff)
        .first()
    )
    if recent:
        raise HTTPException(status_code=429, detail="Please wait 60 seconds before requesting another OTP")

    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)
    otp = OTP(phone=data.phone, code=code, purpose=OTPPurpose.RESET, expires_at=expires_at)
    db.add(otp)
    db.commit()

    send_otp_sms(data.phone, code, "reset")
    return {"message": "Password reset OTP sent"}


# ── Password Reset: Confirm ──────────────────────────────────────
@router.post("/password-reset/confirm")
def confirm_password_reset(data: PasswordResetConfirm, db: Session = Depends(get_db)):
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    otp = (
        db.query(OTP)
        .filter(
            OTP.phone == data.phone,
            OTP.code == data.code,
            OTP.purpose == OTPPurpose.RESET,
            OTP.is_used == False,
            OTP.expires_at > datetime.now(timezone.utc),
        )
        .order_by(OTP.created_at.desc())
        .first()
    )
    if not otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")

    user = db.query(User).filter(User.phone == data.phone).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp.is_used = True
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password reset successfully"}
