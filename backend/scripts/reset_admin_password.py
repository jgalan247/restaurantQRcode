#!/usr/bin/env python3
"""
Script to reset admin password
Usage: python scripts/reset_admin_password.py <username> <new_password>
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import select

from app.config import get_settings
from app.models.admin import AdminUser
from app.utils.auth import get_password_hash


async def reset_password(username: str, new_password: str):
    """Reset admin user password"""
    settings = get_settings()

    # Create async engine
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        # Find admin user
        result = await session.execute(
            select(AdminUser).where(AdminUser.username == username)
        )
        admin = result.scalar_one_or_none()

        if not admin:
            print(f"❌ Admin user '{username}' not found!")
            return False

        # Update password
        admin.hashed_password = get_password_hash(new_password)
        await session.commit()

        print(f"✅ Password reset successfully for user: {username}")
        print(f"\nNew credentials:")
        print(f"  Username: {username}")
        print(f"  Password: {new_password}")
        print(f"\n⚠️  Please change this password after logging in!")

        return True

    await engine.dispose()


async def list_admins():
    """List all admin users"""
    settings = get_settings()

    # Create async engine
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        result = await session.execute(select(AdminUser))
        admins = result.scalars().all()

        if not admins:
            print("No admin users found in database.")
            return

        print("\n📋 Admin Users:")
        print("-" * 80)
        for admin in admins:
            status = "✅ Active" if admin.is_active else "❌ Inactive"
            print(f"ID: {admin.id:3d} | Username: {admin.username:20s} | Role: {admin.role:10s} | {status}")
        print("-" * 80)

    await engine.dispose()


def print_usage():
    """Print usage instructions"""
    print("\n🔧 Admin Password Reset Tool")
    print("=" * 80)
    print("\nUsage:")
    print("  python scripts/reset_admin_password.py <username> <new_password>")
    print("  python scripts/reset_admin_password.py --list")
    print("\nExamples:")
    print("  python scripts/reset_admin_password.py admin newpassword123")
    print("  python scripts/reset_admin_password.py --list")
    print()


if __name__ == "__main__":
    if len(sys.argv) == 2 and sys.argv[1] in ["--list", "-l"]:
        asyncio.run(list_admins())
    elif len(sys.argv) == 3:
        username = sys.argv[1]
        new_password = sys.argv[2]

        if len(new_password) < 6:
            print("❌ Error: Password must be at least 6 characters long")
            sys.exit(1)

        print(f"\n🔄 Resetting password for user: {username}")
        success = asyncio.run(reset_password(username, new_password))

        if not success:
            sys.exit(1)
    else:
        print_usage()
        sys.exit(1)
