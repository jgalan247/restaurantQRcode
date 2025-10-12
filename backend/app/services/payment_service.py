import httpx
from decimal import Decimal
from typing import Dict, Any
import logging

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class CityPayService:
    def __init__(self):
        self.base_url = settings.CITYPAY_BASE_URL
        self.merchant_id = settings.CITYPAY_MERCHANT_ID
        self.api_key = settings.CITYPAY_API_KEY

    async def create_payment_intent(
        self,
        amount: Decimal,
        order_number: str,
        customer_email: str,
        split_token: str,
    ) -> Dict[str, Any]:
        """Create CityPay payment intent"""

        # Convert to cents/pence
        amount_in_cents = int(amount * 100)

        payload = {
            "merchantid": self.merchant_id,
            "amount": amount_in_cents,
            "currency": settings.CURRENCY,
            "identifier": order_number,
            "trans_type": "sale",
            "cardHolderEmail": customer_email,
            "description": f"La Hacienda Order {order_number}",
            "success_url": f"{settings.FRONTEND_URL}/payment/success?token={split_token}",
            "failure_url": f"{settings.FRONTEND_URL}/payment/failure?token={split_token}",
            "cancel_url": f"{settings.FRONTEND_URL}/checkout",
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/payment",
                    json=payload,
                    headers=headers,
                    timeout=30.0,
                )
                response.raise_for_status()
                return response.json()
        except httpx.HTTPError as e:
            logger.error(f"CityPay API error: {e}")
            raise ValueError(f"Payment processing failed: {str(e)}")

    async def verify_payment(self, transaction_id: str) -> Dict[str, Any]:
        """Verify payment status"""
        headers = {"Authorization": f"Bearer {self.api_key}"}

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/payment/{transaction_id}", headers=headers
            )
            response.raise_for_status()
            return response.json()

    async def refund_payment(
        self, transaction_id: str, amount: Decimal
    ) -> Dict[str, Any]:
        """Process refund"""
        amount_in_cents = int(amount * 100)

        payload = {
            "merchantid": self.merchant_id,
            "amount": amount_in_cents,
            "identifier": transaction_id,
        }

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/refund", json=payload, headers=headers
            )
            response.raise_for_status()
            return response.json()
