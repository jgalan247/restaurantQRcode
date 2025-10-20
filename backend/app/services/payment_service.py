import httpx
from decimal import Decimal
from typing import Dict, Any, Optional
import logging
import base64

from app.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class CityPayService:
    def __init__(self):
        self.base_url = settings.CITYPAY_BASE_URL
        self.merchant_id = settings.CITYPAY_MERCHANT_ID
        self.client_id = settings.CITYPAY_CLIENT_ID
        self.licence_key = settings.CITYPAY_LICENCE_KEY
        self._api_key_cache: Optional[str] = None

    def _get_paylink_base_url(self) -> str:
        """
        Get the PayLink base URL
        PayLink v3 uses the same URL for both production and sandbox
        The 'test' flag in the payload determines if it's a test transaction
        """
        # PayLink always uses secure.citypay.com for both prod and test
        return "https://secure.citypay.com"

    async def _get_api_key(self) -> str:
        """
        Authenticate with CityPay and get a temporary API key
        CityPay v6 requires calling /authenticate to get a cp-api-key
        """
        if self._api_key_cache:
            return self._api_key_cache

        print(f"🔵 CITYPAY: Authenticating with client_id={self.client_id}")

        payload = {
            "client_id": self.client_id,
            "licence_key": self.licence_key
        }

        headers = {
            "Content-Type": "application/json",
        }

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    f"{self.base_url}/authenticate",
                    json=payload,
                    headers=headers,
                    timeout=30.0,
                )

                print(f"🔵 CITYPAY AUTH: Response Status = {response.status_code}")
                print(f"🔵 CITYPAY AUTH: Response = {response.text[:500]}")

                response.raise_for_status()
                auth_data = response.json()

                # Cache the API key (CityPay returns it as "key" field)
                self._api_key_cache = auth_data.get("key")

                print(f"🔵 CITYPAY AUTH: Successfully authenticated")
                print(f"🔵 CITYPAY AUTH: API Key = {self._api_key_cache[:20]}..." if self._api_key_cache else "🔴 No API key in response")
                return self._api_key_cache

        except httpx.HTTPStatusError as e:
            print(f"🔴 CITYPAY AUTH ERROR: HTTP {e.response.status_code}")
            print(f"🔴 CITYPAY AUTH ERROR: {e.response.text}")
            logger.error(f"CityPay authentication error: {e.response.status_code} - {e.response.text}")
            raise ValueError(f"CityPay authentication failed: {e.response.text}")

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

        # Ensure email is valid format
        valid_email = customer_email if (customer_email and '@' in customer_email) else "guest@lahacienda.com"

        # Get v6 API key for authentication (might help with IP whitelisting)
        api_key = await self._get_api_key()

        # PayLink uses a different base URL than v6 API
        paylink_base_url = self._get_paylink_base_url()

        # PayLink v3 uses merchantId and licenceKey in payload
        payload = {
            "merchantId": int(self.merchant_id),  # PayLink v3 uses camelCase
            "licenceKey": self.licence_key,  # PayLink v3 expects licence key in payload
            "amount": amount_in_cents,
            "identifier": order_number,
            "test": True,  # Set to True for sandbox/testing
            "cardholder": {
                "email": valid_email,
            },
            "config": {
                "redirect_success": f"{settings.FRONTEND_URL}/payment-success?token={split_token}",
                "redirect_failure": f"{settings.FRONTEND_URL}/payment-failure?token={split_token}",
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
            "cp-api-key": api_key,  # Try including v6 API key for authentication
        }

        # Try different PayLink endpoint variants
        # CityPay documentation is unclear about sandbox endpoint
        paylink_endpoints = [
            f"{paylink_base_url}/paylink3/create",  # PayLink v3 (documented)
            f"{paylink_base_url}/paylink/create",   # Generic PayLink
            f"{paylink_base_url}/v3/paylink/create", # v3 prefix variant
        ]

        paylink_url = paylink_endpoints[0]  # Try first endpoint

        # Log the request for debugging
        print(f"🔵 CITYPAY: PayLink Base URL = {paylink_base_url}")
        print(f"🔵 CITYPAY: Full PayLink URL = {paylink_url}")
        print(f"🔵 CITYPAY: Amount = {amount_in_cents} pence (£{amount})")
        print(f"🔵 CITYPAY: Payload = {payload}")
        print(f"🔵 CITYPAY: Note - Using PayLink v3 auth (merchantId + licenceKey in payload)")

        logger.info(f"Creating CityPay PayLink token for order {order_number}")
        logger.info(f"CityPay PayLink URL: {paylink_url}")
        logger.info(f"Amount: {amount_in_cents} pence (£{amount})")
        logger.info(f"Merchant ID: {self.merchant_id}")
        logger.info(f"Payload: {payload}")

        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(
                    paylink_url,
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
