#!/bin/bash

# CityPay Payment Integration Test Script
# This script tests the complete payment flow with CityPay

# Configuration
API_BASE_URL="https://seahorse-app-zxz5f.ondigitalocean.app/api/v1"
# For local testing, use:
# API_BASE_URL="http://localhost:8000/api/v1"

echo "=========================================="
echo "CityPay Payment Integration Test"
echo "=========================================="
echo ""

# Step 1: Test CityPay Configuration
echo "Step 1: Testing CityPay configuration..."
echo "GET ${API_BASE_URL}/payment/test-citypay"
echo ""

curl -X GET "${API_BASE_URL}/payment/test-citypay" \
  -H "Content-Type: application/json" \
  | jq '.'

echo ""
echo ""

# Step 2: Create a test order first (you need an order to test payment)
echo "Step 2: Creating a test order..."
echo "POST ${API_BASE_URL}/orders/"
echo ""

ORDER_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/orders/" \
  -H "Content-Type: application/json" \
  -d '{
    "table_id": 1,
    "session_token": "test_session_'$(date +%s)'",
    "items": [
      {
        "menu_item_id": 1,
        "quantity": 2,
        "special_instructions": "Test order for payment"
      }
    ]
  }')

echo "$ORDER_RESPONSE" | jq '.'

# Extract order_id from response
ORDER_ID=$(echo "$ORDER_RESPONSE" | jq -r '.id // .order_id // empty')

if [ -z "$ORDER_ID" ] || [ "$ORDER_ID" = "null" ]; then
  echo ""
  echo "❌ Failed to create order. Please create an order manually and update ORDER_ID below."
  echo ""
  echo "Manual test command:"
  echo "ORDER_ID=<your_order_id>  # Replace with actual order ID"
  echo ""
  exit 1
fi

echo ""
echo "✅ Order created with ID: $ORDER_ID"
echo ""
echo ""

# Step 3: Process payment with CityPay
echo "Step 3: Processing payment with CityPay..."
echo "POST ${API_BASE_URL}/payment/process-single/${ORDER_ID}"
echo ""

PAYMENT_RESPONSE=$(curl -s -X POST "${API_BASE_URL}/payment/process-single/${ORDER_ID}" \
  -H "Content-Type: application/json" \
  -d '{
    "card_number": "4000000000000002",
    "expiry_date": "12/25",
    "cvv": "123",
    "cardholder_name": "Test Customer",
    "tip_percentage": 10.0
  }')

echo "$PAYMENT_RESPONSE" | jq '.'

# Extract payment URL
PAYMENT_URL=$(echo "$PAYMENT_RESPONSE" | jq -r '.payment_url // empty')

echo ""
echo ""
echo "=========================================="
echo "Test Results"
echo "=========================================="

if [ -n "$PAYMENT_URL" ] && [ "$PAYMENT_URL" != "null" ]; then
  echo "✅ SUCCESS: Payment intent created!"
  echo ""
  echo "Order ID: $ORDER_ID"
  echo "Payment URL: $PAYMENT_URL"
  echo ""
  echo "Next step: Open this URL in a browser to complete the payment:"
  echo "$PAYMENT_URL"
else
  echo "❌ FAILED: No payment URL returned"
  echo ""
  echo "Full response:"
  echo "$PAYMENT_RESPONSE" | jq '.'
fi

echo ""
echo "=========================================="
