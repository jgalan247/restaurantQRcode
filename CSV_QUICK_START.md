# CSV Import Quick Start Guide

Quick reference for importing menu items via CSV.

## 🚀 Quick Start

### Option 1: Seed Script (Developers)

```bash
# Load from default CSV
python backend/scripts/seed_menu.py

# Clear database and reload
python backend/scripts/seed_menu.py --clear

# Update existing items
python backend/scripts/seed_menu.py --update
```

**With Docker:**
```bash
docker exec lahacienda-api python scripts/seed_menu.py --csv data/menu_items.csv
```

### Option 2: Admin Dashboard (Managers)

1. Go to: `http://localhost:5173/admin`
2. Navigate to **Menu Management**
3. Click **Import CSV** button
4. Download template (optional)
5. Select your CSV file
6. Choose update mode
7. Click **Upload & Import**

## 📝 CSV Format

### Required Columns
- `name` - Item name
- `category_name` - Must match existing category
- `price` - Decimal price (e.g., 12.95)

### Optional Columns
- `description` - Item description
- `calories` - Integer
- `allergens` - Pipe-separated: `gluten|dairy|nuts`
- `spice_level` - `none|mild|medium|hot|extra-hot`
- `is_available` - `true|false`
- `dietary_tags` - Pipe-separated: `v|vg|gf`
- `display_order` - Integer for sorting
- `image_url` - Image URL

### Example CSV

```csv
name,category_name,description,price,calories,allergens,spice_level,is_available
Chicken Quesadilla,Small Plates & Sides,Grilled chicken with cheese,8.95,520,gluten|dairy,mild,true
Veggie Burrito Bowl,Mains,Rice beans and vegetables,10.95,520,dairy,mild,true
Churros,Desserts,Fried dough with chocolate,5.95,420,gluten|dairy,none,true
```

## 🎯 Common Use Cases

### Initial Setup (Development)
```bash
# Fresh database with sample menu
python backend/scripts/seed_menu.py --clear --csv backend/data/menu_items.csv
```

### Update Prices
```bash
# Update existing items from CSV (matches by name)
python backend/scripts/seed_menu.py --update --csv price_updates.csv
```

### Add New Items (Production)
1. Go to Admin Dashboard
2. Import CSV → Upload file
3. Leave "Update existing" **unchecked**
4. Upload

### Bulk Update (Production)
1. Go to Admin Dashboard
2. Import CSV → Upload file
3. **Check** "Update existing items"
4. Upload

## ⚠️ Important Notes

1. **Categories must exist** - Category names must exactly match database categories
2. **Current categories**: Small Plates & Sides, Mains, Desserts, Hot Drinks, Beers & Cider, Wines, Soft Drinks
3. **UTF-8 encoding** - Save CSV files as UTF-8
4. **Pipe separators** - Use `|` for allergens and dietary tags (not commas)
5. **Update mode** - Matches items by name (case-insensitive)

## 📂 Files Location

```
backend/data/menu_items.csv          # Sample data (30 items)
backend/scripts/seed_menu.py          # Seed script
MENU_CSV_IMPORT_GUIDE.md             # Full documentation
```

## 🔍 Verify Import

**Via API:**
```bash
# Check item count
curl -H "Authorization: Bearer YOUR_TOKEN" \
  "http://localhost:8000/api/v1/admin/menu/items" | jq '.total'
```

**Via Database:**
```bash
docker exec lahacienda-db psql -U postgres -d lahacienda \
  -c "SELECT COUNT(*) FROM menu_items;"
```

## 🆘 Troubleshooting

### "Unknown category 'xyz'"
→ Check category name matches exactly (case-sensitive)
→ List categories: `curl -H "Authorization: Bearer TOKEN" http://localhost:8000/api/v1/admin/menu/categories`

### "Missing required field"
→ Ensure name, category_name, and price are present in all rows

### "File must be UTF-8 encoded"
→ Save CSV with UTF-8 encoding in Excel/Google Sheets

### Script fails with import error
→ Ensure you're running from project root
→ Check Python environment is active

## 📚 More Information

See **MENU_CSV_IMPORT_GUIDE.md** for complete documentation including:
- Detailed field specifications
- Error handling
- Best practices
- Advanced usage
- Sample data
