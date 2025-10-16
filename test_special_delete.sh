#!/bin/bash

# Test Special Delete Functionality

echo "=== Testing Special Delete Functionality ==="
echo ""

# Step 1: Login as admin
echo "1. Logging in as admin..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/admin/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Failed to login. Response:"
    echo $LOGIN_RESPONSE | python3 -m json.tool
    exit 1
fi

echo "✅ Login successful"
echo ""

# Step 2: Get all specials
echo "2. Getting all specials..."
SPECIALS_RESPONSE=$(curl -s -X GET "http://localhost:8000/api/v1/admin/specials" \
  -H "Authorization: Bearer $TOKEN")

echo "Specials response:"
echo $SPECIALS_RESPONSE | python3 -m json.tool

# Extract first special ID
SPECIAL_ID=$(echo $SPECIALS_RESPONSE | python3 -c "import sys, json; data = json.load(sys.stdin); print(data['specials'][0]['id']) if data.get('specials') and len(data['specials']) > 0 else print('')" 2>/dev/null)

if [ -z "$SPECIAL_ID" ]; then
    echo ""
    echo "ℹ️  No specials found to test deletion."
    echo "Creating a test special first..."

    # Create a test special
    CREATE_RESPONSE=$(curl -s -X POST "http://localhost:8000/api/v1/admin/specials" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "name": "Test Special for Deletion",
        "description": "This is a test special",
        "price": 19.99,
        "image_url": "",
        "is_active": true,
        "start_date": null,
        "end_date": null,
        "display_order": 0,
        "items": []
      }')

    SPECIAL_ID=$(echo $CREATE_RESPONSE | python3 -c "import sys, json; data = json.load(sys.stdin); print(data.get('id', ''))" 2>/dev/null)

    if [ -z "$SPECIAL_ID" ]; then
        echo "❌ Failed to create test special. Response:"
        echo $CREATE_RESPONSE | python3 -m json.tool
        exit 1
    fi

    echo "✅ Created test special with ID: $SPECIAL_ID"
fi

echo ""
echo "3. Attempting to delete special ID: $SPECIAL_ID"

# Step 3: Delete the special
DELETE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "http://localhost:8000/api/v1/admin/specials/$SPECIAL_ID" \
  -H "Authorization: Bearer $TOKEN")

HTTP_STATUS=$(echo "$DELETE_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
DELETE_BODY=$(echo "$DELETE_RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $HTTP_STATUS"
echo "Response body: $DELETE_BODY"

if [ "$HTTP_STATUS" = "204" ]; then
    echo "✅ Delete returned 204 No Content (expected for successful deletion)"
elif [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Delete returned 200 OK (successful deletion)"
else
    echo "❌ Delete failed with status $HTTP_STATUS"
    if [ ! -z "$DELETE_BODY" ]; then
        echo "$DELETE_BODY" | python3 -m json.tool 2>/dev/null || echo "$DELETE_BODY"
    fi
    exit 1
fi

echo ""

# Step 4: Verify deletion
echo "4. Verifying deletion by trying to fetch the deleted special..."
VERIFY_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "http://localhost:8000/api/v1/admin/specials/$SPECIAL_ID" \
  -H "Authorization: Bearer $TOKEN")

VERIFY_STATUS=$(echo "$VERIFY_RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
VERIFY_BODY=$(echo "$VERIFY_RESPONSE" | sed '/HTTP_STATUS/d')

echo "HTTP Status: $VERIFY_STATUS"

if [ "$VERIFY_STATUS" = "404" ]; then
    echo "✅ Special no longer exists in database (deletion confirmed)"
else
    echo "⚠️  Special still exists. Status: $VERIFY_STATUS"
    if [ ! -z "$VERIFY_BODY" ]; then
        echo "$VERIFY_BODY" | python3 -m json.tool 2>/dev/null || echo "$VERIFY_BODY"
    fi
    exit 1
fi

echo ""
echo "=== All tests passed! Special deletion is working correctly ==="
