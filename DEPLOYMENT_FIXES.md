# Deployment Fixes for Digital Ocean

## Current Issue

Your frontend is deployed but `VITE_API_URL` environment variable is not being loaded, causing it to fall back to an inferred URL.

## Solutions

### Option 1: Set Environment Variable in Digital Ocean (RECOMMENDED)

1. **Go to Digital Ocean App Platform Dashboard**
   - Navigate to: https://cloud.digitalocean.com/apps
   - Select your app: `seahorse-app-zxz5f`

2. **Add Environment Variable to Frontend Component**
   - Click on **Settings** → **Components**
   - Select your **frontend** component (restaurantqrcode-frontend)
   - Go to **Environment Variables** section
   - Click **Edit**
   - Add new variable:
     - **Key**: `VITE_API_URL`
     - **Value**: `https://seahorse-app-zxz5f.ondigitalocean.app/api/v1`
     - **Encrypt**: No (this is a public URL)
   - Click **Save**

3. **Redeploy**
   - Digital Ocean will automatically redeploy
   - Or manually trigger: **Actions** → **Force Rebuild and Deploy**

### Option 2: Use .env.production File (Already Created)

I've created `frontend/.env.production` with the correct URL. To use this:

1. **Commit the file to your repository**:
   ```bash
   cd /Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode
   git add frontend/.env.production
   git commit -m "Add production environment configuration"
   git push
   ```

2. **Ensure Digital Ocean build process includes it**:
   - Check your build command includes environment files
   - Build command should be: `npm run build` (this automatically uses .env.production)

3. **Verify in Digital Ocean App Spec**:
   - Go to **Settings** → **App Spec**
   - Check that `build_command` is: `npm run build`

### Option 3: Update Vite Config (Already Implemented)

I've updated `frontend/src/services/api.ts` to automatically infer the API URL in production:
- It now checks for `VITE_API_URL` first
- Falls back to inferring from hostname if on Digital Ocean
- Falls back to localhost for development

This means your current deployment should already work, but setting the environment variable explicitly is cleaner.

## Verify the Fix

After applying any solution above:

1. **Clear browser cache** or open in incognito mode
2. **Open browser console** (F12)
3. **Look for these logs**:
   ```
   VITE_API_URL from env: https://seahorse-app-zxz5f.ondigitalocean.app/api/v1
   Using API_URL: https://seahorse-app-zxz5f.ondigitalocean.app/api/v1
   ```

4. **Test API calls**:
   - The menu should load without errors
   - Check Network tab for successful API requests

## Additional Fixes

### Fix Missing Favicon (404 on vite.svg)

1. **Add a favicon to your project**:
   ```bash
   # Place a logo file in frontend/public/
   cp /path/to/your/logo.png restaurantQRcode/frontend/public/favicon.png
   ```

2. **Update index.html**:
   Edit `frontend/index.html` and change:
   ```html
   <link rel="icon" type="image/svg+xml" href="/vite.svg" />
   ```
   to:
   ```html
   <link rel="icon" type="image/png" href="/favicon.png" />
   ```

### Configure Base Path (if needed)

If your app is deployed under a subpath like `/restaurantqrcode-frontend/`:

1. **Update vite.config.ts**:
   ```typescript
   export default defineConfig({
     base: '/restaurantqrcode-frontend/',
     plugins: [react()],
     // ... rest of config
   })
   ```

2. **Or set in Digital Ocean**:
   - Add environment variable: `VITE_BASE_PATH=/restaurantqrcode-frontend/`

## Backend Environment Variables

Make sure your backend also has these environment variables set in Digital Ocean:

**Required:**
- `DATABASE_URL` - PostgreSQL connection string (usually auto-set by DO)
- `SECRET_KEY` - Generate with: `python3 -c "import secrets; print(secrets.token_urlsafe(64))"`
- `CORS_ORIGINS` - `["https://seahorse-app-zxz5f.ondigitalocean.app"]`

**Payment (if using CityPay):**
- `CITYPAY_MERCHANT_ID`
- `CITYPAY_API_KEY`
- `CITYPAY_BASE_URL` - Use production URL

**Email (if configured):**
- `MAIL_USERNAME`
- `MAIL_PASSWORD`
- `MAIL_SERVER`
- `MAIL_PORT`
- `MAIL_FROM`

**Business:**
- `GST_RATE=0.05`
- `CURRENCY=GBP`
- `FRONTEND_URL=https://seahorse-app-zxz5f.ondigitalocean.app`

## Test Checklist

After deployment:

- [ ] Frontend loads without console errors
- [ ] API URL is correctly logged in console
- [ ] Menu items load successfully
- [ ] Can add items to cart
- [ ] Cart persists in localStorage
- [ ] Checkout flow works
- [ ] Admin login works
- [ ] Backend API is accessible at `/api/v1/docs`

## Rollback Plan

If issues persist:

1. Check Digital Ocean deployment logs:
   - **Runtime Logs** → Select component → View logs

2. Check build logs:
   - **Deployments** → Select deployment → View build logs

3. Verify environment variables are set:
   - **Settings** → **Environment Variables**

4. Test backend API directly:
   - Visit: `https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/docs`
   - Try: `GET /menu/categories`

## Support

If you need more help:
- Digital Ocean Docs: https://docs.digitalocean.com/products/app-platform/
- Vite Environment Vars: https://vitejs.dev/guide/env-and-mode.html
- Check the CLAUDE.md file for architecture details
