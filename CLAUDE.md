# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

La Hacienda Restaurant QR Code Ordering System - A complete table-side ordering web application with QR code access, digital menu, cart management, bill splitting, CityPay payment integration, and comprehensive admin dashboard.

**Tech Stack:**
- Backend: FastAPI + PostgreSQL + SQLAlchemy (async)
- Frontend: React + TypeScript + Vite + Tailwind CSS
- Payment: CityPay API
- Infrastructure: Docker Compose

## Essential Commands

### Backend Development

```bash
# From /backend directory with virtual environment activated

# Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Or using Python directly
python app/main.py

# Run tests
pytest tests/ -v --cov=app

# Code formatting
black app/
ruff app/

# Database operations
python scripts/init_db.py                # Initialize database
python scripts/create_admin.py           # Create admin user (username: admin, password: admin123)
python scripts/seed_menu.py              # Seed menu data
python scripts/generate_qr_codes.py      # Generate QR codes for tables

# Alembic migrations (when needed)
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Frontend Development

```bash
# From /frontend directory

# Start development server
npm run dev              # Runs on http://localhost:5173

# Build for production
npm run build            # TypeScript compile + Vite build

# Preview production build
npm run preview

# Lint TypeScript files
npm run lint
```

### Docker Development

```bash
# From project root

# Start all services (database, backend, frontend)
docker-compose up

# Start only database
docker-compose up -d postgres

# View logs
docker-compose logs -f backend
docker-compose logs -f postgres

# Access PostgreSQL CLI
docker-compose exec postgres psql -U lahacienda -d lahacienda

# Stop all services
docker-compose down
```

## Architecture Overview

### Backend Architecture (FastAPI)

The backend follows a **layered architecture**:

1. **API Layer** (`app/api/v1/`) - FastAPI endpoints organized by domain:
   - `menu.py` - Public menu browsing
   - `orders.py` - Customer order management
   - `payment.py` - Payment processing and splitting
   - `tables.py` - Table and QR code management
   - `admin*.py` - Admin dashboard endpoints (orders, menu, reports, settings, auth)
   - `customer_promotions.py` - Customer-facing promotions and offers

2. **Service Layer** (`app/services/`) - Business logic isolation:
   - `order_service.py` - Order creation, calculation, status management
   - `payment_service.py` - Payment splitting (equal/by-items), CityPay integration
   - `citypay_service.py` - Direct CityPay API communication
   - `email_service.py` - Email sending with Jinja2 templates
   - `qr_service.py` - QR code generation for tables
   - `menu_service.py` - Menu operations and filtering
   - `admin_service.py` - Admin dashboard data aggregation
   - `admin_order_service.py` - Admin order management
   - `report_service.py` - Analytics and reporting
   - `settings_service.py` - Restaurant settings management
   - `invoice_service.py` - PDF invoice generation
   - `offer_service.py` - Promotions and special offers
   - `special_service.py` - Daily specials management
   - `budget_builder.py` - Budget planning tool

3. **Models** (`app/models/`) - SQLAlchemy ORM with async support:
   - All models use `DeclarativeBase`
   - Monetary values use `DECIMAL(10, 2)` (never float)
   - All timestamps use `DateTime(timezone=True)`
   - Foreign keys enforce referential integrity

4. **Schemas** (`app/schemas/`) - Pydantic v2 for validation:
   - Separate schemas for Create, Update, and Response
   - Configured with `ConfigDict(from_attributes=True)` for ORM compatibility

5. **Dependencies** (`app/api/deps.py`) - Shared dependency injection:
   - `get_db()` - Database session management (auto-commit/rollback)
   - Authentication dependencies for admin routes

### Frontend Architecture (React)

The frontend uses **React Context API** for state management:

1. **Context** (`src/context/`):
   - `CartContext.tsx` - Global cart state with localStorage persistence
     - Manages cart items, quantities, modifiers
     - Persists across page reloads
     - Provides cart operations: add, remove, update, clear

2. **Services** (`src/services/`):
   - `api.ts` - Axios instance with base configuration
   - `*Service.ts` - API call wrappers for each domain
   - All services use TypeScript types from `src/types/`

3. **Component Organization**:
   - `components/layout/` - Header, LoadingSpinner, MexicanBackground
   - `components/menu/` - Menu display, filters, items, modals, dietary badges, allergen info
   - `components/cart/` - Cart drawer, items, summary
   - `components/payment/` - Payment options, tip selector, split forms
   - `components/promotions/` - Offers carousel, daily specials, active banners
   - `components/budget/` - Budget builder modal
   - `components/admin/` - Protected routes, admin components
   - `components/common/` - Reusable Button, Input, Modal components

4. **Pages** (`src/pages/`):
   - Customer flow: `MenuPage` → `CheckoutPage` → `PaymentFormPage` → `PaymentSuccessPage`
   - Admin pages: `AdminLogin`, `AdminDashboard`, `AdminOrdersPage`, `AdminMenuPage`, `AdminReportsPage`, `AdminOffersPage`, `AdminSpecialsPage`, `AdminSettingsPage`
   - `InvoicePage.tsx` - PDF invoice display

### Database Schema Key Points

**Critical Relationships:**
- `Order.table_id` → `Table.id` (which table placed the order)
- `Order.order_items` → `OrderItem[]` (one-to-many)
- `OrderItem.modifiers` - JSON field storing selected modifiers with prices
- `Order.payment_splits` → `PaymentSplit[]` (supports multiple payment splits)
- `MenuItem.category_id` → `Category.id`

**Money Handling:**
- All prices/amounts use `Decimal` type in Python (from `decimal` module)
- Database stores as `NUMERIC(10, 2)` / `DECIMAL(10, 2)`
- **NEVER use float for money** - causes rounding errors
- GST calculation: `subtotal * Decimal(settings.GST_RATE)`
- All calculations in `app/utils/calculations.py` use `Decimal`

**Order Status Flow:**
```
pending → confirmed → preparing → ready → completed
                   ↘ cancelled
