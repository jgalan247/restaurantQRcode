# CityPay Payment Testing with cURL

This guide provides manual cURL commands to test your CityPay integration.

## Prerequisites

- `jq` installed (for JSON formatting): `brew install jq` on macOS
- An existing order in your database, OR create one with the test script

## Quick Test (Automated Script)

```bash
./test_citypay_payment.sh
```

This script will:
1. Test CityPay configuration
2. Create a test order
3. Process payment with CityPay
4. Return the payment URL

## Manual cURL Commands

### 1. Test CityPay Configuration

```bash
curl -X GET "https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/payment/test-citypay" \
  -H "Content-Type: application/json" | jq '.'
```

**Expected Response:**
```json
{
  "citypay_base_url": "https://api.citypay.com/v6",
  "merchant_id": "6032****",
  "api_key_set": true,
  "api_key_preview": "8PBT72CX8K****",
  "currency": "GBP",
  "frontend_url": "https://seahorse-app-zxz5f.ondigitalocean.app",
  "server_outbound_ips": {
    "ipify": "104.248.167.37",
    "ifconfig_me": "104.248.167.37",
    "icanhazip": "104.248.167.37"
  },
  "status": "Configuration loaded - ready to test payment"
}
```

### 2. Create a Test Order

```bash
curl -X POST "https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/orders/" \
  -H "Content-Type: application/json" \
  -d '{
    "table_id": 1,
    "session_token": "test_session_123",
    "items": [
      {
        "menu_item_id": 1,
        "quantity": 2,
        "special_instructions": "Test order for CityPay payment"
      }
    ]
  }' | jq '.'
```

**Save the `order_id` from the response!**

### 3. Process Payment with CityPay

Replace `<ORDER_ID>` with the actual order ID from step 2:

```bash
curl -X POST "https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/payment/process-single/<ORDER_ID>" \
  -H "Content-Type: application/json" \
  -d '{
    "card_number": "4000000000000002",
    "expiry_date": "12/25",
    "cvv": "123",
    "cardholder_name": "Test Customer",
    "tip_percentage": 10.0
  }' | jq '.'
```

**Expected Success Response:**
```json
{
  "message": "Payment intent created successfully",
  "order_id": 123,
  "order_number": "LH2510201234",
  "total_amount": 43.56,
  "payment_url": "https://secure.citypay.com/paylink/ABC123...",
  "split_token": "xyz...",
  "status": "pending_payment",
  "note": "Redirect customer to payment_url to complete payment with CityPay"
}
```

**What to do with the payment_url:**
- Open it in a browser
- You'll be redirected to CityPay's secure payment page
- Complete the test payment there

### 4. Check Backend Logs

After running the payment request, check your Digital Ocean logs to see the authentication flow:

```
🔵 CITYPAY: Authenticating with client_id=...
🔵 CITYPAY AUTH: Response Status = 200
🔵 CITYPAY AUTH: Successfully authenticated
🔵 CITYPAY: Creating payment for order LH2510201234
🔵 CITYPAY: Full URL = https://api.citypay.com/v6/paylink/create
```

## Testing Specific Scenarios

### Test with Existing Order ID

If you already have an order ID (e.g., from your logs or database):

```bash
ORDER_ID=22  # Replace with your order ID

curl -X POST "https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/payment/process-single/${ORDER_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "card_number": "4000000000000002",
    "expiry_date": "12/25",
    "cvv": "123",
    "cardholder_name": "Test Customer",
    "tip_percentage": 15.0
  }' | jq '.'
```

### Test Split Payment (Equal Split)

```bash
ORDER_ID=22  # Replace with your order ID

curl -X POST "https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/payment/split-equal/${ORDER_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "people_count": 2,
    "emails": [
      "customer1@example.com",
      "customer2@example.com"
    ],
    "tip_percentage": 10.0
  }' | jq '.'
```

This will create 2 payment links and send emails to both customers.

## Common Errors and Solutions

### ❌ Error: "Order not found"
**Solution:** Create an order first using the create order command above, or use an existing order ID.

### ❌ Error: "Order already paid"
**Solution:** Use a different order that hasn't been paid yet, or create a new order.

### ❌ Error: "CityPay authentication failed"
**Solution:**
1. Check that `CITYPAY_CLIENT_ID` and `CITYPAY_LICENCE_KEY` are set in Digital Ocean
2. Verify the credentials are correct in CityPay merchant portal
3. Check if you're using test vs production credentials

### ❌ Error: "Missing environment variable CITYPAY_CLIENT_ID"
**Solution:** You need to add the new environment variables to Digital Ocean (see CITYPAY_V6_SETUP.md)

### ❌ Error: "The request is not from an accepted source" (P007)
**Solution:** Contact CityPay to verify your IPs are whitelisted:
- `104.248.167.37`
- `161.35.37.105`

## Checking Payment Status

You can check the payment status from your Digital Ocean logs, or query CityPay's API directly.

## Local Testing

To test locally (if running backend on localhost):

```bash
# Replace the URL in all commands above with:
http://localhost:8000/api/v1
```

**Important:** CityPay will still reject requests from localhost IPs since they're not whitelisted. You'll need to test from the deployed Digital Ocean environment.

## Production vs Test Mode

Currently the code has `test: True` in the payload, which means:
- Payments go to CityPay's test environment
- No real money is charged
- Use test card numbers

To enable production payments:
1. Edit `backend/app/services/payment_service.py` line 93
2. Change `"test": True` to `"test": False`
3. Update to production CityPay credentials
4. Commit and deploy

## Test Card Numbers (CityPay Test Mode)

When testing, use these card numbers:
- **Success:** `4000000000000002`
- **Decline:** `4000000000000010`
- **CVV:** Any 3 digits (e.g., `123`)
- **Expiry:** Any future date (e.g., `12/25`)

## Next Steps After Successful Test

1. ✅ Verify the payment URL is generated
2. ✅ Open the URL in a browser and complete test payment
3. ✅ Check CityPay merchant portal for transaction
4. ✅ Verify order status updates to "paid" in your database
5. ✅ Test email notifications (if configured)
