import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.database import engine
from sqlalchemy import text

async def add_filter_columns():
    """Add filter-related columns to menu_items table"""
    print("Adding filter columns to menu_items table...")

    async with engine.begin() as conn:
        # Add columns if they don't exist
        await conn.execute(text("""
            ALTER TABLE menu_items
            ADD COLUMN IF NOT EXISTS spice_level VARCHAR(20),
            ADD COLUMN IF NOT EXISTS is_lite_bite BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS is_child_friendly BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS is_salad BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS is_deal BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS is_gluten_free BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS calories INTEGER,
            ADD COLUMN IF NOT EXISTS allergens VARCHAR(50)[]
        """))

    print("✅ Filter columns added successfully!")

if __name__ == "__main__":
    asyncio.run(add_filter_columns())
