# /admin/* (protected - admin only)

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.models.user import User, UserStatus
from app.models.booking import Booking, BookingStatus
from app.models.service import Service
from app.models.payment import Payment, PaymentStatus
from app.schemas.user import UserResponse
from app.schemas.booking import BookingResponse
from app.schemas.payment import PaymentResponse
from app.core.dependencies import get_current_admin

router = APIRouter()


# ── Dashboard Stats ─────────────────────────────────────────────

@router.get("/stats")
def get_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    total_users = db.query(func.count(User.id)).scalar()
    total_bookings = db.query(func.count(Booking.id)).scalar()
    total_services = db.query(func.count(Service.id)).scalar()
    total_revenue = db.query(func.sum(Payment.amount)).filter(
        Payment.status == PaymentStatus.SUCCESS
    ).scalar() or 0

    return {
        "total_users": total_users,
        "total_bookings": total_bookings,
        "total_services": total_services,
        "total_revenue": float(total_revenue),
    }


# ── User Management ─────────────────────────────────────────────

@router.get("/users", response_model=List[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return db.query(User).all()


@router.put("/users/{user_id}/status")
def update_user_status(
    user_id: UUID,
    new_status: UserStatus,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = new_status
    db.commit()
    return {"message": f"User status updated to {new_status.value}"}


# ── User Delete ─────────────────────────────────────────────────

@router.delete("/users/{user_id}", status_code=204)
def delete_user(
    user_id: UUID,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.status = UserStatus.INACTIVE
    db.commit()


# ── Booking Management ──────────────────────────────────────────

@router.get("/bookings", response_model=List[BookingResponse])
def list_bookings(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return db.query(Booking).all()


@router.put("/bookings/{booking_id}/status")
def update_booking_status(
    booking_id: UUID,
    new_status: BookingStatus,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    booking.status = new_status
    db.commit()
    return {"message": f"Booking status updated to {new_status.value}"}


# ── Payment Management ──────────────────────────────────────────

@router.get("/payments", response_model=List[PaymentResponse])
def list_payments(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    return db.query(Payment).all()


@router.put("/payments/{payment_id}/status")
def update_payment_status(
    payment_id: UUID,
    new_status: PaymentStatus,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    payment.status = new_status
    db.commit()
    return {"message": f"Payment status updated to {new_status.value}"}
