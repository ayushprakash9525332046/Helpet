# /payments/ - create order, verify, list

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.db.session import get_db
from app.models.payment import Payment, PaymentStatus
from app.models.booking import Booking, BookingStatus
from app.models.user import User
from app.schemas.payment import PaymentOrderCreate, PaymentVerify, PaymentResponse, RazorpayOrderResponse
from app.core.dependencies import get_current_user
from app.services import payment_service

router = APIRouter()


@router.post("/create-order", response_model=RazorpayOrderResponse, status_code=201)
def create_order(
    data: PaymentOrderCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    booking = db.query(Booking).filter(Booking.id == data.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if booking.customer_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Check if a pending payment already exists for this booking
    existing = db.query(Payment).filter(
        Payment.booking_id == booking.id,
        Payment.status == PaymentStatus.PENDING,
    ).first()
    if existing:
        return RazorpayOrderResponse(
            razorpay_order_id=existing.razorpay_order_id,
            amount=int(float(existing.amount) * 100),
            currency="INR",
            payment_id=existing.id,
        )

    rz_order = payment_service.create_razorpay_order(
        amount=float(booking.total_amount),
        receipt=str(booking.id),
    )

    payment = Payment(
        booking_id=booking.id,
        user_id=current_user.id,
        amount=booking.total_amount,
        razorpay_order_id=rz_order["id"],
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)

    return RazorpayOrderResponse(
        razorpay_order_id=rz_order["id"],
        amount=rz_order["amount"],
        currency=rz_order["currency"],
        payment_id=payment.id,
    )


@router.post("/verify", response_model=PaymentResponse)
def verify_payment(
    data: PaymentVerify,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    payment = db.query(Payment).filter(
        Payment.razorpay_order_id == data.razorpay_order_id
    ).first()
    if not payment:
        raise HTTPException(status_code=404, detail="Payment record not found")
    if payment.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Not authorized")

    is_valid = payment_service.verify_signature(
        data.razorpay_order_id,
        data.razorpay_payment_id,
        data.razorpay_signature,
    )
    if not is_valid:
        payment.status = PaymentStatus.FAILED
        db.commit()
        raise HTTPException(status_code=400, detail="Invalid payment signature")

    payment.status = PaymentStatus.SUCCESS
    payment.razorpay_payment_id = data.razorpay_payment_id
    payment.razorpay_signature = data.razorpay_signature

    # Confirm the booking
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
