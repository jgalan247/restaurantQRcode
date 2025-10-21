"""
CityPay PayLink Service - Official SDK Implementation
Uses the official citypay-api-client package for secure payment link generation.

This service creates hosted payment pages where customers enter card details
on CityPay's secure servers (no card data touches our server).
"""
import os
import uuid
import logging
import citypay
from citypay.rest import ApiException
from typing import Optional, Dict, Any
from decimal import Decimal

from app.config import get_settings
from citypay.models.api_key import api_key_generate

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Get settings
settings = get_settings()


class CityPayPaylinkService:
    """
    Service for CityPay PayLink integration using official SDK

    This creates hosted payment pages where customers are redirected
    to CityPay's secure site to enter their card details.
    """

    def __init__(self):
        # Configure CityPay SDK - IMPORTANT: Use correct base URL
        # For sandbox: https://sandbox.citypay.com
        # For production: https://api.citypay.com
        self.configuration = citypay.Configuration(
            host=settings.CITYPAY_BASE_URL
        )

        # Generate temporal API key using CityPay's official api_key_generate function
        # This generates: base64(clientId:nonce:hash) where hash = HMAC-SHA256
        api_key = api_key_generate(settings.CITYPAY_CLIENT_ID, settings.CITYPAY_LICENCE_KEY)
        self.configuration.api_key["cp-api-key"] = api_key

        # Store merchant ID
        self.merchant_id = int(settings.CITYPAY_MERCHANT_ID)

        logger.info(f"🔵 CityPay PayLink SDK initialized")
        logger.info(f"🔵 Host: {settings.CITYPAY_BASE_URL}")
        logger.info(f"🔵 Merchant ID: {self.merchant_id}")
        logger.info(f"🔵 Client ID: {settings.CITYPAY_CLIENT_ID}")
        logger.info(f"🔵 API Key generated using official SDK: {api_key[:30]}...")

    def create_paylink_token(
        self,
        amount: Decimal,
        order_id: str,
        customer_email: str,
        customer_name: Optional[str] = None,
        order_description: Optional[str] = None,
        split_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Create a PayLink token and return payment details.

        Args:
            amount: Payment amount in GBP (e.g., 25.50)
            order_id: Unique order identifier
            customer_email: Customer's email address
            customer_name: Customer's name (optional)
            order_description: Description for the cart (optional)
            split_token: Token for tracking payment splits (optional)

        Returns:
            dict with:
                - 'url': Payment page URL to redirect customer to
                - 'token': PayLink token for status tracking
                - 'order_id': Order identifier
                - 'identifier': CityPay transaction identifier

        Raises:
            ValueError: If inputs are invalid
            RuntimeError: If PayLink creation fails
        """
        # Convert amount to pence
        amount_pence = int(round(amount * 100))

        # Validate inputs
        if amount_pence <= 0:
            raise ValueError("Amount must be positive")
        if not customer_email or '@' not in customer_email:
            raise ValueError("Valid email required")
        if not order_id:
            order_id = str(uuid.uuid4())

        # Build cart description
        if not order_description:
            order_description = f"La Hacienda Order {order_id}"

        # Build redirect URLs with split token if provided
        token_param = f"?token={split_token}" if split_token else ""
        redirect_success = f"{settings.FRONTEND_URL}/payment-success{token_param}"
        redirect_failure = f"{settings.FRONTEND_URL}/payment-failure{token_param}"
        redirect_cancel = f"{settings.FRONTEND_URL}/checkout"

        logger.info(f"Creating PayLink for order {order_id}, amount £{amount} ({amount_pence} pence)")
        logger.info(f"Success URL: {redirect_success}")
        logger.info(f"Failure URL: {redirect_failure}")

        # Create cardholder info
        cardholder = citypay.PaylinkCardHolder(
            email=customer_email,
            name=customer_name or "Customer"
        )

        # Create cart with itemized details
        cart = citypay.PaylinkCart(
            items=[
                citypay.PaylinkCartItemModel(
                    description=order_description,
                    amount=amount_pence,
                    quantity=1
                )
            ]
        )

        # Configure PayLink settings
        config = citypay.PaylinkConfig(
            currency="GBP",
            redirect_success=redirect_success,
            redirect_failure=redirect_failure,
            redirect_cancel=redirect_cancel
        )

        # Build the PayLink request
        request = citypay.PaylinkTokenRequestModel(
            merchantid=self.merchant_id,
            identifier=order_id,
            amount=amount_pence,
            currency="GBP",
            cardholder=cardholder,
            cart=cart,
            config=config
        )

        # Create API client and call PayLink endpoint
        with citypay.ApiClient(self.configuration) as api_client:
            api = citypay.PaylinkApi(api_client)

            try:
                # Make the API call
                response = api.token_create_request(request)

                logger.info(f"✅ PayLink created successfully for order {order_id}")
                logger.info(f"   Token: {response.token}")
                logger.info(f"   URL: {response.url}")

                return {
                    'url': response.url,
                    'token': response.token,
                    'order_id': order_id,
                    'identifier': order_id,
                    'amount': float(amount),
                    'amount_pence': amount_pence,
                    'redirect_url': response.url,  # Alias for compatibility
                    'payment_url': response.url,   # Alias for compatibility
                }

            except ApiException as e:
                logger.error(f"❌ CityPay API error: {e.status} - {e.reason}")
                logger.error(f"   Response body: {e.body}")
                raise RuntimeError(f"Payment link creation failed: {e.status} - {e.reason}")

            except Exception as e:
                logger.error(f"❌ Unexpected error creating PayLink: {str(e)}")
                raise RuntimeError(f"Payment link creation failed: {str(e)}")

    def retrieve_paylink_token(self, token: str) -> Dict[str, Any]:
        """
        Retrieve PayLink token status and details

        Args:
            token: The PayLink token to retrieve

        Returns:
            dict with token status and payment details
        """
        with citypay.ApiClient(self.configuration) as api_client:
            api = citypay.PaylinkApi(api_client)

            try:
                response = api.token_status_request(token)

                logger.info(f"PayLink token {token} status: {response}")

                return {
                    'token': token,
                    'status': response,
                    'amount_paid': response.amount_paid if hasattr(response, 'amount_paid') else None,
                }

            except ApiException as e:
                logger.error(f"Error retrieving PayLink token {token}: {e}")
                raise RuntimeError(f"Token retrieval failed: {e.status} - {e.reason}")

    async def verify_payment(self, transaction_id: str) -> Dict[str, Any]:
        """
        Verify payment status (compatibility method)

        Args:
            transaction_id: Transaction identifier or PayLink token

        Returns:
            dict with payment status
        """
        try:
            result = self.retrieve_paylink_token(transaction_id)
            return {
                "status": "approved" if result.get("amount_paid") else "pending",
                "transaction_id": transaction_id,
                "details": result
            }
        except Exception as e:
            logger.error(f"Payment verification failed: {e}")
            return {
                "status": "error",
                "error": str(e)
            }


# Backwards compatibility - alias for existing code
CityPayService = CityPayPaylinkService


# Example usage and documentation
"""
Example Usage:
--------------

from app.services.citypay_paylink_service import CityPayPaylinkService
from decimal import Decimal

# Initialize service
citypay = CityPayPaylinkService()

# Create a payment link
result = citypay.create_paylink_token(
    amount=Decimal("25.50"),
    order_id="ORDER-123",
    customer_email="customer@example.com",
    customer_name="John Doe",
    order_description="Restaurant Order #123",
    split_token="abc123"
)

# Redirect customer to payment page
payment_url = result['url']
print(f"Redirect customer to: {payment_url}")

# Later, check payment status using token
status = citypay.retrieve_paylink_token(result['token'])
print(f"Payment status: {status}")


Configuration:
--------------

Required environment variables in .env:

CITYPAY_MERCHANT_ID=your_merchant_id
CITYPAY_LICENCE_KEY=your_licence_key
CITYPAY_BASE_URL=https://sandbox.citypay.com  # For testing
# CITYPAY_BASE_URL=https://api.citypay.com   # For production

FRONTEND_URL=http://localhost:5173


Payment Flow:
-------------

1. Customer completes checkout
2. Backend creates PayLink token
3. Backend returns payment URL
4. Frontend redirects customer to CityPay payment page
5. Customer enters card details on CityPay (secure)
6. CityPay processes payment
7. Customer redirected back to success/failure page
8. Backend can verify payment status using token


Security:
---------

✅ No card data touches your server
✅ PCI compliance handled by CityPay
✅ Secure hosted payment pages
✅ API key authentication
✅ HTTPS required for all communication
"""
