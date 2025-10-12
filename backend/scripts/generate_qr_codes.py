"""
QR Code generation script
Generates QR codes for all tables in the database
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import AsyncSessionLocal
from app.models.table import Table
from app.services.qr_service import generate_qr_code
from app.config import get_settings

settings = get_settings()


async def generate_table_qr_codes(table_numbers: list[str] = None):
    """
    Generate QR codes for tables

    Args:
        table_numbers: List of table numbers to generate QR for.
                      If None, creates tables 1-20
    """
    if table_numbers is None:
        table_numbers = [str(i) for i in range(1, 21)]  # Tables 1-20

    print(f"Generating QR codes for {len(table_numbers)} tables...")

    async with AsyncSessionLocal() as db:
        created_count = 0

        for table_number in table_numbers:
            # Check if table already exists
            from sqlalchemy import select
            result = await db.execute(
                select(Table).where(Table.table_number == table_number)
            )
            existing_table = result.scalar_one_or_none()

            if existing_table:
                print(f"  ⚠️  Table {table_number} already exists, skipping...")
                continue

            # Generate QR code
            qr_code_url, qr_code_token = generate_qr_code(
                table_number, settings.FRONTEND_URL
            )

            # Create table
            table = Table(
                table_number=table_number,
                seating_capacity=4,
                status="available",
                qr_code_url=qr_code_url,
                qr_code_token=qr_code_token,
            )
            db.add(table)
            created_count += 1
            print(f"  ✅ Table {table_number} created with QR code")

        await db.commit()

    print(f"\n✅ Successfully created {created_count} tables with QR codes!")
    print(f"QR code images saved to: static/qrcodes/")


if __name__ == "__main__":
    # You can customize table numbers here
    # For example: asyncio.run(generate_table_qr_codes(["1", "2", "3", "VIP1"]))
    asyncio.run(generate_table_qr_codes())
