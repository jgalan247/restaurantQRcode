import asyncio
import sys
from pathlib import Path
from decimal import Decimal

sys.path.append(str(Path(__file__).parent.parent))

from app.database import AsyncSessionLocal
from app.models.menu import Category, MenuItem

async def add_drinks_menu():
    """Add comprehensive cold drinks menu"""

    async with AsyncSessionLocal() as db:
        print("Adding Cold Drinks menu...\n")

        # Create Cold Drinks category
        cold_drinks_category = Category(
            name="Cold Drinks",
            description="Refreshing beverages, beers, wines and soft drinks",
            display_order=5,
            is_active=True
        )
        db.add(cold_drinks_category)
        await db.flush()

        # BEERS
        beers = [
            {
                "name": "Corona Extra",
                "description": "Mexican lager, light and refreshing",
                "price": Decimal("4.50"),
                "calories": 148,
                "dietary_tags": ["vg"],
                "allergens": ["gluten"]
            },
            {
                "name": "San Miguel",
                "description": "Crisp Spanish lager",
                "price": Decimal("4.50"),
                "calories": 144,
                "dietary_tags": ["vg"],
                "allergens": ["gluten"]
            },
            {
                "name": "Madri",
                "description": "Modern Spanish lager",
                "price": Decimal("4.75"),
                "calories": 138,
                "dietary_tags": ["vg"],
                "allergens": ["gluten"]
            },
            {
                "name": "Sol",
                "description": "Light Mexican lager",
                "price": Decimal("4.25"),
                "calories": 130,
                "dietary_tags": ["vg"],
                "allergens": ["gluten"]
            },
            {
                "name": "Desperados",
                "description": "Tequila-flavoured beer",
                "price": Decimal("5.25"),
                "calories": 165,
                "dietary_tags": ["vg"],
                "allergens": ["gluten"]
            },
            {
                "name": "Alcohol-Free Corona Cero",
                "description": "All the taste, 0.0% alcohol",
                "price": Decimal("3.95"),
                "calories": 68,
                "dietary_tags": ["vg"],
                "allergens": ["gluten"]
            },
        ]

        # CIDERS
        ciders = [
            {
                "name": "Rekorderlig Strawberry & Lime",
                "description": "Swedish fruit cider, 4.0% ABV",
                "price": Decimal("5.50"),
                "calories": 220,
                "dietary_tags": ["vg"],
                "allergens": ["sulphites"]
            },
            {
                "name": "Old Mout Pineapple & Raspberry",
                "description": "New Zealand fruit cider, 4.0% ABV",
                "price": Decimal("5.25"),
                "calories": 210,
                "dietary_tags": ["vg"],
                "allergens": ["sulphites"]
            },
            {
                "name": "Kopparberg Mixed Fruit",
                "description": "Swedish mixed fruit cider, 4.0% ABV",
                "price": Decimal("5.25"),
                "calories": 215,
                "dietary_tags": ["vg"],
                "allergens": ["sulphites"]
            },
        ]

        # WINES
        wines = [
            {
                "name": "Red - Rioja Reserva 2019",
                "description": "Full-bodied Spanish red | Pairs perfectly with: Grilled steaks, beef & chorizo dishes, BBQ ribs, rich meat-based enchiladas | Tasting notes: Oak, vanilla, red berries, smooth tannins | Serve at 16-18°C",
                "price": Decimal("28.00"),
                "calories": 625,  # per bottle
                "dietary_tags": ["vg"],
                "allergens": ["sulphites"]
            },
            {
                "name": "White - Pinot Grigio",
                "description": "Crisp Italian white | Pairs perfectly with: Fish tacos, prawn dishes, light salads, quesadillas | Tasting notes: Citrus, green apple, mineral, refreshing acidity | Serve at 8-10°C",
                "price": Decimal("24.00"),
                "calories": 600,  # per bottle
                "dietary_tags": ["vg"],
                "allergens": ["sulphites"]
            },
            {
                "name": "Rosé - Provence Rosé",
                "description": "Elegant French rosé | Pairs perfectly with: Chicken dishes, vegetarian options, nachos, lighter mains | Tasting notes: Strawberry, peach, floral, crisp finish | Serve at 10-12°C",
                "price": Decimal("26.00"),
                "calories": 615,  # per bottle
                "dietary_tags": ["vg"],
                "allergens": ["sulphites"]
            },
            {
                "name": "Sparkling - Prosecco DOC",
                "description": "Italian sparkling wine | Pairs perfectly with: Appetizers, tostadas, light starters, celebrations! | Tasting notes: Pear, apple, floral, fine bubbles | Serve at 6-8°C",
                "price": Decimal("25.00"),
                "calories": 570,  # per bottle
                "dietary_tags": ["vg"],
                "allergens": ["sulphites"]
            },
        ]

        # SOFT DRINKS
        soft_drinks = [
            {
                "name": "Coca-Cola",
                "description": "330ml bottle",
                "price": Decimal("2.95"),
                "calories": 139,
                "dietary_tags": ["vg"],
                "allergens": []
            },
            {
                "name": "Diet Coke",
                "description": "330ml bottle",
                "price": Decimal("2.95"),
                "calories": 1,
                "dietary_tags": ["vg"],
                "allergens": []
            },
            {
                "name": "Sprite",
                "description": "330ml bottle",
                "price": Decimal("2.95"),
                "calories": 142,
                "dietary_tags": ["vg"],
                "allergens": []
            },
            {
                "name": "Fanta Orange",
                "description": "330ml bottle",
                "price": Decimal("2.95"),
                "calories": 138,
                "dietary_tags": ["vg"],
                "allergens": []
            },
            {
                "name": "Fresh Orange Juice",
                "description": "Freshly squeezed",
                "price": Decimal("3.95"),
                "calories": 110,
                "dietary_tags": ["vg"],
                "allergens": []
            },
            {
                "name": "Still Water",
                "description": "500ml bottle",
                "price": Decimal("2.50"),
                "calories": 0,
                "dietary_tags": ["vg"],
                "allergens": []
            },
            {
                "name": "Sparkling Water",
                "description": "500ml bottle",
                "price": Decimal("2.50"),
                "calories": 0,
                "dietary_tags": ["vg"],
                "allergens": []
            },
        ]

        # Add all drinks
        all_drinks = beers + ciders + wines + soft_drinks

        for drink_data in all_drinks:
            drink = MenuItem(
                category_id=cold_drinks_category.id,
                **drink_data,
                is_available=True
            )
            db.add(drink)
            print(f"✓ Added: {drink_data['name']} - £{drink_data['price']} ({drink_data['calories']} cal)")

        await db.commit()
        print(f"\n✅ Added {len(all_drinks)} cold drinks to menu!")

if __name__ == "__main__":
    asyncio.run(add_drinks_menu())
