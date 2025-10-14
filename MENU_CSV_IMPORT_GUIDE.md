# Menu CSV Import Guide

This guide explains how to bulk import and update menu items using CSV files. There are two approaches available:

## 📋 Table of Contents
- [Approach 1: Seed Script (Development)](#approach-1-seed-script-development)
- [Approach 2: Admin Dashboard Upload (Production)](#approach-2-admin-dashboard-upload-production)
- [CSV Format Specification](#csv-format-specification)
- [Sample Data](#sample-data)
- [Troubleshooting](#troubleshooting)

---

## Approach 1: Seed Script (Development)

The seed script is ideal for:
- Initial database setup
- Development environment data population
- Database resets
- Bulk loading large datasets

### Prerequisites

1. Ensure backend is set up and database is running
2. Categories must already exist in the database
3. Python environment is active

### Usage

#### Basic Usage (Default CSV)
```bash
# From project root
python backend/scripts/seed_menu.py
```

This will load menu items from `backend/data/menu_items.csv`

#### Custom CSV File
```bash
python backend/scripts/seed_menu.py --csv /path/to/your/menu.csv
```

#### Clear Existing Items First
```bash
python backend/scripts/seed_menu.py --clear
```

⚠️ **Warning**: This will delete all existing menu items before loading new ones.

#### Update Existing Items
```bash
python backend/scripts/seed_menu.py --update
```

This will update items with matching names instead of skipping them.

#### Combined Options
```bash
# Clear database and load fresh data
python backend/scripts/seed_menu.py --clear --csv backend/data/menu_items.csv

# Update existing items from CSV
python backend/scripts/seed_menu.py --update --csv updates.csv
```

### Script Output

The script provides detailed feedback:

```
============================================================
Menu Items Seed Script
============================================================
CSV file: backend/data/menu_items.csv
Clear existing: False
Update mode: False
============================================================

Loading categories...
✓ Found 6 categories: Starters, Mains, Desserts, Hot Drinks, Beers & Cider

Processing CSV file...
  + Created: Chicken Quesadilla
  + Created: Nachos Supreme
  + Created: Classic Beef Burrito
  ...

Committing changes to database...

============================================================
Summary:
============================================================
✓ Created:  30 items
- Skipped:  0 items
✗ Errors:   0 rows
============================================================
```

### Docker Usage

If using Docker:

```bash
# Copy CSV into container
docker cp backend/data/menu_items.csv lahacienda-api:/app/data/menu_items.csv

# Run seed script inside container
docker exec lahacienda-api python scripts/seed_menu.py

# With options
docker exec lahacienda-api python scripts/seed_menu.py --clear --update
```

---

## Approach 2: Admin Dashboard Upload (Production)

The admin dashboard upload is ideal for:
- Production environment updates
- Manager/admin controlled imports
- Small to medium batch updates
- Audit trail and validation

### Access

1. Navigate to admin dashboard: `http://localhost:5173/admin`
2. Login with admin credentials
3. Go to **Menu Management**
4. Click **Import CSV** button

### Step-by-Step Process

#### 1. Download Template (Optional)
- Click **Download Template** button in the upload modal
- This provides a properly formatted CSV with example data
- Use this as a starting point for your menu items

#### 2. Prepare Your CSV
- Ensure all required fields are present (name, category_name, price)
- Verify category names match existing categories
- Use proper formatting (see CSV Format Specification below)

#### 3. Upload
- Click **Import CSV** button
- Select your CSV file
- Choose options:
  - ☐ **Update existing items**: Check this to update items with matching names
  - ☐ Leave unchecked to skip duplicate items

#### 4. Review Results
The upload will show a summary:
```
Processed 30 rows: 25 created, 3 updated, 2 skipped, 0 errors
```

- **Created**: New items added to database
- **Updated**: Existing items modified (only if "Update existing" was checked)
- **Skipped**: Duplicate items not modified
- **Errors**: Invalid data or formatting issues

#### 5. Check Errors
If there are errors, check the browser console for details:
- Row number and specific error message
- Common issues: invalid category, missing required field, invalid price format

---

## CSV Format Specification

### Required Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `name` | String | Item name | `Chicken Quesadilla` |
| `category_name` | String | Must match existing category | `Starters` |
| `price` | Decimal | Price in GBP (or your currency) | `8.95` |

### Optional Fields

| Field | Type | Description | Example |
|-------|------|-------------|---------|
| `description` | String | Item description | `Grilled chicken with melted cheese` |
| `calories` | Integer | Calorie count | `520` |
| `allergens` | String | Pipe-separated allergens | `gluten\|dairy` |
| `spice_level` | String | none, mild, medium, hot, extra-hot | `mild` |
| `is_available` | Boolean | true/false, 1/0, yes/no | `true` |
| `is_lite_bite` | Boolean | Lite bite flag | `false` |
| `is_child_friendly` | Boolean | Child-friendly flag | `true` |
| `is_salad` | Boolean | Salad flag | `false` |
| `is_deal` | Boolean | Special deal flag | `false` |
| `is_gluten_free` | Boolean | Gluten-free flag | `false` |
| `dietary_tags` | String | Pipe-separated tags | `v\|vg\|gf` |
| `display_order` | Integer | Sort order | `1` |
| `image_url` | String | Image URL | `https://...` |

### Field Format Rules

#### Allergens
Use pipe (`|`) separator, no spaces:
```
gluten|dairy|nuts
```

Common allergens:
- `gluten`, `dairy`, `eggs`, `fish`, `shellfish`, `nuts`, `peanuts`, `soy`

#### Dietary Tags
Use pipe (`|`) separator:
```
v|vg|gf
```

Common tags:
- `v` = Vegetarian
- `vg` = Vegan
- `gf` = Gluten Free

#### Spice Levels
Valid values:
- `none` or empty
- `mild`
- `medium`
- `hot`
- `extra-hot`

#### Boolean Fields
Accepted values for `true`:
- `true`, `1`, `yes` (case insensitive)

Accepted values for `false`:
- `false`, `0`, `no`, or empty

#### Categories
Category names must **exactly match** existing categories in the database.

Current categories (default):
- Starters
- Mains
- Desserts
- Hot Drinks
- Beers & Cider

---

## Sample Data

### Example CSV Header
```csv
name,category_name,description,price,calories,allergens,spice_level,is_available,is_lite_bite,is_child_friendly,is_salad,is_deal,is_gluten_free,dietary_tags,display_order,image_url
```

### Example Rows

```csv
Chicken Quesadilla,Starters,Grilled chicken with melted cheese in a flour tortilla,8.95,520,gluten|dairy,mild,true,false,true,false,false,false,,1,
Nachos Supreme,Starters,Crispy tortilla chips topped with cheese sauce,9.95,680,dairy|gluten,medium,true,false,false,false,false,false,,2,
Guacamole & Chips,Starters,Fresh avocado dip with crispy tortilla chips,6.95,340,gluten,mild,true,true,true,false,false,true,vg,3,
Classic Beef Burrito,Mains,Seasoned ground beef black beans rice cheese and salsa,12.95,780,gluten|dairy,medium,true,false,false,false,false,false,,10,
Veggie Burrito Bowl,Mains,Black beans rice grilled vegetables guacamole and salsa,10.95,520,dairy,mild,true,true,false,false,false,true,vg|gf,11,
Churros,Desserts,Fried dough pastry with cinnamon sugar and chocolate sauce,5.95,420,gluten|dairy,none,true,false,true,false,false,false,v,30,
```

### Full Sample File

A complete sample CSV with 30 Mexican restaurant items is located at:
```
backend/data/menu_items.csv
```

---

## Troubleshooting

### Common Issues

#### ❌ "Unknown category 'xyz'"
**Problem**: Category name in CSV doesn't match database categories.

**Solution**:
1. Check exact spelling and capitalization
2. List available categories:
   ```bash
   docker exec lahacienda-api python -c "
   import asyncio
   from app.database import get_database_url
   from sqlalchemy.ext.asyncio import create_async_engine
   from sqlalchemy import select, text

   async def list_categories():
       engine = create_async_engine(get_database_url())
       async with engine.connect() as conn:
           result = await conn.execute(text('SELECT name FROM categories'))
           for row in result:
               print(row[0])
       await engine.dispose()

   asyncio.run(list_categories())
   "
   ```

#### ❌ "Missing required field"
**Problem**: CSV is missing name, category_name, or price.

**Solution**: Ensure all rows have these three required fields populated.

#### ❌ "Invalid price format"
**Problem**: Price field contains non-numeric data.

**Solution**: Use decimal format like `12.95`, no currency symbols.

#### ❌ "File must be UTF-8 encoded"
**Problem**: CSV file has wrong encoding.

**Solution**: Save CSV with UTF-8 encoding:
- Excel: Save As → CSV UTF-8
- Google Sheets: Download → Comma-separated values (.csv)

#### ❌ Script fails with "No categories found"
**Problem**: Database doesn't have categories yet.

**Solution**: Run migrations first:
```bash
docker exec lahacienda-api alembic upgrade head
```

### Getting Help

#### Check Database State
```bash
# List all menu items
docker exec lahacienda-db psql -U postgres -d lahacienda -c "SELECT id, name, category_id, price FROM menu_items LIMIT 10;"

# Count items by category
docker exec lahacienda-db psql -U postgres -d lahacienda -c "SELECT c.name, COUNT(m.id) FROM categories c LEFT JOIN menu_items m ON c.id = m.category_id GROUP BY c.name;"
```

#### View Script Logs
```bash
# Run seed script with verbose output
python backend/scripts/seed_menu.py --csv backend/data/menu_items.csv 2>&1 | tee seed_output.log
```

#### Check API Logs
```bash
# View backend logs
docker logs lahacienda-api --tail 100 -f
```

---

## Best Practices

### For Development (Seed Script)

1. **Version Control**: Keep your CSV files in version control
2. **Clear First**: Use `--clear` flag when you want a fresh start
3. **Test Data**: Create separate CSVs for testing vs production
4. **Incremental Updates**: Use `--update` flag to modify existing items

### For Production (Admin Upload)

1. **Small Batches**: Upload in smaller batches (50-100 items) for easier error handling
2. **Backup First**: Create a database backup before large imports
3. **Test in Dev**: Test your CSV in development environment first
4. **Review Results**: Always review the upload summary for errors
5. **Update Mode**: Use "Update existing" carefully - it modifies data

### CSV Preparation

1. **Template First**: Start with the downloaded template
2. **Validate Data**: Check all required fields are present
3. **Category Names**: Verify category names exactly match
4. **Special Characters**: Use UTF-8 encoding for special characters (£, é, ñ, etc.)
5. **Line Endings**: Use Unix line endings (LF) or Windows (CRLF)

---

## Quick Reference

### Seed Script Commands
```bash
# Basic load
python backend/scripts/seed_menu.py

# Clear and reload
python backend/scripts/seed_menu.py --clear

# Update existing
python backend/scripts/seed_menu.py --update

# Custom CSV
python backend/scripts/seed_menu.py --csv path/to/menu.csv

# Help
python backend/scripts/seed_menu.py --help
```

### Admin Dashboard
```
1. Login: http://localhost:5173/admin
2. Menu Management → Import CSV
3. Download template (optional)
4. Select CSV file
5. Choose update mode
6. Upload & Import
```

### Files Location
```
backend/data/menu_items.csv          # Sample data
backend/scripts/seed_menu.py          # Seed script
frontend/src/pages/admin/AdminMenuPage.tsx  # Upload UI
backend/app/api/v1/admin_menu.py     # Upload API
```

---

## Support

For issues or questions:
1. Check this documentation first
2. Review error messages in console/logs
3. Verify CSV format matches specification
4. Check database connectivity
5. Consult backend logs for detailed errors

---

**Last Updated**: 2025-10-13
**Version**: 1.0
