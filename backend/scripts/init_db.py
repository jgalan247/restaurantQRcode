"""
Database initialization script
Creates all tables in the database
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import engine, Base
from app.models import *  # Import all models


async def init_db():
    """Initialize database by creating all tables"""
    print("Creating database tables...")

    async with engine.begin() as conn:
        # Drop all tables (use with caution!)
        # await conn.run_sync(Base.metadata.drop_all)

        # Create all tables
        await conn.run_sync(Base.metadata.create_all)

    print("✅ Database tables created successfully!")
    await engine.dispose()


if __name__ == "__main__":
    asyncio.run(init_db())
