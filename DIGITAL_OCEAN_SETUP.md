# Digital Ocean Apps Platform - Setup Guide

## Problem: "No components detected"

This happens because your app is a **monorepo** (backend and frontend in subdirectories). Digital Ocean's auto-detection only works for single-component apps at the root level.

---

## ✅ Solution: Manual Configuration

You have **3 options** to deploy:

---

## Option 1: Use doctl CLI (Recommended - Fastest)

### Install doctl

**macOS:**
```bash
brew install doctl
```

**Linux:**
```bash
cd ~
wget https://github.com/digitalocean/doctl/releases/download/v1.98.1/doctl-1.98.1-linux-amd64.tar.gz
tar xf doctl-1.98.1-linux-amd64.tar.gz
sudo mv doctl /usr/local/bin
```

**Windows:**
Download from: https://github.com/digitalocean/doctl/releases

### Deploy with doctl

```bash
# 1. Authenticate
doctl auth init
# Enter your Digital Ocean API token when prompted
# Get token from: https://cloud.digitalocean.com/account/api/tokens

# 2. Navigate to project
cd /Users/josegalan/Documents/restaurantQR_prod/restaurantQRcode

# 3. Create app from spec
doctl apps create --spec .do/app-simple.yaml

# 4. Get app ID (from output above)
APP_ID="your-app-id-here"

# 5. Watch deployment
doctl apps logs $APP_ID --follow
```

---

## Option 2: Manual Configuration in Dashboard

### Step 1: Create App
1. Go to: https://cloud.digitalocean.com/apps
2. Click "Create App"
3. Choose Source: GitHub
4. Repository: `jgalan247/restaurantQRcode`
5. Branch: `main`
6. **DON'T click "Next" yet!**

### Step 2: Configure Backend Component

Click "Edit" or "Add Component" → Choose "Web Service"

**Settings:**
- Name: `backend`
- Source Directory: `backend` ⚠️ IMPORTANT!
- Branch: `main`
- **Build Command:**
  ```
  pip install -r requirements.txt
  ```
- **Run Command:**
  ```
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --root-path /api
  ```
- HTTP Port: `8000`
- HTTP Routes: `/api`
- Instance Size: Basic (512MB RAM, 1 vCPU) - ~$5/month
- Instance Count: 1

**Environment Variables:** (Add these in Settings after creation)
```
DATABASE_URL = ${db.DATABASE_URL}  (auto-set when you add database)
DEBUG = False
ENVIRONMENT = production
ALGORITHM = HS256
ACCESS_TOKEN_EXPIRE_MINUTES = 480
GST_RATE = 0.05
CURRENCY = GBP
CITYPAY_BASE_URL = https://secure.citypay.com
MAIL_SERVER = smtp.sendgrid.net
MAIL_PORT = 587
MAIL_FROM = noreply@lahacienda.co.uk
RESTAURANT_NAME = La Hacienda
```

**Secrets (Add after creation):**
```
SECRET_KEY = [Generate: python3 -c "import secrets; print(secrets.token_urlsafe(64))"]
CITYPAY_MERCHANT_ID = [Your merchant ID]
CITYPAY_API_KEY = [Your API key]
MAIL_USERNAME = [SendGrid username]
MAIL_PASSWORD = [SendGrid password/API key]
```

### Step 3: Configure Frontend Component

Click "Add Component" → Choose "Static Site"

**Settings:**
- Name: `frontend`
- Source Directory: `frontend` ⚠️ IMPORTANT!
- Branch: `main`
- **Build Command:**
  ```
  npm install && npm run build
  ```
- **Output Directory:**
  ```
  dist
  ```
- HTTP Routes: `/`
- Error Document: `index.html`

**Environment Variables:** (Set in Settings → Environment)
```
VITE_APP_NAME = La Hacienda
```

