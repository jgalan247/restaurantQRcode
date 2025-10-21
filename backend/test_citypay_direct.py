#!/usr/bin/env python3
"""
Direct CityPay PayLink test script
Run this from Digital Ocean console to test with production environment variables
"""
import os
import sys
import citypay
from citypay.rest import ApiException

# Get environment variables
MERCHANT_ID = int(os.environ.get("CITYPAY_MERCHANT_ID", 0))
LICENCE_KEY = os.environ.get("CITYPAY_LICENCE_KEY", "")
BASE_URL = os.environ.get("CITYPAY_BASE_URL", "https://sandbox.citypay.com")

print("=" * 60)
print("CityPay PayLink Direct Test")
print("=" * 60)
print(f"Merchant ID: {MERCHANT_ID}")
print(f"Base URL: {BASE_URL}")
print(f"Licence Key set: {bool(LICENCE_KEY)}")
print(f"Licence Key length: {len(LICENCE_KEY) if LICENCE_KEY else 0}")
print(f"Licence Key preview: {LICENCE_KEY[:20]}..." if len(LICENCE_KEY) > 20 else f"Full key: {LICENCE_KEY}")
print("=" * 60)

# Configure CityPay SDK
configuration = citypay.Configuration(host=BASE_URL)
configuration.api_key["cp-api-key"] = LICENCE_KEY

print("\n✅ Configuration created")
print(f"   Host: {configuration.host}")
print(f"   API Key set: {'cp-api-key' in configuration.api_key}")

# Create a test PayLink token
print("\n🔵 Creating test PayLink token...")

cardholder = citypay.PaylinkCardHolder(
    email="test@example.com",
    name="Test Customer"
)

cart = citypay.PaylinkCart(
    items=[
        citypay.PaylinkCartItemModel(
            description="Test Order",
            amount=2550,  # £25.50 in pence
            quantity=1
        )
    ]
)

config = citypay.PaylinkConfig(
    currency="GBP",
    redirect_success="https://seahorse-app-zxz5f.ondigitalocean.app/payment-success",
    redirect_failure="https://seahorse-app-zxz5f.ondigitalocean.app/payment-failure"
)

request = citypay.PaylinkTokenRequestModel(
    merchantid=MERCHANT_ID,
    identifier="TEST-" + str(os.urandom(8).hex()),
    amount=2550,
    currency="GBP",
    cardholder=cardholder,
    cart=cart,
    config=config
)

print(f"\n📤 Request details:")
print(f"   Merchant ID: {request.merchantid}")
print(f"   Identifier: {request.identifier}")
print(f"   Amount: {request.amount} pence (£{request.amount/100})")
print(f"   Currency: {request.currency}")

try:
    with citypay.ApiClient(configuration) as api_client:
        api = citypay.PaylinkApi(api_client)

        print(f"\n🔄 Making API call to: {BASE_URL}")
        response = api.token_create_request(request)

        print("\n" + "=" * 60)
        print("✅ SUCCESS! PayLink token created")
        print("=" * 60)
        print(f"Token: {response.token}")
        print(f"Payment URL: {response.url}")
        print(f"\nCustomer should visit: {response.url}")
        print("=" * 60)

        sys.exit(0)

except ApiException as e:
    print("\n" + "=" * 60)
    print("❌ CityPay API Error")
    print("=" * 60)
    print(f"Status Code: {e.status}")
    print(f"Reason: {e.reason}")
    print(f"Response Body: {e.body}")
    print(f"Response Headers: {e.headers}")
    print("=" * 60)

    print("\n💡 Troubleshooting:")
    print("1. Verify merchant ID is correct")
    print("2. Verify licence key is correct and active")
    print("3. Confirm IP 104.248.167.37 is whitelisted in CityPay portal")
    print("4. Contact CityPay support if credentials are correct")

    sys.exit(1)

except Exception as e:
    print("\n" + "=" * 60)
    print("❌ Unexpected Error")
    print("=" * 60)
    print(f"Error: {str(e)}")
    print(f"Type: {type(e).__name__}")
    print("=" * 60)
    sys.exit(1)
