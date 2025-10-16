"""
Admin Orders API
Comprehensive order management endpoints for admin dashboard
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from datetime import date
from pydantic import BaseModel

from app.database import get_db
from app.models.admin import AdminUser
from app.utils.auth import get_current_admin
from app.services.admin_order_service import AdminOrderService


router = APIRouter(prefix="/admin/orders", tags=["Admin Orders"])


class OrderStatusUpdate(BaseModel):
    """Schema for order status update"""
    status: str


# ============================================================================
# ORDER LISTING & FILTERING
# ============================================================================

@router.get("")
async def list_orders(
    status: Optional[str] = Query(None, description="Filter by status"),
    date_from: Optional[date] = Query(None, description="Start date filter"),
    date_to: Optional[date] = Query(None, description="End date filter"),
    table_number: Optional[str] = Query(None, description="Filter by table number"),
    search: Optional[str] = Query(None, description="Search by order number"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(50, ge=1, le=200, description="Items per page"),
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get paginated list of orders with comprehensive filtering

    Query Parameters:
    - **status**: Filter by order status (pending, preparing, ready, completed, cancelled)
    - **date_from**: Start date for filtering (YYYY-MM-DD)
    - **date_to**: End date for filtering (YYYY-MM-DD)
    - **table_number**: Filter by specific table
    - **search**: Search by order number
    - **page**: Page number (default: 1)
    - **page_size**: Items per page (default: 50, max: 200)

    Returns paginated orders with full details including items, table info, and timing.
    """
    orders, total = await AdminOrderService.get_orders(
        db=db,
        status=status,
        date_from=date_from,
        date_to=date_to,
        table_number=table_number,
        search=search,
        page=page,
        page_size=page_size
    )

    total_pages = (total + page_size - 1) // page_size

    return {
        "orders": orders,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": total_pages
    }


@router.get("/stats")
async def get_order_statistics(
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get comprehensive order statistics

    Returns:
    - Active orders count
    - Orders by status (pending, preparing, ready)
    - Completed orders today
    - Cancelled orders today
    - Average prep time (minutes)
    - Longest waiting order details
    """
    stats = await AdminOrderService.get_statistics(db)
    return stats


@router.get("/status-counts")
async def get_status_counts(
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get count of orders by status for tab badges

    Returns counts for:
    - all: Total orders
    - pending: Pending/Paid orders
    - preparing: Orders being prepared
    - ready: Orders ready for pickup
    - completed: Completed orders
    - cancelled: Cancelled orders
    """
    counts = await AdminOrderService.get_status_counts(db)
    return counts


# ============================================================================
# SINGLE ORDER OPERATIONS
# ============================================================================

@router.get("/{order_id}")
async def get_order_details(
    order_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get detailed information for a single order

    Includes:
    - Full order details
    - All order items with modifiers
    - Table information
    - Timestamps and wait time
    - Allergen and dietary information
    """
    order = await AdminOrderService.get_order_by_id(db, order_id)

    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    return order


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: int,
    status_update: OrderStatusUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Update order status

    Valid status transitions:
    - pending_payment → preparing
    - paid → preparing
    - preparing → ready
    - ready → completed
    - any status → cancelled

    Body:
    ```json
    {
        "status": "preparing"
    }
    ```

    Valid statuses: cart, pending_payment, paid, preparing, ready, completed, cancelled
    """
    try:
        order = await AdminOrderService.update_order_status(
            db=db,
            order_id=order_id,
            new_status=status_update.status
        )

        if not order:
            raise HTTPException(status_code=404, detail="Order not found")

        return {
            "message": f"Order status updated to {status_update.status}",
            "order": order
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


# ============================================================================
# REAL-TIME MONITORING
# ============================================================================

@router.get("/realtime/active")
async def get_active_orders(
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get all currently active orders (pending, preparing, ready)

    Optimized for real-time monitoring dashboard.
    Auto-refreshes to show latest order status.
    """
    orders, _ = await AdminOrderService.get_orders(
        db=db,
        page=1,
        page_size=100
    )

    # Filter to active statuses only
    active_statuses = ["pending_payment", "paid", "preparing", "ready"]
    active_orders = [o for o in orders if o["status"] in active_statuses]

    return {
        "orders": active_orders,
        "count": len(active_orders)
    }


# ============================================================================
# BULK OPERATIONS
# ============================================================================

@router.post("/bulk-status")
async def bulk_update_status(
    order_ids: list[int],
    status: str,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Update status for multiple orders at once

    Body:
    ```json
    {
        "order_ids": [1, 2, 3],
        "status": "preparing"
    }
    ```

    Useful for batch operations on multiple orders.
    """
    updated = []
    failed = []

    for order_id in order_ids:
        try:
            order = await AdminOrderService.update_order_status(
                db=db,
                order_id=order_id,
                new_status=status
            )
            if order:
                updated.append(order_id)
            else:
                failed.append({"order_id": order_id, "reason": "Not found"})
        except ValueError as e:
            failed.append({"order_id": order_id, "reason": str(e)})

    return {
        "updated": updated,
        "failed": failed,
        "total_updated": len(updated),
        "total_failed": len(failed)
    }
