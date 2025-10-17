# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

La Hacienda Restaurant QR Code Ordering System - A full-stack table-side ordering application with QR code access, digital menu, cart management, bill splitting, CityPay payment integration, and email receipts.

**Tech Stack:**
- Backend: FastAPI (async Python), PostgreSQL, SQLAlchemy 2.0 (async ORM)
- Frontend: React 18 + TypeScript, Vite, Tailwind CSS
- Payment: CityPay integration
- Infrastructure: Docker Compose

## Development Commands

### Backend

```bash
# Navigate to backend
cd backend

# Setup virtual environment (first time)
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Run with specific host/port
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000

# Database migrations
alembic upgrade head           # Apply migrations
alembic revision --autogenerate -m "description"  # Create new migration
alembic downgrade -1           # Rollback one migration

# Run tests
pytest tests/ -v
pytest tests/ -v --cov=app     # With coverage

# Code formatting
black app/ tests/
ruff check app/ tests/
```

### Frontend

```bash
# Navigate to frontend
cd frontend

# Install dependencies (first time)
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run tests
npm run test
```

### Docker

```bash
# Start all services (from project root)
docker-compose up -d

# Start specific service
docker-compose up postgres -d

# View logs
docker-compose logs -f
docker-compose logs -f backend

# Stop services
docker-compose down

# Rebuild after code changes
docker-compose up --build

# Reset database (WARNING: deletes data)
docker-compose down -v
docker-compose up postgres -d
```

### Database Operations

```bash
# Connect to PostgreSQL (local)
psql postgresql://lahacienda:password@localhost:5432/lahacienda

# Connect to PostgreSQL (Docker)
docker-compose exec postgres psql -U lahacienda -d lahacienda

# Backup database
pg_dump -U lahacienda lahacienda > backup.sql

# Restore database
psql -U lahacienda lahacienda < backup.sql
```

### Scripts

```bash
# Initialize database with sample data
cd backend
python scripts/init_db.py

# Import menu from CSV
python scripts/import_menu.py data/menu.csv

# Generate QR codes for tables
python scripts/generate_qr_codes.py
```

## Architecture

### Backend Architecture (Layered/Service-Oriented)

```
API Layer (FastAPI Routers in /api/v1/)
    ↓
Business Logic Layer (Services in /services/)
    ↓
Data Access Layer (SQLAlchemy ORM Models in /models/)
    ↓
Database (PostgreSQL - async via asyncpg)
```

**Key Directories:**
- `backend/app/models/` - SQLAlchemy ORM models (database schema)
- `backend/app/schemas/` - Pydantic validation schemas (request/response DTOs)
- `backend/app/services/` - Business logic layer (service classes)
- `backend/app/api/v1/` - API endpoints (routers)
- `backend/app/utils/` - Utilities (auth, calculations)

**Important Patterns:**
- **Fully async**: All database operations use `AsyncSession` and `await`
- **Dependency Injection**: FastAPI's `Depends()` for DB sessions and auth
- **Service Layer**: Business logic separated from API endpoints
- **JWT Authentication**: Protected admin endpoints with role-based access (admin/manager/staff)

### Frontend Architecture (React Context + useReducer)

**State Management:**
- `CartContext` (Context API + useReducer) - Primary cart state
- LocalStorage persistence for cart data
- No global state library (Redux/MobX) - kept minimal

**Key Directories:**
- `frontend/src/pages/` - Page components (15 pages: 6 customer + 9 admin)
- `frontend/src/components/` - Reusable components organized by feature (32+ components)
- `frontend/src/services/` - API integration (7 service modules with Axios)
- `frontend/src/types/` - TypeScript type definitions (6 modules)
- `frontend/src/context/` - React Context (CartContext)
- `frontend/src/hooks/` - Custom hooks (useMenuFilters)

**Routing:**
- Customer routes: `/`, `/checkout`, `/payment`, `/payment-success`, `/invoice`
- Admin routes: `/admin/*` (protected with JWT token validation)

### Database Schema (PostgreSQL)

**Core Tables:**
- `tables` - Restaurant tables with QR codes
- `categories`, `menu_items`, `item_modifiers` - Menu system
- `orders`, `order_items` - Order management
- `payment_splits` - Split payment tracking
- `admin_users` - Staff authentication
- `offers`, `specials` - Promotions system
- `settings`, `business_hours`, `holidays` - Configuration

**Critical Constraints:**
- All monetary values use `NUMERIC(10,2)` (never FLOAT)
- Order status: `cart` → `pending_payment` → `paid` → `preparing` → `completed`
- Payment status: `pending` → `processing` → `completed`/`failed`

## Key Implementation Notes

### Money Handling
- **Backend**: Always use `Decimal` type for money (from Python `decimal` module)
- **Database**: `NUMERIC(10,2)` columns for currency
- **Frontend**: Number type, format with `toFixed(2)`
- **CityPay API**: Expects amounts in pence/cents (multiply by 100)

