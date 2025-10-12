# Implementation Guide - La Hacienda Ordering System

This guide provides step-by-step instructions to complete the restaurant ordering system.

## Project Status Overview

### ✅ COMPLETED (Foundation Layer)

The following critical foundation components have been created:

1. **Project Structure** - Complete directory tree
2. **Backend Core**:
   - Configuration system (`app/config.py`)
   - Database connection with async SQLAlchemy (`app/database.py`)
   - All database models:
     - `models/table.py` - Table with QR codes
     - `models/menu.py` - Categories, MenuItems, Modifiers
     - `models/order.py` - Orders and OrderItems
     - `models/payment.py` - PaymentSplit
     - `models/admin.py` - AdminUser
   - Utility functions (`utils/calculations.py`)
3. **Configuration**:
   - `requirements.txt` - All Python dependencies
   - `.env.example` - Environment template
   - `Dockerfile` - Backend container
   - `docker-compose.yml` - Complete stack
   - `.gitignore` - Version control exclusions

## Implementation Roadmap

Follow these steps in order for the smoothest implementation:

---

## PHASE 1: Complete Backend Core (Est. 4-6 hours)

### Step 1.1: Create Pydantic Schemas

Create validation schemas in `backend/app/schemas/`:

**File: `backend/app/schemas/__init__.py`**
```python
from app.schemas.menu import *
from app.schemas.order import *
from app.schemas.payment import *
from app.schemas.table import *
```

**File: `backend/app/schemas/menu.py`**
```python
from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal

class ModifierBase(BaseModel):
    name: str
    price: Decimal = Field(ge=0)
    modifier_type: str = "addon"

class ModifierCreate(ModifierBase):
    pass

class ModifierResponse(ModifierBase):
    id: int

    class Config:
        from_attributes = True

class MenuItemBase(BaseModel):
    name: str = Field(max_length=200)
    description: Optional[str] = None
    price: Decimal = Field(ge=0)
    dietary_tags: List[str] = []

class MenuItemResponse(MenuItemBase):
    id: int
    category_id: int
    is_available: bool
    image_url: Optional[str]
    modifiers: List[ModifierResponse] = []

    class Config:
        from_attributes = True

class CategoryResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    items: List[MenuItemResponse] = []

    class Config:
        from_attributes = True
```

**File: `backend/app/schemas/order.py`** - See specification document

**File: `backend/app/schemas/payment.py`** - See specification document

**File: `backend/app/schemas/table.py`**
```python
from pydantic import BaseModel
from typing import Optional

class TableResponse(BaseModel):
    id: int
    table_number: str
    qr_code_url: str
    seating_capacity: int
    status: str

    class Config:
        from_attributes = True
```

### Step 1.2: Create Service Layer

**File: `backend/app/services/__init__.py`**
```python
```

**File: `backend/app/services/order_service.py`**
- Implement `OrderService` class (see specification)
- Key methods:
  - `create_order(order_data: OrderCreate) -> Order`
  - `get_order(order_id: int) -> Order`
  - `calculate_totals(order_id: int, tip_percentage: float)`
  - `update_status(order_id: int, status: str)`

**File: `backend/app/services/payment_service.py`**
- Implement `CityPayService` class (see specification)
- Key methods:
  - `create_payment_intent(...)`
  - `verify_payment(transaction_id: str)`
  - `refund_payment(transaction_id: str, amount: Decimal)`

**File: `backend/app/services/qr_service.py`**
```python
import qrcode
from io import BytesIO
from pathlib import Path

def generate_qr_code(table_number: str, base_url: str) -> str:
    """Generate QR code for table"""
    import secrets
    token = secrets.token_urlsafe(16)
    url = f"{base_url}/menu?table={table_number}&session={token}"

    qr = qrcode.QRCode(version=1, box_size=10, border=4)
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Save to static folder
    static_dir = Path("static/qrcodes")
    static_dir.mkdir(parents=True, exist_ok=True)
    img_path = static_dir / f"table_{table_number}.png"
    img.save(img_path)

    return f"/static/qrcodes/table_{table_number}.png"
```

