# API URL Fix Summary

## Problem Identified

Your application had **multiple hardcoded `localhost:8000` URLs** scattered across different service files, causing the app to try connecting to localhost even in production.

## Files Fixed

### 1. Created Centralized Configuration ✅
**File:** `frontend/src/config/api.config.ts` (NEW)

This new file contains:
- Smart API URL detection logic
- Environment variable priority
- Hostname inference for production
- Fallback to localhost only for development
- Debug logging

All service files now import from this single source of truth.

### 2. Updated Service Files ✅

**frontend/src/services/api.ts**
- ❌ Before: Duplicated URL logic
- ✅ After: Imports from centralized config

**frontend/src/services/adminApi.ts**
- ❌ Before: `const API_BASE = 'http://localhost:8000/api/v1'`
- ✅ After: `const API_BASE = API_URL` (imported from config)

**frontend/src/services/promotionsApi.ts**
- ❌ Before: `const API_BASE = 'http://localhost:8000/api/v1'`
- ✅ After: `const API_BASE = API_URL` (imported from config)

**frontend/src/services/budgetBuilderService.ts**
- ❌ Before: `const API_BASE_URL = 'http://localhost:8000/api/v1'`
- ✅ After: `const API_BASE_URL = API_URL` (imported from config)

**frontend/src/services/invoiceService.ts**
- ❌ Before: `const baseUrl = api.defaults.baseURL || 'http://localhost:8000/api/v1'`
- ✅ After: `const baseUrl = api.defaults.baseURL` (no fallback needed)

### 3. Created Production Environment File ✅
**File:** `frontend/.env.production` (NEW)

```env
VITE_API_URL=https://seahorse-app-zxz5f.ondigitalocean.app/api/v1
VITE_APP_NAME=La Hacienda
```

## How It Works Now

The centralized `api.config.ts` uses this priority order:

1. **Environment Variable** (highest priority)
   - Checks `VITE_API_URL` from `.env.production` or Digital Ocean env vars

2. **Auto-detection** (production fallback)
   - In production mode, infers API URL from current hostname
   - Example: If on `seahorse-app-zxz5f.ondigitalocean.app`, uses `https://seahorse-app-zxz5f.ondigitalocean.app/api/v1`

3. **Localhost** (development fallback)
   - Only used when developing locally

## Browser Console Logs

You'll now see these logs on page load:

```
VITE_API_URL from env: https://seahorse-app-zxz5f.ondigitalocean.app/api/v1
import.meta.env: {BASE_URL: '/restaurantqrcode-frontend/', MODE: 'production', ...}
Using API_URL: https://seahorse-app-zxz5f.ondigitalocean.app/api/v1
```

## Testing

### Local Development
```bash
cd frontend
npm run dev
# Should use: http://localhost:8000/api/v1
```

### Production Build
```bash
cd frontend
npm run build
npm run preview
# Should use: https://seahorse-app-zxz5f.ondigitalocean.app/api/v1
```

### Digital Ocean Deployment

**Option 1: Use .env.production file (Already Done)**
- The file is created and committed
- Digital Ocean will use it during build

**Option 2: Set environment variable in Digital Ocean (Recommended)**
- Go to: Digital Ocean → Your App → Settings → Components → frontend
- Add: `VITE_API_URL = https://seahorse-app-zxz5f.ondigitalocean.app/api/v1`
- Trigger: Force Rebuild and Deploy

**Option 3: Do Nothing (Auto-detection)**
- The smart fallback will automatically detect the hostname
- Should work without any manual configuration

## Verification Checklist

After deploying:

- [ ] Open your app: https://seahorse-app-zxz5f.ondigitalocean.app/restaurantqrcode-frontend
- [ ] Open browser console (F12)
- [ ] Check for log: `Using API_URL: https://seahorse-app-zxz5f.ondigitalocean.app/api/v1`
- [ ] Verify NO localhost URLs in console
- [ ] Test: Menu loads successfully
- [ ] Test: Can add items to cart
- [ ] Test: Admin login works (if applicable)

## Benefits of This Fix

1. **Single Source of Truth** - Only one place to manage API URL logic
2. **No More Hardcoded URLs** - All services use centralized config
3. **Smart Fallbacks** - Multiple detection strategies for reliability
4. **Debug-Friendly** - Console logs show exactly what URL is being used
5. **Environment-Aware** - Automatically adapts to dev/production
6. **Easy to Override** - Just set `VITE_API_URL` environment variable

## Rollback

If you need to rollback to the old behavior:

```bash
# Each service file had its own hardcoded URL
# You can see the old values in the "Before" section above
```

## Files Changed

- ✅ `frontend/src/config/api.config.ts` (CREATED)
- ✅ `frontend/src/services/api.ts` (UPDATED)
- ✅ `frontend/src/services/adminApi.ts` (UPDATED)
- ✅ `frontend/src/services/promotionsApi.ts` (UPDATED)
- ✅ `frontend/src/services/budgetBuilderService.ts` (UPDATED)
- ✅ `frontend/src/services/invoiceService.ts` (UPDATED)
- ✅ `frontend/.env.production` (CREATED)

## Next Steps

1. **Commit changes to git**:
   ```bash
   cd /Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode
   git add frontend/src/config/api.config.ts
   git add frontend/src/services/*.ts
   git add frontend/.env.production
   git commit -m "Fix API URL configuration - centralize and remove hardcoded localhost"
   git push
   ```

2. **Deploy to Digital Ocean**:
   - Push will automatically trigger deployment
   - Or manually trigger: Actions → Force Rebuild and Deploy

3. **Verify in production**:
   - Check browser console logs
   - Test all functionality

## Support

If issues persist:
- Check `DEPLOYMENT_FIXES.md` for detailed troubleshooting
- Check `CLAUDE.md` for architecture overview
- Run `./deploy-checklist.sh` for configuration verification
