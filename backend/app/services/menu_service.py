from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, update, delete, or_
from sqlalchemy.orm import joinedload
from typing import Optional, List, Tuple, Any
import math
from dataclasses import dataclass

from app.models.menu import MenuItem, Category
from app.schemas.menu import MenuItemCreate, MenuItemUpdate


@dataclass
class MenuItemDTO:
    """Data transfer object for menu items to avoid lazy loading issues"""
    id: int
    name: str
    category_id: int
    category_name: str
    description: Optional[str]
    price: Any  # Decimal
    has_variants: bool
    price_small_glass: Optional[Any]  # Decimal
    price_large_glass: Optional[Any]  # Decimal
    price_bottle: Optional[Any]  # Decimal
    calories: Optional[int]
    allergens: List[str]
    image_url: Optional[str]
    is_available: bool
    spice_level: Optional[str]
    is_lite_bite: bool
    is_child_friendly: bool
    is_salad: bool
    is_deal: bool
    is_gluten_free: bool
    dietary_tags: List[str]
    display_order: Optional[int]


class MenuService:
    """Service for admin menu management operations"""

    @staticmethod
    async def get_menu_items(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        search: Optional[str] = None,
        category_id: Optional[int] = None,
        sort_by: str = "name",
        sort_order: str = "asc"
    ) -> Tuple[List[MenuItemDTO], int]:
        """
        Get paginated list of menu items with search and filter

        Args:
            db: Database session
            page: Page number (1-indexed)
            page_size: Items per page
            search: Search query for item name
            category_id: Filter by category ID
            sort_by: Field to sort by (name, price, category_id)
            sort_order: Sort order (asc, desc)

        Returns:
            Tuple of (items list, total count)
        """
        # Build query
        query = select(MenuItem).join(Category)

        # Apply search filter
        if search:
            search_term = f"%{search}%"
            query = query.where(MenuItem.name.ilike(search_term))

        # Apply category filter
        if category_id:
            query = query.where(MenuItem.category_id == category_id)

        # Apply sorting
        sort_column = getattr(MenuItem, sort_by, MenuItem.name)
        if sort_order == "desc":
            query = query.order_by(sort_column.desc())
        else:
            query = query.order_by(sort_column.asc())

        # Get total count
        count_query = select(func.count()).select_from(MenuItem)
        if search:
            count_query = count_query.where(MenuItem.name.ilike(search_term))
        if category_id:
            count_query = count_query.where(MenuItem.category_id == category_id)

        result = await db.execute(count_query)
        total = result.scalar()

        # Apply pagination
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        # Execute query
        result = await db.execute(query)
        items = result.scalars().all()

        # Get category names
        category_query = select(Category)
        category_result = await db.execute(category_query)
        categories = {cat.id: cat.name for cat in category_result.scalars().all()}

        # Convert to DTO to avoid lazy loading issues
        items_response = []
        for item in items:
            dto = MenuItemDTO(
                id=item.id,
                name=item.name,
                category_id=item.category_id,
                category_name=categories.get(item.category_id, "Unknown"),
                description=item.description,
                price=item.price,
                has_variants=item.has_variants or False,
                price_small_glass=item.price_small_glass,
                price_large_glass=item.price_large_glass,
                price_bottle=item.price_bottle,
                calories=item.calories,
                allergens=item.allergens or [],
                image_url=item.image_url,
                is_available=item.is_available if item.is_available is not None else True,
                spice_level=item.spice_level,
                is_lite_bite=item.is_lite_bite or False,
                is_child_friendly=item.is_child_friendly or False,
                is_salad=item.is_salad or False,
                is_deal=item.is_deal or False,
                is_gluten_free=item.is_gluten_free or False,
                dietary_tags=item.dietary_tags or [],
                display_order=item.display_order
            )
            items_response.append(dto)

        return items_response, total

    @staticmethod
    async def get_menu_item_by_id(db: AsyncSession, item_id: int) -> Optional[MenuItem]:
        """Get a single menu item by ID"""
        result = await db.execute(
            select(MenuItem).where(MenuItem.id == item_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_menu_item(db: AsyncSession, item_data: MenuItemCreate) -> MenuItem:
        """Create a new menu item"""
        # Convert to dict and handle defaults
        item_dict = item_data.model_dump()

        # Create menu item
        new_item = MenuItem(**item_dict)
        db.add(new_item)
        await db.commit()
        await db.refresh(new_item)
        return new_item

    @staticmethod
    async def update_menu_item(
        db: AsyncSession,
        item_id: int,
        item_data: MenuItemUpdate
    ) -> Optional[MenuItem]:
        """Update an existing menu item"""
        # Get existing item
        item = await MenuService.get_menu_item_by_id(db, item_id)
        if not item:
            return None

        # Update fields
        update_data = item_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(item, field, value)

        await db.commit()
        await db.refresh(item)
        return item

    @staticmethod
    async def delete_menu_item(db: AsyncSession, item_id: int) -> bool:
        """Delete a menu item"""
        item = await MenuService.get_menu_item_by_id(db, item_id)
        if not item:
            return False

        await db.delete(item)
        await db.commit()
        return True

    @staticmethod
    async def toggle_availability(
        db: AsyncSession,
        item_id: int,
        is_available: bool
    ) -> Optional[MenuItem]:
        """Toggle menu item availability (86'd/out of stock)"""
        item = await MenuService.get_menu_item_by_id(db, item_id)
        if not item:
            return None

        item.is_available = is_available
        await db.commit()
        await db.refresh(item)
        return item

    @staticmethod
    async def get_all_categories(db: AsyncSession) -> List[Category]:
        """Get all categories for dropdown"""
        result = await db.execute(
            select(Category).order_by(Category.name)
        )
        return result.scalars().all()