**File: `backend/app/services/email_service.py`** - See specification

### Step 1.3: Create API Endpoints

**File: `backend/app/api/__init__.py`**
```python
```

**File: `backend/app/api/deps.py`**
```python
from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal

async def get_db() -> AsyncGenerator[AsyncSession, None]:
    async with AsyncSessionLocal() as session:
        yield session
```

**File: `backend/app/api/v1/__init__.py`**
```python
from fastapi import APIRouter
from app.api.v1 import menu, orders, payment, tables

api_router = APIRouter()

api_router.include_router(menu.router, prefix="/menu", tags=["menu"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(payment.router, prefix="/payment", tags=["payment"])
api_router.include_router(tables.router, prefix="/tables", tags=["tables"])
```

**File: `backend/app/api/v1/menu.py`**
```python
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.api.deps import get_db
from app.models.menu import Category, MenuItem
from app.schemas.menu import CategoryResponse

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
async def get_menu(db: AsyncSession = Depends(get_db)):
    """Get complete menu with all categories and items"""
    result = await db.execute(
        select(Category)
        .where(Category.is_active == True)
        .order_by(Category.display_order)
    )
    categories = result.scalars().all()
    return categories
```

**File: `backend/app/api/v1/orders.py`** - See specification

**File: `backend/app/api/v1/payment.py`** - See specification

**File: `backend/app/api/v1/tables.py`** - Basic CRUD for tables

### Step 1.4: Create Main FastAPI Application

**File: `backend/app/main.py`**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager

from app.config import get_settings
from app.api.v1 import api_router
from app.database import engine, Base

settings = get_settings()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    async with engine.begin() as conn:
        # Create tables if they don't exist
        await conn.run_sync(Base.metadata.create_all)
    yield
    # Shutdown
    await engine.dispose()

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static files for QR codes
app.mount("/static", StaticFiles(directory="static"), name="static")

# Include API router
app.include_router(api_router, prefix="/api/v1")

# Health check
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.get("/")
async def root():
    return {
        "app": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs"
    }
```

### Step 1.5: Set Up Alembic Migrations

```bash
cd backend

# Initialize Alembic
alembic init alembic

# Edit alembic.ini - set sqlalchemy.url or leave blank (we'll use env)

# Edit alembic/env.py
```

**Update `backend/alembic/env.py`:**
```python
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context
import asyncio

from app.config import get_settings
from app.database import Base
from app.models import *  # Import all models

settings = get_settings()
config = context.config

# Override sqlalchemy.url with our DATABASE_URL
config.set_main_option("sqlalchemy.url", settings.DATABASE_URL.replace('+asyncpg', ''))

if config.config_file_name is not None:
    fileConfig(config.config_file_name)

target_metadata = Base.metadata

# ... rest of env.py remains the same
```

**Create initial migration:**
```bash
alembic revision --autogenerate -m "Initial schema"
alembic upgrade head
```

### Step 1.6: Create Database Initialization Script

**File: `backend/scripts/init_db.py`**
```python
import asyncio
from app.database import engine, Base
from app.models import *

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    print("Database initialized successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
```

### Step 1.7: Create Menu Import Script

**File: `backend/scripts/import_menu.py`**
```python
import asyncio
from decimal import Decimal
from app.database import AsyncSessionLocal
from app.models.menu import Category, MenuItem, ItemModifier

async def import_menu():
    async with AsyncSessionLocal() as db:
        # Small Plates & Sides
        small_plates = Category(
            name="Small Plates & Sides",
            description="Perfect for sharing",
            display_order=1
        )
        db.add(small_plates)
        await db.flush()

        # Add menu items
        nachos = MenuItem(
            category_id=small_plates.id,
            name="Nachos Supreme",
            description="Crispy tortilla chips topped with cheese, jalapeños, guacamole, and sour cream",
            price=Decimal("12.99"),
            dietary_tags=["v"],
            is_available=True,
            display_order=1
        )
        db.add(nachos)

        # Add more items...
        # Mains category
        # Desserts category
        # Hot Drinks category

        await db.commit()
        print("Menu imported successfully!")

if __name__ == "__main__":
    asyncio.run(import_menu())
```

### Step 1.8: Create Email Templates

**File: `backend/app/templates/email/payment_link.html`** - See specification

**File: `backend/app/templates/email/receipt.html`** - See specification

### Step 1.9: Test Backend

```bash
cd backend

# Copy environment file
cp .env.example .env
# Edit .env with actual credentials

# Run server
uvicorn app.main:app --reload

# Test endpoints
curl http://localhost:8000/health
curl http://localhost:8000/api/v1/menu
```

---

## PHASE 2: Build Frontend (Est. 6-8 hours)

### Step 2.1: Initialize React Project

```bash
cd ..  # Back to project root
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install

# Install dependencies
npm install react-router-dom axios react-hot-toast lucide-react
npm install -D tailwindcss postcss autoprefixer
npm install -D @types/node

# Initialize Tailwind
npx tailwindcss init -p
```

**Update `frontend/tailwind.config.js`:**
```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#d97706',  // Orange
          dark: '#b45309',
        }
      }
    },
  },
  plugins: [],
}
```

**Update `frontend/src/index.css`:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  body {
    @apply bg-gray-50 text-gray-900;
  }
}
```

