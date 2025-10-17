# How to Populate Your Digital Ocean Database

Your menu API is returning empty `[]` because the database has no menu data yet. Here's how to fix it:

## Problem

```
GET https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/menu/
Returns: []
```

This means:
- ✅ Backend is running correctly
- ✅ Database connection works
- ✅ Tables exist
- ❌ No menu items in the database

## Solution: Populate the Database

You have **3 options** to populate your database with the 30 menu items from `backend/data/menu_items.csv`.

---

## Option 1: Use the Admin Interface (EASIEST) ✅

The easiest way is to use your admin CSV upload feature:

### Steps:

1. **Login to Admin**:
   - Visit: https://seahorse-app-zxz5f.ondigitalocean.app/restaurantqrcode-frontend/admin/login
   - Login with your admin credentials

2. **Go to Menu Management**:
   - Navigate to: Admin → Menu Management
   - Click "Upload CSV" or "Bulk Import"

3. **Upload the CSV file**:
   - Use the file: `backend/data/menu_items.csv`
   - Select "Create new items"
   - Click Upload

4. **Verify**:
   - Refresh: https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/menu/
   - Should now show menu items

**Note:** First make sure categories exist (see Option 2 if they don't).

---

## Option 2: Run SQL Script via Digital Ocean Console (RECOMMENDED) ✅

### Steps:

1. **Go to Digital Ocean Dashboard**:
   - Navigate to: https://cloud.digitalocean.com/databases
   - Select your PostgreSQL database

2. **Open Console**:
   - Click "Connection Details" → "Connection String"
   - Or click "Console" tab (if available)

3. **Connect to Database**:
   ```bash
   # Using the connection string from Digital Ocean
   psql "postgresql://user:password@host:25060/db?sslmode=require"
   ```

4. **Run the SQL script**:
   - Copy the contents of `POPULATE_DATABASE.md`
   - Paste into the psql console
   - Or upload the file:
     ```sql
     \i POPULATE_DATABASE.md
     ```

5. **Verify**:
   ```sql
   SELECT COUNT(*) FROM categories;
   -- Should return: 5

   SELECT COUNT(*) FROM menu_items;
   -- Should return: 30
   ```

6. **Test the API**:
   ```bash
   curl https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/menu/
   ```

---

## Option 3: Run Python Seed Script from App Console

If you have access to run commands in your Digital Ocean app:

### Steps:

1. **Access App Console**:
   - Go to: Digital Ocean → Apps → Your App
   - Components → backend → Console

2. **Run the seed script**:
   ```bash
   cd /app
   python scripts/seed_menu.py --clear
   ```

3. **Output should show**:
   ```
   ============================================================
   Menu Items Seed Script
   ============================================================
   CSV file: /app/backend/data/menu_items.csv
   ============================================================

   Loading categories...
   ✓ Found 5 categories: Small Plates & Sides, Mains, Desserts, ...

   Processing CSV file...
     + Created: Chicken Quesadilla
     + Created: Nachos Supreme
     + Created: Guacamole & Chips
     ...

   ============================================================
   Summary:
   ============================================================
   ✓ Created:  30 items
   ============================================================
   ```

4. **Verify**:
   ```bash
   curl https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/menu/
   ```

---

## Option 4: Use API to Create Categories and Upload CSV

If you prefer using the API:

### Step 1: Create Categories

```bash
# Get admin token first
TOKEN=$(curl -X POST https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/admin/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "your_password"}' \
  | jq -r '.access_token')

# Create categories (if they don't exist)
curl -X POST https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/admin/menu/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Small Plates & Sides", "description": "Appetizers and sides", "display_order": 1}'

curl -X POST https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/admin/menu/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Mains", "description": "Main courses", "display_order": 2}'

curl -X POST https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/admin/menu/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Desserts", "description": "Sweet treats", "display_order": 3}'

curl -X POST https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/admin/menu/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Hot Drinks", "description": "Coffee and tea", "display_order": 4}'

curl -X POST https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/admin/menu/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name": "Beers & Cider", "description": "Alcoholic beverages", "display_order": 5}'
```

### Step 2: Upload CSV

```bash
curl -X POST https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/admin/menu/upload-csv \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@backend/data/menu_items.csv" \
  -F "update_existing=false"
```

---

## Quick Check: Do Categories Exist?

Before loading menu items, verify categories exist:

```bash
curl https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/menu/categories
```

**Expected response:**
```json
[
  {
    "id": 1,
    "name": "Small Plates & Sides",
    "description": "Appetizers and side dishes",
    "display_order": 1,
    "is_active": true,
    "items": []
  },
  ...
]
```

**If empty `[]`**, you need to create categories first. Use the SQL script in `POPULATE_DATABASE.md` which creates both categories and menu items.

---

## Troubleshooting

### Issue: "No categories found in database"

**Solution:** Run the SQL script to create categories first:
```sql
INSERT INTO categories (name, description, display_order, is_active, created_at, updated_at)
VALUES
  ('Small Plates & Sides', 'Appetizers and side dishes', 1, true, NOW(), NOW()),
  ('Mains', 'Main courses and entrees', 2, true, NOW(), NOW()),
  ('Desserts', 'Sweet treats and desserts', 3, true, NOW(), NOW()),
  ('Hot Drinks', 'Coffee, tea, and hot beverages', 4, true, NOW(), NOW()),
  ('Beers & Cider', 'Alcoholic beverages', 5, true, NOW(), NOW());
```

### Issue: "CSV file not found"

**Solution:** The CSV is in `backend/data/menu_items.csv`. Make sure this file is included in your deployment.

Check your `.gitignore` - ensure `backend/data/` is NOT ignored.

### Issue: "Permission denied"

**Solution:** Make sure you're using an admin account with proper role (admin or manager).

### Issue: Menu still showing empty after import

**Possible causes:**
1. **Wrong database:** Check `DATABASE_URL` points to production DB
2. **Cache issue:** Clear your browser cache or try incognito
3. **API error:** Check backend logs in Digital Ocean
4. **Categories missing:** Menu items need category associations

**Verify database:**
```bash
# Connect to production database
psql "YOUR_DIGITAL_OCEAN_CONNECTION_STRING"

# Check data
SELECT COUNT(*) FROM categories;
SELECT COUNT(*) FROM menu_items;
SELECT c.name, COUNT(m.id) FROM categories c
LEFT JOIN menu_items m ON m.category_id = c.id
GROUP BY c.name;
```

---

## After Populating

### Verify the Menu Works:

1. **API Test:**
   ```bash
   curl https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/menu/
   ```

2. **Frontend Test:**
   - Visit: https://seahorse-app-zxz5f.ondigitalocean.app/restaurantqrcode-frontend
   - You should see menu items grouped by category

3. **Check Categories:**
   - Should have 5 categories
   - Each category should have menu items

4. **Sample Item:**
   ```json
   {
     "id": 1,
     "name": "Chicken Quesadilla",
     "description": "Grilled chicken with melted cheese...",
     "price": "8.95",
     "category_id": 1,
     "is_available": true,
     "dietary_tags": [],
     "allergens": ["gluten", "dairy"],
     ...
   }
   ```

---

## Files Included

- **POPULATE_DATABASE.md** - Complete SQL script to run
- **backend/data/menu_items.csv** - CSV file with 30 menu items
- **backend/scripts/seed_menu.py** - Python script to load CSV

---

## Summary

**Recommended approach:**

1. Use **Option 2 (SQL Script)** - Most reliable, works directly with database
2. Connect to Digital Ocean PostgreSQL console
3. Copy/paste SQL from `POPULATE_DATABASE.md`
4. Verify with API call
5. Done! ✅

**Time required:** 5-10 minutes

**What you'll get:**
- 5 menu categories
- 30 menu items
- Fully functional menu API
- Working frontend menu display
