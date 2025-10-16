from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from sqlalchemy.orm import selectinload
from datetime import date
import logging

from app.models.special import Special, SpecialItem
from app.models.menu import MenuItem
from app.schemas.special import SpecialCreate, SpecialUpdate

logger = logging.getLogger(__name__)


class SpecialService:
    """Service for managing specials/menu of the day"""

    @staticmethod
    async def get_all_specials(
        db: AsyncSession,
        is_active: Optional[bool] = None
    ) -> List[Special]:
        """Get all specials with optional active filter"""
        query = select(Special).options(
            selectinload(Special.items).selectinload(SpecialItem.menu_item)
        )

        if is_active is not None:
            query = query.where(Special.is_active == is_active)

        query = query.order_by(Special.display_order, Special.name)
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_active_specials(db: AsyncSession) -> List[Special]:
        """Get currently active specials (within date range if set)"""
        today = date.today()
        query = select(Special).options(
            selectinload(Special.items).selectinload(SpecialItem.menu_item)
        ).where(
            and_(
                Special.is_active == True,
                or_(
                    Special.start_date.is_(None),
                    Special.start_date <= today
                ),
                or_(
                    Special.end_date.is_(None),
                    Special.end_date >= today
                )
            )
        ).order_by(Special.display_order)

        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_special_by_id(db: AsyncSession, special_id: int) -> Optional[Special]:
        """Get special by ID"""
        query = select(Special).options(
            selectinload(Special.items).selectinload(SpecialItem.menu_item)
        ).where(Special.id == special_id)

        result = await db.execute(query)
        return result.scalar_one_or_none()

    @staticmethod
    async def create_special(
        db: AsyncSession,
        special_data: SpecialCreate
    ) -> Special:
        """Create a new special"""
        # Create special
        special = Special(
            name=special_data.name,
            description=special_data.description,
            price=special_data.price,
            image_url=special_data.image_url,
            is_active=special_data.is_active,
            start_date=special_data.start_date,
            end_date=special_data.end_date,
            display_order=special_data.display_order,
        )
        db.add(special)
        await db.flush()

        # Add items to special
        for item_data in special_data.items:
            special_item = SpecialItem(
                special_id=special.id,
                menu_item_id=item_data.menu_item_id,
                quantity=item_data.quantity,
                display_order=item_data.display_order,
            )
            db.add(special_item)

        await db.commit()
        await db.refresh(special)

        # Reload with relationships
        return await SpecialService.get_special_by_id(db, special.id)

    @staticmethod
    async def update_special(
        db: AsyncSession,
        special_id: int,
        special_data: SpecialUpdate
    ) -> Optional[Special]:
        """Update an existing special"""
        result = await db.execute(
            select(Special).where(Special.id == special_id)
        )
        special = result.scalar_one_or_none()
        if not special:
            return None

        # Update basic fields
        if special_data.name is not None:
            special.name = special_data.name
        if special_data.description is not None:
            special.description = special_data.description
        if special_data.price is not None:
            special.price = special_data.price
        if special_data.image_url is not None:
            special.image_url = special_data.image_url
        if special_data.is_active is not None:
            special.is_active = special_data.is_active
        if special_data.start_date is not None:
            special.start_date = special_data.start_date
        if special_data.end_date is not None:
            special.end_date = special_data.end_date
        if special_data.display_order is not None:
            special.display_order = special_data.display_order

        # Update items if provided
        if special_data.items is not None:
            # Delete existing items
            result = await db.execute(
                select(SpecialItem).where(SpecialItem.special_id == special_id)
            )
            existing_items = result.scalars().all()
            for item in existing_items:
                await db.delete(item)

            # Add new items
            for item_data in special_data.items:
                special_item = SpecialItem(
                    special_id=special.id,
                    menu_item_id=item_data.menu_item_id,
                    quantity=item_data.quantity,
                    display_order=item_data.display_order,
                )
                db.add(special_item)

        await db.commit()
        return await SpecialService.get_special_by_id(db, special_id)

    @staticmethod
    async def delete_special(db: AsyncSession, special_id: int) -> bool:
        """Delete a special"""
        try:
            logger.info(f"Attempting to delete special with ID: {special_id}")

            result = await db.execute(
                select(Special).where(Special.id == special_id)
            )
            special = result.scalar_one_or_none()

            if not special:
                logger.warning(f"Special with ID {special_id} not found")
                return False

            special_name = special.name
            logger.info(f"Found special '{special_name}' (ID: {special_id}), proceeding with deletion")

            await db.delete(special)
            await db.commit()

            logger.info(f"Successfully deleted special '{special_name}' (ID: {special_id})")
            return True

        except Exception as e:
            logger.error(f"Failed to delete special {special_id}: {str(e)}", exc_info=True)
            await db.rollback()
            raise

    @staticmethod
    async def toggle_special_active(
        db: AsyncSession,
        special_id: int,
        is_active: bool
    ) -> Optional[Special]:
        """Toggle special active status"""
        result = await db.execute(
            select(Special).where(Special.id == special_id)
        )
        special = result.scalar_one_or_none()
        if not special:
            return None

        special.is_active = is_active
        await db.commit()
        return await SpecialService.get_special_by_id(db, special_id)