### Step 2.2: Create Type Definitions

**File: `frontend/src/types/menu.ts`**
```typescript
export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  dietary_tags: string[];
  is_available: boolean;
  image_url?: string;
  modifiers: ItemModifier[];
}

export interface ItemModifier {
  id: number;
  name: string;
  price: number;
  modifier_type: string;
}

export interface Category {
  id: number;
  name: string;
  description?: string;
  items: MenuItem[];
}

export interface ModifierSelection {
  modifier_id: number;
  name: string;
  price: number;
}

export interface CartItem {
  id: number;
  menuItemId: number;
  name: string;
  price: number;
  quantity: number;
  selectedModifiers: ModifierSelection[];
  itemTotal: number;
}
```

**File: `frontend/src/types/order.ts`** - Order interfaces

**File: `frontend/src/types/payment.ts`** - Payment interfaces

### Step 2.3: Create API Services

**File: `frontend/src/services/api.ts`**
```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default api;
```

**File: `frontend/src/services/menuService.ts`**
```typescript
import api from './api';
import { Category } from '../types/menu';

export const getMenu = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/menu');
  return response.data;
};
```

**File: `frontend/src/services/orderService.ts`** - Order API calls

**File: `frontend/src/services/paymentService.ts`** - Payment API calls

### Step 2.4: Create Context Providers

**File: `frontend/src/context/CartContext.tsx`** - See specification document

This is a critical component - implement the complete cart management with:
- Add/remove items
- Update quantities
- Calculate subtotal, GST, total
- Persist to localStorage

### Step 2.5: Build Core Components

**File: `frontend/src/components/layout/Header.tsx`**
```typescript
import React from 'react';
import { ShoppingCart } from 'lucide-react';

interface HeaderProps {
  tableNumber: string;
  cartItemCount: number;
  onCartClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ tableNumber, cartItemCount, onCartClick }) => {
  return (
    <header className="bg-orange-600 text-white sticky top-0 z-10 shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">🌮 La Hacienda</h1>
          <p className="text-sm">Table {tableNumber}</p>
        </div>
        <button
          onClick={onCartClick}
          className="relative bg-white text-orange-600 p-3 rounded-full shadow-lg hover:bg-orange-50 transition"
        >
          <ShoppingCart size={24} />
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
              {cartItemCount}
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;
```

**Continue building components** - See specification for:
- MenuItem
- MenuCategory
- CartDrawer
- CartItem
- PaymentOptions
- SplitEqualForm
- SplitByItemsForm
- TipSelector

### Step 2.6: Build Pages

**File: `frontend/src/pages/MenuPage.tsx`** - See specification

**File: `frontend/src/pages/CheckoutPage.tsx`**

**File: `frontend/src/pages/PaymentSuccessPage.tsx`**

**File: `frontend/src/pages/PaymentFailurePage.tsx`**

### Step 2.7: Set Up Routing