### Authentication
- **Admin JWT**: Stored in `localStorage.adminToken`
- **Token expiration**: 8 hours (configurable in `backend/app/config.py`)
- **Protected endpoints**: Use `require_role()` decorator in `backend/app/utils/auth.py`
- **Customer sessions**: Use session tokens (not authentication, just tracking)

### API Versioning
- All endpoints prefixed with `/api/v1/`
- Admin endpoints: `/api/v1/admin/*`
- Customer endpoints: `/api/v1/menu`, `/api/v1/orders`, `/api/v1/payment`

### Environment Variables
**Backend** (`.env` in `backend/` directory):
- `DATABASE_URL` - PostgreSQL connection string (use `postgresql+asyncpg://`)
- `SECRET_KEY` - JWT signing key (generate with `secrets.token_urlsafe(64)`)
- `CITYPAY_MERCHANT_ID`, `CITYPAY_API_KEY` - Payment gateway credentials
- `GST_RATE` - Tax rate (default: 0.05 for 5%)
- `CORS_ORIGINS` - JSON array of allowed frontend URLs

**Frontend** (`.env` in `frontend/` directory):
- `VITE_API_URL` - Backend API URL (e.g., `http://localhost:8000/api/v1`)

### CSV Menu Import
Admin can bulk import menu items via CSV upload at `/admin/menu`:
- Required columns: `name`, `category`, `price`
- Optional columns: `description`, `dietary_tags`, `allergens`, `spice_level`, `calories`, `image_url`
- Dietary tags: `v` (vegetarian), `vg` (vegan), `gf` (gluten-free)
- Allergens: UK 14 major allergens (comma-separated)
- Download template from admin menu page

### Variant Pricing
Some menu items (e.g., wines) have size variants:
- `has_variants = true` in database
- Prices: `price_small_glass`, `price_large_glass`, `price_bottle`
- Frontend displays size selector in MenuItemModal
- OrderItem stores `variant` field (e.g., "large_glass")

### Payment Splitting
Two modes:
1. **Equal Split**: Divide total equally among N people, each gets email with payment link
2. **Split by Items**: Select specific items for each person, calculate individual amounts

Payment flow:
- Create order → Split payment → Send emails → Customer pays via link → Verify payment

### QR Code Flow
1. Generate QR code for table (stores in `backend/static/qrcodes/`)
2. QR contains URL: `{FRONTEND_URL}/?table={number}&token={session_token}`
3. Customer scans → Lands on menu with table pre-filled
4. Order tied to table via `table_id` and `session_token`

## Common Development Tasks

### Adding a New Menu Item (Manual)
1. Use admin interface at `/admin/menu` → "Add Item"
2. Or via API: `POST /api/v1/admin/menu/items`
3. Set category, price, dietary tags, allergens

### Adding a New API Endpoint
1. Create schema in `backend/app/schemas/*.py` (Pydantic)
2. Add business logic in `backend/app/services/*.py`
3. Create endpoint in `backend/app/api/v1/*.py` (router)
4. Register router in `backend/app/main.py` if new file
5. Test at `http://localhost:8000/docs` (Swagger UI)

### Adding a New Frontend Page
1. Create page component in `frontend/src/pages/*.tsx`
2. Add route in `frontend/src/App.tsx` (React Router)
3. Create API service method in `frontend/src/services/*.ts` if needed
4. Add TypeScript types in `frontend/src/types/*.ts` if needed

### Database Schema Changes
1. Modify model in `backend/app/models/*.py`
2. Generate migration: `alembic revision --autogenerate -m "description"`
3. Review migration in `backend/alembic/versions/*.py`
4. Apply: `alembic upgrade head`

### Running Single Test
```bash
# Backend
cd backend
pytest tests/test_menu.py::test_get_menu_items -v

# Frontend (when tests exist)
cd frontend
npm run test -- MenuItem.test.tsx
```

## Project-Specific Patterns

### Service Layer Pattern
Services handle business logic and database operations:
```python
# backend/app/services/order_service.py
class OrderService:
    @staticmethod
    async def create_order(db: AsyncSession, data: OrderCreate) -> Order:
        # Business logic here
        pass
```

Called from API endpoints:
```python
# backend/app/api/v1/orders.py
@router.post("/")
async def create_order(
    order_data: OrderCreate,
    db: AsyncSession = Depends(get_db)
):
    return await OrderService.create_order(db, order_data)
```

### Budget Builder Algorithm
Located in `backend/app/services/budget_builder.py`:
- 5 combination strategies: balanced, main-focused, light, value, premium
- Filters by dietary preferences and allergens
- Returns meal combinations within budget
- Suggests upgrades (swap items for additional cost)

### Admin Role-Based Access
Protect endpoints with role decorator:
```python
from app.utils.auth import require_role

@router.post("/items")
async def create_item(
    item: MenuItemCreate,
    current_user: AdminUser = Depends(require_role(["admin", "manager"]))
):
    # Only admin and manager can access
    pass
```

