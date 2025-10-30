"""
Seed all promotional data: Specials, Offers, and Chef Combos
Run this script to populate your database with sample promotional data
"""
import asyncio
import sys
from pathlib import Path
from decimal import Decimal
from datetime import datetime, timedelta

sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.special import Special, SpecialItem
from app.models.offer import Offer
from app.models.menu import ChefCombo, ChefComboItem, MenuItem


async def get_item_by_name(db, name_substr):
    """Helper to find menu item by partial name match"""
    result = await db.execute(
        select(MenuItem).where(MenuItem.name.ilike(f"%{name_substr}%"))
    )
    return result.scalars().first()


async def seed_specials(db):
    """Seed Daily Specials / Menu of the Day"""
    print("📋 Seeding Daily Specials...\n")

    today = datetime.now().date()

    specials_data = [
        {
            "name": "Taco Tuesday Special",
            "description": "Three authentic street tacos with your choice of filling, served with rice, beans, and a drink. Available every Tuesday!",
            "price": Decimal("15.99"),
            "is_active": True,
            "start_date": today,
            "end_date": today + timedelta(days=30),
            "display_order": 1,
            "items": [
                {"search": "taco", "quantity": 3, "is_custom": False},
                {"search": "rice", "quantity": 1, "is_custom": False},
                {"search": "bean", "quantity": 1, "is_custom": False},
                {"search": "coca", "quantity": 1, "is_custom": False},
            ]
        },
        {
            "name": "Weekend Brunch Fiesta",
            "description": "Bottomless brunch! Huevos Rancheros, unlimited mimosas, churros, and fresh fruit. Saturdays & Sundays 10AM-2PM.",
            "price": Decimal("25.00"),
            "is_active": True,
            "start_date": today,
            "end_date": today + timedelta(days=60),
            "display_order": 2,
            "items": [
                {
                    "is_custom": True,
                    "custom_name": "Huevos Rancheros",
                    "custom_description": "Two fried eggs on corn tortillas with ranchero sauce, refried beans, and avocado",
                    "quantity": 1
                },
                {
                    "is_custom": True,
                    "custom_name": "Unlimited Mimosas",
                    "custom_description": "Fresh orange juice and prosecco",
                    "quantity": 1
                },
                {"search": "churros", "quantity": 1, "is_custom": False},
                {
                    "is_custom": True,
                    "custom_name": "Fresh Fruit Platter",
                    "custom_description": "Seasonal fresh fruit selection",
                    "quantity": 1
                },
            ]
        },
        {
            "name": "Enchilada Evening",
            "description": "Three cheese enchiladas smothered in mole sauce, served with Mexican rice, refried beans, sour cream, and house margarita.",
            "price": Decimal("18.50"),
            "is_active": True,
            "start_date": today,
            "end_date": today + timedelta(days=30),
            "display_order": 3,
            "items": [
                {
                    "is_custom": True,
                    "custom_name": "Cheese Enchiladas",
                    "custom_description": "Corn tortillas filled with queso fresco and covered in mole sauce",
                    "quantity": 3
                },
                {
                    "is_custom": True,
                    "custom_name": "Mexican Rice",
                    "custom_description": "Traditional Spanish-style rice",
                    "quantity": 1
                },
                {
                    "is_custom": True,
                    "custom_name": "Refried Beans",
                    "custom_description": "Smooth pinto beans topped with queso",
                    "quantity": 1
                },
                {"search": "margarita", "quantity": 1, "is_custom": False},
            ]
        },
    ]

    for special_data in specials_data:
        items = special_data.pop("items")

        special = Special(**special_data)
        db.add(special)
        await db.flush()  # Get special ID

        print(f"✓ Created special: {special.name} (£{special.price})")

        for idx, item_data in enumerate(items):
            if item_data["is_custom"]:
                special_item = SpecialItem(
                    special_id=special.id,
                    quantity=item_data["quantity"],
                    display_order=idx + 1,
                    is_custom=True,
                    custom_item_name=item_data["custom_name"],
                    custom_item_description=item_data.get("custom_description"),
                    custom_item_category="Specials"
                )
                db.add(special_item)
                print(f"  → Added {item_data['quantity']}x {item_data['custom_name']} (custom)")
            else:
                menu_item = await get_item_by_name(db, item_data["search"])
                if menu_item:
                    special_item = SpecialItem(
                        special_id=special.id,
                        menu_item_id=menu_item.id,
                        quantity=item_data["quantity"],
                        display_order=idx + 1,
                        is_custom=False
                    )
                    db.add(special_item)
                    print(f"  → Added {item_data['quantity']}x {menu_item.name}")
                else:
                    print(f"  ⚠ Warning: Could not find item matching '{item_data['search']}'")

        print()

    await db.commit()
    print("✅ Specials seeded successfully!\n")


