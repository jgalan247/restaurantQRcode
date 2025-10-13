import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import update
from app.database import AsyncSessionLocal
from app.models.menu import MenuItem

async def update_allergens():
    """Tag all menu items with UK-required allergen information"""

    async with AsyncSessionLocal() as db:
        print("Updating allergen information for all menu items...\n")

        # Define allergen mappings for La Hacienda items
        allergen_updates = {
            # SMALL PLATES & SIDES
            "Chipotle Mayo": ["eggs", "mustard"],
            "Sour Cream": ["milk"],
            "Guacamole": [],
            "House Salsa - Mexicana": [],
            "House Salsa - Spicy Roasted Tomato": [],
            "House Salsa - El Diablo": [],
            "Fries": [],
            "Spicy Slaw": ["eggs", "mustard"],
            "Sweet Potato Fries": [],
            "Rice & Beans": [],
            "Black Bean & Avocado Salad": [],
            "Mexican Spiced Corn Ribs": ["gluten"],
            "Chicken Wings Al Pastor": ["gluten"],
            "Pimento de Padron": ["milk"],

            # TOSTADAS
            "Tostadas - Black Bean & Sweetcorn": ["gluten", "milk"],
            "Tostadas - Fiery Chicken & Avocado": ["gluten", "eggs"],
            "Tostadas - Fried Breaded King Prawns": ["gluten", "crustaceans", "eggs"],

            # TACOS
            "Tacos - Chicken Goujon": ["gluten", "eggs"],
            "Tacos - Pork Pibil": ["gluten"],
            "Tacos - Spiced Pulled Mushroom": ["gluten"],
            "Tacos - Grilled Steak": ["gluten", "milk"],

            # NACHOS & SHARING
            "Totopos with Trio of Dips": ["gluten"],
            "Macho Nachos - Black Bean & Sweetcorn": ["gluten", "milk"],
            "Macho Nachos - Chargrilled Chipotle Chicken": ["gluten", "milk"],
            "Macho Nachos - Beef, Chorizo & Chilli Con Carne": ["gluten", "milk"],

            # QUESADILLAS
            "Quesadillas - Pulled Mushroom": ["gluten", "milk"],
            "Quesadillas - Chilli": ["gluten", "milk"],
            "Quesadillas - Club": ["gluten", "milk"],
            "Quesadillas - Smoky Chipotle Chicken": ["gluten", "milk"],
            "Quesadillas - Prawn": ["gluten", "milk", "crustaceans"],

            # BURRITOS
            "Burrito - Pulled Mushroom": ["gluten"],
            "Burrito - Chipotle Marinated Chargrilled Chicken": ["gluten"],
            "Burrito - Spice Pulled Pork Pibil": ["gluten"],

            # ENCHILADAS
            "Enchiladas - Pulled Oyster Mushrooms": ["gluten", "milk"],
            "Enchiladas - Chipotle Marinated Chargrilled Chicken": ["gluten", "milk"],
            "Enchiladas - Marinated Grilled Steak": ["gluten", "milk"],

            # SALADS
            "Señora Salad - Chipotle Marinated Grilled Chicken": ["gluten"],
            "Señora Salad - Grilled Skirt Steak": ["gluten"],
            "Señora Salad - Fried Breaded King Prawns": ["gluten", "crustaceans", "eggs"],
            "Señora Salad - Pulled Mushrooms": ["gluten"],

            # OTHER MAINS
            "Baja Taco": ["gluten", "fish", "eggs"],
            "Chilli Cauldrons - Smoky Five Bean": ["gluten"],
            "Chilli Cauldrons - Beef & Chorizo": ["gluten"],
            "The Haburguesa": ["gluten", "milk", "eggs", "sesame"],

            # FAJITAS
            "Fajitas - Chipotle Marinated Chicken": ["gluten"],
            "Fajitas - Marinated Grilled Steak": ["gluten"],
            "Fajitas - Sautéed King Prawns": ["gluten", "crustaceans"],

            "La Hacienda Smoky BBQ Pork Ribs": ["gluten"],

            # DESSERTS
            "La Hacienda Bounty Bar": ["milk", "soybeans"],
            "Tres Leches Cheesecake": ["gluten", "milk", "eggs"],
            "Churros y Chocolate": ["gluten", "milk", "eggs"],

            # HOT DRINKS
            "Mexican Hot Chocolate": ["milk"],
            "Espresso": [],
            "Pot of Tea": [],
            "Herbal Teas": [],
            "Americano": [],
            "Cappuccino": ["milk"],
            "Latté": ["milk"],
            "Mocha": ["milk"],
        }

        # Update each item
        for item_name, allergens in allergen_updates.items():
            result = await db.execute(
                update(MenuItem)
                .where(MenuItem.name.ilike(f"%{item_name}%"))
                .values(allergens=allergens if allergens else [])
            )
            print(f"✓ {item_name}: {allergens if allergens else 'No allergens'}")

        await db.commit()
        print(f"\n✅ Updated allergen information for {len(allergen_updates)} items!")

if __name__ == "__main__":
    asyncio.run(update_allergens())
