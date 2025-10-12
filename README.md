# La Hacienda Restaurant QR Code Ordering System

A complete table-side ordering web application with QR code access, digital menu, cart management, bill splitting, CityPay payment integration, and email receipts.

## Project Status

### ✅ Completed Components

1. **Project Structure** - Complete directory structure created
2. **Backend Foundation**
   - FastAPI configuration (`backend/app/config.py`)
   - Database setup with SQLAlchemy async (`backend/app/database.py`)
   - Complete database models:
     - `Table` model with QR code support
     - `Category`, `MenuItem`, `ItemModifier` for menu
     - `Order`, `OrderItem` for order management
     - `PaymentSplit` for split payments
     - `AdminUser` for staff management
   - Utility functions for calculations (`backend/app/utils/calculations.py`)
3. **Configuration Files**
   - `requirements.txt` with all Python dependencies
   - `.env.example` for environment configuration
   - `.gitignore` for version control

### 🚧 Components To Implement

#### Backend (Priority Order)

1. **Pydantic Schemas** (`backend/app/schemas/`)
   - Create validation schemas for all models
   - Reference the specification document for complete schema definitions

2. **Services** (`backend/app/services/`)
   - `order_service.py` - Order creation and calculation logic
   - `payment_service.py` - CityPay integration
   - `qr_service.py` - QR code generation
   - `email_service.py` - Email with FastAPI-Mail

3. **API Endpoints** (`backend/app/api/v1/`)
   - `menu.py` - GET endpoints for menu data
   - `orders.py` - Order CRUD operations
   - `payment.py` - Payment split and verification
   - `tables.py` - Table management
   - `admin.py` - Admin dashboard

4. **Main Application** (`backend/app/main.py`)
   - FastAPI app initialization
   - CORS middleware configuration
   - Router registration
   - Startup/shutdown events

5. **Database Migrations** (`backend/alembic/`)
   - Initialize Alembic
   - Create initial migration
   - Generate migration script

6. **Email Templates** (`backend/app/templates/email/`)
   - `payment_link.html` - Payment request email
   - `receipt.html` - Order receipt email

7. **Scripts** (`backend/scripts/`)
   - `init_db.py` - Database initialization
   - `import_menu.py` - Import La Hacienda menu data
   - `generate_qr_codes.py` - Generate QR codes for tables

#### Frontend (Priority Order)

1. **Project Setup**
   - Initialize React + TypeScript + Vite project
   - Install dependencies (React Router, Tailwind CSS, Axios, etc.)
   - Configure Tailwind CSS and PostCSS

2. **Type Definitions** (`frontend/src/types/`)
   - `menu.ts` - Menu item, category, modifier types
   - `order.ts` - Order and order item types
   - `payment.ts` - Payment split types

3. **Services** (`frontend/src/services/`)
   - `api.ts` - Axios instance with base configuration
   - `menuService.ts` - Menu API calls
   - `orderService.ts` - Order API calls
   - `paymentService.ts` - Payment API calls

4. **Context & State** (`frontend/src/context/`)
   - `CartContext.tsx` - Shopping cart state management
   - `OrderContext.tsx` - Order state
   - `AuthContext.tsx` - Admin authentication (optional for v1)

5. **Core Components** (`frontend/src/components/`)
   - Layout: Header, Footer, LoadingSpinner
   - Menu: MenuCategory, MenuItem, MenuItemModal, DietaryBadge
   - Cart: CartDrawer, CartItem, CartSummary
   - Payment: PaymentOptions, SplitEqualForm, SplitByItemsForm, TipSelector
   - Common: Button, Input, Modal

6. **Pages** (`frontend/src/pages/`)
   - `MenuPage.tsx` - Main customer-facing menu
   - `CheckoutPage.tsx` - Review order and select payment
   - `PaymentSuccessPage.tsx` - Success confirmation
   - `PaymentFailurePage.tsx` - Failure handling

7. **Main App** (`frontend/src/`)
   - `main.tsx` - React entry point
   - `App.tsx` - Router and context providers
   - `index.css` - Tailwind directives

#### DevOps

1. **Docker Setup**
   - `docker-compose.yml` - PostgreSQL, backend, frontend services
   - `backend/Dockerfile` - Python container
   - `frontend/Dockerfile` - Node container

2. **Testing**
   - Backend: pytest configuration and test files
   - Frontend: Vitest configuration and test files

## Quick Start Guide

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 15+
- Git

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file and configure
cp .env.example .env
# Edit .env with your database credentials and API keys

# Initialize database (once migrations are created)
alembic upgrade head

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies (once package.json is created)
npm install

# Copy environment file
cp .env.example .env

# Run development server
npm run dev
```

### Using Docker

```bash
# From project root (once docker-compose.yml is created)
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Architecture

### Technology Stack

**Backend:**
- FastAPI (Python web framework)
- PostgreSQL (Database)
- SQLAlchemy 2.0 (ORM with async support)
- Alembic (Migrations)
- Pydantic v2 (Validation)
- CityPay API (Payment processing)
- FastAPI-Mail (Email service)

