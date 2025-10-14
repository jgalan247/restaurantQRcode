# 🎯 Final Setup Guide - Admin Dashboard Backend

## ✅ All Fixes Applied

1. **Missing imports fixed**: Added `or_` import to `special_service.py`
2. **Dependencies verified**: `pydantic-settings` is in requirements.txt
3. **Path configuration**: `create_admin.py` has correct Python path setup
4. **Setup scripts created**: Automated installation scripts

---

## 🚀 Complete Setup Instructions

### Prerequisites
- Python 3.8+ installed
- Docker Desktop running
- Git (already have the project)

### Step 1: Install Backend Dependencies

```bash
# Navigate to project root
cd /Users/josegalan/Documents/restaurantQRcode

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install backend dependencies
cd backend
pip install -r requirements.txt
```

**Expected output**: You should see all packages installing without errors. Key packages include:
- fastapi==0.109.0
- pydantic==2.5.3
- pydantic-settings==2.1.0
- sqlalchemy==2.0.25
- python-jose[cryptography]==3.3.0
- passlib[bcrypt]==1.7.4

### Step 2: Start Database

```bash
# From project root or backend directory
docker-compose up -d db
```

**Expected output**:
```
Creating network "restaurantqrcode_default" (or similar)
Creating restaurantqrcode_db_1 ... done
```

Wait 5-10 seconds for PostgreSQL to fully start.

**Verify database is running**:
```bash
docker-compose ps
```

Should show:
```
Name                      Command              State           Ports
-----------------------------------------------------------------------------
restaurantqrcode_db_1    docker-entrypoint.sh postgres   Up      0.0.0.0:5432->5432/tcp
```

### Step 3: Create Admin User

```bash
# Make sure you're in backend directory with venv activated
cd backend
python scripts/create_admin.py
```

**Expected output**:
```
Creating initial admin user...
✅ Admin user created successfully!

Login credentials:
  Username: admin
  Password: admin123

⚠️  IMPORTANT: Please change this password after first login!
```

**If you see**: "❌ Admin user 'admin' already exists!"
- This is fine! The admin user is already created. Skip to Step 4.

### Step 4: Start Backend Server

```bash
# From backend directory with venv activated
python app/main.py
```

**Expected output**:
```
INFO:     Will watch for changes in these directories: ['/Users/josegalan/Documents/restaurantQRcode/backend']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using watchfiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

**Server is now running at**: http://localhost:8000

---

## 🧪 Test Your Setup

### Test 1: Health Check
Open your browser or use curl:
```bash
curl http://localhost:8000/health
```

**Expected response**:
```json
{
  "status": "healthy",
  "app": "La Hacienda Ordering System",
  "version": "1.0.0"
}
```

### Test 2: API Documentation
Open in browser: **http://localhost:8000/docs**

You should see the Swagger UI with all API endpoints, including the new admin endpoints:
- Admin Authentication
- Admin Dashboard
- And all other endpoints

### Test 3: Admin Login
In the Swagger UI at http://localhost:8000/docs:

1. Find `POST /api/v1/admin/auth/login`
2. Click "Try it out"
3. Replace the example with:
```json
{
  "username": "admin",
  "password": "admin123"
}
```
4. Click "Execute"

**Expected response**: Status 200 with JSON:
```json
{
  "access_token": "eyJhbGci...(long token)...",
  "token_type": "bearer",
  "admin_id": 1,
  "username": "admin",
  "role": "admin"
}
```

5. **Copy the `access_token` value**

### Test 4: Authorize and Test Protected Endpoints

1. In Swagger UI, click the **"Authorize"** button (top right, lock icon)
2. In the dialog, enter: `Bearer YOUR_ACCESS_TOKEN` (paste the token you copied)
3. Click "Authorize"
4. Click "Close"

Now all endpoints with a lock icon are accessible!

### Test 5: Dashboard Endpoint

1. Find `GET /api/v1/admin/dashboard`
2. Click "Try it out"
3. Click "Execute"

**Expected response**: Status 200 with today's statistics:
```json
{
  "today_sales": 0.0,
  "today_orders": 0,
  "average_order_value": 0.0,
  "most_popular_item": null,
  "most_popular_item_count": 0,
  "pending_orders": 0,
  "preparing_orders": 0
}
```

(Values will be 0 initially since there are no orders yet)

---

## 📋 Quick Command Reference

```bash
# Activate virtual environment
source venv/bin/activate

