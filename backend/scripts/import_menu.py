"""
Menu import script for La Hacienda restaurant
Imports sample menu data into the database
"""
import asyncio
import sys
from pathlib import Path
from decimal import Decimal

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import AsyncSessionLocal
from app.models.menu import Category, MenuItem, ItemModifier


async def import_menu():
    """Import sample menu data"""
    print("Importing La Hacienda menu...")

    async with AsyncSessionLocal() as db:
        # Small Plates & Sides
        small_plates = Category(
            name="Small Plates & Sides",
            description="Perfect for sharing or as a starter",
            display_order=1,
            is_active=True,
        )
        db.add(small_plates)
        await db.flush()

        # Add some menu items
        nachos = MenuItem(
            category_id=small_plates.id,
            name="Nachos Supreme",
            description="Crispy tortilla chips topped with cheese, jalapeños, guacamole, and sour cream",
            price=Decimal("12.99"),
            dietary_tags=["v"],
            is_available=True,
            display_order=1,
        )
        db.add(nachos)

        quesadilla = MenuItem(
            category_id=small_plates.id,
            name="Quesadilla",
            description="Grilled flour tortilla filled with cheese and your choice of filling",
            price=Decimal("10.99"),
            dietary_tags=["v"],
            is_available=True,
            display_order=2,
        )
        db.add(quesadilla)

        # Mains
        mains = Category(
            name="Mains",
            description="Hearty Mexican favorites",
            display_order=2,
            is_active=True,
        )
        db.add(mains)
        await db.flush()

        tacos = MenuItem(
            category_id=mains.id,
            name="Street Tacos (3)",
            description="Three soft corn tortillas with your choice of filling, cilantro, and lime",
            price=Decimal("15.99"),
            dietary_tags=[],
            is_available=True,
            display_order=1,
        )
        db.add(tacos)

        burrito = MenuItem(
            category_id=mains.id,
            name="Burrito Bowl",
            description="Rice, beans, your choice of protein, lettuce, cheese, salsa, and guacamole",
            price=Decimal("14.99"),
            dietary_tags=[],
            is_available=True,
            display_order=2,
        )
        db.add(burrito)

        enchiladas = MenuItem(
            category_id=mains.id,
            name="Enchiladas (2)",
            description="Two rolled tortillas filled with your choice, topped with sauce and cheese",
            price=Decimal("16.99"),
            dietary_tags=[],
            is_available=True,
            display_order=3,
        )
        db.add(enchiladas)

        # Desserts
        desserts = Category(
            name="Desserts",
            description="Sweet endings",
            display_order=3,
            is_active=True,
        )
        db.add(desserts)
        await db.flush()

        churros = MenuItem(
            category_id=desserts.id,
            name="Churros",
            description="Crispy fried dough with cinnamon sugar and chocolate dipping sauce",
            price=Decimal("7.99"),
            dietary_tags=["v"],
            is_available=True,
            display_order=1,
        )
        db.add(churros)

        flan = MenuItem(
            category_id=desserts.id,
            name="Flan",
            description="Traditional Mexican custard with caramel sauce",
            price=Decimal("6.99"),
            dietary_tags=["v"],
            is_available=True,
            display_order=2,
        )
        db.add(flan)

        # Hot Drinks
        drinks = Category(
            name="Hot Drinks",
            description="Warm beverages",
            display_order=4,
            is_active=True,
        )
        db.add(drinks)
        await db.flush()

        coffee = MenuItem(
            category_id=drinks.id,
            name="Mexican Coffee",
            description="Dark roast coffee with cinnamon and piloncillo",
            price=Decimal("3.99"),
            dietary_tags=["v", "vg"],
            is_available=True,
            display_order=1,
        )
        db.add(coffee)

        chocolate = MenuItem(
            category_id=drinks.id,
            name="Hot Chocolate",
            description="Rich Mexican hot chocolate with cinnamon",
            price=Decimal("4.99"),
            dietary_tags=["v"],
            is_available=True,
            display_order=2,
        )
        db.add(chocolate)

        await db.commit()

    print("✅ Menu imported successfully!")
    print("   - 4 categories created")
    print("   - 10 menu items added")


if __name__ == "__main__":
    asyncio.run(import_menu())
