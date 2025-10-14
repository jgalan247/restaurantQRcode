from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import List, Optional
from datetime import datetime, date, time as time_type
import calendar

from app.database import get_db
from app.models.special import Special, SpecialItem
from app.models.offer import Offer
from app.models.menu import MenuItem
from app.schemas.special import SpecialResponse, SpecialItemResponse
from app.schemas.offer import OfferResponse
from typing import cast

router = APIRouter(prefix="/promotions", tags=["Customer Promotions"])


def is_time_in_range(current_time: time_type, start_time: Optional[str], end_time: Optional[str]) -> bool:
    """Check if current time is within the specified range"""
    if start_time is None or end_time is None:
        return True

    # Parse time strings (format: 'HH:MM')
    try:
        start_parts = start_time.split(':')
        start_t = time_type(int(start_parts[0]), int(start_parts[1]))

        end_parts = end_time.split(':')
        end_t = time_type(int(end_parts[0]), int(end_parts[1]))

        return start_t <= current_time <= end_t
    except (ValueError, IndexError):
        return True  # If parsing fails, don't filter by time


def is_day_applicable(current_day: str, applicable_days: Optional[List[str]]) -> bool:
    """Check if current day is in the applicable days list"""
    if not applicable_days:
        return True
    return current_day.lower() in [day.lower() for day in applicable_days]