**Frontend:**
- React 18 with TypeScript
- Vite (Build tool)
- Tailwind CSS (Styling)
- React Router v6 (Routing)
- Axios (HTTP client)
- React Context API (State management)
- Lucide React (Icons)

### Database Schema

See the specification document for the complete SQL schema with:
- Tables for restaurant tables with QR codes
- Categories and menu items with modifiers
- Orders and order items
- Payment splits with CityPay integration
- Admin users for staff

### Key Features

1. **QR Code Access** - Each table has unique QR code with embedded table number
2. **Digital Menu** - Browse categories: Small Plates, Mains, Desserts, Hot Drinks
3. **Cart Management** - Add items with quantities and modifiers
4. **5% GST** - Automatic tax calculation
5. **Flexible Tipping** - 10%, 15%, 20%, or custom tip
6. **Bill Splitting** - Equal split or split by selected items
7. **CityPay Integration** - Secure payment processing
8. **Email Receipts** - Automatic receipt generation
9. **Order Tracking** - Real-time order status updates

## API Endpoints

### Menu
- `GET /api/v1/menu` - Get complete menu with categories
- `GET /api/v1/categories` - Get all categories
- `GET /api/v1/categories/{id}/items` - Get items by category

### Orders
- `POST /api/v1/orders` - Create new order
- `GET /api/v1/orders/{id}` - Get order details
- `PATCH /api/v1/orders/{id}/status` - Update order status
- `POST /api/v1/orders/{id}/calculate` - Calculate totals with tip

### Payment
- `POST /api/v1/payment/split-equal/{order_id}` - Split equally
- `POST /api/v1/payment/split-by-items/{order_id}` - Split by items
- `POST /api/v1/payment/verify/{split_token}` - Verify payment

### Tables
- `GET /api/v1/tables` - List all tables
- `GET /api/v1/tables/{table_number}` - Get table by number
- `POST /api/v1/tables` - Create new table (admin)

## Environment Variables

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql+asyncpg://user:pass@localhost:5432/lahacienda

# Security
SECRET_KEY=your-secret-key-min-32-chars
ALGORITHM=HS256

# CityPay
CITYPAY_MERCHANT_ID=your_merchant_id
CITYPAY_API_KEY=your_api_key
CITYPAY_BASE_URL=https://api.citypay.com/v6

# Email
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=noreply@lahacienda.com
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587

# Business
GST_RATE=0.05
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)

```bash
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=La Hacienda
```

## Menu Data

The menu should be imported from the La Hacienda PDF with:
- **Small Plates & Sides**: Appetizers, sides, salads
- **Mains**: Tacos, burritos, enchiladas, etc.
- **Desserts**: Churros, flan, etc.
- **Hot Drinks**: Coffee, hot chocolate, etc.

Each item includes:
- Name and description
- Price in USD
- Dietary tags (v=vegetarian, vg=vegan)
- Optional modifiers (extra toppings, spice levels, etc.)

## Development Workflow

1. **Start Backend**:
   ```bash
   cd backend && uvicorn app.main:app --reload
   ```

2. **Start Frontend**:
   ```bash
   cd frontend && npm run dev
   ```

3. **Access Application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

4. **Test QR Code Flow**:
   - Generate QR code for a table
   - Scan QR code (or visit URL manually)
   - Browse menu and add items to cart
   - Proceed to checkout
   - Split payment
   - Complete payment via CityPay
   - Receive email receipt

## Testing

### Backend Tests
```bash
cd backend
pytest tests/ -v --cov=app
```

### Frontend Tests
```bash
cd frontend
npm run test
```

## Deployment

See `DEPLOYMENT.md` (to be created) for:
- Production environment setup
- Database migrations
- Environment configuration
- SSL/TLS setup
- CityPay webhook configuration
- Email service setup
- Monitoring and logging

## Security Considerations

- All monetary calculations use `Decimal` type
- Input validation with Pydantic
- SQL injection protection via SQLAlchemy
- CORS configured for allowed origins
- Rate limiting on API endpoints
- Secure session tokens
- Payment data never stored in plain text
- HTTPS required in production

## Next Steps

1. **Complete Backend Implementation**:
   - Implement all Pydantic schemas
   - Build service layer (Order, Payment, QR, Email)
   - Create API endpoints
   - Write main FastAPI app
   - Set up Alembic migrations

2. **Complete Frontend Implementation**:
   - Initialize React + Vite project
   - Build type definitions
   - Implement API services
   - Create Context providers
   - Build all components and pages

3. **Integration**:
   - Connect frontend to backend API
   - Test complete user flow
   - Implement error handling
   - Add loading states

4. **Testing**:
   - Write unit tests for services
   - Write integration tests for API
   - Write component tests for React
   - Perform end-to-end testing

5. **Deployment**:
   - Set up Docker containers
   - Configure production database
   - Deploy to cloud provider
   - Set up monitoring

## Support

For issues or questions:
- Check the specification document for detailed requirements
- Review API documentation at `/docs` endpoint
- Check logs for error messages

## License

Proprietary - La Hacienda Mexican Restaurant

---

**Built with FastAPI, React, and PostgreSQL**
