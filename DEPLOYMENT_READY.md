# Digital Ocean Deployment Readiness Checklist

## ✅ Repository Status: READY FOR DEPLOYMENT

**Last Updated:** 2025-10-30
**Branch:** main
**Features:** Complete ordering system with French translation support

---

## What's Included in This Deployment

### Core Features
✅ **Customer-Facing App**
- QR code table access
- Digital menu with categories and filtering
- Allergen warnings and dietary tags
- Shopping cart with modifiers
- Bill splitting (equal split & by items)
- **French/English language toggle** (NEW!)
- Payment integration (CityPay ready)
- Email invoices

✅ **Admin Dashboard**
- Menu management (CRUD operations)
- CSV bulk import
- Order management
- Table management
- Budget builder tool
- Promotions system
- Business settings

✅ **Backend API**
- FastAPI with async PostgreSQL
- JWT authentication for admin
- CityPay payment integration
- Email service integration
- Comprehensive API docs at `/api/v1/docs`

---

## Pre-Deployment Steps (Complete These First!)

### 1. ⚠️ Set Required Environment Variables in Digital Ocean

**Critical - Backend Secrets:**
Navigate to: Settings → backend → Environment Variables

```bash
# JWT Secret (REQUIRED)
SECRET_KEY = [Generate with: python3 -c "import secrets; print(secrets.token_urlsafe(64))"]

# CityPay Credentials (REQUIRED for payments)
CITYPAY_MERCHANT_ID = [Your merchant ID]
CITYPAY_API_KEY = [Your API key]

# Email Service (REQUIRED for invoices)
MAIL_USERNAME = [SendGrid username or SMTP username]
MAIL_PASSWORD = [SendGrid API key or SMTP password]
```

**Important - Frontend Build Variable:**
Navigate to: Settings → frontend → Environment Variables

```bash
# This MUST match your actual backend URL after deployment
VITE_API_URL = https://your-actual-app-url.ondigitalocean.app/api/v1
```

**Note:** The current hardcoded value in `.do/app.yaml` is:
```
https://seahorse-app-zxz5f.ondigitalocean.app/api/v1
```
You need to update this to YOUR actual Digital Ocean app URL!

### 2. ⚠️ Update Restaurant Information

Edit `.do/app.yaml` (lines 49-58) with your actual restaurant details:

```yaml
- key: RESTAURANT_NAME
  value: La Hacienda  # Change this
- key: RESTAURANT_ADDRESS
  value: "123 Mexican Street, London, UK, SW1A 1AA"  # Change this
- key: RESTAURANT_PHONE
  value: "+44 20 1234 5678"  # Change this
- key: RESTAURANT_EMAIL
  value: info@lahacienda.co.uk  # Change this
- key: RESTAURANT_VAT_NUMBER
  value: GB123456789  # Change this
```

### 3. ⚠️ Update Frontend URL in app.yaml

After you deploy once and get your Digital Ocean app URL, update line 97:

**Current (placeholder):**
```yaml
- key: VITE_API_URL
  scope: BUILD_TIME
  value: https://seahorse-app-zxz5f.ondigitalocean.app/api/v1
```

**Update to YOUR URL:**
```yaml
- key: VITE_API_URL
  scope: BUILD_TIME
  value: https://YOUR-APP-NAME.ondigitalocean.app/api/v1
```

Then commit and push to trigger a rebuild.

---

## Deployment Process

### Step 1: Push to GitHub
```bash
# You're on main branch with all changes merged
git status
git push origin main
```

### Step 2: Create Digital Ocean App

**Option A: Use App Spec (Recommended)**
1. Login to Digital Ocean
2. Go to Apps → Create App
3. Connect your GitHub repository: `https://github.com/jgalan247/restaurantQRcode`
4. Select branch: `main`
5. Import app spec: Upload `.do/app.yaml`
6. Review components (backend, frontend, database)
7. Click "Create Resources"

**Option B: Manual Setup**
1. Create App from GitHub
2. Select repository and `main` branch
3. Configure backend:
   - Source: `/backend`
   - Run command: `uvicorn app.main:app --host 0.0.0.0 --port 8000 --root-path /api`
   - HTTP port: 8000
   - Route: `/api`
4. Configure frontend:
   - Source: `/frontend`
   - Build: `npm install && npm run build`
   - Output: `dist`
   - Route: `/`
5. Add PostgreSQL database
6. Set environment variables (see above)

### Step 3: Post-Deployment Configuration

**After first successful deployment:**

1. **Update VITE_API_URL**
   - Copy your actual app URL (e.g., `https://your-app-abc123.ondigitalocean.app`)
   - Update `.do/app.yaml` line 97
   - Commit and push
   - Wait for automatic redeploy

