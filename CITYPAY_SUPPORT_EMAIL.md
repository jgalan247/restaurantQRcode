# Email to CityPay Support

---

**To:** CityPay Support
**Subject:** PayLink Integration Issue - 404 Error on Token Creation (Merchant ID 60325080)

---

Dear CityPay Support Team,

I am integrating CityPay PayLink v3 into our restaurant ordering system (La Hacienda) and experiencing a 404 error when attempting to create PayLink tokens in the sandbox environment.

## Account Information

- **Merchant ID:** 60325080
- **Client ID:** PC603250
- **Environment:** Sandbox (https://sandbox.citypay.com/v6)
- **Server IPs (Whitelisted):** 104.248.167.37, 161.35.37.105

## What is Working ✅

1. **v6 API Authentication** - Successfully authenticating and receiving API keys
   - Endpoint: `POST https://sandbox.citypay.com/v6/authenticate`
   - Payload: `client_id` + `licence_key`
   - Response: `200 OK` with valid API key

2. **Configuration Test** - All credentials are properly configured and loading correctly

3. **IP Whitelisting** - Both server outbound IPs have been whitelisted in the merchant portal
   - Current active IP: 161.35.37.105 (confirmed via test endpoint)
   - Secondary IP: 104.248.167.37

## What is Failing ❌

**PayLink Token Creation** - We are successfully able to authenticate to the v6 API and receive API keys. However, when attempting to create PayLink tokens, we receive a **200 OK** response but with an error code **P007** in the response body.

**Actual Error Response:**
```json
{
  "id": "MTYzNzg5NzM3NzQyMDE2NTEwNTE",
  "result": 0,
  "errors": [{
    "code": "P007",
    "msg": "The request is not from an accepted source: No authen required via RSP"
  }]
}
```

**Error Analysis:**
- HTTP Status: `200 OK` (but contains error in response body)
- Error Code: `P007`
- Error Message: "The request is not from an accepted source: No authen required via RSP"
- Payment URL: `None` (not returned due to error)

This suggests the request is being received but rejected due to authentication or source validation issues.

### Endpoints Attempted

**Primary Endpoint (currently using):**
- `POST https://secure.citypay.com/paylink3/create` → Returns 200 OK with P007 error

**Also tested (returned 404):**
- `POST https://sandbox.citypay.com/paylink3/create` → 404 Not Found
- `POST https://sandbox.citypay.com/paylink/create` → 404 Not Found
- `POST https://sandbox.citypay.com/v6/paylink/create` → 404 Not Found

### Request Details

**Headers:**
```
Content-Type: application/json
cp-api-key: [API key from v6 authentication]
```

**Payload Example:**
```json
{
  "merchantId": 60325080,
  "licenceKey": "[licence_key]",
  "amount": 1790,
  "identifier": "ORDER-123",
  "test": true,
  "cardholder": {
    "email": "customer@example.com"
  },
  "config": {
    "redirect_success": "https://seahorse-app-zxz5f.ondigitalocean.app/payment-success",
    "redirect_failure": "https://seahorse-app-zxz5f.ondigitalocean.app/payment-failure",
    "redirect_cancel": "https://seahorse-app-zxz5f.ondigitalocean.app/checkout"
  },
  "cart": {
    "contents": [
      {
        "name": "La Hacienda Order ORDER-123",
        "description": "Restaurant order ORDER-123",
        "count": 1,
        "amount": 1790
      }
    ]
  }
}
```

**Actual Response (from https://secure.citypay.com/paylink3/create):**
```json
HTTP 200 OK
{
  "id": "MTYzNzg5NzM3NzQyMDE2NTEwNTE",
  "result": 0,
  "errors": [{
    "code": "P007",
    "msg": "The request is not from an accepted source: No authen required via RSP"
  }]
}
```
Note: No payment URL is returned in the response.

## Technical Implementation

- **Backend Framework:** FastAPI (Python)
- **HTTP Client:** httpx (async)
- **Integration Type:** Server-to-server API calls
- **Use Case:** Customer restaurant orders with redirect to hosted payment page

## Questions for CityPay Support

1. **What does error code P007 mean?**
   - Error message: "The request is not from an accepted source: No authen required via RSP"
   - What does "RSP" refer to?
   - How do I resolve this authentication/source validation issue?

2. **Is PayLink enabled for merchant account 60325080?**
   - I cannot see PayLink listed in the merchant portal services
   - Do I need additional activation or configuration?

3. **IP Whitelisting - Are both IPs properly whitelisted for PayLink?**
   - 104.248.167.37
   - 161.35.37.105
   - Note: v6 authentication works fine, but PayLink returns P007

4. **What is the correct PayLink authentication method?**
   - Currently using: `merchantId` + `licenceKey` in payload
   - Should I also/instead use the v6 `cp-api-key` header?
   - Is there a different authentication method required for PayLink vs v6 API?

5. **Endpoint Confirmation**
   - We get P007 from: `https://secure.citypay.com/paylink3/create`
   - Sandbox endpoints return 404 - is this expected?
   - Should we use the production endpoint with `"test": true` flag for sandbox testing?

6. **Alternative Solution**
   - Should we use the Direct Payment API (`POST /v6/charge`) instead?
   - Would that avoid the P007 error?

## Expected Behavior

Based on the PayLink v3 documentation, I expect:

**Request:** `POST /paylink3/create` with valid merchant credentials
**Response:** `200 OK` with:
```json
{
  "url": "https://secure.citypay.com/paylink/[token]",
  "identifier": "ORDER-123",
  "token": "[paylink_token]"
}
```

**Current Behavior:**
- HTTP 200 OK response received
- Response contains error code P007
- No payment URL returned
- Error: "The request is not from an accepted source: No authen required via RSP"

## Testing Evidence

I have tested the integration with multiple order scenarios and all result in the same P007 error:

- Order IDs tested: 1, 2, 3, 22, 23, 24, 25
- Server response: HTTP 200 OK with error code P007 in body
- Error message: "The request is not from an accepted source: No authen required via RSP"
- Result: No payment URL returned, preventing payment completion
- Tested from server IP: 161.35.37.105 (confirmed via test endpoint)

## Documentation Referenced

- [CityPay API Documentation](https://citypay.github.io/api-docs/payment-api/)
- [CityPay PayLink Documentation](https://citypay.github.io/api-docs/paylink/)
- CityPay v6 API Reference (successfully implemented for authentication)

## Request for Assistance

Could you please help resolve the P007 error by:

1. **Explaining what P007 error means** - specifically "The request is not from an accepted source: No authen required via RSP"
2. **Verifying PayLink is enabled** for merchant account 60325080
3. **Confirming IP whitelist** - are both IPs (104.248.167.37, 161.35.37.105) properly whitelisted for PayLink specifically?
4. **Confirming authentication method** - what authentication should PayLink v3 use?
5. **Checking account configuration** - is there additional setup needed to authorize PayLink requests from our server?
6. **Advising on RSP requirement** - what does "No authen required via RSP" mean and how do we configure it?

## Additional Information

If helpful, I can provide:
- Full API request/response logs
- Server-side implementation code
- Network trace/debugging information
- Access to test environment

I appreciate your assistance in resolving this issue. Our restaurant ordering system is ready for payment integration, and we're eager to complete the CityPay implementation.

Please let me know if you need any additional information.

Best regards,

Jose Galan
La Hacienda Restaurant
Email: [your email]
Phone: [your phone]

---

## Internal Notes (Remove before sending)

- Server deployed at: https://seahorse-app-zxz5f.ondigitalocean.app
- Test endpoint: https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/payment/test-citypay
- Backend implementation: `/backend/app/services/payment_service.py`
- Troubleshooting docs: `CITYPAY_TROUBLESHOOTING.md`
