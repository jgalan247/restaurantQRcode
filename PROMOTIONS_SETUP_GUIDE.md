# Promotions Setup Guide

This guide will help you populate your database with promotional data so that **Daily Specials**, **Offers/Deals**, and **Chef's Recommendations** appear on your menu.

## Why Aren't Promotions Showing?

The promotional features are **fully implemented** in your codebase, but they're hidden when there's no data in the database. The frontend components check for data and only display when records exist:

```typescript
{featuredOffers.length > 0 && <FeaturedOffersCarousel ... />}
{activeSpecials.length > 0 && <DailySpecialsSection ... />}
```

## Quick Start - Option 1: Python Script (Recommended)

### Prerequisites
- Backend virtual environment activated
- Database running

### Steps

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Activate virtual environment:**
   ```bash
   source venv/bin/activate  # macOS/Linux
   # OR
   venv\Scripts\activate  # Windows
   ```

3. **Run the seed script:**
   ```bash
   python scripts/seed_all_promotions.py
   ```

4. **Verify:**
   The script will show you a summary:
   ```
   ✓ Total Specials: 3
   ✓ Total Offers: 5
   ✓ Total Chef Combos: 5
   ```

5. **Check your frontend:**
   Visit your menu page - you should now see:
   - **Featured Offers Carousel** at the top (bright colorful banner)
   - **Daily Specials Section** with horizontal scrolling cards
   - **Active Offers Banner** below the specials
   - **Chef's Combos** in the Budget Builder modal

## Quick Start - Option 2: SQL Script

If you prefer direct SQL or don't have Python setup:

1. **Connect to your database:**
   ```bash
   psql -U your_username -d your_database_name
   ```

2. **Run the SQL file:**
   ```bash
   \i SEED_PROMOTIONS.sql
   ```

   Or copy-paste the SQL content directly into your database client.

## Quick Start - Option 3: Admin Interface

You can also manually create promotions through the admin panel:

1. **Login to admin panel:**
   - Visit `/admin/login`
   - Use your admin credentials

2. **Create Daily Specials:**
   - Navigate to `/admin/specials`
   - Click "Create New Special"
   - Fill in the form:
     - Name: "Taco Tuesday"
     - Description: "Three tacos with rice and beans"
     - Price: 15.99
     - Select menu items to include
   - Save

3. **Create Offers:**
   - Navigate to `/admin/offers`
   - Click "Create New Offer"
   - Fill in the form:
     - Name: "Happy Hour"
     - Discount Type: percentage
     - Discount Value: 50
     - Set applicable days/times
     - Mark as "Featured" to show in carousel
   - Save

## What Gets Created?

### Daily Specials (3 items)
1. **Taco Tuesday Special** - £15.99
   - 3 tacos, rice, beans, and a drink

2. **Weekend Brunch Fiesta** - £25.00
   - Huevos Rancheros, mimosas, churros, fresh fruit

3. **Enchilada Evening** - £18.50
   - 3 cheese enchiladas, rice, beans, margarita

### Promotional Offers (5 items)
1. **Happy Hour** - 50% off drinks (4PM-6PM weekdays) ⭐ Featured
2. **Student Special** - 20% off with student ID
3. **Birthday Fiesta** - Free dessert on your birthday ⭐ Featured
4. **Family Sunday** - £10 off orders over £50 on Sundays ⭐ Featured
5. **Lunch Express** - 15% off lunch orders (12PM-3PM weekdays)

### Chef's Combos (5 items)
1. **Quick Lunch** - £20.00
2. **Date Night** - £50.00
3. **Full Experience** - £40.00
4. **Family Feast** - £80.00
5. **Solo Treat** - £30.00

## Where Do Promotions Appear?

### Customer Menu Page (`/`)

1. **Featured Offers Carousel** (top of page)
   - Bright gradient banner (orange/red/pink)
   - Auto-rotates every 5 seconds
   - Shows offers marked as `is_featured = true`
   - Displays discount amount prominently