**After first deployment, add:**
```
VITE_API_URL = https://YOUR-ACTUAL-APP-URL.ondigitalocean.app/api/v1
```
(You'll get the URL after first deploy, then update this and redeploy)

### Step 4: Add Database

Click "Add Resource" → Choose "Database"

**Settings:**
- Type: PostgreSQL
- Name: `lahacienda-db`
- Version: 15
- Size: Basic ($15/month)
- Region: Same as app (London - `lon`)

### Step 5: Review and Create

- Review all settings
- Click "Create Resources"
- Wait 5-10 minutes for initial deployment

---

## Option 3: Import App Spec (If Available)

Some DO accounts show an "Import App Spec" or "Edit Spec" option.

If you see this:
1. Click "Import App Spec" or "Edit Spec"
2. Paste the contents of `.do/app-simple.yaml`
3. Click "Import" or "Save"
4. Add the secret environment variables manually (see Option 2)

---

## After Deployment: Required Steps

### 1. Get Your App URL
After deployment completes, you'll see:
```
https://your-app-name-xyz123.ondigitalocean.app
```

### 2. Update VITE_API_URL

**Important:** The frontend needs to know where the backend is!

1. Go to: Settings → frontend → Environment Variables
2. Add/Edit:
   ```
   Key: VITE_API_URL
   Value: https://your-app-name-xyz123.ondigitalocean.app/api/v1
   Scope: Build Time
   ```
3. Trigger rebuild: Actions → Force Rebuild

### 3. Update CORS_ORIGINS

1. Go to: Settings → backend → Environment Variables
2. Add/Edit:
   ```
   Key: CORS_ORIGINS
   Value: ["https://your-app-name-xyz123.ondigitalocean.app"]
   Scope: Runtime
   ```
3. Restart backend

### 4. Seed the Database

**Option A: Via Console**
1. Go to: Database → Console
2. Paste SQL from `POPULATE_DATABASE.md`

**Option B: Via psql**
```bash
# Get connection string from DO dashboard
psql "postgresql://db_user:password@host:port/db_name?sslmode=require"

# Paste SQL from POPULATE_DATABASE.md
```

### 5. Create Admin User

**Option A: Via Backend Console**
1. Go to: backend → Console
2. Run:
   ```bash
   python scripts/create_admin_user.py
   ```

**Option B: Via SQL**
```sql
-- Generate password hash first (use bcrypt)
-- Password: admin123
INSERT INTO admin_users (username, hashed_password, role, created_at)
VALUES ('admin', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LeB.4AXO.WPfbMDC6', 'admin', NOW());
```

---

## Environment Variables Reference

### Required Secrets (Set in DO Dashboard)

**Backend:**
```bash
SECRET_KEY = [Generate: python3 -c "import secrets; print(secrets.token_urlsafe(64))"]
CITYPAY_MERCHANT_ID = [Your CityPay merchant ID]
CITYPAY_API_KEY = [Your CityPay API key]
MAIL_USERNAME = [SendGrid username]
MAIL_PASSWORD = [SendGrid API key]
```

**Frontend:**
```bash
VITE_API_URL = https://YOUR-APP.ondigitalocean.app/api/v1
```

### Optional Variables

```bash
# Restaurant Info
RESTAURANT_NAME = La Hacienda
RESTAURANT_ADDRESS = 123 Mexican Street, London
RESTAURANT_PHONE = +44 20 1234 5678
RESTAURANT_EMAIL = info@lahacienda.co.uk
RESTAURANT_VAT_NUMBER = GB123456789

# Email Settings
MAIL_FROM_NAME = La Hacienda Restaurant

# Business Settings
GST_RATE = 0.05
CURRENCY = GBP
```

---

## Troubleshooting

### Build fails with "No such file or directory"
**Cause:** Source directory not set correctly
**Fix:** Verify `source_dir` is exactly `backend` or `frontend` (no leading slash)

### Backend returns 502 Bad Gateway
**Cause:** Missing SECRET_KEY or DATABASE_URL
**Fix:** Check environment variables are set, restart backend

### Frontend shows "Network Error"
**Cause:** VITE_API_URL not set or incorrect
**Fix:**
1. Set VITE_API_URL in frontend environment variables
2. Make sure scope is "Build Time"
3. Trigger rebuild

### CORS errors
**Cause:** Frontend URL not in CORS_ORIGINS
**Fix:** Add frontend URL to backend's CORS_ORIGINS env var

### Database connection fails
**Cause:** Database not attached to backend
**Fix:** Go to backend settings → attach database component

---

## Verification Steps

After deployment, test:

1. **Backend Health:**
   - Visit: `https://your-app.ondigitalocean.app/api/v1/docs`
   - Should see Swagger API documentation

2. **Frontend:**
   - Visit: `https://your-app.ondigitalocean.app/`
   - Should see restaurant menu page
   - Test language toggle (EN/FR)

3. **Database:**
   - Backend logs should show: "Database connected successfully"
   - Menu endpoint should return items: `https://your-app.ondigitalocean.app/api/v1/menu`

4. **Admin Login:**
   - Visit: `https://your-app.ondigitalocean.app/admin`
   - Login with created admin credentials
   - Should see admin dashboard

---

## Cost Breakdown

- **Backend:** ~$5-10/month (Basic instance)
- **Frontend:** Free (static site)
- **Database:** ~$15/month (Basic PostgreSQL)
- **Total:** ~$20-25/month

---

## Support Files

- `.do/app.yaml` - Full app spec with all variables
- `.do/app-simple.yaml` - Simplified spec (secrets added manually)
- `DEPLOYMENT_READY.md` - Complete deployment guide
- `POPULATE_DATABASE.md` - Database seed SQL
- `backend/scripts/create_admin_user.py` - Admin user creation script

---

## Quick Commands

```bash
# Generate SECRET_KEY
python3 -c "import secrets; print(secrets.token_urlsafe(64))"

# Check app status (doctl)
doctl apps list
doctl apps get APP_ID
doctl apps logs APP_ID --follow

# Connect to database
doctl databases connection lahacienda-db

# Force rebuild
doctl apps create-deployment APP_ID
```

---

## Next Steps

1. ✅ Deploy using one of the 3 options above
2. ⚠️ Set all required environment variables
3. ⚠️ Update VITE_API_URL after first deploy
4. ⚠️ Seed the database
5. ⚠️ Create admin user
6. ✅ Test the application
7. ✅ Configure custom domain (optional)

**Deployment time:** ~10-15 minutes

**Ready to go live!** 🚀