async def seed_offers(db):
    """Seed Promotional Offers"""
    print("🎁 Seeding Promotional Offers...\n")

    today = datetime.now().date()

    offers_data = [
        {
            "name": "Happy Hour - 50% Off Drinks",
            "description": "Half price on all beers, wines, and cocktails! Weekdays 4PM-6PM only.",
            "discount_type": "percentage",
            "discount_value": Decimal("50.00"),
            "minimum_spend": Decimal("0.00"),
            "applicable_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
            "applicable_times_start": "16:00",
            "applicable_times_end": "18:00",
            "start_date": today,
            "end_date": today + timedelta(days=90),
            "is_active": True,
            "is_featured": True,
        },
        {
            "name": "Student Special - 20% Off",
            "description": "Show your student ID and get 20% off your entire order. Valid every day!",
            "discount_type": "percentage",
            "discount_value": Decimal("20.00"),
            "minimum_spend": Decimal("15.00"),
            "applicable_days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
            "start_date": today,
            "end_date": today + timedelta(days=180),
            "is_active": True,
            "is_featured": False,
        },
        {
            "name": "Birthday Fiesta - Free Dessert",
            "description": "Celebrating your birthday? Get a free dessert on us! Show ID for proof of birthday within 7 days.",
            "discount_type": "free_item",
            "discount_value": Decimal("0.00"),
            "minimum_spend": Decimal("20.00"),
            "applicable_days": ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"],
            "start_date": today,
            "end_date": today + timedelta(days=365),
            "is_active": True,
            "is_featured": True,
        },
        {
            "name": "Family Sunday - £10 Off",
            "description": "Bring the whole family! Get £10 off orders over £50 every Sunday.",
            "discount_type": "fixed",
            "discount_value": Decimal("10.00"),
            "minimum_spend": Decimal("50.00"),
            "applicable_days": ["sunday"],
            "start_date": today,
            "end_date": today + timedelta(days=90),
            "is_active": True,
            "is_featured": True,
        },
        {
            "name": "Lunch Express - 15% Off",
            "description": "Quick lunch? Get 15% off all orders between 12PM-3PM on weekdays.",
            "discount_type": "percentage",
            "discount_value": Decimal("15.00"),
            "minimum_spend": Decimal("10.00"),
            "applicable_days": ["monday", "tuesday", "wednesday", "thursday", "friday"],
            "applicable_times_start": "12:00",
            "applicable_times_end": "15:00",
            "start_date": today,
            "end_date": today + timedelta(days=60),
            "is_active": True,
            "is_featured": False,
        },
    ]

    for offer_data in offers_data:
        offer = Offer(**offer_data)
        db.add(offer)
        print(f"✓ Created offer: {offer.name} ({offer.discount_type}: {offer.discount_value})")

    await db.commit()
    print("\n✅ Offers seeded successfully!\n")


