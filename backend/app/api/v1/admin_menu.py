from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
import math
import csv
import io
from decimal import Decimal

from app.database import get_db
from app.models.admin import AdminUser
from app.utils.auth import get_current_admin, require_role
from app.schemas.menu import (
    MenuItemCreate,
    MenuItemUpdate,
    MenuItemAvailability,
    MenuItemListResponse,
    AdminMenuItemResponse
)
from app.services.menu_service import MenuService

router = APIRouter(prefix="/admin/menu", tags=["admin-menu"])


def item_to_dict(item, category_name: str) -> dict:
    """Convert MenuItem model to dict for API response"""
    return {
        "id": item.id,
        "name": item.name,
        "category_id": item.category_id,
        "category_name": category_name,
        "description": item.description,
        "price": float(item.price),
        "has_variants": item.has_variants or False,
        "price_small_glass": float(item.price_small_glass) if item.price_small_glass else None,
        "price_large_glass": float(item.price_large_glass) if item.price_large_glass else None,
        "price_bottle": float(item.price_bottle) if item.price_bottle else None,
        "calories": item.calories,
        "allergens": item.allergens or [],
        "image_url": item.image_url,
        "is_available": item.is_available if item.is_available is not None else True,
        "spice_level": item.spice_level,
        "is_lite_bite": item.is_lite_bite or False,
        "is_child_friendly": item.is_child_friendly or False,
        "is_salad": item.is_salad or False,
        "is_deal": item.is_deal or False,
        "is_gluten_free": item.is_gluten_free or False,
        "dietary_tags": item.dietary_tags or [],
        "display_order": item.display_order
    }


