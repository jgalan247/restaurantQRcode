import asyncio
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.database import AsyncSessionLocal

async def create_budget_builder_tables():
    """Create tables for Budget Builder feature"""

    async with AsyncSessionLocal() as db:
        print("Creating Budget Builder tables...\n")

        # Create chef_combos table
        await db.execute(text("""
            CREATE TABLE IF NOT EXISTS chef_combos (
                id SERIAL PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                description TEXT,
                price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
                image_url TEXT,
                is_active BOOLEAN DEFAULT TRUE,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        print("✓ Created chef_combos table")

        # Create chef_combo_items table
        await db.execute(text("""
            CREATE TABLE IF NOT EXISTS chef_combo_items (
                id SERIAL PRIMARY KEY,
                combo_id INTEGER NOT NULL REFERENCES chef_combos(id) ON DELETE CASCADE,
                menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
                quantity INTEGER DEFAULT 1,
                CONSTRAINT fk_combo FOREIGN KEY (combo_id) REFERENCES chef_combos(id) ON DELETE CASCADE,
                CONSTRAINT fk_menu_item FOREIGN KEY (menu_item_id) REFERENCES menu_items(id) ON DELETE CASCADE
            )
        """))
        print("✓ Created chef_combo_items table")

        # Create indexes
        await db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_chef_combo_items_combo_id ON chef_combo_items(combo_id);
        """))
        await db.execute(text("""
            CREATE INDEX IF NOT EXISTS idx_chef_combo_items_menu_item_id ON chef_combo_items(menu_item_id);
        """))
        print("✓ Created indexes")

        # Create budget_builder_logs table
        await db.execute(text("""
            CREATE TABLE IF NOT EXISTS budget_builder_logs (
                id SERIAL PRIMARY KEY,
                budget_amount NUMERIC(10, 2) NOT NULL,
                dietary_preferences TEXT[],
                meal_preferences TEXT[],
                combo_selected INTEGER,
                upgrade_accepted BOOLEAN DEFAULT FALSE,
                upgrade_amount NUMERIC(10, 2),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        print("✓ Created budget_builder_logs table")

        await db.commit()
        print("\n✅ Budget Builder tables created successfully!")

if __name__ == "__main__":
    asyncio.run(create_budget_builder_tables())
