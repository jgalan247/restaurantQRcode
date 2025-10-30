# Digital Ocean Deployment - Quick Start

## ✅ Repository is Ready!

Your repository now contains:
- `.digitalocean/app.yaml` - Primary app specification
- `.do-app-spec.yaml` - Alternative app spec (use if needed)
- Proper monorepo structure with backend and frontend

---

## 🚀 Deployment Instructions

### Option 1: Import App Spec (Recommended)

1. **Go to Digital Ocean Dashboard**
   - Navigate to: https://cloud.digitalocean.com/apps
   - Click **"Create App"**

2. **Choose Source**
   - Select **GitHub**
   - Repository: `jgalan247/restaurantQRcode`
   - Branch: `main`

3. **Import App Spec**
   - Look for **"Import from App Spec"** or **"Edit App Spec"** button/tab
   - If you see it, click it
   - The `.digitalocean/app.yaml` should be automatically detected
   - OR paste the contents of `.do-app-spec.yaml` manually

4. **You Should See:**
   ```
   ✓ backend (Web Service)
     Source: backend/

   ✓ frontend (Static Site)
     Source: frontend/

   ✓ lahacienda-db (PostgreSQL Database)
   ```

5. **Click "Next" or "Create Resources"**

---

### Option 2: Manual Component Configuration

If auto-detection still doesn't work:

1. **Create App** from GitHub (`jgalan247/restaurantQRcode`, branch `main`)

2. **Skip/Ignore** the "No components detected" message

3. **Click "Edit Resources" or "Add Component"**

4. **Add Backend Service:**
   - Type: **Web Service**
   - Name: `backend`
   - Source Directory: `backend`
   - Build Command: `pip install -r requirements.txt`
   - Run Command: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --root-path /api`
   - HTTP Port: `8000`
   - Routes: `/api`

5. **Add Frontend Static Site:**
   - Type: **Static Site**
   - Name: `frontend`
   - Source Directory: `frontend`
   - Build Command: `npm install && npm run build`
   - Output Directory: `dist`
   - Routes: `/`

6. **Add Database:**
   - Type: PostgreSQL
   - Version: 15
   - Name: `lahacienda-db`

---

## ⚠️ Required Environment Variables (Set After Creation)

### Backend Secrets (Required!)

Go to: Settings → backend → Environment Variables

```bash
# 1. Generate SECRET_KEY first
python3 -c "import secrets; print(secrets.token_urlsafe(64))"

# Then add in DO dashboard:
SECRET_KEY = [paste generated key above]
CITYPAY_MERCHANT_ID = [your CityPay merchant ID]
CITYPAY_API_KEY = [your CityPay API key]
MAIL_USERNAME = [SendGrid username or SMTP username]
MAIL_PASSWORD = [SendGrid API key or SMTP password]
```

### Frontend Variable (Update After First Deploy)

Go to: Settings → frontend → Environment Variables

```bash
# After you get your app URL from first deployment:
VITE_API_URL = https://YOUR-APP-NAME.ondigitalocean.app/api/v1
```

Then trigger a rebuild: Actions → Force Rebuild

---

## 📋 Post-Deployment Steps

### 1. Seed the Database

Connect to database via DO Console:
```bash
# Get connection string from DO dashboard → Database
psql "your-connection-string-here"

# Then paste SQL from POPULATE_DATABASE.md
```

### 2. Create Admin User

In backend console:
```bash
python scripts/create_admin_user.py
```

### 3. Test Your App

- Frontend: `https://your-app.ondigitalocean.app`
- Backend API: `https://your-app.ondigitalocean.app/api/v1/docs`
- Admin Panel: `https://your-app.ondigitalocean.app/admin`

---

## 🎯 Expected Components

After successful deployment, you should have:

1. **backend** (Web Service)
   - Running FastAPI on port 8000
   - Accessible at `/api/*`
   - Connected to PostgreSQL database

2. **frontend** (Static Site)
   - React + Vite build
   - Accessible at `/`
   - Supports French/English toggle

3. **lahacienda-db** (Database)
   - PostgreSQL 15
   - Managed by Digital Ocean

---

## 💰 Cost Estimate

- Backend: ~$5-10/month
- Frontend: Free (static)
- Database: ~$15/month
- **Total: ~$20-25/month**

---

## 📚 Additional Help

- Full deployment guide: `DEPLOYMENT_READY.md`
- Detailed setup: `DIGITAL_OCEAN_SETUP.md`
- Database population: `POPULATE_DATABASE.md`
- Troubleshooting: `DEPLOYMENT_FIXES.md`

---

## 🔧 Troubleshooting

**Still seeing "No components detected"?**
→ Use Option 2 (Manual Configuration) above

**Only seeing 1 component (web service)?**
→ Click "Edit Resources" and add frontend as Static Site separately

**Backend won't start?**
→ Make sure SECRET_KEY environment variable is set

**Frontend shows "Network Error"?**
→ Update VITE_API_URL with actual deployment URL and rebuild

---

**Ready to deploy!** Start with Option 1 above.
