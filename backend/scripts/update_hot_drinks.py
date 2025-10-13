import asyncio
import sys
from pathlib import Path
from decimal import Decimal

sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.menu import MenuItem, ItemModifier

async def add_milk_options():
    """Add milk type modifiers to hot drinks"""

    async with AsyncSessionLocal() as db:
        print("Adding milk options to hot drinks...\n")

        # Get hot drinks that contain milk
        milk_drinks = ["Cappuccino", "Latté", "Mocha", "Mexican Hot Chocolate"]

        for drink_name in milk_drinks:
            result = await db.execute(
                select(MenuItem).where(MenuItem.name.ilike(f"%{drink_name}%"))
            )
            drinks = result.scalars().all()

            for drink in drinks:
                # Add milk modifiers
                milk_options = [
                    {"name": "Semi-Skimmed Milk", "price": Decimal("0.00"), "modifier_type": "milk", "display_order": 1},
                    {"name": "Full Cream Milk", "price": Decimal("0.00"), "modifier_type": "milk", "display_order": 2},
                    {"name": "Soya Milk", "price": Decimal("0.40"), "modifier_type": "milk", "display_order": 3},
                    {"name": "Oat Milk", "price": Decimal("0.40"), "modifier_type": "milk", "display_order": 4},
                    {"name": "Almond Milk", "price": Decimal("0.40"), "modifier_type": "milk", "display_order": 5},
                ]

                for milk_opt in milk_options:
                    modifier = ItemModifier(
                        menu_item_id=drink.id,
                        **milk_opt,
                        is_required=False  # Optional choice
                    )
                    db.add(modifier)

                print(f"✓ Added milk options to: {drink.name}")

        await db.commit()
        print("\n✅ Milk options added to hot drinks!")

if __name__ == "__main__":
    asyncio.run(add_milk_options())
