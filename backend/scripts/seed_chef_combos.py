import asyncio
import sys
from pathlib import Path
from decimal import Decimal

sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.menu import ChefCombo, ChefComboItem, MenuItem

async def seed_chef_combos():
    """Seed database with Chef's Combo packages"""

    async with AsyncSessionLocal() as db:
        print("Seeding Chef's Combos...\n")

        # Helper function to get menu item by name
        async def get_item_by_name(name_substr):
            result = await db.execute(
                select(MenuItem).where(MenuItem.name.ilike(f"%{name_substr}%"))
            )
            return result.scalars().first()

        # Define Chef's Combos
        combos_data = [
            {
                "name": "Quick Lunch",
                "description": "Perfect for a quick midday bite. Includes a starter and main course.",
                "price": Decimal("20.00"),
                "display_order": 1,
                "items": [
                    ("Nacho", 1),
                    ("Quesadilla", 1),
                    ("Coca-Cola", 1),
                ]
            },
            {
                "name": "Date Night",
                "description": "Romantic dinner for two. Share starters, enjoy mains, and finish with dessert and wine.",
                "price": Decimal("50.00"),
                "display_order": 2,
                "items": [
                    ("Nacho", 1),
                    ("Quesadilla", 2),
                    ("Churros", 1),
                    ("Red - Rioja", 1),
                ]
            },
            {
                "name": "Full Experience",
                "description": "The complete La Hacienda experience. Starter, main, sides, dessert, and drinks.",
                "price": Decimal("40.00"),
                "display_order": 3,
                "items": [
                    ("Nacho", 1),
                    ("Quesadilla", 1),
                    ("Guacamole", 1),
                    ("Churros", 1),
                    ("Corona", 1),
                ]
            },
            {
                "name": "Family Feast",
                "description": "Feed the whole family! Multiple mains, sides to share, and drinks for everyone.",
                "price": Decimal("80.00"),
                "display_order": 4,
                "items": [
                    ("Nacho", 2),
                    ("Quesadilla", 3),
                    ("Guacamole", 2),
                    ("Churros", 2),
                    ("Coca-Cola", 4),
                ]
            },
            {
                "name": "Solo Treat",
                "description": "Treat yourself! A well-balanced meal with starter, main, and a sweet finish.",
                "price": Decimal("30.00"),
                "display_order": 5,
                "items": [
                    ("Quesadilla", 1),
                    ("Guacamole", 1),
                    ("Churros", 1),
                    ("Sprite", 1),
                ]
            }
        ]

        for combo_data in combos_data:
            # Create combo
            combo = ChefCombo(
                name=combo_data["name"],
                description=combo_data["description"],
                price=combo_data["price"],
                display_order=combo_data["display_order"],
                is_active=True
            )
            db.add(combo)
            await db.flush()  # Get the combo ID

            print(f"✓ Created combo: {combo.name} (£{combo.price})")

            # Add items to combo
            for item_name_substr, quantity in combo_data["items"]:
                menu_item = await get_item_by_name(item_name_substr)
                if menu_item:
                    combo_item = ChefComboItem(
                        combo_id=combo.id,
                        menu_item_id=menu_item.id,
                        quantity=quantity
                    )
                    db.add(combo_item)
                    print(f"  → Added {quantity}x {menu_item.name}")
                else:
                    print(f"  ⚠ Warning: Could not find item matching '{item_name_substr}'")

            print()

        await db.commit()
        print("✅ Chef's Combos seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed_chef_combos())
