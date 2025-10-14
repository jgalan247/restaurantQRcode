# Admin Dashboard Implementation Guide

## ✅ BACKEND COMPLETED

### 1. Database Models Created
- **Special** & **SpecialItem**: Menu of the day / combo specials
- **Offer**: Promotional offers and discounts
- **AdminUser**: Admin authentication (already existed)
- **Order extensions**: Added `special_id` and `offer_id` tracking

Location: `backend/app/models/`

### 2. Pydantic Schemas Created
- **Admin schemas**: Login, token, user management
- **Special schemas**: CRUD operations for specials
- **Offer schemas**: CRUD operations for offers
- **Analytics schemas**: Dashboard, reports, order history

Location: `backend/app/schemas/`

### 3. Services/Business Logic Created
- **AdminService**: Authentication, user management, analytics
- **AnalyticsService**: Dashboard overview, sales reports, order history
- **SpecialService**: Full CRUD for specials
- **OfferService**: Full CRUD for offers

Location: `backend/app/services/`

### 4. Authentication System
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (admin, manager, staff)
- Protected routes with bearer token

Location: `backend/app/utils/auth.py`

### 5. API Endpoints Created

#### Admin Authentication (`/api/v1/admin/auth/`)
- POST `/login` - Admin login
- POST `/register` - Create new admin user
- GET `/me` - Get current admin info
- POST `/logout` - Logout

#### Dashboard & Analytics (`/api/v1/admin/`)
- GET `/dashboard` - Overview statistics
- GET `/reports/sales?start_date=YYYY-MM-DD&end_date=YYYY-MM-DD` - Sales report
- GET `/orders/history?page=1&page_size=20` - Paginated order history with filters

