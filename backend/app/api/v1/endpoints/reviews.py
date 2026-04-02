# /reviews/ - create and read reviews

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.models.review import Review
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewResponse
from app.core.dependencies import get_current_user

router = APIRouter()


@router.post("/", response_model=ReviewResponse, status_code=201)
def create_review(
    data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Booking must be completed and belong to current user
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    if booking.status != BookingStatus.COMPLETED:
        raise HTTPException(status_code=400, detail="Can only review completed bookings")

    # One review per booking
    existing = db.query(Review).filter(Review.booking_id == data.booking_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Review already submitted for this booking")

    review = Review(
        booking_id=data.booking_id,
        customer_id=current_user.id,
        provider_id=data.provider_id,
        rating=data.rating,
        comment=data.comment,
    )
    db.add(review)
    db.commit()
    db.refresh(review)
    return review


@router.get("/provider/{provider_id}", response_model=List[ReviewResponse])
def get_provider_reviews(
    provider_id: UUID,
    db: Session = Depends(get_db),
):
    return db.query(Review).filter(Review.provider_id == provider_id).all()


@router.get("/my", response_model=List[ReviewResponse])
def get_my_reviews(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Review).filter(Review.customer_id == current_user.id).all()
