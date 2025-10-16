from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List, Optional
from datetime import date, datetime
import logging

from app.database import get_db
from app.utils.auth import get_current_admin, require_role
from app.models.admin import AdminUser

logger = logging.getLogger(__name__)
from app.models.menu import MenuItem, Category
from app.models.order import Order
from app.schemas.menu import MenuItemCreate, MenuItemResponse
from app.schemas.special import SpecialCreate, SpecialUpdate, SpecialResponse, SpecialListResponse
from app.schemas.offer import OfferCreate, OfferUpdate, OfferResponse, OfferListResponse
from app.schemas.analytics import (
    DashboardOverview,
    SalesReportResponse,
    OrderHistoryResponse
)
from app.services.admin_service import AnalyticsService
from app.services.special_service import SpecialService
from app.services.offer_service import OfferService

router = APIRouter(prefix="/admin", tags=["Admin Dashboard"])


# ============================================================================
# DASHBOARD & ANALYTICS
# ============================================================================

@router.get("/dashboard", response_model=DashboardOverview)
async def get_dashboard_overview(
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get dashboard overview with today's statistics"""
    return await AnalyticsService.get_dashboard_overview(db)


@router.get("/reports/sales", response_model=SalesReportResponse)
async def get_sales_report(
    start_date: date = Query(..., description="Start date for report"),
    end_date: date = Query(..., description="End date for report"),
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get comprehensive sales report for date range"""
    return await AnalyticsService.get_sales_report(db, start_date, end_date)


@router.get("/orders/history", response_model=OrderHistoryResponse)
async def get_order_history(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    status: Optional[str] = None,
    table_number: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get paginated order history with filters"""
    return await AnalyticsService.get_order_history(
        db, page, page_size, start_date, end_date, status, table_number
    )


# ============================================================================
# MENU MANAGEMENT
# ============================================================================
# NOTE: Menu management routes have been moved to admin_menu.py
# These old routes are commented out to avoid conflicts and lazy loading issues

# ============================================================================
# SPECIALS / MENU OF THE DAY
# ============================================================================

@router.get("/specials", response_model=SpecialListResponse)
async def get_all_specials(
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get all specials with optional active filter"""
    specials = await SpecialService.get_all_specials(db, is_active)
    return SpecialListResponse(specials=specials, total=len(specials))


@router.get("/specials/{special_id}", response_model=SpecialResponse)
async def get_special(
    special_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get special by ID"""
    special = await SpecialService.get_special_by_id(db, special_id)
    if not special:
        raise HTTPException(status_code=404, detail="Special not found")
    return special


@router.post("/specials", response_model=SpecialResponse, status_code=status.HTTP_201_CREATED)
async def create_special(
    special_data: SpecialCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(require_role("admin", "manager"))
):
    """Create a new special"""
    return await SpecialService.create_special(db, special_data)


@router.put("/specials/{special_id}", response_model=SpecialResponse)
async def update_special(
    special_id: int,
    special_data: SpecialUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(require_role("admin", "manager"))
):
    """Update an existing special"""
    special = await SpecialService.update_special(db, special_id, special_data)
    if not special:
        raise HTTPException(status_code=404, detail="Special not found")
    return special


@router.delete("/specials/{special_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_special(
    special_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(require_role("admin", "manager"))
):
    """Delete a special"""
    logger.info(f"Admin {current_admin.username} requesting to delete special ID: {special_id}")
    try:
        success = await SpecialService.delete_special(db, special_id)
        if not success:
            logger.warning(f"Special ID {special_id} not found for deletion")
            raise HTTPException(status_code=404, detail="Special not found")
        logger.info(f"Special ID {special_id} deleted successfully by admin {current_admin.username}")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting special ID {special_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Failed to delete special")


@router.patch("/specials/{special_id}/active")
async def toggle_special_active(
    special_id: int,
    is_active: bool,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Toggle special active status"""
    special = await SpecialService.toggle_special_active(db, special_id, is_active)
    if not special:
        raise HTTPException(status_code=404, detail="Special not found")
    return {"message": "Special status updated", "is_active": is_active}


# ============================================================================
# OFFERS / PROMOTIONS
# ============================================================================

@router.get("/offers", response_model=OfferListResponse)
async def get_all_offers(
    is_active: Optional[bool] = None,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get all offers with optional active filter"""
    offers = await OfferService.get_all_offers(db, is_active)
    return OfferListResponse(offers=offers, total=len(offers))


@router.get("/offers/{offer_id}", response_model=OfferResponse)
async def get_offer(
    offer_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Get offer by ID"""
    offer = await OfferService.get_offer_by_id(db, offer_id)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer


@router.post("/offers", response_model=OfferResponse, status_code=status.HTTP_201_CREATED)
async def create_offer(
    offer_data: OfferCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(require_role("admin", "manager"))
):
    """Create a new offer"""
    return await OfferService.create_offer(db, offer_data)


@router.put("/offers/{offer_id}", response_model=OfferResponse)
async def update_offer(
    offer_id: int,
    offer_data: OfferUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(require_role("admin", "manager"))
):
    """Update an existing offer"""
    offer = await OfferService.update_offer(db, offer_id, offer_data)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return offer


@router.delete("/offers/{offer_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_offer(
    offer_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(require_role("admin", "manager"))
):
    """Delete an offer"""
    success = await OfferService.delete_offer(db, offer_id)
    if not success:
        raise HTTPException(status_code=404, detail="Offer not found")


@router.patch("/offers/{offer_id}/active")
async def toggle_offer_active(
    offer_id: int,
    is_active: bool,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """Toggle offer active status"""
    offer = await OfferService.toggle_offer_active(db, offer_id, is_active)
    if not offer:
        raise HTTPException(status_code=404, detail="Offer not found")
    return {"message": "Offer status updated", "is_active": is_active}


# ============================================================================
# ORDER MANAGEMENT
# ============================================================================
# NOTE: Order management routes have been moved to admin_orders.py
# These old routes are commented out to avoid conflicts

# @router.get("/orders/realtime")
# @router.patch("/orders/{order_id}/status")
# See admin_orders.py for the new comprehensive order management endpoints