#### Menu Management (`/api/v1/admin/menu/`)
- GET `/items` - Get all menu items
- POST `/items` - Create menu item
- PUT `/items/{id}` - Update menu item
- DELETE `/items/{id}` - Delete menu item
- PATCH `/items/{id}/availability` - Toggle availability (86'd/out of stock)

#### Specials Management (`/api/v1/admin/specials/`)
- GET `/` - Get all specials
- GET `/{id}` - Get special by ID
- POST `/` - Create special
- PUT `/{id}` - Update special
- DELETE `/{id}` - Delete special
- PATCH `/{id}/active` - Toggle active status

#### Offers Management (`/api/v1/admin/offers/`)
- GET `/` - Get all offers
- GET `/{id}` - Get offer by ID
- POST `/` - Create offer
- PUT `/{id}` - Update offer
- DELETE `/{id}` - Delete offer
- PATCH `/{id}/active` - Toggle active status

#### Order Management (`/api/v1/admin/orders/`)
- GET `/realtime` - Get pending/preparing orders
- PATCH `/{id}/status` - Update order status

### 6. Migration Script Created
Location: `backend/alembic/versions/001_add_admin_dashboard_models.py`

### 7. Initial Admin User Script
Location: `backend/scripts/create_admin.py`

---

## 🔧 SETUP INSTRUCTIONS

### Backend Setup

1. **Run Database Migration**:
```bash
cd backend
# If using Docker:
docker-compose up -d db
# Wait for DB to be ready, then:
python -m alembic upgrade head
```

2. **Create Initial Admin User**:
```bash
python scripts/create_admin.py
# Default credentials: admin / admin123
```

3. **Start Backend**:
```bash
python app/main.py
# Or with Docker:
docker-compose up backend
```

4. **Test API**:
Visit `http://localhost:8000/docs` to see all admin endpoints in Swagger UI.

---

## 🎨 FRONTEND TODO

### Admin Frontend Structure to Create

```
frontend/src/
├── pages/admin/
│   ├── AdminLogin.tsx          # Login page
│   ├── AdminDashboard.tsx      # Dashboard home
│   ├── MenuManagement.tsx      # Menu CRUD
│   ├── SpecialsManagement.tsx  # Specials CRUD
│   ├── OffersManagement.tsx    # Offers CRUD
│   ├── OrdersDashboard.tsx     # Real-time orders
│   ├── OrderHistory.tsx        # Historical orders
│   └── SalesReports.tsx        # Analytics & reports
├── components/admin/
│   ├── AdminLayout.tsx         # Admin dashboard layout with sidebar
│   ├── AdminNav.tsx            # Navigation sidebar
│   ├── OverviewCard.tsx        # Dashboard stat cards
│   ├── MenuItemForm.tsx        # Menu item form
│   ├── SpecialForm.tsx         # Special creation form
│   ├── OfferForm.tsx           # Offer creation form
│   ├── OrderCard.tsx           # Real-time order card
│   └── SalesChart.tsx          # Charts for analytics
├── services/
│   └── adminApi.ts             # Admin API calls
├── context/
│   └── AdminAuthContext.tsx    # Admin auth state
└── types/
    └── admin.ts                # Admin TypeScript types
```

### Key Frontend Features to Implement

#### 1. Admin Authentication
- Login form with username/password
- Store JWT token in localStorage
- Protected admin routes
- Auto-logout on token expiry
- Redirect to login if not authenticated

#### 2. Admin Layout
- Sidebar navigation with icons:
  - Dashboard (home icon)
  - Menu Management
  - Specials
  - Offers
  - Orders (real-time)
  - Order History
  - Reports & Analytics
- Header with admin info and logout button
- Responsive design (desktop/tablet)

#### 3. Dashboard Home
Overview cards showing:
- Today's Sales (£)
- Number of Orders
- Average Order Value
- Most Popular Item
- Pending Orders count
- Preparing Orders count

Real-time updates (auto-refresh every 30 seconds)

#### 4. Menu Management
- Data table with columns:
  - Image, Name, Category, Price, Stock Status
- Actions: Edit, Delete, Toggle Availability
- Search and filter by category
- Inline editing or modal forms
- Mark as "86'd" / Out of Stock button
- Color-coded stock status (green=available, red=out of stock)

#### 5. Specials Management
- List all specials with create button
- Form fields:
  - Name, Description, Price
  - Image URL
  - Start/End dates (optional)
  - Select menu items to include
  - Display order
  - Active/Inactive toggle
- Edit/Delete actions
- Show which items are included

#### 6. Offers Management
- List all offers with create button
- Form fields:
  - Name, Description
  - Discount Type (dropdown: fixed, percentage, BOGO, free item)
  - Discount Value
  - Minimum Spend
  - Applicable Days (checkboxes: Mon-Sun)
  - Applicable Times (start/end)
  - Start/End dates
  - Max usage limit
  - Active/Inactive toggle
- Show usage statistics
- Edit/Delete actions

#### 7. Real-time Orders Dashboard
- Auto-refresh every 10-30 seconds
- Display orders as cards with:
  - Order number, Table number, Time
  - Items list
  - Total amount
  - Status badge (color-coded)
- Filter by status
- Action buttons: Mark as Preparing / Ready / Completed
- New orders notification/sound

#### 8. Order History
- Paginated table
- Filters:
  - Date range picker
  - Status dropdown
  - Table number input
  - Min/Max amount
- Search by order number
- Click to view full order details
- Export to CSV button

#### 9. Sales Reports & Analytics
- Date range selector (today, this week, this month, custom)
- Summary cards:
  - Total Revenue
  - Total Orders
  - Average Order Value
- Charts:
  - Revenue over time (line chart)
  - Revenue by category (pie chart)
  - Orders per hour (bar chart)
- Top 10 items:
  - By quantity sold
  - By revenue generated
  - Show percentage of total
- Export to PDF/CSV

### Styling Guidelines
- Use same background styling as main site (Mexican theme)
- Consistent color scheme
- Use Tailwind CSS for styling
- Use Lucide React icons
- Toast notifications for success/error messages
- Loading states for all API calls
- Confirmation dialogs for destructive actions

### API Integration Examples

```typescript
// adminApi.ts structure
import axios from 'axios';

const API_BASE = 'http://localhost:8000/api/v1';

// Set auth header
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('adminToken')}`
  }
});

