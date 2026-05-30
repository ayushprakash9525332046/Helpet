# /admin/* (protected - admin only)

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import String, func, or_
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from uuid import UUID

from app.db.session import get_db
from app.models.user import User, UserRole, UserStatus
from app.models.booking import Booking, BookingStatus
from app.models.service import Service
from app.models.payment import Payment, PaymentStatus
from app.schemas.user import UserResponse
from app.schemas.booking import BookingResponse
from app.schemas.payment import PaymentResponse
from app.schemas.common import Page, paginate
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

@router.get("/users", response_model=Page[UserResponse])
def list_users(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: Optional[str] = None,
    role: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    query = db.query(User)

    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                User.full_name.ilike(term),
                User.phone.ilike(term),
                User.email.ilike(term),
            )
        )
    if role and role != "all":
        try:
            query = query.filter(User.role == UserRole(role))
        except ValueError:
            pass
    if status and status != "all":
        try:
            query = query.filter(User.status == UserStatus(status))
        except ValueError:
            pass

    total = query.count()
    items = (
        query.order_by(User.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return paginate(items, total, page, page_size)


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

@router.get("/bookings", response_model=Page[BookingResponse])
def list_bookings(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    # Eager-load service/category/customer so serialization doesn't N+1
    query = db.query(Booking).options(
        joinedload(Booking.service).joinedload(Service.category),
        joinedload(Booking.customer),
    )

    if status and status != "all":
        try:
            query = query.filter(Booking.status == BookingStatus(status))
        except ValueError:
            pass
    if search:
        term = f"%{search}%"
        query = (
            query.join(Service, Booking.service_id == Service.id)
            .join(User, Booking.customer_id == User.id)
            .filter(
                or_(
                    Service.name.ilike(term),
                    User.full_name.ilike(term),
                    Booking.address.ilike(term),
                )
            )
        )

    total = query.count()
    items = (
        query.order_by(Booking.scheduled_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return paginate(items, total, page, page_size)


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

@router.get("/payments", response_model=Page[PaymentResponse])
def list_payments(
    page: int = Query(1, ge=1),
    page_size: int = Query(25, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin),
):
    query = db.query(Payment)

    if status and status != "all":
        try:
            query = query.filter(Payment.status == PaymentStatus(status))
        except ValueError:
            pass
    if search:
        term = f"%{search}%"
        query = query.filter(
            or_(
                func.cast(Payment.id, String).ilike(term),
                func.cast(Payment.booking_id, String).ilike(term),
            )
        )

    total = query.count()
    items = (
        query.order_by(Payment.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return paginate(items, total, page, page_size)


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
