import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

from app.database import engine, Base
from app.models.table import Table
from app.models.menu import Category, MenuItem, ItemModifier
from app.models.order import Order, OrderItem
from app.models.payment import PaymentSplit

async def init_db():
    """Create all database tables"""
    print("Creating database tables...")
    
    async with engine.begin() as conn:
        # Drop all tables (careful - this deletes data!)
        # await conn.run_sync(Base.metadata.drop_all)
        
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    print("✅ Database tables created successfully!")

if __name__ == "__main__":
    asyncio.run(init_db())