@router.get("/specials/active", response_model=List[SpecialResponse])
async def get_active_specials(
    table: Optional[int] = Query(None, description="Table number"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get currently active specials based on day and time.
    Filters by:
    - is_active = true
    - Current date within start_date and end_date (if set)
    - Current day and time (if applicable)
    """
    now = datetime.now()
    current_date = now.date()
    current_time = now.time()
    current_day = calendar.day_name[now.weekday()].lower()

    # Query for active specials
    query = select(Special).where(
        Special.is_active == True,
        or_(
            Special.start_date == None,
            Special.start_date <= current_date
        ),
        or_(
            Special.end_date == None,
            Special.end_date >= current_date
        )
    ).order_by(Special.display_order)

    result = await db.execute(query)
    specials = result.scalars().all()

    # Get all special IDs
    special_ids = [s.id for s in specials]

    if not special_ids:
        return []

    # Load all special items in one query
    items_query = select(SpecialItem).where(SpecialItem.special_id.in_(special_ids)).order_by(SpecialItem.special_id, SpecialItem.display_order)
    items_result = await db.execute(items_query)
    all_items = items_result.scalars().all()

    # Get all menu item IDs
    menu_item_ids = [item.menu_item_id for item in all_items if not item.is_custom and item.menu_item_id]

    # Load all menu items in one query
    menu_items_dict = {}
    if menu_item_ids:
        menu_items_query = select(MenuItem).where(MenuItem.id.in_(menu_item_ids))
        menu_items_result = await db.execute(menu_items_query)
        menu_items = menu_items_result.scalars().all()
        menu_items_dict = {mi.id: mi.name for mi in menu_items}

    # Organize items by special
    items_by_special = {}
    for item in all_items:
        if item.special_id not in items_by_special:
            items_by_special[item.special_id] = []

        # Add menu item name if applicable
        if not item.is_custom and item.menu_item_id and item.menu_item_id in menu_items_dict:
            item.menu_item_name = menu_items_dict[item.menu_item_id]

        items_by_special[item.special_id].append(item)

    # Build response objects manually to avoid relationship loading
    active_specials = []
    for special in specials:
        special_items = items_by_special.get(special.id, [])

        # Convert to response model explicitly
        special_response = SpecialResponse(
            id=special.id,
            name=special.name,
            description=special.description,
            price=special.price,
            image_url=special.image_url,
            is_active=special.is_active,
            start_date=special.start_date,
            end_date=special.end_date,
            display_order=special.display_order,
            created_at=special.created_at,
            updated_at=special.updated_at,
            items=[
                SpecialItemResponse(
                    id=item.id,
                    special_id=item.special_id,
                    menu_item_id=item.menu_item_id,
                    quantity=item.quantity,
                    display_order=item.display_order,
                    menu_item_name=getattr(item, 'menu_item_name', None),
                    is_custom=item.is_custom,
                    custom_item_name=item.custom_item_name,
                    custom_item_description=item.custom_item_description,
                    custom_item_category=item.custom_item_category,
                )
                for item in special_items
            ]
        )
        active_specials.append(special_response)

    return active_specials


@router.get("/specials/{special_id}", response_model=SpecialResponse)
async def get_special_details(
    special_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get detailed information about a specific special"""
    query = select(Special).where(Special.id == special_id)
    result = await db.execute(query)
    special = result.scalar_one_or_none()

    if not special:
        raise HTTPException(status_code=404, detail="Special not found")

    # Load special items
    items_query = select(SpecialItem).where(SpecialItem.special_id == special.id).order_by(SpecialItem.display_order)
    items_result = await db.execute(items_query)
    special.items = items_result.scalars().all()

    # Load menu item names
    for item in special.items:
        if not item.is_custom and item.menu_item_id:
            menu_item_query = select(MenuItem).where(MenuItem.id == item.menu_item_id)
            menu_item_result = await db.execute(menu_item_query)
            menu_item = menu_item_result.scalar_one_or_none()
            if menu_item:
                item.menu_item_name = menu_item.name

    return special


@router.get("/offers/active", response_model=List[OfferResponse])
async def get_active_offers(
    table: Optional[int] = Query(None, description="Table number"),
    featured_only: bool = Query(False, description="Return only featured offers"),
    db: AsyncSession = Depends(get_db),
):
    """
    Get currently active offers based on day and time.
    Filters by:
    - is_active = true
    - Current date within start_date and end_date (if set)
    - Current day in applicable_days (if set)
    - Current time within applicable_times (if set)
    """
    now = datetime.now()
    current_date = now.date()
    current_time = now.time()
    current_day = calendar.day_name[now.weekday()].lower()

    # Base query for active offers
    query = select(Offer).where(
        Offer.is_active == True,
        or_(
            Offer.start_date == None,
            Offer.start_date <= current_date
        ),
        or_(
            Offer.end_date == None,
            Offer.end_date >= current_date
        )
    )

    if featured_only:
        query = query.where(Offer.is_featured == True)

    query = query.order_by(Offer.id.desc())

    result = await db.execute(query)
    offers = result.scalars().all()

    # Filter by day and time
    active_offers = []
    for offer in offers:
        # Check day applicability
        if offer.applicable_days:
            if not is_day_applicable(current_day, offer.applicable_days):
                continue

        # Check time applicability
        if offer.applicable_times_start and offer.applicable_times_end:
            if not is_time_in_range(current_time, offer.applicable_times_start, offer.applicable_times_end):
                continue

        active_offers.append(offer)

    return active_offers


@router.get("/offers/featured", response_model=List[OfferResponse])
async def get_featured_offers(
    db: AsyncSession = Depends(get_db),
):
    """Get featured offers for the hero carousel"""
    return await get_active_offers(featured_only=True, db=db)


@router.get("/offers/{offer_id}", response_model=OfferResponse)
async def get_offer_details(
    offer_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get detailed information about a specific offer"""
    query = select(Offer).where(Offer.id == offer_id)
    result = await db.execute(query)
    offer = result.scalar_one_or_none()

    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")

    return offer


@router.get("/check-availability")
async def check_offer_availability(
    offer_id: Optional[int] = None,
    special_id: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
):
    """
    Check if an offer or special is currently available.
    Returns availability status, time until available, and expiry info.
    """
    now = datetime.now()
    current_date = now.date()
    current_time = now.time()
    current_day = calendar.day_name[now.weekday()].lower()

    response = {
        "available": False,
        "reason": None,
        "next_available": None,
        "expires_soon": False,
        "hours_until_expiry": None,
    }

    if offer_id:
        query = select(Offer).where(Offer.id == offer_id)
        result = await db.execute(query)
        offer = result.scalar_one_or_none()

        if not offer:
            raise HTTPException(status_code=404, detail="Offer not found")

        # Check active status
        if not offer.is_active:
            response["reason"] = "Offer is not currently active"
            return response

        # Check date range
        if offer.start_date and offer.start_date > current_date:
            response["reason"] = "Offer has not started yet"
            response["next_available"] = offer.start_date.isoformat()
            return response

        if offer.end_date and offer.end_date < current_date:
            response["reason"] = "Offer has expired"
            return response

        # Check day
        if offer.applicable_days and not is_day_applicable(current_day, offer.applicable_days):
            response["reason"] = f"Offer not available on {current_day}"
            # TODO: Calculate next available day
            return response

        # Check time
        if offer.applicable_times_start and offer.applicable_times_end:
            if not is_time_in_range(current_time, offer.applicable_times_start, offer.applicable_times_end):
                response["reason"] = f"Offer available {offer.applicable_times_start} - {offer.applicable_times_end}"
                return response

            # Check if expires soon (within 2 hours)
            try:
                end_parts = offer.applicable_times_end.split(':')
                end_t = time_type(int(end_parts[0]), int(end_parts[1]))
                end_datetime = datetime.combine(current_date, end_t)
                time_until_expiry = end_datetime - now
                hours_until_expiry = time_until_expiry.total_seconds() / 3600
            except (ValueError, IndexError):
                hours_until_expiry = None

            if hours_until_expiry is not None and hours_until_expiry <= 2:
                response["expires_soon"] = True
                response["hours_until_expiry"] = round(hours_until_expiry, 1)

        # Check end date (last day warning)
        if offer.end_date:
            if offer.end_date == current_date:
                response["expires_soon"] = True
                response["reason"] = "Last day!"

        response["available"] = True
        return response

    elif special_id:
        query = select(Special).where(Special.id == special_id)
        result = await db.execute(query)
        special = result.scalar_one_or_none()

        if not special:
            raise HTTPException(status_code=404, detail="Special not found")

        # Check active status
        if not special.is_active:
            response["reason"] = "Special is not currently active"
            return response

        # Check date range
        if special.start_date and special.start_date > current_date:
            response["reason"] = "Special has not started yet"
            response["next_available"] = special.start_date.isoformat()
            return response

        if special.end_date and special.end_date < current_date:
            response["reason"] = "Special has ended"
            return response

        # Check if expires soon
        if special.end_date:
            if special.end_date == current_date:
                response["expires_soon"] = True
                response["reason"] = "Last day!"

        response["available"] = True
        return response

    raise HTTPException(status_code=400, detail="Must provide either offer_id or special_id")
