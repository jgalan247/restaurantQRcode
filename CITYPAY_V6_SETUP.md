# CityPay v6 Integration Setup Guide

## Changes Made

The application has been updated to use **CityPay API v6** with proper authentication.

### Files Modified

1. **`backend/app/services/payment_service.py`**
   - Added `_get_api_key()` method to authenticate with CityPay
   - Updated to use `CITYPAY_CLIENT_ID` and `CITYPAY_LICENCE_KEY`
   - Removed `licenceKey` from request payload
   - Added `cp-api-key` header for authenticated requests

2. **`backend/app/config.py`**
   - Added `CITYPAY_CLIENT_ID` setting
   - Renamed `CITYPAY_API_KEY` to `CITYPAY_LICENCE_KEY`
   - Updated `CITYPAY_BASE_URL` default to `https://api.citypay.com/v6`

3. **`backend/.env.example`**
   - Updated documentation for CityPay credentials
   - Added comments explaining each credential

## Required Environment Variables

You need to update your environment variables on **Digital Ocean** (or wherever your app is deployed):

### For Production (Live)

```bash
CITYPAY_MERCHANT_ID=<your_production_merchant_id>
CITYPAY_CLIENT_ID=<your_production_client_id>
CITYPAY_LICENCE_KEY=<your_production_licence_key>
CITYPAY_BASE_URL=https://api.citypay.com/v6
```

### For Testing/Sandbox

```bash
CITYPAY_MERCHANT_ID=<your_test_merchant_id>
CITYPAY_CLIENT_ID=<your_test_client_id>
CITYPAY_LICENCE_KEY=<your_test_licence_key>
CITYPAY_BASE_URL=https://sandbox.citypay.com/v6
```

## How to Update Digital Ocean Environment Variables

1. Go to your Digital Ocean App Platform dashboard
2. Select your app (seahorse-app-zxz5f)
3. Click on **Settings** → **Components** → **backend**
4. Scroll to **Environment Variables**
5. Update/Add these variables:
   - `CITYPAY_MERCHANT_ID`
   - `CITYPAY_CLIENT_ID` (NEW - add this)
   - `CITYPAY_LICENCE_KEY` (rename from CITYPAY_API_KEY if it exists)
   - `CITYPAY_BASE_URL`
6. Click **Save**
7. The app will automatically redeploy with the new variables

## What Each Credential Means

From your CityPay merchant portal, you have:

| CityPay Portal Name | Environment Variable Name | Description |
|---------------------|---------------------------|-------------|
| Merchant Account    | `CITYPAY_MERCHANT_ID`     | Your merchant account number |
| Client ID           | `CITYPAY_CLIENT_ID`       | Client identifier for API access |
| Client Licence Key  | `CITYPAY_LICENCE_KEY`     | Secret key for authentication |

## How the New Authentication Works

### Old Method (Incorrect) ❌
```json
POST /paylink3/create
{
  "merchantId": 12345,
  "licenceKey": "your-key",  // This was wrong
  ...
}
```

### New Method (Correct) ✅

**Step 1:** Authenticate to get temporary API key
```json
POST /v6/authenticate
{
  "client_id": "your_client_id",
  "licence_key": "your_licence_key"
}

Response:
{
  "api_key": "temporary_key_valid_for_5_minutes"
}
```

**Step 2:** Use the API key in headers for payment requests
```json
POST /v6/paylink/create
Headers: {
  "cp-api-key": "temporary_key_from_step_1"
}
Body: {
  "merchantid": 12345,
  ...
}
```

## Testing After Deployment

After Digital Ocean redeploys with the new environment variables:

1. **Test the configuration:**
   ```bash
   curl https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/payment/test-citypay
   ```

2. **Check the logs for authentication:**
   Look for these log messages:
   - `🔵 CITYPAY: Authenticating with client_id=...`
   - `🔵 CITYPAY AUTH: Successfully authenticated`

3. **Try a test payment:**
   - Go through the checkout flow
   - Check logs for any errors

## Troubleshooting

### Error: "Missing environment variable CITYPAY_CLIENT_ID"
- You forgot to add `CITYPAY_CLIENT_ID` to Digital Ocean
- Go to Settings → Environment Variables and add it

### Error: "CityPay authentication failed"
- Check that `CITYPAY_CLIENT_ID` and `CITYPAY_LICENCE_KEY` are correct
- Verify you're using the right credentials (test vs production)
- Check the CityPay merchant portal for the correct values

### Error: "The request is not from an accepted source" (P007)
- Your IPs are whitelisted: `104.248.167.37` and `161.35.37.105`
- Contact CityPay to verify these IPs are in your whitelist
- Make sure the whitelist is for the correct environment (test vs prod)

## IP Addresses (Already Whitelisted)

Your dedicated egress IPs that should be whitelisted in CityPay:
- `104.248.167.37`
- `161.35.37.105`

## Next Steps

1. ✅ Code changes committed and pushed to GitHub
2. ⏳ Digital Ocean will auto-deploy (or trigger manual deploy)
3. 🔧 Update environment variables on Digital Ocean:
   - Add `CITYPAY_CLIENT_ID`
   - Rename `CITYPAY_API_KEY` → `CITYPAY_LICENCE_KEY`
   - Update `CITYPAY_BASE_URL` to `https://api.citypay.com/v6`
4. 🧪 Test payment flow after deployment
5. 📧 Monitor logs for any errors

## Production Readiness Checklist

- [ ] Add production CityPay credentials to Digital Ocean
- [ ] Change `test: True` to `test: False` in `payment_service.py` line 93
- [ ] Verify IP addresses are whitelisted in CityPay production environment
- [ ] Test a real payment with a small amount
- [ ] Monitor transaction logs in CityPay portal
- [ ] Set up CityPay webhooks for payment confirmations (if needed)

## Support

If you encounter issues:
- Check Digital Ocean deployment logs
- Check CityPay merchant portal for transaction status
- Contact CityPay support with:
  - Your Merchant ID
  - Transaction timestamp
  - Error messages from logs
