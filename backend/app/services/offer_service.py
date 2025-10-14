from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from datetime import date

from app.models.offer import Offer
from app.schemas.offer import OfferCreate, OfferUpdate


class OfferService:
    """Service for managing promotional offers"""

    @staticmethod
    async def get_all_offers(
        db: AsyncSession,
        is_active: Optional[bool] = None
    ) -> List[Offer]:
        """Get all offers with optional active filter"""
        query = select(Offer)

        if is_active is not None:
            query = query.where(Offer.is_active == is_active)

        query = query.order_by(Offer.created_at.desc())
        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_active_offers(db: AsyncSession) -> List[Offer]:
        """Get currently active offers (within date range and usage limits)"""
        today = date.today()
        query = select(Offer).where(
            and_(
                Offer.is_active == True,
                or_(
                    Offer.start_date.is_(None),
                    Offer.start_date <= today
                ),
                or_(
                    Offer.end_date.is_(None),
                    Offer.end_date >= today
                ),
                or_(
                    Offer.max_usage.is_(None),
                    Offer.usage_count < Offer.max_usage
                )
            )
        )

        result = await db.execute(query)
        return result.scalars().all()

    @staticmethod
    async def get_offer_by_id(db: AsyncSession, offer_id: int) -> Optional[Offer]:
        """Get offer by ID"""
        result = await db.execute(
            select(Offer).where(Offer.id == offer_id)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def create_offer(
        db: AsyncSession,
        offer_data: OfferCreate
    ) -> Offer:
        """Create a new offer"""
        offer = Offer(
            name=offer_data.name,
            description=offer_data.description,
            discount_type=offer_data.discount_type,
            discount_value=offer_data.discount_value,
            minimum_spend=offer_data.minimum_spend,
            applicable_days=offer_data.applicable_days,
            applicable_times_start=offer_data.applicable_times_start,
            applicable_times_end=offer_data.applicable_times_end,
            start_date=offer_data.start_date,
            end_date=offer_data.end_date,
            is_active=offer_data.is_active,
            max_usage=offer_data.max_usage,
        )
        db.add(offer)
        await db.commit()
        await db.refresh(offer)
        return offer

    @staticmethod
    async def update_offer(
        db: AsyncSession,
        offer_id: int,
        offer_data: OfferUpdate
    ) -> Optional[Offer]:
        """Update an existing offer"""
        result = await db.execute(
            select(Offer).where(Offer.id == offer_id)
        )
        offer = result.scalar_one_or_none()
        if not offer:
            return None

        # Update fields
        if offer_data.name is not None:
            offer.name = offer_data.name
        if offer_data.description is not None:
            offer.description = offer_data.description
        if offer_data.discount_type is not None:
            offer.discount_type = offer_data.discount_type
        if offer_data.discount_value is not None:
            offer.discount_value = offer_data.discount_value
        if offer_data.minimum_spend is not None:
            offer.minimum_spend = offer_data.minimum_spend
        if offer_data.applicable_days is not None:
            offer.applicable_days = offer_data.applicable_days
        if offer_data.applicable_times_start is not None:
            offer.applicable_times_start = offer_data.applicable_times_start
        if offer_data.applicable_times_end is not None:
            offer.applicable_times_end = offer_data.applicable_times_end
        if offer_data.start_date is not None:
            offer.start_date = offer_data.start_date
        if offer_data.end_date is not None:
            offer.end_date = offer_data.end_date
        if offer_data.is_active is not None:
            offer.is_active = offer_data.is_active
        if offer_data.max_usage is not None:
            offer.max_usage = offer_data.max_usage

        await db.commit()
        await db.refresh(offer)
        return offer

    @staticmethod
    async def delete_offer(db: AsyncSession, offer_id: int) -> bool:
        """Delete an offer"""
        result = await db.execute(
            select(Offer).where(Offer.id == offer_id)
        )
        offer = result.scalar_one_or_none()
        if not offer:
            return False

        await db.delete(offer)
        await db.commit()
        return True

    @staticmethod
    async def toggle_offer_active(
        db: AsyncSession,
        offer_id: int,
        is_active: bool
    ) -> Optional[Offer]:
        """Toggle offer active status"""
        result = await db.execute(
            select(Offer).where(Offer.id == offer_id)
        )
        offer = result.scalar_one_or_none()
        if not offer:
            return None

        offer.is_active = is_active
        await db.commit()
        await db.refresh(offer)
        return offer

    @staticmethod
    async def increment_usage(db: AsyncSession, offer_id: int) -> Optional[Offer]:
        """Increment offer usage count"""
        result = await db.execute(
            select(Offer).where(Offer.id == offer_id)
        )
        offer = result.scalar_one_or_none()
        if not offer:
            return None

        offer.usage_count += 1
        await db.commit()
        await db.refresh(offer)
        return offer
