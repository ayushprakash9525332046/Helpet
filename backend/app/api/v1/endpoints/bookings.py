# /bookings/, /bookings/{id}

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.models.booking import Booking, BookingStatus
from app.models.service import Service
from app.models.user import User, UserRole
from app.schemas.booking import BookingCreate, BookingUpdate, BookingResponse
from app.core.dependencies import get_current_user, get_current_admin

router = APIRouter()


@router.post("/", response_model=BookingResponse, status_code=201)
def create_booking(
    data: BookingCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = db.query(Service).filter(Service.id == data.service_id).first()
    if not service:
        raise HTTPException(status_code=404, detail="Service not found")

    booking = Booking(
        customer_id=current_user.id,
        service_id=data.service_id,
        scheduled_at=data.scheduled_at,
        address=data.address,
        notes=data.notes,
        total_amount=service.price,
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)
    return booking


@router.get("/my", response_model=List[BookingResponse])
def get_my_bookings(
    db: Session = Depends(get_db), current_user: User = Depends(get_current_user)
):
    return db.query(Booking).filter(Booking.customer_id == current_user.id).all()


@router.get("/{booking_id}", response_model=BookingResponse)
def get_booking(
    booking_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.customer_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    return booking


@router.put("/{booking_id}", response_model=BookingResponse)
def update_booking(
    booking_id: UUID,
    data: BookingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.customer_id != current_user.id and current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Not authorized")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(booking, key, value)
    db.commit()
    db.refresh(booking)
    return booking


@router.delete("/{booking_id}", status_code=204)
def cancel_booking(
    booking_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    booking.status = BookingStatus.CANCELLED
    db.commit()


@router.get("/", response_model=List[BookingResponse])
def get_all_bookings(
    db: Session = Depends(get_db), admin: User = Depends(get_current_admin)
):
    return db.query(Booking).all()