2. **Daily Specials Section**
   - Below the carousel
   - Horizontal scrolling cards
   - Shows active specials with images
   - "View Details" button opens modal

3. **Active Offers Banner**
   - Compact banner showing non-featured active offers
   - Shows applicable days/times
   - Minimum spend requirements

4. **Chef's Recommendations**
   - Appears in Budget Builder modal
   - Click "Budget Builder" button (bottom right)
   - Shows under "Chef's Recommendations" section

### Admin Pages

- **Manage Specials:** `/admin/specials`
- **Manage Offers:** `/admin/offers`
- Chef's Combos currently managed via scripts/database

## Troubleshooting

### "I ran the script but don't see promotions"

1. **Check if data was created:**
   ```bash
   cd backend
   python -c "
   import asyncio
   from sqlalchemy import select, func
   from app.database import AsyncSessionLocal
   from app.models.special import Special
   from app.models.offer import Offer
   from app.models.menu import ChefCombo

   async def check():
       async with AsyncSessionLocal() as db:
           s = await db.execute(select(func.count()).select_from(Special))
           o = await db.execute(select(func.count()).select_from(Offer))
           c = await db.execute(select(func.count()).select_from(ChefCombo))
           print(f'Specials: {s.scalar()}, Offers: {o.scalar()}, Combos: {c.scalar()}')

   asyncio.run(check())
   "
   ```

2. **Check browser console:**
   - Open DevTools (F12)
   - Look for API errors
   - Check if `/api/v1/promotions/specials/active` returns data

3. **Verify backend is running:**
   ```bash
   curl http://localhost:8000/api/v1/promotions/specials/active
   ```

### "Items not found" warnings in seed script

This means the menu items referenced by the combos don't exist. Solutions:

1. **Populate menu first:**
   ```bash
   cd backend
   python scripts/init_db.py
   ```

2. **Or use the SQL script from POPULATE_DATABASE.md**

3. **Or upload CSV via admin:** `/admin/menu`

### "Database connection error"

1. **Check DATABASE_URL in `.env`:**
   ```
   DATABASE_URL=postgresql+asyncpg://user:pass@host:port/dbname
   ```

2. **Ensure PostgreSQL is running:**
   ```bash
   # macOS
   brew services list

   # Docker
   docker-compose ps
   ```

## API Endpoints

Your promotional features use these endpoints:

- `GET /api/v1/promotions/specials/active` - Active specials
- `GET /api/v1/promotions/offers/active` - Active offers
- `GET /api/v1/promotions/offers/featured` - Featured offers (carousel)
- `GET /api/v1/menu/budget-builder` - Budget builder (includes chef combos)

## Customization

### Modify Existing Promotions

Edit the seed scripts:
- `backend/scripts/seed_all_promotions.py` - All promotions
- `backend/scripts/seed_chef_combos.py` - Just chef combos
- `SEED_PROMOTIONS.sql` - SQL version

### Create Your Own

Use the admin interface or modify the seed data in the scripts.

### Delete All Promotional Data

```sql
DELETE FROM special_items;
DELETE FROM specials;
DELETE FROM offers;
DELETE FROM chef_combo_items;
DELETE FROM chef_combos;
```

## Files Reference

- `backend/scripts/seed_all_promotions.py` - **Main seed script** (recommended)
- `backend/scripts/seed_chef_combos.py` - Chef combos only
- `SEED_PROMOTIONS.sql` - SQL version of seed data
- `frontend/src/components/promotions/` - Frontend components
- `frontend/src/pages/MenuPage.tsx` - Where promotions display
- `backend/app/api/v1/customer_promotions.py` - API endpoints
- `backend/app/models/special.py` - Specials database model
- `backend/app/models/offer.py` - Offers database model
- `backend/app/models/menu.py` - Chef combos model

## Support

If you encounter issues:
1. Check the backend logs for errors
2. Verify database connection
3. Ensure menu items exist (required for chef combos)
4. Check browser console for API errors
5. Verify backend is running on correct port

---

**Happy promoting! 🎉**
