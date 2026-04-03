# /payments/ - Stripe payment intents

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.models.payment import Payment, PaymentStatus
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.schemas.payment import PaymentIntentCreate, PaymentConfirm, PaymentResponse, StripeIntentResponse
from app.core.dependencies import get_current_user
from app.services import payment_service

router = APIRouter()


@router.post("/create-intent", response_model=StripeIntentResponse, status_code=201)
def create_intent(
    data: PaymentIntentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Reuse existing pending payment if one already exists
    existing = db.query(Payment).filter(
        Payment.booking_id == booking.id,
        Payment.status == PaymentStatus.PENDING,
    ).first()
    if existing and existing.stripe_payment_intent_id:
        intent = payment_service.retrieve_payment_intent(existing.stripe_payment_intent_id)
        return StripeIntentResponse(
            client_secret=intent["client_secret"],
            payment_intent_id=intent["id"],
            amount=intent["amount"],
            payment_id=existing.id,
        )

    intent = payment_service.create_payment_intent(
        amount=float(booking.total_amount),
        booking_id=str(booking.id),
    )

    payment = Payment(
        booking_id=booking.id,
        user_id=current_user.id,
        amount=booking.total_amount,
        stripe_payment_intent_id=intent["id"],
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return StripeIntentResponse(
        client_secret=intent["client_secret"],
        payment_intent_id=intent["id"],
        amount=intent["amount"],
        payment_id=payment.id,
    )


@router.post("/confirm", response_model=PaymentResponse)
def confirm_payment(
    data: PaymentConfirm,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment = db.query(Payment).filter(
        Payment.stripe_payment_intent_id == data.payment_intent_id
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    if payment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Verify with Stripe that the payment actually succeeded
    intent = payment_service.retrieve_payment_intent(data.payment_intent_id)
    if intent["status"] != "succeeded":
        raise HTTPException(status_code=400, detail=f"Payment not completed (status: {intent['status']})")

    payment.status = PaymentStatus.SUCCESS
    booking = db.query(Booking).filter(Booking.id == payment.booking_id).first()
    if booking:
        booking.status = BookingStatus.CONFIRMED
    db.commit()
    db.refresh(payment)
    return payment


@router.get("/my", response_model=List[PaymentResponse])
def get_my_payments(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Payment).filter(Payment.user_id == current_user.id).all()


@router.get("/{payment_id}", response_model=PaymentResponse)
def get_payment(
    payment_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment = db.query(Payment).filter(Payment.id == payment_id).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    if payment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return payment
