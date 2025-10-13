import asyncio
import sys
from pathlib import Path
from decimal import Decimal

sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal
from app.models.menu import Category, MenuItem, ItemModifier

def classify_menu_item(name: str, description: str, price: float, dietary_tags: list) -> dict:
    """Classify menu items with filter properties"""
    name_lower = name.lower()
    desc_lower = description.lower() if description else ""

    # Default classification
    classification = {
        "spice_level": None,
        "is_lite_bite": False,
        "is_child_friendly": False,
        "is_salad": False,
        "is_deal": False,
        "is_gluten_free": False,
        "calories": None,
        "allergens": []
    }

    # Spice level classification
    if any(word in name_lower or word in desc_lower for word in ["el diablo", "extra hot", "culo calliente", "hot ass", "habanero"]):
        classification["spice_level"] = "extra-hot"
    elif any(word in name_lower or word in desc_lower for word in ["spicy", "fiery", "hot", "chipotle", "jalapeño"]):
        classification["spice_level"] = "hot"
    elif any(word in name_lower or word in desc_lower for word in ["chilli", "spiced"]):
        classification["spice_level"] = "medium"
    elif any(word in name_lower or word in desc_lower for word in ["mild"]):
        classification["spice_level"] = "mild"

    # Lite bite classification (small plates, under £10)
    if price < 10 or any(word in name_lower for word in ["salsa", "mayo", "sour cream", "guacamole", "fries"]):
        classification["is_lite_bite"] = True

    # Child-friendly items (simple, mild items)
    if any(word in name_lower for word in ["quesadilla", "fries", "chicken goujon", "sweet potato"]) and \
       classification["spice_level"] not in ["hot", "extra-hot"]:
        classification["is_child_friendly"] = True

    # Salad classification
    if "salad" in name_lower or "señora salad" in name_lower:
        classification["is_salad"] = True

    # Gluten-free potential (items that could easily be GF)
    if "vg" in dietary_tags or "v" in dietary_tags:
        if any(word in name_lower for word in ["salad", "salsa", "guacamole", "rice", "beans"]):
            classification["is_gluten_free"] = True

    # Common allergens
    if any(word in name_lower or word in desc_lower for word in ["prawn", "prawns", "fish", "cod"]):
        classification["allergens"].append("shellfish")
    if any(word in name_lower or word in desc_lower for word in ["cheese", "cream", "milk", "mozzarella", "feta", "cheddar"]):
        classification["allergens"].append("dairy")
    if any(word in name_lower or word in desc_lower for word in ["peanut", "nuts", "pumpkin seeds"]):
        classification["allergens"].append("nuts")

    return classification

