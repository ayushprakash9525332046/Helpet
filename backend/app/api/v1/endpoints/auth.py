# /auth/register, /auth/login, /auth/otp/*, /auth/password-reset/*

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timezone, timedelta

from app.db.session import get_db
from app.models.user import User
from app.models.otp import OTP, OTPPurpose
from app.schemas.user import UserRegister, TokenResponse, UserResponse
from app.schemas.otp import OTPSendRequest, OTPVerifyRequest, PasswordResetConfirm
from app.core.security import hash_password, verify_password, create_access_token
from app.core.sms import generate_otp
from app.core.email import send_otp_email
from app.core.config import settings
from app.core.dependencies import get_current_user

from fastapi.security import OAuth2PasswordRequestForm

router = APIRouter()

OTP_EXPIRE_MINUTES = 10
OTP_RESEND_COOLDOWN_SECONDS = 60
OTP_MAX_ATTEMPTS = 5


def _invalidate_active_otps(db: Session, email: str, purpose: OTPPurpose) -> None:
    """Mark any existing unused OTP for this email+purpose as used, so only the latest one sent is ever valid."""
    db.query(OTP).filter(OTP.email == email, OTP.purpose == purpose, OTP.is_used == False).update(
        {"is_used": True}
    )


def _consume_otp(db: Session, email: str, code: str, purpose: OTPPurpose) -> OTP:
    """Look up the active OTP for this email+purpose and validate `code` against it, rate-limiting wrong guesses."""
    otp = (
        db.query(OTP)
        .filter(
            OTP.email == email,
            OTP.purpose == purpose,
            OTP.is_used == False,
            OTP.expires_at > datetime.now(timezone.utc),
        )
        .order_by(OTP.created_at.desc())
        .first()
    )
    if not otp:
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    if otp.attempts >= OTP_MAX_ATTEMPTS:
        raise HTTPException(status_code=400, detail="Too many incorrect attempts. Please request a new OTP.")
    if otp.code != code:
        otp.attempts += 1
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    return otp


# ── Register ─────────────────────────────────────────────────────
@router.post("/register", response_model=UserResponse, status_code=201)
def register(user_data: UserRegister, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if db.query(User).filter(User.phone == user_data.phone).first():
        raise HTTPException(status_code=400, detail="Phone number already registered")
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

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

    # Send email verification OTP
    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)
    _invalidate_active_otps(db, user_data.email, OTPPurpose.VERIFY)
    db.add(OTP(email=user_data.email, code=code, purpose=OTPPurpose.VERIFY, expires_at=expires_at))
    db.commit()
    background_tasks.add_task(send_otp_email, user_data.email, code, "verify")

    return new_user


# ── Password Login ───────────────────────────────────────────────
@router.post("/login", response_model=TokenResponse)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
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


# ── OTP: Send (email) ────────────────────────────────────────────
@router.post("/otp/send")
def send_otp(data: OTPSendRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if data.purpose in (OTPPurpose.LOGIN, OTPPurpose.RESET):
        if not db.query(User).filter(User.email == data.email).first():
            raise HTTPException(status_code=404, detail="No account found with this email")

    cooldown_cutoff = datetime.now(timezone.utc) - timedelta(seconds=OTP_RESEND_COOLDOWN_SECONDS)
    recent = (
        db.query(OTP)
        .filter(OTP.email == data.email, OTP.purpose == data.purpose, OTP.created_at > cooldown_cutoff)
        .first()
    )
    if recent:
        raise HTTPException(status_code=429, detail="Please wait 60 seconds before requesting another OTP")

    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)
    _invalidate_active_otps(db, data.email, data.purpose)
    db.add(OTP(email=data.email, code=code, purpose=data.purpose, expires_at=expires_at))
    db.commit()

    background_tasks.add_task(send_otp_email, data.email, code, data.purpose.value)
    return {"message": "OTP sent to your email"}


# ── OTP: Verify Login ────────────────────────────────────────────
@router.post("/otp/verify-login", response_model=TokenResponse)
def verify_otp_login(data: OTPVerifyRequest, db: Session = Depends(get_db)):
    otp = _consume_otp(db, data.email, data.code, OTPPurpose.LOGIN)

    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="No account found with this email")

    otp.is_used = True
    user.is_email_verified = True
    db.commit()

    access_token = create_access_token(
        data={"sub": str(user.id), "role": user.role},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    )
    return {"access_token": access_token, "token_type": "bearer", "user": user}


# ── OTP: Verify Email (after registration) ───────────────────────
@router.post("/otp/verify-email")
def verify_email_otp(data: OTPVerifyRequest, db: Session = Depends(get_db)):
    otp = _consume_otp(db, data.email, data.code, OTPPurpose.VERIFY)

    otp.is_used = True
    user = db.query(User).filter(User.email == data.email).first()
    if user:
        user.is_email_verified = True
    db.commit()

    # Auto-login: return a token so the frontend doesn't need a separate login step
    if user:
        access_token = create_access_token(
            data={"sub": str(user.id), "role": user.role},
            expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
        )
        return {"message": "Email verified successfully", "access_token": access_token, "token_type": "bearer", "user": user}
    return {"message": "Email verified successfully"}


# ── Password Reset: Request ──────────────────────────────────────
@router.post("/password-reset/request")
def request_password_reset(data: OTPSendRequest, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    if not db.query(User).filter(User.email == data.email).first():
        raise HTTPException(status_code=404, detail="No account found with this email")

    cooldown_cutoff = datetime.now(timezone.utc) - timedelta(seconds=OTP_RESEND_COOLDOWN_SECONDS)
    recent = (
        db.query(OTP)
        .filter(OTP.email == data.email, OTP.purpose == OTPPurpose.RESET, OTP.created_at > cooldown_cutoff)
        .first()
    )
    if recent:
        raise HTTPException(status_code=429, detail="Please wait 60 seconds before requesting another OTP")

    code = generate_otp()
    expires_at = datetime.now(timezone.utc) + timedelta(minutes=OTP_EXPIRE_MINUTES)
    _invalidate_active_otps(db, data.email, OTPPurpose.RESET)
    db.add(OTP(email=data.email, code=code, purpose=OTPPurpose.RESET, expires_at=expires_at))
    db.commit()

    background_tasks.add_task(send_otp_email, data.email, code, "reset")
    return {"message": "Password reset OTP sent to your email"}


# ── Password Reset: Confirm ──────────────────────────────────────
@router.post("/password-reset/confirm")
def confirm_password_reset(data: PasswordResetConfirm, db: Session = Depends(get_db)):
    if len(data.new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    otp = _consume_otp(db, data.email, data.code, OTPPurpose.RESET)

    user = db.query(User).filter(User.email == data.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    otp.is_used = True
    user.hashed_password = hash_password(data.new_password)
    db.commit()
    return {"message": "Password reset successfully"}