```

**Payment Split Types:**
- `single` - One person pays entire bill
- `equal` - Split equally among N people
- `by_items` - Each person pays for specific items

### Key Architectural Patterns

#### 1. Async/Await Throughout
All database operations use async/await:
```python
async with AsyncSessionLocal() as session:
    result = await session.execute(select(MenuItem))
    items = result.scalars().all()
```

#### 2. Dependency Injection
FastAPI dependencies provide database sessions and authentication:
```python
@router.get("/orders")
async def get_orders(db: AsyncSession = Depends(get_db)):
    # db session auto-managed (commit/rollback/close)
```

#### 3. Service Layer Pattern
Controllers delegate to services for business logic:
```python
# In API endpoint
order = await order_service.create_order(db, order_data)

# Service handles all business logic
async def create_order(db, data):
    # Validate, calculate totals, save, send emails
```

#### 4. Repository Pattern (Implicit)
Services encapsulate data access, keeping SQLAlchemy queries out of API layer.

#### 5. React Context for Global State
Cart state managed globally but only re-renders subscribed components.

### Payment Flow Architecture

The payment system supports three flows:

**1. Single Payment:**
```
Order → Create PaymentSplit (amount = total) → Send payment link email → CityPay redirect → Verify payment → Update status
```

**2. Equal Split:**
```
Order → Calculate split (total / num_people) → Create PaymentSplit per person → Send emails → Process payments → Verify all paid
```

**3. Split by Items:**
```
Order → User selects items per person → Calculate individual totals → Create PaymentSplit per person → Send emails → Process payments
```

**Key Files:**
- `backend/app/services/payment_service.py` - Payment logic
- `backend/app/services/citypay_service.py` - CityPay API integration
- `backend/app/api/v1/payment.py` - Payment endpoints
- `frontend/src/components/payment/` - Payment UI components

**Important:** Payment tokens are single-use and expire. Store in `payment_splits.token` and verify before processing.

### Admin Dashboard Features

The admin system includes:

1. **Dashboard** - Real-time metrics (today's revenue, orders, popular items)
2. **Orders Management** - View, filter, update status, mark as paid
3. **Menu Management** - CRUD operations for categories, items, modifiers, with CSV upload
4. **Reports** - Sales analytics, revenue trends, top items (with charts using Recharts)
5. **Settings** - Restaurant info, business hours, GST rate, tip presets
6. **Offers & Specials** - Manage promotions, discounts, daily specials
7. **Budget Builder** - Customer budget planning tool

**Authentication:**
- JWT-based with `python-jose`
- Tokens stored in localStorage
- Protected routes use `ProtectedRoute` component
- Default credentials: admin/admin123 (CHANGE IN PRODUCTION)

### Environment Configuration

**Critical Environment Variables:**

Backend (`backend/.env`):
- `DATABASE_URL` - PostgreSQL connection string (MUST use `postgresql+asyncpg://` for async)
- `SECRET_KEY` - JWT signing key (generate with `secrets.token_urlsafe(64)`)
- `CITYPAY_MERCHANT_ID`, `CITYPAY_API_KEY` - Payment gateway credentials
- `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_SERVER` - Email service config
- `GST_RATE` - Tax rate (default: 0.05 for 5%)
- `FRONTEND_URL` - For CORS and email links

Frontend (`frontend/.env`):
- `VITE_API_URL` - Backend API base URL (e.g., `http://localhost:8000/api/v1`)
- `VITE_APP_NAME` - Application name

**Docker Note:** When using Docker Compose, database host is `postgres` (service name), not `localhost`.

### QR Code System

**Generation:**
- Run `python scripts/generate_qr_codes.py` to create QR codes for all tables
- QR codes stored in `/backend/static/qrcodes/`
- Each QR contains: `{FRONTEND_URL}/?table={table_number}&session={token}`

**Session Tokens:**
- Generated per scan using `generate_session_token()` in `calculations.py`
- Used to track orders from same table session
- Prevents cross-table order confusion

### Special Considerations

**1. Decimal Precision:**
Always use `Decimal` for money:
```python
from decimal import Decimal
subtotal = Decimal('10.50')
gst = subtotal * Decimal('0.05')  # NOT 0.05 as float
```