async def seed_chef_combos(db):
    """Seed Chef's Recommendations"""
    print("👨‍🍳 Seeding Chef's Combos...\n")

    combos_data = [
        {
            "name": "Quick Lunch",
            "description": "Perfect for a quick midday bite. Includes nachos, quesadilla, and a refreshing drink.",
            "price": Decimal("20.00"),
            "display_order": 1,
            "items": [
                ("nacho", 1),
                ("quesadilla", 1),
                ("coca", 1),
            ]
        },
        {
            "name": "Date Night",
            "description": "Romantic dinner for two. Share nachos, enjoy quesadillas, finish with churros and wine.",
            "price": Decimal("50.00"),
            "display_order": 2,
            "items": [
                ("nacho", 1),
                ("quesadilla", 2),
                ("churros", 1),
                ("rioja", 1),
            ]
        },
        {
            "name": "Full Experience",
            "description": "The complete La Hacienda experience. Nachos, quesadilla, guacamole, churros, and a Corona.",
            "price": Decimal("40.00"),
            "display_order": 3,
            "items": [
                ("nacho", 1),
                ("quesadilla", 1),
                ("guacamole", 1),
                ("churros", 1),
                ("corona", 1),
            ]
        },
        {
            "name": "Family Feast",
            "description": "Feed the whole family! Multiple mains, sides to share, and drinks for everyone.",
            "price": Decimal("80.00"),
            "display_order": 4,
            "items": [
                ("nacho", 2),
                ("quesadilla", 3),
                ("guacamole", 2),
                ("churros", 2),
                ("coca", 4),
            ]
        },
        {
            "name": "Solo Treat",
            "description": "Treat yourself! A well-balanced meal with quesadilla, guacamole, churros, and a Sprite.",
            "price": Decimal("30.00"),
            "display_order": 5,
            "items": [
                ("quesadilla", 1),
                ("guacamole", 1),
                ("churros", 1),
                ("sprite", 1),
            ]
        }
    ]

    for combo_data in combos_data:
        items = combo_data.pop("items")

        combo = ChefCombo(**combo_data)
        db.add(combo)
        await db.flush()  # Get combo ID

        print(f"✓ Created combo: {combo.name} (£{combo.price})")

        for item_search, quantity in items:
            menu_item = await get_item_by_name(db, item_search)
            if menu_item:
                combo_item = ChefComboItem(
                    combo_id=combo.id,
                    menu_item_id=menu_item.id,
                    quantity=quantity
                )
                db.add(combo_item)
                print(f"  → Added {quantity}x {menu_item.name}")
            else:
                print(f"  ⚠ Warning: Could not find item matching '{item_search}'")

        print()

    await db.commit()
    print("✅ Chef's Combos seeded successfully!\n")


async def main():
    """Main seeding function"""
    print("\n" + "="*60)
    print("🌮 LA HACIENDA - PROMOTIONAL DATA SEEDING")
    print("="*60 + "\n")

    async with AsyncSessionLocal() as db:
        try:
            # Seed all promotional data
            await seed_specials(db)
            await seed_offers(db)
            await seed_chef_combos(db)

            # Verification
            print("\n" + "="*60)
            print("📊 VERIFICATION")
            print("="*60 + "\n")

            from sqlalchemy import func

            specials_count = await db.execute(select(func.count()).select_from(Special))
            offers_count = await db.execute(select(func.count()).select_from(Offer))
            combos_count = await db.execute(select(func.count()).select_from(ChefCombo))

            print(f"✓ Total Specials: {specials_count.scalar()}")
            print(f"✓ Total Offers: {offers_count.scalar()}")
            print(f"✓ Total Chef Combos: {combos_count.scalar()}")

            print("\n" + "="*60)
            print("🎉 ALL PROMOTIONAL DATA SEEDED SUCCESSFULLY!")
            print("="*60)
            print("\n👉 Visit your menu page to see the promotions in action!")
            print("   - Daily Specials will appear at the top")
            print("   - Featured Offers will show in a carousel")
            print("   - Chef's Combos appear in the Budget Builder\n")

        except Exception as e:
            print(f"\n❌ Error seeding data: {e}")
            import traceback
            traceback.print_exc()
            await db.rollback()


if __name__ == "__main__":
    asyncio.run(main())
