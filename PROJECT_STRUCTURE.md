# Project Structure - La Hacienda Ordering System

Complete file tree with descriptions for the restaurant QR code ordering system.

## Directory Tree

```
la-hacienda-ordering/
├── README.md                          ✅ Complete system overview
├── IMPLEMENTATION_GUIDE.md            ✅ Step-by-step build instructions
├── PROJECT_STRUCTURE.md               ✅ This file
├── .gitignore                         ✅ Git exclusions
├── docker-compose.yml                 ✅ Docker orchestration
│
├── backend/                           🔧 FastAPI Backend
│   ├── Dockerfile                     ✅ Backend container
│   ├── requirements.txt               ✅ Python dependencies
│   ├── .env.example                   ✅ Environment template
│   ├── .env                           ⚠️ Create from .env.example
│   ├── alembic.ini                    ⏳ Create with: alembic init
│   │
│   ├── alembic/                       ⏳ Database migrations
│   │   ├── env.py                     ⏳ Alembic environment
│   │   └── versions/                  ⏳ Migration files
│   │
│   ├── app/
│   │   ├── __init__.py                ✅ Package init
│   │   ├── main.py                    ⏳ FastAPI app entry (CRITICAL)
│   │   ├── config.py                  ✅ Settings & configuration
│   │   ├── database.py                ✅ DB connection & session
│   │   │
│   │   ├── models/                    ✅ SQLAlchemy Models
│   │   │   ├── __init__.py            ✅ Model exports
│   │   │   ├── table.py               ✅ Table with QR codes
│   │   │   ├── menu.py                ✅ Category, MenuItem, ItemModifier
│   │   │   ├── order.py               ✅ Order, OrderItem
│   │   │   ├── payment.py             ✅ PaymentSplit
│   │   │   └── admin.py               ✅ AdminUser
│   │   │
│   │   ├── schemas/                   ⏳ Pydantic Schemas (NEXT STEP)
│   │   │   ├── __init__.py            ⏳ Schema exports
│   │   │   ├── table.py               ⏳ Table validation schemas
│   │   │   ├── menu.py                ⏳ Menu validation schemas
│   │   │   ├── order.py               ⏳ Order validation schemas
│   │   │   └── payment.py             ⏳ Payment validation schemas
│   │   │
│   │   ├── api/                       ⏳ API Endpoints
│   │   │   ├── __init__.py            ⏳ API package init
│   │   │   ├── deps.py                ⏳ Shared dependencies
│   │   │   └── v1/                    ⏳ API version 1
│   │   │       ├── __init__.py        ⏳ Router aggregation
│   │   │       ├── menu.py            ⏳ Menu endpoints
│   │   │       ├── tables.py          ⏳ Table endpoints
│   │   │       ├── orders.py          ⏳ Order endpoints
│   │   │       ├── payment.py         ⏳ Payment endpoints
│   │   │       └── admin.py           ⏳ Admin endpoints
│   │   │
│   │   ├── services/                  ⏳ Business Logic
│   │   │   ├── __init__.py            ⏳ Service exports
│   │   │   ├── qr_service.py          ⏳ QR code generation
│   │   │   ├── order_service.py       ⏳ Order calculations
│   │   │   ├── payment_service.py     ⏳ CityPay integration
│   │   │   └── email_service.py       ⏳ Email with templates
│   │   │
│   │   ├── utils/                     ✅ Utility Functions
│   │   │   ├── __init__.py            ✅ Utils init
│   │   │   ├── calculations.py        ✅ Tax, tip, totals
│   │   │   └── validators.py          ⏳ Custom validators
│   │   │
│   │   └── templates/                 ⏳ Email Templates
│   │       └── email/
│   │           ├── payment_link.html  ⏳ Payment request email
│   │           └── receipt.html       ⏳ Order receipt email
│   │
│   ├── static/                        ⏳ Static files
│   │   └── qrcodes/                   ⏳ Generated QR codes
│   │
│   ├── tests/                         ⏳ Backend Tests
│   │   ├── __init__.py                ⏳ Test package
│   │   ├── conftest.py                ⏳ Pytest configuration
│   │   ├── test_menu.py               ⏳ Menu endpoint tests
│   │   ├── test_orders.py             ⏳ Order tests
│   │   └── test_payment.py            ⏳ Payment tests
│   │
│   └── scripts/                       ⏳ Utility Scripts
│       ├── init_db.py                 ⏳ Database initialization
│       ├── import_menu.py             ⏳ Import menu from PDF
│       └── generate_qr_codes.py       ⏳ Generate QR codes
│
└── frontend/                          ⏳ React Frontend
    ├── Dockerfile                     ⏳ Frontend container
    ├── package.json                   ⏳ Node dependencies
    ├── tsconfig.json                  ⏳ TypeScript config
    ├── vite.config.ts                 ⏳ Vite config
    ├── tailwind.config.js             ⏳ Tailwind config
    ├── postcss.config.js              ⏳ PostCSS config
    ├── .env.example                   ⏳ Frontend env template
    ├── .env                           ⏳ Frontend environment
    ├── index.html                     ⏳ HTML entry
    │
    ├── public/                        ⏳ Public Assets
    │   ├── icons/                     ⏳ App icons
    │   └── manifest.json              ⏳ PWA manifest
    │
    └── src/
        ├── main.tsx                   ⏳ React entry point
        ├── App.tsx                    ⏳ Main app with router
        ├── index.css                  ⏳ Tailwind imports
        ├── vite-env.d.ts              ⏳ Vite types
        │
        ├── assets/                    ⏳ Images & Icons
        │   └── logo.svg               ⏳ Restaurant logo
        │
        ├── components/                ⏳ React Components
        │   ├── layout/
        │   │   ├── Header.tsx         ⏳ Top navigation
        │   │   ├── Footer.tsx         ⏳ Footer
        │   │   └── LoadingSpinner.tsx ⏳ Loading state
        │   │
        │   ├── menu/
        │   │   ├── MenuCategory.tsx   ⏳ Category display
        │   │   ├── MenuItem.tsx       ⏳ Item card
        │   │   ├── MenuItemModal.tsx  ⏳ Item details modal
        │   │   └── DietaryBadge.tsx   ⏳ Dietary indicator
        │   │
        │   ├── cart/
        │   │   ├── CartDrawer.tsx     ⏳ Slide-out cart
        │   │   ├── CartItem.tsx       ⏳ Cart line item
        │   │   └── CartSummary.tsx    ⏳ Cart totals
        │   │
        │   ├── payment/
        │   │   ├── PaymentOptions.tsx ⏳ Payment choice
        │   │   ├── SplitEqualForm.tsx ⏳ Equal split form
        │   │   ├── SplitByItemsForm.tsx ⏳ Item split form
        │   │   ├── TipSelector.tsx    ⏳ Tip selection
        │   │   └── CityPayCheckout.tsx ⏳ Payment UI
        │   │
        │   └── common/
        │       ├── Button.tsx         ⏳ Reusable button
        │       ├── Input.tsx          ⏳ Form input
        │       └── Modal.tsx          ⏳ Modal dialog
        │
        ├── pages/                     ⏳ Page Components
        │   ├── MenuPage.tsx           ⏳ Main menu page
        │   ├── CheckoutPage.tsx       ⏳ Checkout & payment
        │   ├── PaymentSuccessPage.tsx ⏳ Success confirmation
        │   ├── PaymentFailurePage.tsx ⏳ Failure handling
        │   └── admin/
        │       ├── Dashboard.tsx      ⏳ Admin dashboard
        │       ├── MenuManagement.tsx ⏳ Menu editor
        │       └── TableManagement.tsx ⏳ Table manager
        │
        ├── context/                   ⏳ React Context
        │   ├── CartContext.tsx        ⏳ Cart state (CRITICAL)
        │   ├── OrderContext.tsx       ⏳ Order state
        │   └── AuthContext.tsx        ⏳ Admin auth
        │
        ├── hooks/                     ⏳ Custom Hooks
        │   ├── useCart.ts             ⏳ Cart hook
        │   ├── useMenu.ts             ⏳ Menu hook
        │   └── usePayment.ts          ⏳ Payment hook
        │
        ├── services/                  ⏳ API Services
        │   ├── api.ts                 ⏳ Axios instance
        │   ├── menuService.ts         ⏳ Menu API
        │   ├── orderService.ts        ⏳ Order API
        │   └── paymentService.ts      ⏳ Payment API
        │
        ├── types/                     ⏳ TypeScript Types
        │   ├── menu.ts                ⏳ Menu interfaces
        │   ├── order.ts               ⏳ Order interfaces
        │   └── payment.ts             ⏳ Payment interfaces
        │
        └── utils/                     ⏳ Frontend Utils
            ├── calculations.ts        ⏳ Price calculations
            ├── formatters.ts          ⏳ Format currency, dates
            └── validators.ts          ⏳ Form validation
```