@router.get("/items")
async def list_menu_items(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    search: Optional[str] = Query(None, description="Search by item name"),
    category_id: Optional[int] = Query(None, description="Filter by category ID"),
    sort_by: str = Query("name", description="Field to sort by"),
    sort_order: str = Query("asc", regex="^(asc|desc)$", description="Sort order"),
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get paginated list of menu items with search and filter options

    - **page**: Page number (default: 1)
    - **page_size**: Items per page (default: 20, max: 100)
    - **search**: Search term for item name
    - **category_id**: Filter by category
    - **sort_by**: Sort field (name, price, category_id)
    - **sort_order**: asc or desc
    """
    items, total = await MenuService.get_menu_items(
        db=db,
        page=page,
        page_size=page_size,
        search=search,
        category_id=category_id,
        sort_by=sort_by,
        sort_order=sort_order
    )

    total_pages = math.ceil(total / page_size)

    # Convert DTO objects to dict
    items_dict = [
        {
            "id": item.id,
            "name": item.name,
            "category_id": item.category_id,
            "category_name": item.category_name,
            "description": item.description,
            "price": float(item.price),
            "has_variants": item.has_variants,
            "price_small_glass": float(item.price_small_glass) if item.price_small_glass else None,
            "price_large_glass": float(item.price_large_glass) if item.price_large_glass else None,
            "price_bottle": float(item.price_bottle) if item.price_bottle else None,
            "calories": item.calories,
            "allergens": item.allergens,
            "image_url": item.image_url,
            "is_available": item.is_available,
            "spice_level": item.spice_level,
            "is_lite_bite": item.is_lite_bite,
            "is_child_friendly": item.is_child_friendly,
            "is_salad": item.is_salad,
            "is_deal": item.is_deal,
            "is_gluten_free": item.is_gluten_free,
            "dietary_tags": item.dietary_tags,
            "display_order": item.display_order
        }
        for item in items
    ]

    return {
        "items": items_dict,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.get("/items/{item_id}")
async def get_menu_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get a single menu item by ID"""
    item = await MenuService.get_menu_item_by_id(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    # Get category name
    categories = await MenuService.get_all_categories(db)
    category_map = {cat.id: cat.name for cat in categories}

    return item_to_dict(item, category_map.get(item.category_id, "Unknown"))


@router.post("/items", status_code=201)
async def create_menu_item(
    item_data: MenuItemCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Create a new menu item"""
    # Verify category exists
    categories = await MenuService.get_all_categories(db)
    if not any(cat.id == item_data.category_id for cat in categories):
        raise HTTPException(status_code=400, detail="Invalid category ID")

    # Validate variant pricing if enabled
    if item_data.has_variants:
        if not item_data.price_small_glass or not item_data.price_large_glass or not item_data.price_bottle:
            raise HTTPException(
                status_code=400,
                detail="All variant prices (small_glass, large_glass, bottle) are required when has_variants is true"
            )

        # Validate pricing logic
        if item_data.price_large_glass <= item_data.price_small_glass:
            raise HTTPException(
                status_code=400,
                detail="Large glass price must be greater than small glass price"
            )
        if item_data.price_bottle <= item_data.price_large_glass:
            raise HTTPException(
                status_code=400,
                detail="Bottle price must be greater than large glass price"
            )

        # Warning for unusual pricing (optional but helpful)
        bottle_ratio = item_data.price_bottle / item_data.price_small_glass
        if bottle_ratio < 3:
            # This is just a warning, don't block the request
            pass  # Could log a warning here

    new_item = await MenuService.create_menu_item(db, item_data)

    # Get category name
    category_map = {cat.id: cat.name for cat in categories}

    return item_to_dict(new_item, category_map.get(new_item.category_id, "Unknown"))


@router.put("/items/{item_id}")
async def update_menu_item(
    item_id: int,
    item_data: MenuItemUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Update an existing menu item"""
    # Verify category exists if being updated
    if item_data.category_id is not None:
        categories = await MenuService.get_all_categories(db)
        if not any(cat.id == item_data.category_id for cat in categories):
            raise HTTPException(status_code=400, detail="Invalid category ID")

    # Validate variant pricing if being updated
    if item_data.has_variants is not None and item_data.has_variants:
        # Need to check the item for existing values
        existing_item = await MenuService.get_menu_item_by_id(db, item_id)
        if not existing_item:
            raise HTTPException(status_code=404, detail="Menu item not found")

        # Use new values if provided, otherwise use existing
        small = item_data.price_small_glass if item_data.price_small_glass is not None else existing_item.price_small_glass
        large = item_data.price_large_glass if item_data.price_large_glass is not None else existing_item.price_large_glass
        bottle = item_data.price_bottle if item_data.price_bottle is not None else existing_item.price_bottle

        if not small or not large or not bottle:
            raise HTTPException(
                status_code=400,
                detail="All variant prices (small_glass, large_glass, bottle) are required when has_variants is true"
            )

        # Validate pricing logic
        if large <= small:
            raise HTTPException(
                status_code=400,
                detail="Large glass price must be greater than small glass price"
            )
        if bottle <= large:
            raise HTTPException(
                status_code=400,
                detail="Bottle price must be greater than large glass price"
            )

    updated_item = await MenuService.update_menu_item(db, item_id, item_data)
    if not updated_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    # Get category name
    categories = await MenuService.get_all_categories(db)
    category_map = {cat.id: cat.name for cat in categories}

    return item_to_dict(updated_item, category_map.get(updated_item.category_id, "Unknown"))


@router.delete("/items/{item_id}", status_code=204)
async def delete_menu_item(
    item_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Delete a menu item"""
    success = await MenuService.delete_menu_item(db, item_id)
    if not success:
        raise HTTPException(status_code=404, detail="Menu item not found")
    return None


@router.patch("/items/{item_id}/availability")
async def toggle_item_availability(
    item_id: int,
    availability_data: MenuItemAvailability,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Toggle menu item availability (86'd / out of stock)"""
    updated_item = await MenuService.toggle_availability(
        db, item_id, availability_data.is_available
    )
    if not updated_item:
        raise HTTPException(status_code=404, detail="Menu item not found")

    # Get category name
    categories = await MenuService.get_all_categories(db)
    category_map = {cat.id: cat.name for cat in categories}

    return item_to_dict(updated_item, category_map.get(updated_item.category_id, "Unknown"))


@router.get("/categories")
async def list_categories(
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get all categories for dropdown"""
    categories = await MenuService.get_all_categories(db)
    return [
        {
            "id": cat.id,
            "name": cat.name,
            "description": cat.description if hasattr(cat, 'description') else None
        }
        for cat in categories
    ]


@router.post("/upload-csv")
async def upload_menu_csv(
    file: UploadFile = File(...),
    update_existing: bool = Query(False, description="Update existing items by name"),
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(require_role("admin", "manager"))
):
    """
    Bulk upload/update menu items from CSV file

    CSV Format:
    - name (required)
    - category_name (required)
    - description
    - price (required)
    - calories
    - allergens (pipe-separated: gluten|dairy)
    - spice_level (none|mild|medium|hot|extra-hot)
    - is_available (true/false)
    - is_lite_bite (true/false)
    - is_child_friendly (true/false)
    - is_salad (true/false)
    - is_deal (true/false)
    - is_gluten_free (true/false)
    - dietary_tags (pipe-separated: v|vg|gf)
    - display_order (integer)
    - image_url

    Options:
    - update_existing: If true, updates existing items by name. If false, skips duplicates.
    """

    # Validate file type
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")

    try:
        # Read file content
        content = await file.read()
        text_content = content.decode('utf-8')
        csv_reader = csv.DictReader(io.StringIO(text_content))

        # Load categories
        categories = await MenuService.get_all_categories(db)
        category_map = {cat.name: cat.id for cat in categories}

        # Load existing items
        all_items, _ = await MenuService.get_menu_items(db, page=1, page_size=10000)
        existing_items = {item.name.lower(): item.id for item in all_items}

        created = []
        updated = []
        skipped = []
        errors = []

        # Process each row
        row_num = 1  # Header is row 0
        for row in csv_reader:
            row_num += 1
            try:
                # Validate required fields
                name = row.get('name', '').strip()
                category_name = row.get('category_name', '').strip()
                price_str = row.get('price', '').strip()

                if not name:
                    errors.append(f"Row {row_num}: Missing name")
                    continue
                if not category_name:
                    errors.append(f"Row {row_num}: Missing category_name")
                    continue
                if not price_str:
                    errors.append(f"Row {row_num}: Missing price")
                    continue

                # Validate category
                if category_name not in category_map:
                    errors.append(f"Row {row_num}: Unknown category '{category_name}'")
                    continue

                # Parse data
                item_data = {
                    'name': name,
                    'category_id': category_map[category_name],
                    'description': row.get('description', '').strip() or None,
                    'price': Decimal(price_str),
                    'calories': int(row.get('calories', '').strip()) if row.get('calories', '').strip() else None,
                    'allergens': row.get('allergens', '').strip().split('|') if row.get('allergens', '').strip() else [],
                    'spice_level': row.get('spice_level', '').strip() or None,
                    'is_available': row.get('is_available', 'true').lower() in ('true', '1', 'yes'),
                    'is_lite_bite': row.get('is_lite_bite', 'false').lower() in ('true', '1', 'yes'),
                    'is_child_friendly': row.get('is_child_friendly', 'false').lower() in ('true', '1', 'yes'),
                    'is_salad': row.get('is_salad', 'false').lower() in ('true', '1', 'yes'),
                    'is_deal': row.get('is_deal', 'false').lower() in ('true', '1', 'yes'),
                    'is_gluten_free': row.get('is_gluten_free', 'false').lower() in ('true', '1', 'yes'),
                    'dietary_tags': row.get('dietary_tags', '').strip().split('|') if row.get('dietary_tags', '').strip() else [],
                    'display_order': int(row.get('display_order', '0').strip()) if row.get('display_order', '').strip() else 0,
                    'image_url': row.get('image_url', '').strip() or None
                }

                # Check if item exists
                item_id = existing_items.get(name.lower())

                if item_id and update_existing:
                    # Update existing item
                    update_schema = MenuItemUpdate(**item_data)
                    await MenuService.update_menu_item(db, item_id, update_schema)
                    updated.append(name)
                elif item_id:
                    # Skip existing item
                    skipped.append(name)
                else:
                    # Create new item
                    create_schema = MenuItemCreate(**item_data)
                    await MenuService.create_menu_item(db, create_schema)
                    created.append(name)

            except ValueError as e:
                errors.append(f"Row {row_num}: Invalid data - {str(e)}")
            except Exception as e:
                errors.append(f"Row {row_num}: {str(e)}")

        # Return summary
        return {
            "success": len(errors) == 0,
            "summary": {
                "total_rows": row_num - 1,
                "created": len(created),
                "updated": len(updated),
                "skipped": len(skipped),
                "errors": len(errors)
            },
            "created_items": created[:10],  # Show first 10
            "updated_items": updated[:10],
            "skipped_items": skipped[:10],
            "errors": errors[:20],  # Show first 20 errors
            "message": f"Processed {row_num - 1} rows: {len(created)} created, {len(updated)} updated, {len(skipped)} skipped, {len(errors)} errors"
        }

    except csv.Error as e:
        raise HTTPException(status_code=400, detail=f"CSV parsing error: {str(e)}")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="File must be UTF-8 encoded")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")


@router.get("/csv-template")
async def download_csv_template(
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Download a CSV template with example data"""
    template = """name,category_name,description,price,calories,allergens,spice_level,is_available,is_lite_bite,is_child_friendly,is_salad,is_deal,is_gluten_free,dietary_tags,display_order,image_url
Chicken Quesadilla,Starters,Grilled chicken with melted cheese,8.95,520,gluten|dairy,mild,true,false,true,false,false,false,,1,
Nachos Supreme,Starters,Crispy tortilla chips with toppings,9.95,680,dairy|gluten,medium,true,false,false,false,false,false,,2,
Classic Beef Burrito,Mains,Seasoned ground beef with beans and rice,12.95,780,gluten|dairy,medium,true,false,false,false,false,false,,10,
"""

    return {
        "template": template,
        "instructions": "Download this template, fill in your menu items, and upload back to the system"
    }
