from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from datetime import datetime
from decimal import Decimal
import secrets
import logging

from app.api.deps import get_db

logger = logging.getLogger(__name__)
from app.schemas.order import SplitEqualRequest, SplitByItemsRequest, PaymentSplitResponse
from app.services.citypay_paylink_service import CityPayPaylinkService
from app.services.citypay_service import CityPayService as MockCityPayService
from app.services.email_service import send_payment_link_email
from app.models.payment import PaymentSplit
from app.models.order import Order
from app.config import get_settings
from pydantic import BaseModel

router = APIRouter()
settings = get_settings()


@router.get("/test-citypay")
async def test_citypay_connection():
    """
    Test CityPay API connection and credentials
    Returns configuration info (without sensitive data)
    """
    import httpx

    citypay = CityPayPaylinkService()

    # Get server's outbound IP address from multiple sources
    outbound_ips = {}

    # Try ipify
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://api.ipify.org?format=json", timeout=5.0)
            if response.status_code == 200:
                outbound_ips["ipify"] = response.json().get("ip", "unknown")
    except:
        outbound_ips["ipify"] = "error"

    # Try ifconfig.me
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://ifconfig.me/ip", timeout=5.0)
            if response.status_code == 200:
                outbound_ips["ifconfig_me"] = response.text.strip()
    except:
        outbound_ips["ifconfig_me"] = "error"

    # Try icanhazip
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get("https://icanhazip.com", timeout=5.0)
            if response.status_code == 200:
                outbound_ips["icanhazip"] = response.text.strip()
    except:
        outbound_ips["icanhazip"] = "error"

    return {
        "citypay_base_url": citypay.configuration.host,
        "merchant_id": str(citypay.merchant_id),
        "merchant_id_preview": str(citypay.merchant_id)[:4] + "****" if len(str(citypay.merchant_id)) > 4 else "****",
        "licence_key_set": bool(citypay.configuration.api_key.get("cp-api-key")),
        "currency": settings.CURRENCY,
        "frontend_url": settings.FRONTEND_URL,
        "server_outbound_ips": outbound_ips,
        "integration_type": "PayLink (Official SDK)",
        "sdk_version": "citypay-api-client",
        "status": "Configuration loaded - ready to create PayLinks",
        "note": "Using official CityPay SDK with PayLink hosted pages"
    }


class MockPaymentRequest(BaseModel):
    """Request model for mock payment (test mode only)"""
    card_number: str
    expiry_date: str
    cvv: str
    cardholder_name: str
    tip_percentage: float = 0.0


@router.post("/mock-single/{order_id}")
async def mock_single_payment(
    order_id: int,
    payment_data: MockPaymentRequest,
    db: AsyncSession = Depends(get_db),
):
    """
    Mock single payment for testing (Test mode only)

    This endpoint simulates a successful payment without actual payment processing.
    Test mode: Marks order as 'paid' immediately after validation passes.
    In production, use real CityPay integration with async payment confirmation.
    """

    # Get order
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    # Validate card using mock validation
    mock_citypay = MockCityPayService()
    validation_result = mock_citypay.mock_validate_card(
        card_number=payment_data.card_number,
        expiry_date=payment_data.expiry_date,
        cvv=payment_data.cvv
    )

    if not validation_result.get("valid"):
        raise HTTPException(
            status_code=400,
            detail=validation_result.get("error", "Payment validation failed")
        )

    # Calculate tip and total
    tip = order.subtotal * Decimal(str(payment_data.tip_percentage / 100))
    total_with_tip = order.subtotal + order.gst_amount + tip

    # Update order with tip and totals
    order.tip_amount = tip
    order.total_amount = total_with_tip

    # Test mode: Mark as paid immediately after validation passes
    # In production, status would be 'pending' until CityPay confirms
    order.status = "paid"
    order.completed_at = datetime.now()

    # Create a payment split record for tracking
    payment_split = PaymentSplit(
        order_id=order_id,
        split_token=secrets.token_urlsafe(32),
        customer_name=payment_data.cardholder_name,
        customer_email="",  # No email needed for mock payment
        amount_to_pay=total_with_tip,
        payment_status="completed",  # Test mode: mark as completed
        payment_method="card_test",
        paid_at=datetime.now()
    )
    db.add(payment_split)

    await db.commit()
    await db.refresh(order)

    return {
        "message": "Payment processed successfully (TEST MODE)",
        "order_id": order.id,
        "order_number": order.order_number,
        "status": order.status,
        "total_amount": float(total_with_tip),
        "note": "Test mode: Order marked as paid immediately. In production, payment confirmation is async."
    }


