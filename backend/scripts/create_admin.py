#!/usr/bin/env python3
"""
Script to create an initial admin user for the restaurant system.
Run this after setting up the database to create your first admin account.
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker

from app.config import get_settings
from app.models.admin import AdminUser
from app.utils.auth import get_password_hash


async def create_initial_admin():
    """Create initial admin user"""
    settings = get_settings()

    # Create async engine
    engine = create_async_engine(settings.DATABASE_URL, echo=True)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Check if admin already exists
        from sqlalchemy import select
        result = await session.execute(
            select(AdminUser).where(AdminUser.username == "admin")
        )
        existing_admin = result.scalar_one_or_none()

        if existing_admin:
            print("❌ Admin user 'admin' already exists!")
            return

        # Create admin user
        admin = AdminUser(
            username="admin",
            email="admin@lahacienda.co.uk",
            hashed_password=get_password_hash("admin123"),  # Change this password!
            full_name="System Administrator",
            role="admin",
            is_active=True
        )

        session.add(admin)
        await session.commit()

        print("✅ Admin user created successfully!")
        print("\nLogin credentials:")
        print("  Username: admin")
        print("  Password: admin123")
        print("\n⚠️  IMPORTANT: Please change this password after first login!")

    await engine.dispose()


if __name__ == "__main__":
    print("Creating initial admin user...")
    asyncio.run(create_initial_admin())