# Start database
docker-compose up -d db

# Stop database
docker-compose down

# View database logs
docker-compose logs db

# Create admin user (first time only)
cd backend
python scripts/create_admin.py

# Start backend server
cd backend
python app/main.py

# Or with auto-reload (development)
cd backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Install/update dependencies
cd backend
pip install -r requirements.txt
```

---

## 🐛 Common Issues & Solutions

### Issue: "ModuleNotFoundError: No module named 'pydantic_settings'"

**Cause**: Dependencies not installed in virtual environment

**Solution**:
```bash
source venv/bin/activate
cd backend
pip install -r requirements.txt
```

---

### Issue: "sqlalchemy.exc.OperationalError: could not connect to server"

**Cause**: PostgreSQL database not running

**Solution**:
```bash
# Check if Docker is running
docker ps

# Start database
docker-compose up -d db

# Wait 10 seconds
sleep 10

# Check database logs
docker-compose logs db
```

---

### Issue: "ModuleNotFoundError: No module named 'app'"

**Cause**: Running script from wrong directory

**Solution**:
```bash
# Always run from backend directory
cd backend
python scripts/create_admin.py
python app/main.py
```

---

### Issue: Port 8000 already in use

**Cause**: Another process using port 8000

**Solution**:
```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9

# Or use different port
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

---

### Issue: "Admin user 'admin' already exists!"

**Cause**: Admin user already created (this is normal)

**Solution**: This is not an error! Just use the existing credentials:
- Username: `admin`
- Password: `admin123`

Or to reset:
```bash
# Delete existing admin
docker-compose exec db psql -U postgres -d lahacienda -c "DELETE FROM admin_users WHERE username='admin';"

# Recreate
python scripts/create_admin.py
```

---

## ✅ Verification Checklist

After setup, verify these are working:

- [ ] Virtual environment activated (see `(venv)` in terminal prompt)
- [ ] Backend dependencies installed (no import errors)
- [ ] Docker Desktop running
- [ ] PostgreSQL database running (`docker-compose ps` shows "Up")
- [ ] Admin user created (got success message)
- [ ] Backend server running (http://localhost:8000/health returns healthy)
- [ ] API docs accessible (http://localhost:8000/docs loads)
- [ ] Admin login works (login endpoint returns token)
- [ ] Dashboard endpoint works (returns statistics after authorization)

---

## 🎉 You're Ready!

Your backend is now fully set up and running! Next steps:

### Immediate Testing
1. Explore all endpoints in Swagger UI: http://localhost:8000/docs
2. Test menu management endpoints
3. Test specials and offers endpoints
4. Test order management endpoints

### Frontend Development
1. Read `ADMIN_DASHBOARD_IMPLEMENTATION.md` for detailed frontend guide
2. Use `frontend/src/services/adminApi.ts` (already created)
3. Use `frontend/src/types/admin.ts` (already created)
4. Build admin pages following the examples

### Customization
1. Change admin password (security!)
2. Create additional admin users
3. Customize settings in `backend/.env`
4. Add your menu items, specials, and offers

---

## 📞 Need Help?

### Check Logs
```bash
# Backend logs (in terminal where server is running)
# Database logs
docker-compose logs db

# Python import test
python -c "import app.config; print('OK')"
```

### Documentation
- `ADMIN_README.md` - Quick reference
- `ADMIN_DASHBOARD_IMPLEMENTATION.md` - Complete implementation guide
- `ADMIN_DASHBOARD_COMPLETE_SUMMARY.md` - Technical overview
- `SETUP_FIXES_APPLIED.md` - What was fixed

### API Documentation
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

---

## 🚀 Production Deployment Tips

When ready to deploy:

1. **Change default passwords**:
   - Admin password (admin123)
   - Database password (in .env)
   - SECRET_KEY (in .env)

2. **Update CORS origins** in `backend/app/main.py`

3. **Use environment variables** for sensitive data

4. **Set up proper database migrations** with Alembic

5. **Use production ASGI server** (Gunicorn with Uvicorn workers)

6. **Enable HTTPS** for all connections

7. **Set up monitoring** and logging

---

**Backend is now ready to use! Happy coding! 🎊**