### Cart Context Usage
Frontend components access cart via:
```typescript
import { useCart } from '../context/CartContext'

function Component() {
  const { items, addItem, removeItem, updateQuantity, clearCart } = useCart()
  // Use cart methods
}
```

## Testing Notes

- Backend uses `pytest` with async support (`pytest-asyncio`)
- Tests use test database (configure in `conftest.py`)
- Frontend testing setup exists (Vitest) but tests not fully implemented
- Manual testing via Swagger UI: `http://localhost:8000/docs`

## Deployment Considerations

### Environment Variables (Critical!)

**Frontend (Digital Ocean App Platform):**
- `VITE_API_URL` - Must be set explicitly in Digital Ocean dashboard
  - Go to: Settings → Components → frontend → Environment Variables
  - Value: `https://your-app.ondigitalocean.app/api/v1`
  - Note: Vite env vars must be set at BUILD time, not runtime
  - After changing, trigger rebuild: Actions → Force Rebuild and Deploy

**Backend:**
- Set `DEBUG=False` in production `.env`
- Generate secure `SECRET_KEY` for production: `python3 -c "import secrets; print(secrets.token_urlsafe(64))"`
- Update `CORS_ORIGINS` to production domain: `["https://your-app.ondigitalocean.app"]`
- Use managed PostgreSQL (e.g., Digital Ocean, AWS RDS)
- Set up CityPay production credentials (not sandbox)
- Configure production email service (SendGrid recommended)

### Deployment Checklist

- [ ] Frontend `VITE_API_URL` set in Digital Ocean
- [ ] Backend `CORS_ORIGINS` includes frontend URL
- [ ] Backend `SECRET_KEY` is 64+ characters
- [ ] Database backups enabled
- [ ] SSL/HTTPS configured (usually automatic on Digital Ocean)
- [ ] API documentation accessible at `/api/v1/docs`
- [ ] Test menu loading in production
- [ ] Test cart functionality
- [ ] Test admin login
- [ ] Monitor logs for errors

### Common Deployment Issues

**Issue: Frontend can't connect to backend (CORS errors)**
- Solution: Add frontend URL to backend `CORS_ORIGINS` environment variable

**Issue: Environment variables not loading**
- Solution: Vite variables must be set in Digital Ocean dashboard AND start with `VITE_`
- Trigger rebuild after changing variables

**Issue: 404 on API calls**
- Solution: Check `VITE_API_URL` matches backend deployment URL
- Verify backend is running: visit `/api/v1/docs`

**Issue: Database connection fails**
- Solution: Check `DATABASE_URL` format: `postgresql+asyncpg://user:pass@host:port/db`
- For Digital Ocean managed DB, use connection string from database dashboard

See `DEPLOYMENT_FIXES.md` for detailed troubleshooting steps.

## File Paths Reference

**Backend:**
- Main app: `backend/app/main.py`
- Config: `backend/app/config.py`
- Database setup: `backend/app/database.py`
- Models: `backend/app/models/*.py`
- Services: `backend/app/services/*.py`
- API routes: `backend/app/api/v1/*.py`

**Frontend:**
- Entry: `frontend/src/main.tsx`
- App router: `frontend/src/App.tsx`
- Cart state: `frontend/src/context/CartContext.tsx`
- API services: `frontend/src/services/*.ts`

**Configuration:**
- Docker: `docker-compose.yml`
- Backend env: `backend/.env` (copy from `.env.example`)
- Frontend env: `frontend/.env` (copy from `.env.example`)

## Populating the Database

If the menu API returns empty `[]`, you need to seed the database with menu data.

**Quick fix:**
1. Run SQL script: `POPULATE_DATABASE.md` (contains 5 categories + 30 menu items)
2. Or use admin CSV upload: Upload `backend/data/menu_items.csv` via admin interface
3. Or run Python script: `python backend/scripts/seed_menu.py`

**Files:**
- `POPULATE_DATABASE.md` - SQL script with all menu data
- `HOW_TO_POPULATE_DATABASE.md` - Step-by-step guide
- `QUICK_FIX_EMPTY_MENU.md` - Quick reference
- `backend/data/menu_items.csv` - CSV file with 30 menu items
- `backend/scripts/seed_menu.py` - Python seed script

**Verify:**
```bash
# Should return menu items
curl https://your-domain.com/api/v1/menu/
```

## Additional Documentation

- `README.md` - Project overview and setup instructions
- `GETTING_STARTED.md` - Beginner's guide to the project
- `PROJECT_STRUCTURE.md` - Complete file tree with status
- `IMPLEMENTATION_GUIDE.md` - Step-by-step build instructions
- `API_URL_FIX_SUMMARY.md` - Fix for localhost URL issues
- `DEPLOYMENT_FIXES.md` - Deployment troubleshooting
- API documentation: `http://localhost:8000/docs` (when backend is running)
