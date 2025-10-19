"""
Create an admin user
Run this script to create a new admin user in the database
"""
import asyncio
import sys
from pathlib import Path
from getpass import getpass

sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models.admin import AdminUser
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


async def create_admin():
    """Create a new admin user"""
    print("\n" + "="*60)
    print("🔐 CREATE ADMIN USER")
    print("="*60 + "\n")

    # Get user input
    print("Enter admin details:")
    username = input("Username: ").strip()
    email = input("Email: ").strip()
    full_name = input("Full Name: ").strip()

    print("\nPassword requirements:")
    print("  - Minimum 8 characters")
    print("  - Recommended: Mix of letters, numbers, symbols\n")

    password = getpass("Password: ")
    password_confirm = getpass("Confirm Password: ")

    # Validate inputs
    if not username or not email or not password:
        print("\n❌ Error: All fields are required!")
        return

    if password != password_confirm:
        print("\n❌ Error: Passwords don't match!")
        return

    if len(password) < 8:
        print("\n❌ Error: Password must be at least 8 characters!")
        return

    # Choose role
    print("\nSelect role:")
    print("  1. admin (full access)")
    print("  2. manager (can manage orders, menu, reports)")
    print("  3. staff (view-only access)")

    role_choice = input("Choice (1-3) [default: 1]: ").strip() or "1"
    role_map = {"1": "admin", "2": "manager", "3": "staff"}
    role = role_map.get(role_choice, "admin")

    # Connect to database
    async with AsyncSessionLocal() as db:
        try:
            # Check if username already exists
            result = await db.execute(
                select(AdminUser).where(AdminUser.username == username)
            )
            existing = result.scalar_one_or_none()

            if existing:
                print(f"\n❌ Error: Username '{username}' already exists!")
                return

            # Check if email already exists
            result = await db.execute(
                select(AdminUser).where(AdminUser.email == email)
            )
            existing = result.scalar_one_or_none()

            if existing:
                print(f"\n❌ Error: Email '{email}' already exists!")
                return

            # Hash password
            hashed_password = pwd_context.hash(password)

            # Create admin user
            admin_user = AdminUser(
                username=username,
                email=email,
                full_name=full_name,
                hashed_password=hashed_password,
                role=role,
                is_active=True
            )

            db.add(admin_user)
            await db.commit()

            print("\n" + "="*60)
            print("✅ ADMIN USER CREATED SUCCESSFULLY!")
            print("="*60)
            print(f"\nUsername: {username}")
            print(f"Email: {email}")
            print(f"Full Name: {full_name}")
            print(f"Role: {role}")
            print(f"\n👉 Login at: https://seahorse-app-zxz5f.ondigitalocean.app/admin/login")
            print(f"   Username: {username}")
            print(f"   Password: [the password you entered]")
            print()

        except Exception as e:
            print(f"\n❌ Error creating admin user: {e}")
            import traceback
            traceback.print_exc()
            await db.rollback()


if __name__ == "__main__":
    asyncio.run(create_admin())