export const adminApi = {
  // Auth
  login: (username: string, password: string) =>
    axios.post(`${API_BASE}/admin/auth/login`, { username, password }),

  // Dashboard
  getDashboard: () =>
    axios.get(`${API_BASE}/admin/dashboard`, getAuthHeaders()),

  // Menu
  getMenuItems: () =>
    axios.get(`${API_BASE}/admin/menu/items`, getAuthHeaders()),

  toggleItemAvailability: (id: number, is_available: boolean) =>
    axios.patch(
      `${API_BASE}/admin/menu/items/${id}/availability`,
      { is_available },
      getAuthHeaders()
    ),

  // Specials
  getSpecials: () =>
    axios.get(`${API_BASE}/admin/specials`, getAuthHeaders()),

  createSpecial: (data: any) =>
    axios.post(`${API_BASE}/admin/specials`, data, getAuthHeaders()),

  // Offers
  getOffers: () =>
    axios.get(`${API_BASE}/admin/offers`, getAuthHeaders()),

  // Orders
  getRealtimeOrders: () =>
    axios.get(`${API_BASE}/admin/orders/realtime`, getAuthHeaders()),

  updateOrderStatus: (id: number, status: string) =>
    axios.patch(
      `${API_BASE}/admin/orders/${id}/status`,
      { new_status: status },
      getAuthHeaders()
    ),

  // Reports
  getSalesReport: (startDate: string, endDate: string) =>
    axios.get(
      `${API_BASE}/admin/reports/sales?start_date=${startDate}&end_date=${endDate}`,
      getAuthHeaders()
    ),
};
```

### Protected Route Example

```typescript
// AdminRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAdminAuth } from '../context/AdminAuthContext';

export const AdminRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAdminAuth();

  if (loading) return <div>Loading...</div>;

  return isAuthenticated ? children : <Navigate to="/admin/login" />;
};
```

### Routes to Add

```typescript
// In App.tsx, add admin routes:
<Routes>
  {/* Existing customer routes... */}

  {/* Admin routes */}
  <Route path="/admin/login" element={<AdminLogin />} />
  <Route path="/admin" element={
    <AdminRoute>
      <AdminLayout />
    </AdminRoute>
  }>
    <Route index element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="dashboard" element={<AdminDashboard />} />
    <Route path="menu" element={<MenuManagement />} />
    <Route path="specials" element={<SpecialsManagement />} />
    <Route path="offers" element={<OffersManagement />} />
    <Route path="orders" element={<OrdersDashboard />} />
    <Route path="orders/history" element={<OrderHistory />} />
    <Route path="reports" element={<SalesReports />} />
  </Route>
</Routes>
```

---

## 🚀 QUICK START

1. **Backend**: Run migration, create admin user, start server
2. **Frontend**:
   - Create admin types in `types/admin.ts`
   - Create admin API service in `services/adminApi.ts`
   - Create admin auth context
   - Build pages one by one (start with login)
   - Test each feature as you build

## 📝 TESTING CHECKLIST

### Backend
- [ ] Admin login works
- [ ] Dashboard endpoint returns data
- [ ] Menu CRUD operations work
- [ ] Can toggle menu item availability
- [ ] Specials CRUD works
- [ ] Offers CRUD works
- [ ] Order status updates work
- [ ] Sales reports generate correctly

### Frontend
- [ ] Admin can login
- [ ] Token is stored and used for requests
- [ ] Dashboard shows correct statistics
- [ ] Menu items can be edited
- [ ] Items can be marked out of stock
- [ ] Specials can be created/edited/deleted
- [ ] Offers can be created/edited/deleted
- [ ] Real-time orders display correctly
- [ ] Order status can be updated
- [ ] Order history filters work
- [ ] Sales reports display correctly
- [ ] All features work on tablet/desktop
- [ ] Error handling works (toast notifications)
- [ ] Loading states display correctly

---

## 🎯 PRIORITY ORDER

1. **High Priority** (Core functionality):
   - Admin Login
   - Dashboard Home
   - Menu Management (especially toggle availability)
   - Real-time Orders Dashboard

2. **Medium Priority** (Important features):
   - Specials Management
   - Offers Management
   - Order History

3. **Nice to Have** (Enhancement):
   - Sales Reports with charts
   - Advanced analytics
   - Export features (CSV/PDF)

---

## 🐛 KNOWN CONSIDERATIONS

1. **Security**: All admin routes are protected with JWT authentication
2. **CORS**: Backend already configured for localhost:5173
3. **Real-time Updates**: Use polling (setInterval) or implement WebSocket later
4. **Mobile**: Admin dashboard is desktop/tablet focused (not mobile-optimized)
5. **Permissions**: Role-based access (admin, manager, staff) is implemented
6. **Database**: Remember to run migrations before testing

---

## 📚 REFERENCE

- Backend API Docs: `http://localhost:8000/docs`
- JWT Token expires after 8 hours (configured in `utils/auth.py`)
- Default admin: username=`admin`, password=`admin123`
- All decimal fields use 2 decimal places
- Dates should be in ISO format (YYYY-MM-DD)

