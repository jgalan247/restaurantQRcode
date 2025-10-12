from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from decimal import Decimal
import secrets

from app.api.deps import get_db
from app.schemas.order import SplitEqualRequest, SplitByItemsRequest, PaymentSplitResponse
from app.services.payment_service import CityPayService
from app.services.email_service import send_payment_link_email
from app.models.payment import PaymentSplit
from app.models.order import Order
from app.config import get_settings

router = APIRouter()
settings = get_settings()


@router.post("/split-equal/{order_id}")
async def split_payment_equally(
    order_id: int,
    split_data: SplitEqualRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Split payment equally among N people"""

    # Get order
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Calculate tip and total
    tip = order.subtotal * Decimal(str(split_data.tip_percentage / 100))
    total_with_tip = order.subtotal + order.gst_amount + tip
    amount_per_person = total_with_tip / split_data.people_count

    # Update order tip
    order.tip_amount = tip
    order.total_amount = total_with_tip
    order.status = "pending_payment"

    # Create payment splits
    payment_links = []
    citypay = CityPayService()

    for i, email in enumerate(split_data.emails):
        split_token = secrets.token_urlsafe(32)

        payment_split = PaymentSplit(
            order_id=order_id,
            split_token=split_token,
            customer_name=f"Guest {i+1}",
            customer_email=email,
            amount_to_pay=amount_per_person,
            payment_status="pending",
        )
        db.add(payment_split)
        await db.flush()

        # Create CityPay payment intent
        payment_intent = await citypay.create_payment_intent(
            amount=amount_per_person,
            order_number=order.order_number,
            customer_email=email,
            split_token=split_token,
        )

        payment_split.payment_provider_id = payment_intent.get("identifier")

        # Send email with payment link
        payment_url = payment_intent.get("redirect_url", f"{settings.FRONTEND_URL}/payment/{split_token}")
        background_tasks.add_task(
            send_payment_link_email,
            email=email,
            payment_url=payment_url,
            amount=amount_per_person,
            order_number=order.order_number,
        )

        payment_links.append({
            "email": email,
            "amount": float(amount_per_person),
            "payment_url": payment_url,
            "split_token": split_token,
        })

    await db.commit()

    return {
        "message": "Payment split created successfully",
        "total_amount": float(total_with_tip),
        "amount_per_person": float(amount_per_person),
        "payment_links": payment_links,
    }


@router.post("/split-by-items/{order_id}")
async def split_payment_by_items(
    order_id: int,
    split_data: SplitByItemsRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """Split payment by selected items"""

    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Calculate tip
    tip_total = order.subtotal * Decimal(str(split_data.tip_percentage / 100))
    order.tip_amount = tip_total
    order.status = "pending_payment"

    payment_links = []
    citypay = CityPayService()

    for split_request in split_data.splits:
        split_token = secrets.token_urlsafe(32)

        # Add proportional tip and tax
        split_amount = split_request.amount_to_pay
        proportional_gst = split_amount * Decimal("0.05")
        proportional_tip = (
            (split_amount / order.subtotal) * tip_total if order.subtotal > 0 else Decimal("0")
        )
        total_amount = split_amount + proportional_gst + proportional_tip

        payment_split = PaymentSplit(
            order_id=order_id,
            split_token=split_token,
            customer_name=split_request.customer_name,
            customer_email=split_request.customer_email,
            amount_to_pay=total_amount,
            order_item_ids=split_request.order_item_ids,
            payment_status="pending",
        )
        db.add(payment_split)
        await db.flush()

        # Create payment intent
        payment_intent = await citypay.create_payment_intent(
            amount=total_amount,
            order_number=order.order_number,
            customer_email=split_request.customer_email,
            split_token=split_token,
        )

        payment_split.payment_provider_id = payment_intent.get("identifier")

        # Send email
        payment_url = payment_intent.get("redirect_url", f"{settings.FRONTEND_URL}/payment/{split_token}")
        background_tasks.add_task(
            send_payment_link_email,
            email=split_request.customer_email,
            payment_url=payment_url,
            amount=total_amount,
            order_number=order.order_number,
        )

        payment_links.append({
            "email": split_request.customer_email,
            "amount": float(total_amount),
            "payment_url": payment_url,
        })

    await db.commit()

    return {"message": "Payment splits created", "payment_links": payment_links}


@router.post("/verify/{split_token}")
async def verify_payment(split_token: str, transaction_id: str, db: AsyncSession = Depends(get_db)):
    """Verify payment completion"""

    # Get payment split
    result = await db.execute(
        select(PaymentSplit).where(PaymentSplit.split_token == split_token)
    )
    payment_split = result.scalar_one_or_none()

    if not payment_split:
        raise HTTPException(status_code=404, detail="Payment split not found")

    # Verify with CityPay
    citypay = CityPayService()
    payment_status = await citypay.verify_payment(transaction_id)

    if payment_status.get("status") == "approved":
        payment_split.payment_status = "completed"
        payment_split.paid_at = datetime.now()

        # Check if all splits are paid
        order = payment_split.order
        all_paid = all(s.payment_status == "completed" for s in order.payment_splits)

        if all_paid:
            order.status = "paid"
            order.completed_at = datetime.now()

            # Send receipt
            # TODO: Implement receipt email

        await db.commit()

        return {"message": "Payment verified successfully", "status": "completed"}
    else:
        payment_split.payment_status = "failed"
        await db.commit()
        raise HTTPException(status_code=400, detail="Payment verification failed")


@router.get("/{split_token}", response_model=PaymentSplitResponse)
async def get_payment_split(split_token: str, db: AsyncSession = Depends(get_db)):
    """Get payment split details"""
    result = await db.execute(
        select(PaymentSplit).where(PaymentSplit.split_token == split_token)
    )
    payment_split = result.scalar_one_or_none()

    if not payment_split:
        raise HTTPException(status_code=404, detail="Payment split not found")

    return payment_split
