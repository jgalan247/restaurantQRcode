# 🎯 Admin Dashboard - Quick Reference

## 🚀 Quick Start (3 Steps)

### Option 1: Automatic (Recommended)
```bash
./ADMIN_QUICK_START.sh
```

### Option 2: Manual
```bash
# 1. Start database
docker-compose up -d db

# 2. Create admin user
cd backend
python3 scripts/create_admin.py

# 3. Start backend
python3 app/main.py
```

## 🔑 Login Credentials

**Default Admin Account:**
- **URL**: http://localhost:8000 (backend) or http://localhost:5173/admin/login (frontend when built)
- **Username**: `admin`
- **Password**: `admin123`
- ⚠️ **IMPORTANT**: Change this password after first login!

## 📚 Documentation

### Main Guides
1. **[ADMIN_DASHBOARD_IMPLEMENTATION.md](./ADMIN_DASHBOARD_IMPLEMENTATION.md)** - Complete implementation guide with examples
2. **[ADMIN_DASHBOARD_COMPLETE_SUMMARY.md](./ADMIN_DASHBOARD_COMPLETE_SUMMARY.md)** - Full summary of what's been built

### API Documentation
- **Swagger UI**: http://localhost:8000/docs (Interactive API testing)
- **ReDoc**: http://localhost:8000/redoc (Alternative API documentation)

## ✅ Backend Status: COMPLETE

All backend functionality is implemented and ready to use:

