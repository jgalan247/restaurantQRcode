# Create New Digital Ocean App - Manual Configuration

## When to Use This Method

Use this if you:
- Can't or don't want to install doctl CLI
- Prefer using the Digital Ocean dashboard UI
- Don't mind manually configuring components

**Note:** This takes longer than doctl CLI but achieves the same result.

---

## The Problem

Digital Ocean's auto-detection shows "No components detected" because your app is a monorepo (backend and frontend in subdirectories).

**Solution:** Skip auto-detection and add components manually.

---

## Step-by-Step Instructions

### Step 1: Start Creating App

1. Go to: https://cloud.digitalocean.com/apps
2. Click **"Create App"**
3. Source: **GitHub**
4. Repository: **jgalan247/restaurantQRcode**
5. Branch: **main**
6. Autodeploy: **Checked**

You'll see: **"No components detected"**

**Don't worry!** Click **"Next"** anyway (or look for "Skip" or "Configure Manually")

---

### Step 2: Skip to Resources Page

You should reach a page that shows:
- **Resources** (top tab/section)
- An option to **"Edit"** or **"Add Component"**

If you get stuck, look for:
- "Edit Resources"
- "Add Component"
- "Configure Resources"
- Or a button to proceed to resource configuration

---

### Step 3: Add Backend Component

Click **"Add Component"** or **"Add Resource"**

**Select:** Web Service

**Configure Backend:**
- **Name:** `backend`
- **Source Directory:** `backend` ⚠️ CRITICAL!
- **Branch:** `main`
- **Autodeploy:** Checked

**Build & Run:**
- **Build Command:**
  ```
  pip install -r requirements.txt
  ```
- **Run Command:**
  ```
  uvicorn app.main:app --host 0.0.0.0 --port 8000 --root-path /api
  ```

**Service Details:**
- **HTTP Port:** `8000`
- **HTTP Routes:** `/api`
- **Instance Size:** Basic ($5/month)
- **Instance Count:** 1

Click **"Save"** or **"Add Resource"**

---

### Step 4: Add Frontend Component

Click **"Add Component"** again

**Select:** Static Site

**Configure Frontend:**
- **Name:** `frontend`
- **Source Directory:** `frontend` ⚠️ CRITICAL!
- **Branch:** `main`
- **Autodeploy:** Checked

**Build:**
- **Build Command:**
  ```
  npm install && npm run build
  ```
- **Output Directory:**
  ```
  dist
  ```

**Routes:**
- **HTTP Routes:** `/`
- **Error Document:** `index.html`

Click **"Save"** or **"Add Resource"**

---

### Step 5: Add Database

Click **"Add Resource"** → **"Database"**

**Configure Database:**
- **Engine:** PostgreSQL
- **Name:** `lahacienda-db`
- **Version:** 15
- **Size:** Dev Database ($15/month)
- **Region:** London (lon) - **MUST match app region!**

Click **"Add Database"**

---

### Step 6: Review Resources

You should now see:
- ✓ backend (Web Service)
- ✓ frontend (Static Site)
- ✓ lahacienda-db (PostgreSQL)

Click **"Next"** or **"Review"**

---

### Step 7: Configure Environment Variables

Before finalizing, you need to set environment variables:

#### Backend Environment Variables

**Non-Secret Variables (Add Now):**

| Key | Value | Scope |
|-----|-------|-------|
| DEBUG | False | Runtime |
| ENVIRONMENT | production | Runtime |
| ALGORITHM | HS256 | Runtime |
| ACCESS_TOKEN_EXPIRE_MINUTES | 480 | Runtime |
| GST_RATE | 0.05 | Runtime |
| CURRENCY | GBP | Runtime |
| CITYPAY_BASE_URL | https://secure.citypay.com | Runtime |
| MAIL_SERVER | smtp.sendgrid.net | Runtime |
| MAIL_PORT | 587 | Runtime |
| MAIL_FROM | noreply@lahacienda.co.uk | Runtime |
| RESTAURANT_NAME | La Hacienda | Runtime |

**Database URL (Auto-set):**
- Key: `DATABASE_URL`
- Value: `${lahacienda-db.DATABASE_URL}` (should be automatically configured)

**Secrets (Add AFTER creation):**
These MUST be added after the app is created:
- SECRET_KEY
- CITYPAY_MERCHANT_ID
- CITYPAY_API_KEY
- MAIL_USERNAME
- MAIL_PASSWORD

#### Frontend Environment Variables

| Key | Value | Scope |
|-----|-------|-------|
| VITE_APP_NAME | La Hacienda | Build Time |

**VITE_API_URL (Add AFTER first deploy):**
After you get your app URL, you'll add:
- Key: `VITE_API_URL`
- Value: `https://YOUR-APP-URL.ondigitalocean.app/api/v1`
- Scope: **Build Time**