**File: `frontend/src/App.tsx`**
```typescript
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { CartProvider } from './context/CartContext';
import MenuPage from './pages/MenuPage';
import CheckoutPage from './pages/CheckoutPage';
import PaymentSuccessPage from './pages/PaymentSuccessPage';
import PaymentFailurePage from './pages/PaymentFailurePage';

function App() {
  return (
    <BrowserRouter>
      <CartProvider>
        <Routes>
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/payment/success" element={<PaymentSuccessPage />} />
          <Route path="/payment/failure" element={<PaymentFailurePage />} />
          <Route path="/" element={<MenuPage />} />
        </Routes>
        <Toaster position="top-right" />
      </CartProvider>
    </BrowserRouter>
  );
}

export default App;
```

**File: `frontend/src/main.tsx`**
```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 2.8: Environment Configuration

**File: `frontend/.env.example`**
```
VITE_API_URL=http://localhost:8000/api/v1
VITE_APP_NAME=La Hacienda
```

**File: `frontend/package.json`** - Update scripts:
```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  }
}
```

### Step 2.9: Test Frontend

```bash
cd frontend
npm run dev
# Visit http://localhost:5173
```

---

## PHASE 3: Integration & Testing (Est. 3-4 hours)

### Step 3.1: End-to-End Testing

1. Start all services:
   ```bash
   docker-compose up
   ```

2. Test complete flow:
   - Access menu with table number
   - Add items to cart
   - Modify quantities
   - Proceed to checkout
   - Calculate with tip
   - Split payment (equal/by items)
   - Verify payment links generated

3. Test edge cases:
   - Empty cart
   - Invalid table number
   - Network failures
   - Payment failures

### Step 3.2: Write Tests

**Backend tests** (`backend/tests/`):
- `test_menu.py` - Test menu endpoints
- `test_orders.py` - Test order creation and calculations
- `test_payment.py` - Test payment splits

**Frontend tests** (`frontend/src/__tests__/`):
- Test components with Vitest
- Test cart functionality
- Test API service calls

---

## PHASE 4: Deployment Preparation (Est. 2-3 hours)

### Step 4.1: Production Environment

1. Set up production database (PostgreSQL on cloud)
2. Configure environment variables
3. Set up CityPay production credentials
4. Configure email service (SMTP)

### Step 4.2: Generate QR Codes

```bash
python backend/scripts/generate_qr_codes.py --tables 1-20
```

### Step 4.3: Deploy

Options:
- **Railway** (backend + database)
- **Vercel** (frontend)
- **AWS** / **DigitalOcean** (full stack)

---

## Quick Reference

### Start Development

```bash
# Terminal 1 - Database
docker-compose up postgres

# Terminal 2 - Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# Terminal 3 - Frontend
cd frontend
npm run dev
```

### Common Commands

```bash
# Backend
alembic revision --autogenerate -m "message"
alembic upgrade head
pytest tests/ -v

# Frontend
npm run build
npm run preview
```

### API Testing

```bash
# Get menu
curl http://localhost:8000/api/v1/menu

# Create order
curl -X POST http://localhost:8000/api/v1/orders \
  -H "Content-Type: application/json" \
  -d '{"table_number": "1", "session_token": "test", "items": []}'
```

---

## Support & Troubleshooting

### Common Issues

1. **Database connection fails**:
   - Check DATABASE_URL in .env
   - Ensure PostgreSQL is running
   - Verify credentials

2. **CORS errors**:
   - Check CORS_ORIGINS in backend config
   - Verify frontend URL matches

3. **Payment integration issues**:
   - Test with CityPay sandbox first
   - Check API credentials
   - Review webhook configuration

4. **Email not sending**:
   - Verify SMTP credentials
   - Check firewall/port 587
   - Use app-specific password for Gmail

### Next Steps After Completion

1. Security audit
2. Performance optimization
3. Mobile responsive testing
4. Accessibility (WCAG 2.1) review
5. Load testing
6. Documentation for restaurant staff
7. Training sessions
8. Soft launch with select tables
9. Full production rollout
10. Monitoring setup

---

**Happy Coding! 🚀**
