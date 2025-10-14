# 🚀 Quick Reference - Admin Dashboard

## One-Command Setup
```bash
./install_and_start.sh
```

## Manual Commands

### Start Everything
```bash
# 1. Activate virtual environment
source venv/bin/activate

# 2. Start database
docker-compose up -d postgres

# 3. Wait for database
sleep 10

# 4. Create admin (first time only)
cd backend
python scripts/create_admin.py

# 5. Start backend
python app/main.py
```

### Docker Commands
```bash
# Start database
docker-compose up -d postgres

# Stop everything
docker-compose down

# View logs
docker-compose logs postgres
docker-compose logs backend

# Check status
docker-compose ps

# Restart services
docker-compose restart postgres
```

### Database Access
```bash
# Connect to database CLI
docker-compose exec postgres psql -U lahacienda -d lahacienda

# Inside psql:
\dt              # List tables
\d admin_users   # Describe table
SELECT * FROM admin_users;
\q               # Quit
```

### Backend Commands
```bash
# From backend directory with venv activated

# Start server (development)
python app/main.py

# Or with uvicorn directly
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Create admin user
python scripts/create_admin.py

# Check imports work
python -c "import app.config; print('OK')"
```

### Python Environment
```bash
# Activate venv
source venv/bin/activate

# Deactivate venv
deactivate

# Install dependencies
pip install -r requirements.txt

# Check package
pip show fastapi
pip list | grep pydantic
```

## Important URLs

### Backend
- **Health Check**: http://localhost:8000/health
- **API Docs (Swagger)**: http://localhost:8000/docs
- **API Docs (ReDoc)**: http://localhost:8000/redoc
- **API Root**: http://localhost:8000/

### Test Endpoints
- **Login**: POST http://localhost:8000/api/v1/admin/auth/login
- **Dashboard**: GET http://localhost:8000/api/v1/admin/dashboard

## Default Credentials

### Admin Login
- **Username**: `admin`
- **Password**: `admin123`
- ⚠️ **Change immediately after first login!**

### Database
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `lahacienda`
- **Username**: `lahacienda`
- **Password**: `password123`

## Quick Tests

### Test 1: Health Check
```bash
curl http://localhost:8000/health
```

### Test 2: Admin Login
```bash
curl -X POST http://localhost:8000/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

### Test 3: Dashboard (with token)
```bash
TOKEN="your_access_token_here"
curl http://localhost:8000/api/v1/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

## Common Issues

### "no such service: db"
✅ **Fixed!** Use `postgres` not `db`:
```bash
docker-compose up -d postgres  # Correct
docker-compose up -d db        # Wrong
```

### "ModuleNotFoundError"
```bash
source venv/bin/activate
cd backend
pip install -r requirements.txt
```

### "Connection refused"
```bash
# Start database
docker-compose up -d postgres
sleep 10
```

### Port 8000 in use
```bash
# Find and kill process
lsof -ti:8000 | xargs kill -9
```

## Directory Structure
```
restaurantQRcode/
├── backend/
│   ├── app/
│   │   ├── api/v1/admin.py       # Admin endpoints
│   │   ├── models/special.py     # New models
│   │   ├── services/admin_service.py
│   │   └── utils/auth.py         # JWT auth
│   ├── scripts/create_admin.py
│   └── requirements.txt
├── frontend/
│   └── src/
│       ├── types/admin.ts        # TypeScript types
│       ├── services/adminApi.ts  # API client
│       └── pages/admin/AdminLogin.tsx
├── install_and_start.sh          # ONE-COMMAND SETUP
└── docker-compose.yml            # Docker config
```

## Documentation Files

- **QUICK_REFERENCE.md** (this file) - Quick commands
- **FINAL_SETUP_GUIDE.md** - Complete setup guide
- **ADMIN_README.md** - Overview and quick start
- **ADMIN_DASHBOARD_IMPLEMENTATION.md** - Frontend dev guide
- **DOCKER_COMPOSE_FIX.md** - Service name fix details

## Next Steps After Setup

1. ✅ Backend running? → Test endpoints in Swagger UI
2. ✅ Login works? → Build frontend pages
3. ✅ All endpoints working? → Customize for your needs

---

**Need Help?** Check `FINAL_SETUP_GUIDE.md` for detailed troubleshooting!