**2. Async Session Management:**
Never share sessions across requests. Always use `Depends(get_db)` or async context manager.

**3. CORS Configuration:**
Update `app/main.py` CORS origins for production domains.

**4. Email Templates:**
Located in `backend/app/templates/email/`. Use Jinja2 syntax. Test emails in development with console output.

**5. Admin Password Security:**
Always change default admin credentials after first login. Use `scripts/reset_admin_password.py` to reset.

**6. Database Migrations:**
In production, always use Alembic migrations. The `Base.metadata.create_all()` in `main.py` is development-only.

**7. CSV Upload Format:**
Admin menu CSV must have columns: `name,description,price,category,dietary_info,image_url,calories,allergens`

**8. Static Files:**
QR codes and other static files served from `/static` via FastAPI's `StaticFiles`.

### Testing Strategy

**Backend Testing:**
- Use `pytest-asyncio` for async tests
- Test database operations with test database (not production)
- Mock CityPay API calls in tests
- Coverage target: 80%+ for services

**Frontend Testing:**
- Component tests for complex logic (cart operations, calculations)
- Integration tests for payment flows
- Manual QR code scanning tests on mobile devices

### Common Development Tasks

**Add New Menu Item (via Admin):**
1. Login to admin dashboard
2. Navigate to Menu Management
3. Click "Add Item" or upload CSV
4. Set category, price, dietary info, allergens

**Change Order Status:**
Use admin dashboard Orders page or API: `PATCH /api/v1/admin/orders/{id}/status`

**Generate New QR Codes:**
```bash
cd backend
python scripts/generate_qr_codes.py
```

**Reset Admin Password:**
```bash
cd backend
python scripts/reset_admin_password.py
# Follow prompts
```

**Add New Admin Endpoint:**
1. Define route in `app/api/v1/admin*.py`
2. Add service method in `app/services/admin_service.py`
3. Add Pydantic schemas in `app/schemas/admin.py`
4. Update frontend `src/services/adminApi.ts`
5. Add types in `src/types/admin.ts`

### Deployment Considerations

1. **Database:** Use managed PostgreSQL (Digital Ocean, AWS RDS, etc.)
2. **Backend:** Deploy with Gunicorn + Uvicorn workers
3. **Frontend:** Build and serve from CDN (Vercel, Netlify) or nginx
4. **Environment:** Set all production environment variables
5. **Security:**
   - Enable HTTPS (required for CityPay)
   - Update CORS origins
   - Use strong SECRET_KEY
   - Change default admin password
6. **Email:** Use production SMTP service (SendGrid, Mailgun)
7. **Static Files:** Consider CDN for QR codes and images

### Key Utility Functions

Located in `backend/app/utils/calculations.py`:
- `calculate_gst(subtotal: Decimal) -> Decimal`
- `calculate_order_total(subtotal: Decimal, tip: Decimal = Decimal('0')) -> dict`
- `generate_order_number() -> str` - Format: ORD-{timestamp}-{random}
- `generate_session_token() -> str` - Secure random token
- `split_amount_equally(total: Decimal, num_people: int) -> List[Decimal]`

### Important URLs (Development)

- Backend API: http://localhost:8000
- API Docs (Swagger): http://localhost:8000/docs
- API Docs (ReDoc): http://localhost:8000/redoc
- Frontend: http://localhost:5173
- Customer URL: http://localhost:5173/?table=1&session=test-123
- Admin Login: http://localhost:5173/admin/login

### Known Patterns to Follow

**When adding new models:**
1. Define in `app/models/` with proper types (Decimal for money, DateTime with timezone)
2. Create Pydantic schemas in `app/schemas/`
3. Add to imports in `app/models/__init__.py`

**When adding new API endpoints:**
1. Define in appropriate `app/api/v1/*.py` file
2. Create service method in corresponding `app/services/*.py`
3. Add proper error handling and validation
4. Document in docstring (appears in Swagger UI)

**When modifying payment logic:**
1. Always use Decimal for calculations
2. Update both single and split payment flows
3. Test email sending
4. Verify CityPay integration

**When changing database schema:**
1. Modify model in `app/models/`
2. Create Alembic migration: `alembic revision --autogenerate -m "description"`
3. Review generated migration
4. Apply: `alembic upgrade head`

### Frontend Routing Structure

```
/ (or /?table=X&session=Y)      → MenuPage (customer menu)
/checkout                        → CheckoutPage
/payment/:orderId                → PaymentFormPage
/payment/success/:orderId        → PaymentSuccessPage
/payment/failure/:orderId        → PaymentFailurePage
/invoice/:orderId                → InvoicePage
/admin/login                     → AdminLogin
/admin/dashboard                 → AdminDashboard (protected)
/admin/orders                    → AdminOrdersPage (protected)
/admin/menu                      → AdminMenuPage (protected)
/admin/reports                   → AdminReportsPage (protected)
/admin/offers                    → AdminOffersPage (protected)
/admin/specials                  → AdminSpecialsPage (protected)
/admin/settings                  → AdminSettingsPage (protected)
```

All `/admin/*` routes (except login) are protected by JWT authentication.
