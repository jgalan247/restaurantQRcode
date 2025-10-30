#!/usr/bin/env python3
import os
import citypay
from citypay.rest import ApiException

MERCHANT_ID = int(os.environ.get("CITYPAY_MERCHANT_ID", 0))
LICENCE_KEY = os.environ.get("CITYPAY_LICENCE_KEY", "")
BASE_URL = os.environ.get("CITYPAY_BASE_URL", "https://sandbox.citypay.com")

print("="*60)
print("CityPay Test")
print("="*60)
print("Merchant ID:", MERCHANT_ID)
print("Base URL:", BASE_URL)
print("Licence Key length:", len(LICENCE_KEY))
print("="*60)

configuration = citypay.Configuration(host=BASE_URL)
configuration.api_key["cp-api-key"] = LICENCE_KEY

cardholder = citypay.PaylinkCardHolder(email="test@example.com", name="Test")
cart = citypay.PaylinkCart(items=[citypay.PaylinkCartItemModel(description="Test", amount=2550, quantity=1)])
config = citypay.PaylinkConfig(currency="GBP", redirect_success="https://example.com/success", redirect_failure="https://example.com/fail")
request = citypay.PaylinkTokenRequestModel(merchantid=MERCHANT_ID, identifier="TEST123", amount=2550, currency="GBP", cardholder=cardholder, cart=cart, config=config)

try:
    with citypay.ApiClient(configuration) as api_client:
        api = citypay.PaylinkApi(api_client)
        response = api.token_create_request(request)
        print("SUCCESS!")
        print("Token:", response.token)
        print("URL:", response.url)
except ApiException as e:
    print("API ERROR - Status:", e.status)
    print("Reason:", e.reason)
    print("Body:", e.body)
except Exception as e:
    print("ERROR:", str(e))
