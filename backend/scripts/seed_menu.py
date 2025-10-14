#!/usr/bin/env python3
"""
Menu Items Seed Script

This script loads menu items from a CSV file into the database.
Use this for initial development setup or database resets.

Usage:
    python backend/scripts/seed_menu.py

    Or with custom CSV path:
    python backend/scripts/seed_menu.py --csv path/to/menu.csv

    With options:
    python backend/scripts/seed_menu.py --clear  # Clear existing items first
    python backend/scripts/seed_menu.py --update # Update existing items by name
"""

import asyncio
import csv
import sys
import argparse
from pathlib import Path
from decimal import Decimal

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))

from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker

from app.models.menu import MenuItem, Category
from app.config import get_settings


# CSV field mappings
FIELD_MAPPINGS = {
    'name': str,
    'category_name': str,
    'description': str,
    'price': Decimal,
    'calories': lambda x: int(x) if x else None,
    'allergens': lambda x: x.split('|') if x else [],
    'spice_level': lambda x: x if x else None,
    'is_available': lambda x: x.lower() in ('true', '1', 'yes') if x else True,
    'is_lite_bite': lambda x: x.lower() in ('true', '1', 'yes') if x else False,
    'is_child_friendly': lambda x: x.lower() in ('true', '1', 'yes') if x else False,
    'is_salad': lambda x: x.lower() in ('true', '1', 'yes') if x else False,
    'is_deal': lambda x: x.lower() in ('true', '1', 'yes') if x else False,
    'is_gluten_free': lambda x: x.lower() in ('true', '1', 'yes') if x else False,
    'dietary_tags': lambda x: x.split('|') if x else [],
    'display_order': lambda x: int(x) if x else 0,
    'image_url': lambda x: x if x else None,
}


async def load_categories(session: AsyncSession) -> dict:
    """Load all categories and return a name->id mapping"""
    result = await session.execute(select(Category))
    categories = result.scalars().all()
    return {cat.name: cat.id for cat in categories}


async def parse_csv_row(row: dict, category_map: dict) -> dict:
    """Parse a CSV row into menu item data"""
    category_name = row.get('category_name', '').strip()

    if not category_name:
        raise ValueError(f"Missing category_name for item: {row.get('name', 'unknown')}")

    if category_name not in category_map:
        raise ValueError(f"Unknown category '{category_name}' for item: {row.get('name', 'unknown')}")

    # Parse all fields
    item_data = {}
    for field, converter in FIELD_MAPPINGS.items():
        if field == 'category_name':
            continue

        value = row.get(field, '').strip()
        try:
            item_data[field] = converter(value)
        except (ValueError, TypeError) as e:
            print(f"Warning: Error parsing field '{field}' with value '{value}': {e}")
            item_data[field] = None

    # Add category_id
    item_data['category_id'] = category_map[category_name]

    return item_data


async def clear_menu_items(session: AsyncSession):
    """Clear all existing menu items"""
    print("Clearing existing menu items...")
    await session.execute(delete(MenuItem))
    await session.commit()
    print("✓ Cleared all menu items")


async def seed_from_csv(
    csv_path: Path,
    clear: bool = False,
    update: bool = False
):
    """Load menu items from CSV file"""

    # Validate CSV file exists
    if not csv_path.exists():
        print(f"Error: CSV file not found at {csv_path}")
        return False

    print(f"\n{'='*60}")
    print(f"Menu Items Seed Script")
    print(f"{'='*60}")
    print(f"CSV file: {csv_path}")
    print(f"Clear existing: {clear}")
    print(f"Update mode: {update}")
    print(f"{'='*60}\n")

    # Create async engine and session
    settings = get_settings()
    engine = create_async_engine(settings.DATABASE_URL, echo=False)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as session:
        try:
            # Load categories
            print("Loading categories...")
            category_map = await load_categories(session)
            if not category_map:
                print("Error: No categories found in database. Please run migrations first.")
                return False
            print(f"✓ Found {len(category_map)} categories: {', '.join(category_map.keys())}")
            print()

            # Clear existing items if requested
            if clear:
                await clear_menu_items(session)
                print()

            # Load existing items if updating
            existing_items = {}
            if update:
                print("Loading existing items...")
                result = await session.execute(select(MenuItem))
                for item in result.scalars().all():
                    existing_items[item.name.lower()] = item
                print(f"✓ Found {len(existing_items)} existing items")
                print()

            # Read and process CSV
            print("Processing CSV file...")
            with open(csv_path, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)

                created_count = 0
                updated_count = 0
                skipped_count = 0
                errors = []

                for row_num, row in enumerate(reader, start=2):  # Start at 2 (header is row 1)
                    try:
                        # Parse row
                        item_data = await parse_csv_row(row, category_map)
                        item_name = item_data['name']

                        # Check if item exists (for update mode)
                        existing_item = existing_items.get(item_name.lower())

                        if existing_item and update:
                            # Update existing item
                            for key, value in item_data.items():
                                setattr(existing_item, key, value)
                            updated_count += 1
                            print(f"  ↻ Updated: {item_name}")
                        elif existing_item and not update:
                            # Skip existing item
                            skipped_count += 1
                            print(f"  - Skipped: {item_name} (already exists)")
                        else:
                            # Create new item
                            new_item = MenuItem(**item_data)
                            session.add(new_item)
                            created_count += 1
                            print(f"  + Created: {item_name}")

                    except Exception as e:
                        error_msg = f"Row {row_num}: {str(e)}"
                        errors.append(error_msg)
                        print(f"  ✗ Error on row {row_num}: {e}")

            # Commit all changes
            print("\nCommitting changes to database...")
            await session.commit()

            # Print summary
            print(f"\n{'='*60}")
            print("Summary:")
            print(f"{'='*60}")
            print(f"✓ Created:  {created_count} items")
            if update:
                print(f"↻ Updated:  {updated_count} items")
            if skipped_count > 0:
                print(f"- Skipped:  {skipped_count} items")
            if errors:
                print(f"✗ Errors:   {len(errors)} rows")
            print(f"{'='*60}")

            if errors:
                print("\nErrors:")
                for error in errors:
                    print(f"  - {error}")

            return len(errors) == 0

        except Exception as e:
            print(f"\n✗ Fatal error: {e}")
            await session.rollback()
            return False
        finally:
            await engine.dispose()


def main():
    parser = argparse.ArgumentParser(
        description='Seed menu items from CSV file',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Load from default CSV location
  python backend/scripts/seed_menu.py

  # Clear existing items and load fresh data
  python backend/scripts/seed_menu.py --clear

  # Update existing items (by name) with CSV data
  python backend/scripts/seed_menu.py --update

  # Use custom CSV file
  python backend/scripts/seed_menu.py --csv /path/to/menu.csv
        """
    )

    parser.add_argument(
        '--csv',
        type=Path,
        default=Path(__file__).parent.parent / 'data' / 'menu_items.csv',
        help='Path to CSV file (default: backend/data/menu_items.csv)'
    )

    parser.add_argument(
        '--clear',
        action='store_true',
        help='Clear all existing menu items before loading'
    )

    parser.add_argument(
        '--update',
        action='store_true',
        help='Update existing items by name instead of skipping'
    )

    args = parser.parse_args()

    # Run async seed function
    success = asyncio.run(seed_from_csv(
        csv_path=args.csv,
        clear=args.clear,
        update=args.update
    ))

    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()
