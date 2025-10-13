import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import select, update, delete
from app.database import AsyncSessionLocal
from app.models.menu import Category, MenuItem

async def reorganize_drinks():
    """Split Cold Drinks into Beers & Cider, Wines, and Soft Drinks"""

    async with AsyncSessionLocal() as db:
        print("Reorganizing drinks menu into separate categories...\n")

        # Get existing Cold Drinks category
        result = await db.execute(
            select(Category).where(Category.name == "Cold Drinks")
        )
        cold_drinks_cat = result.scalar_one_or_none()

        if not cold_drinks_cat:
            print("❌ Cold Drinks category not found. Run add_drinks_menu.py first.")
            return

        # Create new categories
        beers_cider = Category(
            name="Beers & Cider",
            description="Refreshing beers and fruit ciders",
            display_order=5,
            is_active=True
        )

        wines = Category(
            name="Wines",
            description="Carefully selected wines with food pairing recommendations",
            display_order=6,
            is_active=True
        )

        soft_drinks = Category(
            name="Soft Drinks",
            description="Refreshing non-alcoholic beverages",
            display_order=7,
            is_active=True
        )

        db.add(beers_cider)
        db.add(wines)
        db.add(soft_drinks)
        await db.flush()

        print(f"✓ Created category: Beers & Cider (ID: {beers_cider.id})")
        print(f"✓ Created category: Wines (ID: {wines.id})")
        print(f"✓ Created category: Soft Drinks (ID: {soft_drinks.id})\n")

        # Get all items from Cold Drinks
        result = await db.execute(
            select(MenuItem).where(MenuItem.category_id == cold_drinks_cat.id)
        )
        items = result.scalars().all()

        beers_keywords = ['Corona', 'San Miguel', 'Madri', 'Sol', 'Desperados', 'Cero']
        cider_keywords = ['Rekorderlig', 'Old Mout', 'Kopparberg']
        wine_keywords = ['Red -', 'White -', 'Rosé -', 'Sparkling -', 'Rioja', 'Pinot', 'Provence', 'Prosecco']

        beer_count = 0
        wine_count = 0
        soft_count = 0

        for item in items:
            # Determine which category this item belongs to
            if any(keyword in item.name for keyword in beers_keywords + cider_keywords):
                await db.execute(
                    update(MenuItem)
                    .where(MenuItem.id == item.id)
                    .values(category_id=beers_cider.id)
                )
                beer_count += 1
                print(f"  → Moved to Beers & Cider: {item.name}")

            elif any(keyword in item.name for keyword in wine_keywords):
                await db.execute(
                    update(MenuItem)
                    .where(MenuItem.id == item.id)
                    .values(category_id=wines.id)
                )
                wine_count += 1
                print(f"  → Moved to Wines: {item.name}")

            else:
                await db.execute(
                    update(MenuItem)
                    .where(MenuItem.id == item.id)
                    .values(category_id=soft_drinks.id)
                )
                soft_count += 1
                print(f"  → Moved to Soft Drinks: {item.name}")

        # Delete old Cold Drinks category
        await db.execute(
            delete(Category).where(Category.id == cold_drinks_cat.id)
        )

        await db.commit()

        print(f"\n✅ Reorganization complete!")
        print(f"   Beers & Cider: {beer_count} items")
        print(f"   Wines: {wine_count} items")
        print(f"   Soft Drinks: {soft_count} items")
        print(f"   Removed old 'Cold Drinks' category")

if __name__ == "__main__":
    asyncio.run(reorganize_drinks())
