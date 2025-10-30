# Quick Fix: Empty Menu Data

## Problem
```
GET /api/v1/menu/ returns []
```

## Fastest Solution (5 minutes)

### 1. Connect to Digital Ocean Database

Go to: https://cloud.digitalocean.com/databases → Your Database → Console

### 2. Copy & Paste This SQL

```sql
-- Create Categories
INSERT INTO categories (name, description, display_order, is_active, created_at, updated_at)
VALUES
  ('Small Plates & Sides', 'Appetizers and side dishes', 1, true, NOW(), NOW()),
  ('Mains', 'Main courses and entrees', 2, true, NOW(), NOW()),
  ('Desserts', 'Sweet treats and desserts', 3, true, NOW(), NOW()),
  ('Hot Drinks', 'Coffee, tea, and hot beverages', 4, true, NOW(), NOW()),
  ('Beers & Cider', 'Alcoholic beverages', 5, true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING;
```

Then run the full SQL script from `POPULATE_DATABASE.md` (contains all 30 menu items).

### 3. Verify

```bash
curl https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/menu/
```

Should now return menu items! ✅

---

## Alternative: Use Admin Upload

1. Login: `/admin/login`
2. Menu Management → Upload CSV
3. Upload: `backend/data/menu_items.csv`
4. Done! ✅

---

## Full Instructions

See: `HOW_TO_POPULATE_DATABASE.md`
