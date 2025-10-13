import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.menu import MenuItem

async def verify_calories():
    """Check which items are missing calorie information"""

    async with AsyncSessionLocal() as db:
        result = await db.execute(select(MenuItem))
        items = result.scalars().all()

        missing_calories = []
        has_calories = []

        for item in items:
            if item.calories is None or item.calories == 0:
                missing_calories.append(item.name)
            else:
                has_calories.append(f"{item.name}: {item.calories} cal")

        print(f"✅ Items WITH calories: {len(has_calories)}")
        for item in has_calories[:15]:  # Show first 15
            print(f"   {item}")
        if len(has_calories) > 15:
            print(f"   ... and {len(has_calories) - 15} more")

        if missing_calories:
            print(f"\n❌ Items MISSING calories: {len(missing_calories)}")
            for item in missing_calories[:20]:
                print(f"   {item}")
            if len(missing_calories) > 20:
                print(f"   ... and {len(missing_calories) - 20} more")
        else:
            print(f"\n✅ All items have calorie information!")

if __name__ == "__main__":
    asyncio.run(verify_calories())