async def import_menu():
    """Import La Hacienda menu from PDF data"""
    
    async with AsyncSessionLocal() as db:
        print("Importing La Hacienda menu...")
        
        # Get categories
        from sqlalchemy import select
        result = await db.execute(select(Category))
        categories = {cat.name: cat for cat in result.scalars().all()}
        
        # Small Plates & Sides
        small_plates_items = [
            {"name": "Chipotle Mayo", "price": 2.50, "description": "", "dietary_tags": []},
            {"name": "Sour Cream", "price": 2.50, "description": "", "dietary_tags": ["v"]},
            {"name": "Guacamole", "price": 2.95, "description": "", "dietary_tags": ["vg"]},
            {"name": "House Salsa - Mexicana", "price": 3.50, "description": "Tomato, red onion, coriander, lime", "dietary_tags": ["vg"]},
            {"name": "House Salsa - Spicy Roasted Tomato", "price": 3.50, "description": "Salsa de la Piña - Roasted pineapple, tomato, red onion, lime, habanero chilli", "dietary_tags": ["vg"]},
            {"name": "House Salsa - El Diablo", "price": 3.50, "description": "Extra hot for massive show offs", "dietary_tags": ["vg"]},
            {"name": "Fries", "price": 4.95, "description": "", "dietary_tags": []},
            {"name": "Spicy Slaw", "price": 5.25, "description": "Fresh crunchy slaw in our chipotle dressing, radish, mint, pumpkin seeds", "dietary_tags": ["v"]},
            {"name": "Sweet Potato Fries", "price": 5.50, "description": "", "dietary_tags": []},
            {"name": "Rice & Beans", "price": 5.50, "description": "Green rice mixed with onion, garlic, coriander, spinach, frijoles", "dietary_tags": ["vg"]},
            {"name": "Black Bean & Avocado Salad", "price": 5.45, "description": "Mixed leaves tossed with Hass avocado, finished with a drizzle of our black bean & sweetcorn salsa", "dietary_tags": ["v"]},
            {"name": "Mexican Spiced Corn Ribs", "price": 8.95, "description": "Fried corn ribs in spicy Mexican salt", "dietary_tags": []},
            {"name": "Chicken Wings Al Pastor", "price": 9.50, "description": "Spicy chicken wings", "dietary_tags": []},
            {"name": "Pimento de Padron", "price": 9.50, "description": "Sautéed Chorizo & Padrón peppers with Mexican crema", "dietary_tags": []},
        ]
        
        # Mains
        mains_items = [
            {"name": "Tostadas - Black Bean & Sweetcorn (x3)", "price": 10.50, "description": "Black bean & sweetcorn salsa on a bed of slaw, feta cheese", "dietary_tags": ["v"]},
            {"name": "Tostadas - Fiery Chicken & Avocado (x3)", "price": 11.50, "description": "Chicken in a smoky chipotle mayo on a bed of crisp shredded lettuce with a topping of avocado", "dietary_tags": []},
            {"name": "Tostadas - Fried Breaded King Prawns (x3)", "price": 12.50, "description": "Guacamole, lime, salsa de la piña", "dietary_tags": []},
            {"name": "Tacos - Chicken Goujon (x3)", "price": 11.50, "description": "Baby gem, salsa Mexicana, chipotle mayo", "dietary_tags": []},
            {"name": "Tacos - Pork Pibil (x3)", "price": 11.95, "description": "Spiced pulled slow cooked pork, guacamole, fiery pink pickled onions", "dietary_tags": []},
            {"name": "Tacos - Spiced Pulled Mushroom (x3)", "price": 11.95, "description": "Pulled oyster mushrooms, pickled onion, salsa Mexicana, fresh chilli", "dietary_tags": ["vg"]},
            {"name": "Tacos - Grilled Steak (x3)", "price": 12.95, "description": "Flash grilled skirt steak with chipotle salsa, grilled cheese, fresh onion", "dietary_tags": []},
            {"name": "Totopos with Trio of Dips", "price": 11.95, "description": "Homemade cooked tortilla chips sprinkled with sea salt. Choice of: Salsa Mexicana, Guacamole, Salsa de la Piña, Salsa El Diablo", "dietary_tags": []},
            {"name": "Macho Nachos - Black Bean & Sweetcorn", "price": 12.95, "description": "Corn tortillas layered & topped with melted Cheddar, roasted peppers", "dietary_tags": ["v"]},
            {"name": "Macho Nachos - Chargrilled Chipotle Chicken", "price": 15.95, "description": "Corn tortillas layered & topped with melted Cheddar, roasted peppers", "dietary_tags": []},
            {"name": "Macho Nachos - Beef, Chorizo & Chilli Con Carne", "price": 16.95, "description": "Corn tortillas layered & topped with melted Cheddar, roasted peppers", "dietary_tags": []},
            {"name": "Quesadillas - Pulled Mushroom", "price": 14.50, "description": "Oyster mushroom mix, garlic & Mexican oregano, crumbled Feta cheese", "dietary_tags": ["v"]},
            {"name": "Quesadillas - Chilli", "price": 14.50, "description": "Sweet sautéed red onion, jalapeño chilli, Feta cheese", "dietary_tags": ["v"]},
            {"name": "Quesadillas - Club", "price": 16.50, "description": "Chipotle chicken, pancetta, avocado, served with a side of house salsa", "dietary_tags": []},
            {"name": "Quesadillas - Smoky Chipotle Chicken", "price": 15.50, "description": "Chargrilled chicken in a smoky chipotle tomato sauce", "dietary_tags": []},
            {"name": "Quesadillas - Prawn", "price": 16.50, "description": "Mildly spiced sautéed prawns in olive oil, garlic, onions, peppers", "dietary_tags": []},
            {"name": "Burrito - Pulled Mushroom", "price": 14.50, "description": "Large floured tortilla, black beans, green rice, shredded cabbage, avocado dressing. Fresh salsa, guacamole", "dietary_tags": []},
            {"name": "Burrito - Chipotle Marinated Chargrilled Chicken", "price": 16.50, "description": "Large floured tortilla, black beans, green rice, shredded cabbage, avocado dressing", "dietary_tags": []},
            {"name": "Burrito - Spice Pulled Pork Pibil", "price": 15.50, "description": "Large floured tortilla, black beans, green rice, shredded cabbage, avocado dressing", "dietary_tags": []},
            {"name": "Enchiladas - Pulled Oyster Mushrooms", "price": 15.95, "description": "Large Flour tortilla with your filling, green rice & frijoles bathed in a gently spiced tomato sauce, grilled cheese", "dietary_tags": []},
            {"name": "Enchiladas - Chipotle Marinated Chargrilled Chicken", "price": 16.50, "description": "Large Flour tortilla with your filling, green rice & frijoles bathed in a gently spiced tomato sauce, grilled cheese", "dietary_tags": []},
            {"name": "Enchiladas - Marinated Grilled Steak", "price": 17.50, "description": "Large Flour tortilla with your filling, green rice & frijoles bathed in a gently spiced tomato sauce, grilled cheese", "dietary_tags": []},
            {"name": "Señora Salad - Chipotle Marinated Grilled Chicken", "price": 16.25, "description": "Salad leaves, avocado, pumpkin seeds, beans & cos lettuce tossed in a light chipotle dressing in a crispy tortilla bowl", "dietary_tags": []},
            {"name": "Señora Salad - Grilled Skirt Steak", "price": 17.50, "description": "Salad leaves, avocado, pumpkin seeds, beans & cos lettuce tossed in a light chipotle dressing in a crispy tortilla bowl", "dietary_tags": []},
            {"name": "Señora Salad - Fried Breaded King Prawns", "price": 16.50, "description": "Salad leaves, avocado, pumpkin seeds, beans & cos lettuce tossed in a light chipotle dressing in a crispy tortilla bowl", "dietary_tags": []},
            {"name": "Señora Salad - Pulled Mushrooms", "price": 15.95, "description": "Salad leaves, avocado, pumpkin seeds, beans & cos lettuce tossed in a light chipotle dressing in a crispy tortilla bowl", "dietary_tags": []},
            {"name": "Baja Taco", "price": 16.50, "description": "Beach shack style breaded cod tacos with shredded slaw, chipotle mayo, pickled cucumber, regular fries", "dietary_tags": []},
            {"name": "Chilli Cauldrons - Smoky Five Bean", "price": 16.95, "description": "Hearty chilli served with sour cream, green rice, crisp floured tortilla chips. Choose Fresca or Culo Calliente (hot ass!)", "dietary_tags": []},
            {"name": "Chilli Cauldrons - Beef & Chorizo", "price": 17.95, "description": "Hearty chilli served with sour cream, green rice, crisp floured tortilla chips. Choose Fresca or Culo Calliente (hot ass!)", "dietary_tags": []},
            {"name": "The Haburguesa", "price": 16.95, "description": "Homemade burger with a Mexican twist, melting mozzarella, house mayo, beef tomato & crunchy cos lettuce in a toasted brioche bun with French fries", "dietary_tags": []},
            {"name": "Fajitas - Chipotle Marinated Chicken", "price": 17.50, "description": "Stir fried mixed peppers & onions", "dietary_tags": []},
            {"name": "Fajitas - Marinated Grilled Steak", "price": 18.50, "description": "Stir fried mixed peppers & onions", "dietary_tags": []},
            {"name": "Fajitas - Sautéed King Prawns", "price": 19.50, "description": "Stir fried mixed peppers & onions", "dietary_tags": []},
            {"name": "La Hacienda Smoky BBQ Pork Ribs", "price": 17.95, "description": "Marinated in our smoky BBQ sauce, side salad, sweet potato or regular fries", "dietary_tags": []},
        ]
        
        # Desserts
        desserts_items = [
            {"name": "La Hacienda Bounty Bar", "price": 9.50, "description": "Coconut infused with a hint of red chilli, coated in chocolate, lime zest", "dietary_tags": []},
            {"name": "Tres Leches Cheesecake", "price": 9.50, "description": "Swirls of dulce de leche & traditional cheese cake", "dietary_tags": []},
            {"name": "Churros y Chocolate", "price": 9.50, "description": "La Hacienda doughnuts with an intense dark chocolate sauce", "dietary_tags": []},
        ]
        
        # Hot Drinks
        drinks_items = [
            {"name": "Mexican Hot Chocolate", "price": 4.25, "description": "Mildly spiced thick hot chocolate homemade with a mix of dark & milk chocolate", "dietary_tags": []},
            {"name": "Espresso", "price": 3.50, "description": "", "dietary_tags": []},
            {"name": "Pot of Tea", "price": 3.75, "description": "", "dietary_tags": []},
            {"name": "Herbal Teas", "price": 3.50, "description": "Ask for flavours", "dietary_tags": []},
            {"name": "Americano", "price": 3.75, "description": "", "dietary_tags": []},
            {"name": "Cappuccino", "price": 3.75, "description": "", "dietary_tags": []},
            {"name": "Latté", "price": 3.95, "description": "", "dietary_tags": []},
            {"name": "Mocha", "price": 4.25, "description": "", "dietary_tags": []},
        ]
        
        # Import items
        menu_data = {
            "Small Plates & Sides": small_plates_items,
            "Mains": mains_items,
            "Desserts": desserts_items,
            "Hot Drinks": drinks_items
        }
        
        for category_name, items in menu_data.items():
            category = categories[category_name]
            print(f"\nImporting {category_name}...")

            for item_data in items:
                # Get classification for this item
                classification = classify_menu_item(
                    item_data["name"],
                    item_data["description"],
                    item_data["price"],
                    item_data["dietary_tags"]
                )

                menu_item = MenuItem(
                    category_id=category.id,
                    name=item_data["name"],
                    description=item_data["description"],
                    price=Decimal(str(item_data["price"])),
                    dietary_tags=item_data["dietary_tags"],
                    is_available=True,
                    spice_level=classification["spice_level"],
                    is_lite_bite=classification["is_lite_bite"],
                    is_child_friendly=classification["is_child_friendly"],
                    is_salad=classification["is_salad"],
                    is_deal=classification["is_deal"],
                    is_gluten_free=classification["is_gluten_free"],
                    calories=classification["calories"],
                    allergens=classification["allergens"]
                )
                db.add(menu_item)
                spice_indicator = f" ({classification['spice_level']})" if classification['spice_level'] else ""
                print(f"  ✓ {item_data['name']} - £{item_data['price']}{spice_indicator}")
        
        await db.commit()
        print("\n✅ Menu imported successfully!")

if __name__ == "__main__":
    asyncio.run(import_menu())