---

### Step 8: Create App

1. Review all settings
2. **App Name:** lahacienda-ordering (or any name)
3. **Region:** London (lon)
4. Click **"Create Resources"**

**Initial deployment will start automatically!**

This takes ~10-15 minutes.

---

### Step 9: Add Secret Environment Variables

After the app is created (don't wait for deployment to finish):

1. Go to: Apps → Your new app → **Settings**
2. Click **backend** → **Environment Variables**
3. Click **"Edit"** or **"Add Variable"**

**Generate SECRET_KEY first:**
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(64))"
```

**Add these variables:**
- **SECRET_KEY** (paste generated key) - Type: Secret, Encrypt: Yes
- **CITYPAY_MERCHANT_ID** (your merchant ID) - Type: Secret, Encrypt: Yes
- **CITYPAY_API_KEY** (your API key) - Type: Secret, Encrypt: Yes
- **MAIL_USERNAME** (SendGrid username) - Type: Secret, Encrypt: Yes
- **MAIL_PASSWORD** (SendGrid API key) - Type: Secret, Encrypt: Yes

4. Click **"Save"**
5. This will trigger an automatic rebuild

---

### Step 10: Get Your App URL

After deployment completes:

1. Go to your app in DO dashboard
2. Copy the URL (e.g., `https://your-app-abc123.ondigitalocean.app`)

---

### Step 11: Update VITE_API_URL

**CRITICAL STEP:**

1. Go to **Settings** → **frontend** → **Environment Variables**
2. Click **"Edit"**
3. Add new variable:
   - Key: `VITE_API_URL`
   - Value: `https://your-app-abc123.ondigitalocean.app/api/v1` (use YOUR URL!)
   - Scope: **Build Time** ⚠️ Important!
   - Type: Plain Text
4. Click **"Save"**

5. **Trigger rebuild:**
   - Go to **Deployments** tab
   - Click **"Force Rebuild and Deploy"**
   - Wait ~5 minutes

---

### Step 12: Seed Database

1. Go to your app → **lahacienda-db** (database)
2. Click **"Connection Details"**
3. Copy the connection string
4. Open terminal and connect:
   ```bash
   psql "postgresql://user:password@host:port/db?sslmode=require"
   ```
5. Paste SQL from `POPULATE_DATABASE.md`

---

### Step 13: Create Admin User

1. Go to your app → **backend** component
2. Click **"Console"** tab
3. Run:
   ```bash
   python scripts/create_admin_user.py
   ```

---

## Verification

After all steps complete:

### Frontend Test
- Visit: `https://your-app-abc123.ondigitalocean.app`
- Should see menu
- Should see **globe icon** (language toggle)
- Click it to switch EN ↔ FR

### Backend Test
- Visit: `https://your-app-abc123.ondigitalocean.app/api/v1/docs`
- Should see Swagger API documentation

### Admin Test
- Visit: `https://your-app-abc123.ondigitalocean.app/admin`
- Login with created admin credentials
- Should see dashboard

---

## Troubleshooting

### "No components detected" and can't proceed
- Look for "Skip" or "Continue without detection"
- Or try clicking "Next" anyway
- Last resort: Use doctl CLI method instead

### Backend shows 502 Bad Gateway
- Check SECRET_KEY is set in environment variables
- Check database is attached
- View backend logs: backend → Runtime Logs

### Frontend shows "Network Error"
- VITE_API_URL not set or incorrect
- Must be BUILD_TIME scope
- Must match your actual app URL
- Trigger rebuild after changing

### Can't add environment variables
- Make sure app is created first
- Go to Settings → Component → Environment Variables
- Click "Edit" then "Add Variable"

### Database connection fails
- Check DATABASE_URL is set (should be automatic)
- Verify database is in same region as app
- Check backend logs for connection errors

---

## Summary Checklist

- [ ] Create app from GitHub (main branch)
- [ ] Skip "No components detected" message
- [ ] Add backend component (source_dir: backend)
- [ ] Add frontend component (source_dir: frontend)
- [ ] Add PostgreSQL database
- [ ] Set non-secret environment variables
- [ ] Create app and wait for deployment
- [ ] Add secret environment variables (SECRET_KEY, etc.)
- [ ] Get app URL
- [ ] Update VITE_API_URL with actual URL
- [ ] Trigger rebuild
- [ ] Seed database
- [ ] Create admin user
- [ ] Test frontend, backend, admin

---

## Cost

- Backend: ~$5-10/month
- Frontend: Free
- Database: ~$15/month
- **Total: ~$20-25/month**

Plus your old app (if keeping it): **~$40-50/month total**

---

## If This Doesn't Work

**Use doctl CLI method instead** - see `CREATE_NEW_APP_DOCTL.md`

The CLI method works 100% of the time and is faster!