- ✅ JWT Authentication with role-based access control
- ✅ Admin user management
- ✅ Dashboard overview statistics
- ✅ Menu management (CRUD + toggle availability/86'd)
- ✅ Specials/Menu of the Day management
- ✅ Promotional offers management
- ✅ Real-time order management
- ✅ Order history with filters and pagination
- ✅ Sales reports and analytics

## 🎨 Frontend Status: STARTER FILES CREATED

**What's Ready:**
- ✅ TypeScript type definitions (`frontend/src/types/admin.ts`)
- ✅ Complete API client (`frontend/src/services/adminApi.ts`)
- ✅ Beautiful login page (`frontend/src/pages/admin/AdminLogin.tsx`)

**What Needs to Be Built:**
- 📝 Admin authentication context
- 📝 Protected route component
- 📝 Admin layout with sidebar navigation
- 📝 Dashboard home page
- 📝 Menu management page
- 📝 Specials management page
- 📝 Offers management page
- 📝 Real-time orders dashboard
- 📝 Order history page
- 📝 Sales reports page

See implementation guide for detailed instructions.

## 📋 API Endpoints Reference

### Authentication
- `POST /api/v1/admin/auth/login` - Login (get JWT token)
- `POST /api/v1/admin/auth/logout` - Logout
- `GET /api/v1/admin/auth/me` - Get current admin info

### Dashboard
- `GET /api/v1/admin/dashboard` - Today's overview stats

### Menu Management
- `GET /api/v1/admin/menu/items` - List all menu items
- `POST /api/v1/admin/menu/items` - Create menu item
- `PUT /api/v1/admin/menu/items/{id}` - Update menu item
- `DELETE /api/v1/admin/menu/items/{id}` - Delete menu item
- `PATCH /api/v1/admin/menu/items/{id}/availability` - Toggle availability (86'd)

### Specials
- `GET /api/v1/admin/specials` - List all specials
- `POST /api/v1/admin/specials` - Create special
- `PUT /api/v1/admin/specials/{id}` - Update special
- `DELETE /api/v1/admin/specials/{id}` - Delete special

### Offers
- `GET /api/v1/admin/offers` - List all offers
- `POST /api/v1/admin/offers` - Create offer
- `PUT /api/v1/admin/offers/{id}` - Update offer
- `DELETE /api/v1/admin/offers/{id}` - Delete offer

### Orders
- `GET /api/v1/admin/orders/realtime` - Get active orders
- `GET /api/v1/admin/orders/history` - Get order history (paginated)
- `PATCH /api/v1/admin/orders/{id}/status` - Update order status

### Reports
- `GET /api/v1/admin/reports/sales?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Sales report

## 🧪 Testing the Backend

1. **Start the backend** (see Quick Start above)

2. **Open API docs** at http://localhost:8000/docs

3. **Login**:
   - Click on `POST /api/v1/admin/auth/login`
   - Click "Try it out"
   - Use: `{"username": "admin", "password": "admin123"}`
   - Click "Execute"
   - Copy the `access_token` from the response

4. **Authorize**:
   - Click the "Authorize" button at the top right
   - Enter: `Bearer YOUR_ACCESS_TOKEN_HERE` (replace with your token)
   - Click "Authorize"

5. **Test endpoints**:
   - Now you can test any admin endpoint
   - They all have the lock icon indicating they're protected

## 🔧 Configuration

### JWT Token Settings
File: `backend/app/utils/auth.py`
- Default expiry: 8 hours (480 minutes)
- Algorithm: HS256
- Secret key: From `backend/.env` file

### Admin Roles
- `admin` - Full access (can create other admins)
- `manager` - Can manage menu, specials, offers, orders
- `staff` - Can view and update orders

### Database
- PostgreSQL (via Docker)
- Connection string in `backend/.env`
- Auto-creates tables on first run (development mode)

## 📦 Project Structure

```
restaurant-qr-system/
├── backend/
│   ├── app/
│   │   ├── api/v1/
│   │   │   ├── admin.py          # Admin dashboard endpoints
│   │   │   └── admin_auth.py     # Admin authentication
│   │   ├── models/
│   │   │   ├── special.py        # Specials models
│   │   │   └── offer.py          # Offers models
│   │   ├── schemas/
│   │   │   ├── admin.py          # Admin schemas
│   │   │   ├── special.py        # Special schemas
│   │   │   ├── offer.py          # Offer schemas
│   │   │   └── analytics.py      # Analytics schemas
│   │   ├── services/
│   │   │   ├── admin_service.py  # Admin business logic
│   │   │   ├── special_service.py
│   │   │   └── offer_service.py
│   │   └── utils/
│   │       └── auth.py           # JWT authentication
│   ├── scripts/
│   │   └── create_admin.py       # Create initial admin
│   └── alembic/versions/
│       └── 001_add_admin_dashboard_models.py
│
├── frontend/
│   └── src/
│       ├── types/
│       │   └── admin.ts          # TypeScript types
│       ├── services/
│       │   └── adminApi.ts       # API client
│       └── pages/admin/
│           └── AdminLogin.tsx    # Login page
│
└── Documentation/
    ├── ADMIN_README.md (this file)
    ├── ADMIN_DASHBOARD_IMPLEMENTATION.md
    └── ADMIN_DASHBOARD_COMPLETE_SUMMARY.md
```

## 🐛 Troubleshooting

### Backend won't start
```bash
# Check if database is running
docker-compose ps

# Check database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

### Can't login
```bash
# Recreate admin user
cd backend
python3 scripts/create_admin.py
```

### CORS errors
- Backend is configured for `localhost:5173` (Vite default)
- If frontend runs on different port, update `backend/app/main.py`

### Database errors
```bash
# Reset database (WARNING: Deletes all data)
docker-compose down -v
docker-compose up -d db
cd backend
python3 scripts/create_admin.py
```

## 💡 Pro Tips

1. **API Testing**: Use the Swagger UI at `/docs` - it's much easier than Postman
2. **Token Expiry**: Tokens last 8 hours. If expired, just login again
3. **Development**: Backend auto-reloads on code changes
4. **Security**: Never commit the `.env` file to git
5. **Production**: Change the default admin password immediately

## 📞 Need Help?

1. Check `ADMIN_DASHBOARD_IMPLEMENTATION.md` for detailed examples
2. Check `ADMIN_DASHBOARD_COMPLETE_SUMMARY.md` for complete overview
3. Use Swagger UI at http://localhost:8000/docs to test APIs
4. Check backend logs for error messages

## ✨ Next Steps

1. ✅ Backend is done! It's fully functional and tested
2. 📝 Build the frontend pages (see implementation guide)
3. 🧪 Test everything end-to-end
4. 🎨 Customize styling to match your brand
5. 🚀 Deploy to production

---

**Happy coding! 🎉**

The backend is production-ready. Now just build beautiful UI components to connect to it!
