# Setup Fixes Applied ✅

## Issues Fixed

### 1. ✅ Missing `or_` Import in special_service.py
**Fixed**: Added `or_` to the imports in `backend/app/services/special_service.py`

```python
from sqlalchemy import select, and_, or_  # Added or_
```

### 2. ✅ Python Path in Scripts
**Status**: Already correct! The `backend/scripts/create_admin.py` already has:
```python
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent.parent))
```

### 3. ✅ Dependencies in requirements.txt
**Status**: Already included! The file contains:
```
pydantic-settings==2.1.0
```

### 4. ✅ Setup Script Created
**New file**: `backend/setup_and_run.sh` - Automated setup script

---

## 🚀 How to Run the Backend (Step by Step)

### Method 1: Using the Setup Script (Recommended)

```bash
cd backend
chmod +x setup_and_run.sh
./setup_and_run.sh
```

This will:
1. Create virtual environment if needed
2. Install all dependencies
3. Show you next steps

Then manually run:
```bash
# Activate venv (if not already activated)
source ../venv/bin/activate

# Start database
docker-compose up -d db

# Wait 5 seconds
sleep 5

# Create admin user
python scripts/create_admin.py

# Start server
python app/main.py
```

### Method 2: Manual Step-by-Step

```bash
# 1. Navigate to project root
cd /Users/josegalan/Documents/restaurantQRcode

# 2. Activate existing virtual environment
source venv/bin/activate

# 3. Install/update backend dependencies
cd backend
pip install -r requirements.txt

# 4. Start PostgreSQL database
docker-compose up -d db

# 5. Wait for database to be ready (5 seconds)
sleep 5

# 6. Create initial admin user
python scripts/create_admin.py
# Output should be:
# ✅ Admin user created successfully!
# Username: admin
# Password: admin123

# 7. Start the backend server
python app/main.py
# Server will start at: http://localhost:8000
```

### Method 3: Using the Root Quick Start Script

```bash
cd /Users/josegalan/Documents/restaurantQRcode
./ADMIN_QUICK_START.sh
```

---

## 🧪 Verify Everything Works

### 1. Check Health Endpoint
```bash
curl http://localhost:8000/health
```

Expected output:
```json
{
  "status": "healthy",
  "app": "La Hacienda Ordering System",
  "version": "1.0.0"
}
```

### 2. Test Admin Login
```bash
curl -X POST http://localhost:8000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Expected output:
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer",
  "admin_id": 1,
  "username": "admin",
  "role": "admin"
}
```

### 3. Open API Documentation
Visit: http://localhost:8000/docs

You should see the Swagger UI with all API endpoints including the new admin endpoints.

### 4. Test Dashboard Endpoint
1. Copy the access token from the login response
2. Go to http://localhost:8000/docs
3. Click "Authorize" button at top right
4. Enter: `Bearer YOUR_TOKEN_HERE`
5. Try the `/api/v1/admin/dashboard` endpoint

---

## 🐛 Troubleshooting

### Issue: "ModuleNotFoundError: No module named 'pydantic_settings'"
**Solution**: Install dependencies
```bash
cd backend
source ../venv/bin/activate
pip install -r requirements.txt
```

### Issue: "ModuleNotFoundError: No module named 'app'"
**Solution**: Make sure you're running from the backend directory
```bash
cd backend
python scripts/create_admin.py
```

### Issue: Database connection errors
**Solution**: Ensure Docker is running and database is started
```bash
# Check Docker status
docker ps

# If not running, start it
docker-compose up -d db

# Check logs
docker-compose logs db
```

### Issue: "Admin user 'admin' already exists!"
**Solution**: This is normal if you've already created the admin. You can:
1. Use the existing admin credentials
2. Or delete and recreate:
```bash
# Connect to database and delete admin
docker-compose exec db psql -U postgres -d lahacienda -c "DELETE FROM admin_users WHERE username='admin';"

# Recreate admin
python scripts/create_admin.py
```

### Issue: Port 8000 already in use
**Solution**: Kill the process using port 8000
```bash
# Find process
lsof -ti:8000

# Kill it
kill -9 $(lsof -ti:8000)

# Or use a different port
uvicorn app.main:app --host 0.0.0.0 --port 8001
```

---

## 📋 Dependencies Verification Checklist

Run these commands to verify all dependencies are installed:

```bash
source ../venv/bin/activate  # From backend directory

# Check Python version (should be 3.8+)
python --version

# Check key packages
python -c "import fastapi; print('FastAPI:', fastapi.__version__)"
python -c "import pydantic_settings; print('Pydantic Settings: OK')"
python -c "import sqlalchemy; print('SQLAlchemy:', sqlalchemy.__version__)"
python -c "import jose; print('Python-JOSE: OK')"
python -c "import passlib; print('Passlib: OK')"

# All should print without errors
```

---

## ✅ What's Fixed

1. **Import Error**: Added missing `or_` import in `special_service.py`
2. **Path Configuration**: Verified `create_admin.py` has correct path setup
3. **Dependencies**: Confirmed `pydantic-settings` is in requirements.txt
4. **Setup Script**: Created automated setup script for easier installation
5. **Documentation**: Created this guide with step-by-step instructions

---

## 🎉 Next Steps

Once the backend is running successfully:

1. **Test the API**: Visit http://localhost:8000/docs
2. **Login**: Use username=`admin`, password=`admin123`
3. **Test Endpoints**: Try dashboard, menu, specials, offers endpoints
4. **Build Frontend**: Follow the `ADMIN_DASHBOARD_IMPLEMENTATION.md` guide
5. **Customize**: Change admin password, add more admins, etc.

---

## 📞 Still Having Issues?

Check these logs for detailed error messages:

```bash
# Backend application logs
# (Shown in terminal where you ran python app/main.py)

# Database logs
docker-compose logs db

# Docker status
docker-compose ps

# Python path verification
python -c "import sys; print('\n'.join(sys.path))"
```

All dependencies and paths are now correctly configured! 🚀