## Legend

- ✅ **Complete** - File created and ready
- ⏳ **To Do** - Needs implementation
- ⚠️ **Action Required** - Needs configuration
- 🔧 **In Progress** - Partially complete

## Critical Path

The minimum viable product requires these files in order:

### Backend Critical Path (Must Complete First)

1. ✅ `backend/app/config.py` - DONE
2. ✅ `backend/app/database.py` - DONE
3. ✅ `backend/app/models/*` - DONE (all models)
4. ✅ `backend/app/utils/calculations.py` - DONE
5. ⏳ `backend/app/schemas/*` - NEXT: All Pydantic schemas
6. ⏳ `backend/app/services/order_service.py` - Order logic
7. ⏳ `backend/app/services/payment_service.py` - CityPay
8. ⏳ `backend/app/api/v1/*` - All endpoints
9. ⏳ `backend/app/main.py` - FastAPI app (CRITICAL)
10. ⏳ Database migrations with Alembic

### Frontend Critical Path (After Backend Works)

1. ⏳ Initialize Vite + React + TypeScript project
2. ⏳ `frontend/src/types/*` - TypeScript interfaces
3. ⏳ `frontend/src/services/api.ts` - Axios setup
4. ⏳ `frontend/src/context/CartContext.tsx` - Cart state (CRITICAL)
5. ⏳ `frontend/src/components/menu/*` - Menu display
6. ⏳ `frontend/src/components/cart/*` - Cart UI
7. ⏳ `frontend/src/components/payment/*` - Payment UI
8. ⏳ `frontend/src/pages/MenuPage.tsx` - Main page
9. ⏳ `frontend/src/pages/CheckoutPage.tsx` - Checkout
10. ⏳ `frontend/src/App.tsx` - Router setup

