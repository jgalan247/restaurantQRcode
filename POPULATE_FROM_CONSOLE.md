# Populate Database from Digital Ocean Console

You're logged into: `root@restaurantqrcode-backend-586c58884-dllz6:/app#`

## Quick Steps

### 1. Check if CSV file exists

```bash
ls -la data/menu_items.csv
```

If it exists, you should see:
```
-rw-r--r-- 1 root root 4454 Oct 17 16:13 data/menu_items.csv
```

### 2. Check if script exists

```bash
ls -la scripts/seed_menu.py
```

### 3. Run the seed script

```bash
python scripts/seed_menu.py --clear
```

**Expected output:**
```
============================================================
Menu Items Seed Script
============================================================
CSV file: /app/data/menu_items.csv
Clear existing: True
Update mode: False
============================================================

Loading categories...
✓ Found 5 categories: Small Plates & Sides, Mains, Desserts, Hot Drinks, Beers & Cider

Clearing existing menu items...
✓ Cleared all menu items

Processing CSV file...
  + Created: Chicken Quesadilla
  + Created: Nachos Supreme
  + Created: Guacamole & Chips
  ... (30 total items)

============================================================
Summary:
============================================================
✓ Created:  30 items
============================================================
```

### 4. Verify it worked

```bash
# Quick database check using Python
python -c "
import asyncio
from app.database import AsyncSessionLocal
from app.models.menu import MenuItem, Category
from sqlalchemy import select

async def check():
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(Category))
        categories = result.scalars().all()
        print(f'Categories: {len(categories)}')

        result = await session.execute(select(MenuItem))
        items = result.scalars().all()
        print(f'Menu Items: {len(items)}')

        for cat in categories:
            result = await session.execute(
                select(MenuItem).where(MenuItem.category_id == cat.id)
            )
            items = result.scalars().all()
            print(f'  {cat.name}: {len(items)} items')

asyncio.run(check())
"
```

**Expected output:**
```
Categories: 5
Menu Items: 30
  Small Plates & Sides: 5 items
  Mains: 15 items
  Desserts: 4 items
  Hot Drinks: 2 items
  Beers & Cider: 4 items
```

### 5. Test the API

```bash
curl http://localhost:8000/api/v1/menu/categories
```

Should return JSON with categories and menu items!

---

## If Files Don't Exist

### Option A: CSV file missing

Create it manually:
```bash
cat > data/menu_items.csv << 'EOF'
name,category_name,description,price,calories,allergens,spice_level,is_available,is_lite_bite,is_child_friendly,is_salad,is_deal,is_gluten_free,dietary_tags,display_order,image_url
Chicken Quesadilla,Small Plates & Sides,Grilled chicken with melted cheese in a flour tortilla,8.95,520,gluten|dairy,mild,true,false,true,false,false,false,,1,
Nachos Supreme,Small Plates & Sides,Crispy tortilla chips topped with cheese sauce jalapeños and sour cream,9.95,680,dairy|gluten,medium,true,false,false,false,false,false,,2,
EOF
```

(Then paste the rest of the CSV content)

### Option B: Use SQL directly

```bash
# Connect to database
python -c "
import asyncio
from app.database import engine

async def run_sql():
    async with engine.begin() as conn:
        # Insert categories
        await conn.execute(text('''
            INSERT INTO categories (name, description, display_order, is_active, created_at, updated_at)
            VALUES
              ('Small Plates & Sides', 'Appetizers', 1, true, NOW(), NOW()),
              ('Mains', 'Main courses', 2, true, NOW(), NOW()),
              ('Desserts', 'Desserts', 3, true, NOW(), NOW()),
              ('Hot Drinks', 'Hot beverages', 4, true, NOW(), NOW()),
              ('Beers & Cider', 'Alcoholic beverages', 5, true, NOW(), NOW())
            ON CONFLICT (name) DO NOTHING;
        '''))
        print('Categories inserted')

from sqlalchemy import text
asyncio.run(run_sql())
"
```

---

## Troubleshooting

### Error: "No module named 'app'"

You're not in the right directory. Try:
```bash
cd /app
pwd
# Should show: /app
```

### Error: "No categories found"

Categories need to exist first. Run:
```bash
python scripts/init_db.py
```

Then try the seed script again.

### Error: "CSV file not found"

Check the path:
```bash
find / -name "menu_items.csv" 2>/dev/null
```

### Error: Database connection failed

Check DATABASE_URL:
```bash
env | grep DATABASE_URL
```

Should show your PostgreSQL connection string.

---

## After Successful Population

Test in browser:
1. Visit: https://seahorse-app-zxz5f.ondigitalocean.app/restaurantqrcode-frontend
2. You should see menu items!
3. API: https://seahorse-app-zxz5f.ondigitalocean.app/api/v1/menu/

Done! 🎉
