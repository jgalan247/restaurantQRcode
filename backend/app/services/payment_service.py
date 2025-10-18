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
        """Create CityPay PayLink token"""

        print(f"🔵 CITYPAY: Creating payment for order {order_number}")
        print(f"🔵 CITYPAY: Base URL = {self.base_url}")
        print(f"🔵 CITYPAY: Merchant ID = {self.merchant_id}")

        # Convert to cents/pence
        amount_in_cents = int(amount * 100)

        payload = {
            "merchantId": int(self.merchant_id),
            "licenceKey": self.api_key,
            "amount": amount_in_cents,
            "identifier": order_number,
            "test": True,  # Set to True for sandbox/testing
            "cardholder": {
                "email": customer_email if customer_email else "guest@lahacienda.com",
            },
            "config": {
                "redirect_success": f"{settings.FRONTEND_URL}/payment/success?token={split_token}",
                "redirect_failure": f"{settings.FRONTEND_URL}/payment/failure?token={split_token}",
                "redirect_cancel": f"{settings.FRONTEND_URL}/checkout",
            },
            "cart": {
                "contents": [
                    {
                        "name": f"La Hacienda Order {order_number}",
                        "description": f"Restaurant order {order_number}",
                        "count": 1,
                        "amount": amount_in_cents,
                    }
                ]
            }
        }

        headers = {
            "Content-Type": "application/json",
        }

        # Log the request for debugging
        print(f"🔵 CITYPAY: Full URL = {self.base_url}/paylink3/create")
        print(f"🔵 CITYPAY: Amount = {amount_in_cents} pence (£{amount})")
        print(f"🔵 CITYPAY: Payload = {payload}")

        logger.info(f"Creating CityPay PayLink token for order {order_number}")
        logger.info(f"CityPay URL: {self.base_url}/paylink3/create")
        logger.info(f"Amount: {amount_in_cents} pence (£{amount})")
        logger.info(f"Merchant ID: {self.merchant_id}")
        logger.info(f"Payload: {payload}")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/paylink3/create",
                    json=payload,
                    headers=headers,
                    timeout=30.0,
                )

                # Log response for debugging
                print(f"🔵 CITYPAY: Response Status = {response.status_code}")
                print(f"🔵 CITYPAY: Response Body = {response.text[:500]}")

                logger.info(f"CityPay Response Status: {response.status_code}")
                logger.info(f"CityPay Response: {response.text[:500]}")  # First 500 chars

                response.raise_for_status()
                response_data = response.json()

                print(f"🔵 CITYPAY: Payment URL = {response_data.get('url')}")
                logger.info(f"CityPay PayLink token created successfully")

                # Extract the payment URL from the response
                # PayLink returns: {"url": "https://secure.citypay.com/paylink/token", ...}
                payment_url = response_data.get("url")

                return {
                    "identifier": response_data.get("identifier"),
                    "redirect_url": payment_url,
                    "payment_url": payment_url,  # Alias for compatibility
                    "token": response_data.get("token"),
                }

        except httpx.HTTPStatusError as e:
            print(f"🔴 CITYPAY ERROR: HTTP {e.response.status_code}")
            print(f"🔴 CITYPAY ERROR: {e.response.text}")
            logger.error(f"CityPay API HTTP error: {e.response.status_code}")
            logger.error(f"CityPay error response: {e.response.text}")
            raise ValueError(f"CityPay API error ({e.response.status_code}): {e.response.text}")
        except httpx.HTTPError as e:
            print(f"🔴 CITYPAY ERROR: Connection error - {str(e)}")
            logger.error(f"CityPay API connection error: {str(e)}")
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