## File Count Summary

- **Total Files**: ~80+
- **Completed**: 12 files
- **Remaining**: ~68 files
- **Progress**: ~15%

## Estimated Time to Complete

Based on complexity and dependencies:

- **Backend Completion**: 6-8 hours
  - Schemas: 1 hour
  - Services: 2-3 hours
  - API Endpoints: 2-3 hours
  - Main app & migrations: 1 hour

- **Frontend Completion**: 8-10 hours
  - Setup & config: 1 hour
  - Types & services: 1 hour
  - Context & state: 1-2 hours
  - Components: 3-4 hours
  - Pages: 2-3 hours

- **Integration & Testing**: 3-4 hours

- **Total**: 17-22 hours of focused development

## Quick Start Commands

```bash
# Backend
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env  # Then edit with your credentials
# Wait for main.py to be created, then:
uvicorn app.main:app --reload

# Frontend (after initialization)
cd frontend
npm install
cp .env.example .env
npm run dev

# Docker (complete stack)
docker-compose up
```

## Next Immediate Steps

1. **Read IMPLEMENTATION_GUIDE.md** - Detailed instructions
2. **Create Pydantic schemas** - Start with `backend/app/schemas/menu.py`
3. **Build services** - Order service first
4. **Create main.py** - FastAPI application entry
5. **Test with Swagger** - http://localhost:8000/docs
6. **Initialize frontend** - React + TypeScript + Vite
7. **Build cart context** - Critical state management
8. **Connect frontend to backend** - API integration

## Important Notes

- All backend models use `Decimal` for money - never use `float`
- Frontend uses TypeScript strict mode
- Database uses async SQLAlchemy - all queries are `await`
- Payment amounts are in dollars, CityPay expects cents
- QR codes embed table number and session token
- Email templates use Jinja2 syntax
- CORS must allow frontend origin
- Session tokens are for customer tracking, not auth

## Reference Documents

1. **README.md** - Project overview and setup
2. **IMPLEMENTATION_GUIDE.md** - Step-by-step build guide (READ THIS NEXT)
3. **Original Specification** - Complete technical requirements
4. **This file** - Structure and status reference

---

**Foundation Complete ✅ | Ready for Implementation 🚀**
