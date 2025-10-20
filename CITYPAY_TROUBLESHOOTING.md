# CityPay Integration Troubleshooting

## Current Issue: 404 Error on PayLink Create

### What's Working ✅
- Authentication to v6 API: **SUCCESS**
- Getting temporary API key: **SUCCESS**
- IP whitelisting: **SUCCESS**

### What's Failing ❌
- PayLink token creation: **404 Not Found**

## Attempted Endpoints (All Return 404)

1. `https://sandbox.citypay.com/v6/paylink/create`
2. `https://sandbox.citypay.com/paylink3/create`
3. `https://sandbox.citypay.com/paylink/create`

## Possible Root Causes

### 1. PayLink Not Enabled for Your Account
**Likelihood: HIGH**

PayLink might need to be explicitly enabled by CityPay for your merchant account. Contact CityPay support to verify:
- Is PayLink enabled for merchant ID `60325080`?
- Is PayLink available in the sandbox/test environment?
- What's the correct PayLink endpoint for sandbox?

### 2. Different PayLink Base URL for Sandbox
**Likelihood: MEDIUM**

The production PayLink URL is `https://secure.citypay.com/paylink3/create`, but the sandbox might use:
- A completely different domain
- A different path structure
- Or not support PayLink at all

**Action:** Ask CityPay for the correct sandbox PayLink endpoint.

### 3. PayLink Requires Different Authentication
**Likelihood: LOW**

We've tried:
- ✅ v6 API key in `cp-api-key` header
- ✅ `merchantId` + `licenceKey` in payload
- ✅ Both methods

**Action:** Confirm with CityPay which authentication method PayLink expects.

### 4. Alternative: Use Direct Payment API Instead of PayLink
**Likelihood: RECOMMENDED**

CityPay v6 API has a **direct payment processing endpoint** that might work better:

**Endpoint:** `POST /v6/charge`

This creates a direct payment request instead of a PayLink token. The difference:
- **PayLink:** Creates a hosted payment page URL (customer redirected to CityPay)
- **Direct Payment:** Process payment directly via API (requires PCI compliance)

## Immediate Actions Required

### Contact CityPay Support
Email or call CityPay support with these questions:

```
Subject: PayLink Endpoint 404 Error - Merchant ID 60325080

Hi CityPay Support,

I'm integrating PayLink with merchant account 60325080 (sandbox environment).

I'm successfully authenticating to the v6 API at:
https://sandbox.citypay.com/v6/authenticate

However, when trying to create PayLink tokens, I get 404 errors on all these endpoints:
- https://sandbox.citypay.com/paylink3/create
- https://sandbox.citypay.com/paylink/create
- https://sandbox.citypay.com/v6/paylink/create

Questions:
1. Is PayLink enabled for my merchant account?
2. What is the correct PayLink endpoint for the sandbox environment?
3. Does PayLink work in sandbox, or only in production?
4. Should I use the Direct Payment API instead?

My IP addresses (already whitelisted):
- 104.248.167.37
- 161.35.37.105

Thanks,
[Your Name]
```

### Check Your CityPay Merchant Portal
Log into your CityPay merchant portal and check:
- **Services** section: Is "PayLink" listed as enabled?
- **API Settings**: Are there any endpoint URLs listed?
- **Documentation**: Is there a PayLink setup guide specific to your account?

### Alternative Solution: Use CityPay Direct Payment API

If PayLink isn't available, we can switch to the direct payment API. This requires:

1. **Change endpoint to:** `POST /v6/charge`
2. **Accept card details** in your app (requires PCI compliance)
3. **Process payment directly** (no redirect to CityPay hosted page)

**Trade-offs:**
- ❌ More complex PCI compliance requirements
- ❌ Handle card data in your app
- ✅ No redirect, better UX
- ✅ More control over payment flow

## Testing Different Endpoints

I've prepared the code to try multiple endpoint variants. Here's what we can test:

### Test 1: PayLink v3 (Current Attempt)
```
URL: https://sandbox.citypay.com/paylink3/create
Auth: merchantId + licenceKey in payload
Result: 404 ❌
```

### Test 2: Production PayLink URL in Sandbox
```
URL: https://secure.citypay.com/paylink3/create
Auth: merchantId + licenceKey in payload
Result: NOT TESTED (might work if sandbox PayLink doesn't exist)
```

### Test 3: Direct Payment API (Recommended Alternative)
```
URL: https://sandbox.citypay.com/v6/charge
Auth: cp-api-key header
Requires: Card data in request
Result: NOT TESTED
```

## Recommended Next Steps

**Priority 1: Contact CityPay Support**
- Fastest way to get the correct endpoint
- Confirm PayLink is enabled
- Get official documentation

**Priority 2: Check Merchant Portal**
- Look for PayLink settings
- Check if it's enabled
- Look for endpoint documentation

**Priority 3: Try Production PayLink URL**
- If sandbox doesn't support PayLink
- Use production URL with test credentials
- CityPay might only support PayLink in production

**Priority 4: Switch to Direct Payment API**
- If PayLink isn't available
- Requires PCI compliance discussion
- More development work needed

## Code Changes Needed for Direct Payment API

If we need to switch to direct payment, here are the changes:

```python
# Change endpoint
response = await client.post(
    f"{self.base_url}/charge",  # v6 charge endpoint
    json={
        "merchantid": int(self.merchant_id),
        "amount": amount_in_cents,
        "identifier": order_number,
        "cardnumber": "4000000000000002",  # From customer
        "expmonth": 12,
        "expyear": 25,
        "currency": "GBP",
        # ... more card details
    },
    headers={
        "cp-api-key": api_key,
        "Content-Type": "application/json"
    }
)
```

This would require:
1. Collecting card details in the frontend
2. Sending card data securely to backend
3. Processing payment directly
4. Handling 3D Secure redirects

## References

- [CityPay API Documentation](https://citypay.github.io/api-docs/payment-api/)
- [CityPay PayLink Docs](https://citypay.github.io/api-docs/paylink/)
- CityPay Support: Check your merchant portal for contact info

## Current Credentials Being Used

- **Merchant ID:** 60325080
- **Client ID:** PC603250
- **Base URL:** https://sandbox.citypay.com/v6
- **Authentication:** Working ✅
- **PayLink:** Not working ❌ (404 error)

## Summary

The PayLink endpoint is returning 404, which strongly suggests either:
1. PayLink is not enabled for your merchant account
2. PayLink is not available in the sandbox environment
3. We're using the wrong endpoint URL

**Immediate action:** Contact CityPay support to confirm the correct PayLink endpoint and verify it's enabled for your account.