@router.post("/process-single/{order_id}")
async def process_single_payment(
    order_id: int,
    payment_data: MockPaymentRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    """
    Process single payment using real CityPay integration

    This endpoint creates a CityPay payment intent and returns a payment URL
    where the customer will be redirected to complete payment on CityPay's
    secure payment page.
    """

    # Get order
    order = await db.get(Order, order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    if order.status == "paid":
        raise HTTPException(status_code=400, detail="Order already paid")

    # Calculate tip and total
    tip = order.subtotal * Decimal(str(payment_data.tip_percentage / 100))
    total_with_tip = order.subtotal + order.gst_amount + tip

    # Update order with tip and totals
    order.tip_amount = tip
    order.total_amount = total_with_tip
    order.status = "pending_payment"

    # Generate unique split token for this payment
    split_token = secrets.token_urlsafe(32)

    # Create payment split record
    payment_split = PaymentSplit(
        order_id=order_id,
        split_token=split_token,
        customer_name=payment_data.cardholder_name,
        customer_email="",  # Email optional for single payment
        amount_to_pay=total_with_tip,
        payment_status="pending",
        payment_method="card",
    )
    db.add(payment_split)
    await db.flush()

    # Create CityPay PayLink using official SDK
    citypay = CityPayPaylinkService()
    try:
        # Create PayLink token
        paylink_result = citypay.create_paylink_token(
            amount=total_with_tip,
            order_id=order.order_number,
            customer_email="guest@lahacienda.com",  # Default email
            customer_name=payment_data.cardholder_name,
            order_description=f"La Hacienda Order {order.order_number}",
            split_token=split_token,
        )

        # Store PayLink token for tracking
        payment_split.payment_provider_id = paylink_result.get("token")

        # Get payment URL from PayLink response
        payment_url = paylink_result.get("url")

        if not payment_url:
            raise ValueError("CityPay did not return a payment URL")

        await db.commit()

        logger.info(f"✅ PayLink created for order {order.id}: {payment_url}")

        return {
            "message": "PayLink created successfully",
            "order_id": order.id,
            "order_number": order.order_number,
            "total_amount": float(total_with_tip),
            "payment_url": payment_url,
            "paylink_token": paylink_result.get("token"),
            "split_token": split_token,
            "status": "pending_payment",
            "integration_type": "CityPay PayLink (Official SDK)",
            "note": "Redirect customer to payment_url - they will enter card details on CityPay's secure page"
        }

    except Exception as e:
        await db.rollback()
        logger.error(f"❌ Failed to create PayLink: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to create payment link: {str(e)}"
        )


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
    citypay = CityPayPaylinkService()

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

        # Create CityPay PayLink
        paylink_result = citypay.create_paylink_token(
            amount=amount_per_person,
            order_id=f"{order.order_number}-SPLIT{i+1}",
            customer_email=email,
            customer_name=f"Guest {i+1}",
            order_description=f"La Hacienda Order {order.order_number} (Split {i+1}/{split_data.people_count})",
            split_token=split_token,
        )

        payment_split.payment_provider_id = paylink_result.get("token")

        # Send email with payment link
        payment_url = paylink_result.get("url")
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
    citypay = CityPayPaylinkService()

    for idx, split_request in enumerate(split_data.splits, 1):
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

        # Create PayLink
        paylink_result = citypay.create_paylink_token(
            amount=total_amount,
            order_id=f"{order.order_number}-ITEM{idx}",
            customer_email=split_request.customer_email,
            customer_name=split_request.customer_name,
            order_description=f"La Hacienda Order {order.order_number} (Items Split {idx})",
            split_token=split_token,
        )

        payment_split.payment_provider_id = paylink_result.get("token")

        # Send email
        payment_url = paylink_result.get("url")
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

    # Verify with CityPay PayLink
    citypay = CityPayPaylinkService()
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


# Payment callback endpoints to handle CityPay redirects
from fastapi.responses import RedirectResponse
from fastapi import Request

@router.api_route("/callback/success", methods=["GET", "POST"])
async def payment_callback_success(request: Request, token: str = None):
    """
    Handle CityPay payment success callback (accepts both GET and POST)
    CityPay may POST data after 3DS authentication
    """
    logger.info(f"Payment success callback received - Method: {request.method}, Token: {token}")

    # Redirect to frontend success page
    frontend_url = f"{settings.FRONTEND_URL}/payment-success"
    if token:
        frontend_url += f"?token={token}"

    return RedirectResponse(url=frontend_url, status_code=303)


@router.api_route("/callback/failure", methods=["GET", "POST"])
async def payment_callback_failure(request: Request, token: str = None):
    """
    Handle CityPay payment failure callback (accepts both GET and POST)
    """
    logger.info(f"Payment failure callback received - Method: {request.method}, Token: {token}")

    # Redirect to frontend failure page
    frontend_url = f"{settings.FRONTEND_URL}/payment-failure"
    if token:
        frontend_url += f"?token={token}"

    return RedirectResponse(url=frontend_url, status_code=303)


@router.api_route("/callback/cancel", methods=["GET", "POST"])
async def payment_callback_cancel(request: Request):
    """
    Handle CityPay payment cancellation callback (accepts both GET and POST)
    """
    logger.info(f"Payment cancel callback received - Method: {request.method}")

    # Redirect to frontend checkout page
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/checkout", status_code=303)