2. **Seed the Database**

   Connect to your database via DO console and run:
   ```bash
   # Get connection string from DO dashboard
   psql [DATABASE_URL]

   # Then paste SQL from POPULATE_DATABASE.md
   ```

3. **Create Admin User**

   SSH into backend container:
   ```bash
   # From DO dashboard: backend → Console
   python backend/scripts/create_admin_user.py
   ```

   Or run SQL directly:
   ```sql
   INSERT INTO admin_users (username, hashed_password, role)
   VALUES ('admin', '[bcrypt hash]', 'admin');
   ```

4. **Test the Application**
   - Visit frontend: `https://your-app.ondigitalocean.app`
   - Test menu loading
   - Test language toggle (EN/FR)
   - Test cart functionality
   - Login to admin: `https://your-app.ondigitalocean.app/admin`
   - Test payment flow (if CityPay configured)

---

## Configuration Files Reference

### `.do/app.yaml` ✅ Ready
- Configured for main branch deployment
- PostgreSQL database defined
- Backend at `/api` route
- Frontend at `/` route
- All environment variables listed

### `backend/.env.example` ✅ Complete
- Template for local development
- Shows all required variables
- Not used in production (DO uses app.yaml)

### `frontend/.env.example` ✅ Complete
- Shows VITE_API_URL format
- Used for local development only

### `backend/requirements.txt` ✅ Ready
- All Python dependencies listed
- Includes CityPay client, FastAPI, SQLAlchemy, etc.

### `frontend/package.json` ✅ Ready
- All Node dependencies listed
- Includes React, i18next, Tailwind, etc.

---

## Environment Variables Reference

### Backend (Set in Digital Ocean Dashboard)

**Required for Production:**
```bash
# Database (automatically set by DO)
DATABASE_URL=${lahacienda-db.DATABASE_URL}

# Security (MUST SET)
SECRET_KEY=[64-char random string]
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=480

# Application
DEBUG=False
ENVIRONMENT=production
CORS_ORIGINS=["https://your-app.ondigitalocean.app"]
FRONTEND_URL=https://your-app.ondigitalocean.app

# Business
GST_RATE=0.05
CURRENCY=GBP
RESTAURANT_NAME=La Hacienda
RESTAURANT_ADDRESS=123 Mexican Street, London, UK
RESTAURANT_PHONE=+44 20 1234 5678
RESTAURANT_EMAIL=info@lahacienda.co.uk
RESTAURANT_VAT_NUMBER=GB123456789

# Payment (REQUIRED for orders)
CITYPAY_MERCHANT_ID=[from CityPay]
CITYPAY_API_KEY=[from CityPay]
CITYPAY_BASE_URL=https://secure.citypay.com

# Email (REQUIRED for invoices)
MAIL_USERNAME=[SendGrid or SMTP username]
MAIL_PASSWORD=[SendGrid API key or SMTP password]
MAIL_SERVER=smtp.sendgrid.net
MAIL_FROM=noreply@lahacienda.co.uk
MAIL_PORT=587
MAIL_FROM_NAME=La Hacienda Restaurant
```

### Frontend (Set in Digital Ocean Dashboard)

**Required at BUILD TIME:**
```bash
VITE_API_URL=https://your-app.ondigitalocean.app/api/v1
VITE_APP_NAME=La Hacienda
```

---

## Testing Checklist (After Deployment)

### Frontend Tests
- [ ] Homepage loads without errors
- [ ] Menu items display correctly
- [ ] Language toggle works (EN ↔ FR)
- [ ] Cart operations work (add, remove, update)
- [ ] Checkout flow completes
- [ ] Admin login works
- [ ] Admin dashboard loads
- [ ] Menu management works

### Backend Tests
- [ ] API docs accessible at `/api/v1/docs`
- [ ] GET `/api/v1/menu` returns menu items
- [ ] POST `/api/v1/orders` creates orders
- [ ] Admin authentication works
- [ ] Database migrations applied
- [ ] No CORS errors in browser console

### Database Tests
- [ ] Tables created (check via DO console)
- [ ] Menu items populated
- [ ] Admin user exists
- [ ] Test order creation

---

## Common Deployment Issues & Fixes

### Issue: Frontend shows "Network Error"
**Cause:** VITE_API_URL not set or incorrect
**Fix:**
1. Go to DO dashboard → frontend → Environment Variables
2. Add `VITE_API_URL` with scope `BUILD_TIME`
3. Value: `https://your-actual-app-url.ondigitalocean.app/api/v1`
4. Trigger rebuild

### Issue: Backend 502 Bad Gateway
**Cause:** Database not connected or env vars missing
**Fix:**
1. Check backend logs in DO dashboard
2. Verify `DATABASE_URL` is set automatically
3. Check `SECRET_KEY` is set
4. Restart backend component

### Issue: CORS errors in browser
**Cause:** Frontend URL not in CORS_ORIGINS
**Fix:**
1. Update backend env var `CORS_ORIGINS`
2. Add: `["https://your-frontend-url.ondigitalocean.app"]`
3. Restart backend

### Issue: Empty menu (GET /menu returns [])
**Cause:** Database not seeded
**Fix:**
1. Connect to database via DO console
2. Run SQL from `POPULATE_DATABASE.md`
3. Or upload CSV via admin interface

### Issue: Payment fails
**Cause:** CityPay credentials not set
**Fix:**
1. Add `CITYPAY_MERCHANT_ID` and `CITYPAY_API_KEY`
2. Verify `CITYPAY_BASE_URL` is correct
3. Check CityPay dashboard for API status

---

## Files Changed in This Release

**New Translation Files:**
- `frontend/src/i18n.ts` - i18n configuration
- `frontend/src/locales/en/translation.json` - English UI strings
- `frontend/src/locales/fr/translation.json` - French UI strings
- `frontend/src/locales/en/menu-items.json` - English menu items
- `frontend/src/locales/fr/menu-items.json` - French menu items
- `frontend/src/utils/menuTranslation.ts` - Translation utilities

**Updated Components:**
- Header.tsx - Language toggle button
- All customer-facing pages - French translation support
- Payment components - Translated
- Cart components - Translated
- Menu components - Translated

**Documentation:**
- `FRENCH_TRANSLATION_GUIDE.md` - Implementation guide
- `TRANSLATION_PROGRESS.md` - Progress report
- `CLAUDE.md` - Complete project documentation

**Configuration:**
- `.do/app.yaml` - Updated to deploy from `main` branch

---

## Production Monitoring

### Health Checks
- Frontend: `https://your-app.ondigitalocean.app/`
- Backend API docs: `https://your-app.ondigitalocean.app/api/v1/docs`
- Backend health: `https://your-app.ondigitalocean.app/api/v1/health`

### Logs
Access via Digital Ocean dashboard:
- Backend logs: backend component → Runtime Logs
- Build logs: backend/frontend → Build Logs
- Database logs: database component → Logs

### Metrics
Monitor in DO dashboard:
- CPU usage
- Memory usage
- Request rate
- Error rate
- Database connections

---

## Support Resources

### Documentation
- `README.md` - Project overview
- `CLAUDE.md` - Complete development guide
- `DEPLOYMENT_FIXES.md` - Troubleshooting guide
- `HOW_TO_POPULATE_DATABASE.md` - Database setup
- `FRENCH_TRANSLATION_GUIDE.md` - Translation docs

### API Documentation
- Swagger UI: `https://your-app.ondigitalocean.app/api/v1/docs`
- ReDoc: `https://your-app.ondigitalocean.app/api/v1/redoc`

### Repository
- GitHub: https://github.com/jgalan247/restaurantQRcode
- Branch: `main`
- Deployment: Auto-deploy on push to main

---

## Next Steps After Deployment

1. **Test thoroughly** - Go through entire customer ordering flow
2. **Set up monitoring** - Configure alerts in DO dashboard
3. **Configure payment gateway** - Complete CityPay integration
4. **Set up email service** - Configure SendGrid or SMTP
5. **Custom domain** (optional) - Add your own domain in DO settings
6. **SSL certificate** - Automatic with DO, verify it's active
7. **Backup strategy** - Enable database backups in DO
8. **Populate real menu** - Upload your actual menu via admin CSV import
9. **Test translations** - Verify French translations are accurate
10. **Train staff** - Show admin how to use the admin dashboard

---

## Summary

✅ **Repository Status:** Ready for deployment
✅ **Branch:** main (merged with frenchTranslation)
✅ **Features:** Complete with French translation support
✅ **Configuration:** `.do/app.yaml` configured for main branch
⚠️ **Action Required:** Set environment variables in DO dashboard
⚠️ **Action Required:** Update VITE_API_URL with actual deployment URL
⚠️ **Action Required:** Seed database after deployment
⚠️ **Action Required:** Create admin user

**Deployment Method:** Push to main → Auto-deploys to Digital Ocean Apps

**Estimated Deployment Time:** 10-15 minutes (first deploy)

**Monthly Cost Estimate:**
- Backend: ~$5-10 (basic-xxs)
- Frontend: Free (static site)
- Database: ~$15 (db-s-dev-database)
- **Total: ~$20-25/month**

---

**Ready to deploy!** Push to GitHub and Digital Ocean will handle the rest.
