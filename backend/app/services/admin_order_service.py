"""
Admin Order Service
Handles order management operations for the admin dashboard
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, desc
from typing import Optional, List, Tuple, Dict, Any
from datetime import datetime, date
from dataclasses import dataclass, asdict

from app.models.order import Order, OrderItem
from app.models.table import Table
from app.models.menu import MenuItem


@dataclass
class OrderDTO:
    """Data transfer object for orders"""
    id: int
    order_number: str
    table_id: int
    table_number: str
    status: str
    subtotal: float
    gst_amount: float
    tip_amount: float
    total_amount: float
    customer_notes: Optional[str]
    created_at: str
    updated_at: str
    completed_at: Optional[str]
    item_count: int
    items: List[Dict[str, Any]]
    wait_time_minutes: int


@dataclass
class OrderStats:
    """Order statistics"""
    active_orders: int
    pending_orders: int
    preparing_orders: int
    ready_orders: int
    completed_today: int
    cancelled_today: int
    average_prep_time: Optional[float]
    longest_waiting_order: Optional[Dict[str, Any]]


class AdminOrderService:
    """Service for admin order management"""

    ACTIVE_STATUSES = ["pending_payment", "paid", "preparing", "ready"]

    @staticmethod
    async def get_orders(
        db: AsyncSession,
        status: Optional[str] = None,
        date_from: Optional[date] = None,
        date_to: Optional[date] = None,
        table_number: Optional[str] = None,
        search: Optional[str] = None,
        page: int = 1,
        page_size: int = 50
    ) -> Tuple[List[Dict[str, Any]], int]:
        """Get filtered and paginated orders"""

        # Build base query
        query = select(Order).join(Table)

        # Apply filters
        filters = []

        if status:
            filters.append(Order.status == status)

        if date_from:
            filters.append(Order.created_at >= datetime.combine(date_from, datetime.min.time()))

        if date_to:
            filters.append(Order.created_at <= datetime.combine(date_to, datetime.max.time()))

        if table_number:
            filters.append(Table.table_number == table_number)

        if search:
            filters.append(Order.order_number.ilike(f"%{search}%"))

        if filters:
            query = query.where(and_(*filters))

        # Get total count
        count_query = select(func.count()).select_from(Order).join(Table)
        if filters:
            count_query = count_query.where(and_(*filters))
        count_result = await db.execute(count_query)
        total = count_result.scalar() or 0

        # Apply sorting and pagination
        query = query.order_by(desc(Order.created_at))
        offset = (page - 1) * page_size
        query = query.offset(offset).limit(page_size)

        # Execute query
        result = await db.execute(query)
        orders = result.scalars().all()

        # Convert to dicts with full details
        order_list = []
        now = datetime.utcnow()

        for order in orders:
            # Get table
            table_result = await db.execute(
                select(Table).where(Table.id == order.table_id)
            )
            table = table_result.scalar_one_or_none()

            # Get order items
            items_result = await db.execute(
                select(OrderItem, MenuItem)
                .join(MenuItem, OrderItem.menu_item_id == MenuItem.id)
                .where(OrderItem.order_id == order.id)
            )

            items_data = []
            item_count = 0
            for order_item, menu_item in items_result:
                items_data.append({
                    "id": order_item.id,
                    "menu_item_id": menu_item.id,
                    "name": menu_item.name,
                    "quantity": order_item.quantity,
                    "unit_price": float(order_item.unit_price),
                    "item_total": float(order_item.item_total),
                    "special_notes": order_item.special_notes,
                    "selected_modifiers": order_item.selected_modifiers or [],
                    "allergens": menu_item.allergens or [],
                    "dietary_tags": menu_item.dietary_tags or []
                })
                item_count += order_item.quantity

            # Calculate wait time
            wait_time = int((now - order.created_at).total_seconds() / 60)

            order_dict = {
                "id": order.id,
                "order_number": order.order_number,
                "table_id": order.table_id,
                "table_number": table.table_number if table else "Unknown",
                "status": order.status,
                "subtotal": float(order.subtotal),
                "gst_amount": float(order.gst_amount),
                "tip_amount": float(order.tip_amount),
                "total_amount": float(order.total_amount),
                "customer_notes": order.customer_notes,
                "created_at": order.created_at.isoformat(),
                "updated_at": order.updated_at.isoformat(),
                "completed_at": order.completed_at.isoformat() if order.completed_at else None,
                "item_count": item_count,
                "items": items_data,
                "wait_time_minutes": wait_time
            }
            order_list.append(order_dict)

        return order_list, total

    @staticmethod
    async def get_order_by_id(db: AsyncSession, order_id: int) -> Optional[Dict[str, Any]]:
        """Get single order with full details"""
        result = await db.execute(
            select(Order).where(Order.id == order_id)
        )
        order = result.scalar_one_or_none()

        if not order:
            return None

        # Get table
        table_result = await db.execute(
            select(Table).where(Table.id == order.table_id)
        )
        table = table_result.scalar_one_or_none()

        # Get order items
        items_result = await db.execute(
            select(OrderItem, MenuItem)
            .join(MenuItem, OrderItem.menu_item_id == MenuItem.id)
            .where(OrderItem.order_id == order.id)
        )

        items_data = []
        item_count = 0
        for order_item, menu_item in items_result:
            items_data.append({
                "id": order_item.id,
                "menu_item_id": menu_item.id,
                "name": menu_item.name,
                "quantity": order_item.quantity,
                "unit_price": float(order_item.unit_price),
                "item_total": float(order_item.item_total),
                "special_notes": order_item.special_notes,
                "selected_modifiers": order_item.selected_modifiers or [],
                "allergens": menu_item.allergens or [],
                "dietary_tags": menu_item.dietary_tags or []
            })
            item_count += order_item.quantity

        # Calculate wait time
        now = datetime.utcnow()
        wait_time = int((now - order.created_at).total_seconds() / 60)

        return {
            "id": order.id,
            "order_number": order.order_number,
            "table_id": order.table_id,
            "table_number": table.table_number if table else "Unknown",
            "status": order.status,
            "subtotal": float(order.subtotal),
            "gst_amount": float(order.gst_amount),
            "tip_amount": float(order.tip_amount),
            "total_amount": float(order.total_amount),
            "customer_notes": order.customer_notes,
            "created_at": order.created_at.isoformat(),
            "updated_at": order.updated_at.isoformat(),
            "completed_at": order.completed_at.isoformat() if order.completed_at else None,
            "item_count": item_count,
            "items": items_data,
            "wait_time_minutes": wait_time
        }

    @staticmethod
    async def update_order_status(
        db: AsyncSession,
        order_id: int,
        new_status: str
    ) -> Optional[Dict[str, Any]]:
        """Update order status"""
        valid_statuses = ["cart", "pending_payment", "paid", "preparing", "ready", "completed", "cancelled"]
        if new_status not in valid_statuses:
            raise ValueError(f"Invalid status: {new_status}")

        result = await db.execute(
            select(Order).where(Order.id == order_id)
        )
        order = result.scalar_one_or_none()

        if not order:
            return None

        order.status = new_status
        order.updated_at = datetime.utcnow()

        if new_status == "completed":
            order.completed_at = datetime.utcnow()

        await db.commit()
        await db.refresh(order)

        # Return full order details
        return await AdminOrderService.get_order_by_id(db, order_id)

    @staticmethod
    async def get_statistics(db: AsyncSession) -> Dict[str, Any]:
        """Get order statistics"""
        now = datetime.utcnow()
        today_start = datetime.combine(date.today(), datetime.min.time())

        # Active orders count
        active_result = await db.execute(
            select(func.count())
            .select_from(Order)
            .where(Order.status.in_(AdminOrderService.ACTIVE_STATUSES))
        )
        active_count = active_result.scalar() or 0

        # Pending orders
        pending_result = await db.execute(
            select(func.count())
            .select_from(Order)
            .where(Order.status.in_(["pending_payment", "paid"]))
        )
        pending_count = pending_result.scalar() or 0

        # Preparing orders
        preparing_result = await db.execute(
            select(func.count())
            .select_from(Order)
            .where(Order.status == "preparing")
        )
        preparing_count = preparing_result.scalar() or 0

        # Ready orders
        ready_result = await db.execute(
            select(func.count())
            .select_from(Order)
            .where(Order.status == "ready")
        )
        ready_count = ready_result.scalar() or 0

        # Completed today
        completed_result = await db.execute(
            select(func.count())
            .select_from(Order)
            .where(
                and_(
                    Order.status == "completed",
                    Order.completed_at >= today_start
                )
            )
        )
        completed_count = completed_result.scalar() or 0

        # Cancelled today
        cancelled_result = await db.execute(
            select(func.count())
            .select_from(Order)
            .where(
                and_(
                    Order.status == "cancelled",
                    Order.created_at >= today_start
                )
            )
        )
        cancelled_count = cancelled_result.scalar() or 0

        # Average prep time
        avg_prep_result = await db.execute(
            select(
                func.avg(
                    func.extract('epoch', Order.completed_at - Order.created_at) / 60
                )
            )
            .where(
                and_(
                    Order.status == "completed",
                    Order.completed_at >= today_start,
                    Order.completed_at.isnot(None)
                )
            )
        )
        avg_prep_time = avg_prep_result.scalar()

        # Longest waiting order
        longest_waiting = None
        oldest_result = await db.execute(
            select(Order, Table)
            .join(Table)
            .where(Order.status.in_(AdminOrderService.ACTIVE_STATUSES))
            .order_by(Order.created_at.asc())
            .limit(1)
        )
        oldest_row = oldest_result.first()
        if oldest_row:
            order, table = oldest_row
            wait_time = int((now - order.created_at).total_seconds() / 60)
            longest_waiting = {
                "order_id": order.id,
                "order_number": order.order_number,
                "table_number": table.table_number,
                "wait_time_minutes": wait_time,
                "status": order.status
            }

        return {
            "active_orders": active_count,
            "pending_orders": pending_count,
            "preparing_orders": preparing_count,
            "ready_orders": ready_count,
            "completed_today": completed_count,
            "cancelled_today": cancelled_count,
            "average_prep_time": round(float(avg_prep_time), 1) if avg_prep_time else None,
            "longest_waiting_order": longest_waiting
        }

    @staticmethod
    async def get_status_counts(db: AsyncSession) -> Dict[str, int]:
        """Get count of orders by status"""
        # Get all active orders
        all_result = await db.execute(
            select(func.count()).select_from(Order)
        )
        all_count = all_result.scalar() or 0

        # Pending
        pending_result = await db.execute(
            select(func.count())
            .select_from(Order)
            .where(Order.status.in_(["pending_payment", "paid"]))
        )
        pending_count = pending_result.scalar() or 0

        # Preparing
        preparing_result = await db.execute(
            select(func.count())
            .select_from(Order)
            .where(Order.status == "preparing")
        )
        preparing_count = preparing_result.scalar() or 0

        # Ready
        ready_result = await db.execute(
            select(func.count())
            .select_from(Order)
            .where(Order.status == "ready")
        )
        ready_count = ready_result.scalar() or 0

        # Completed
        completed_result = await db.execute(
            select(func.count())
            .select_from(Order)
            .where(Order.status == "completed")
        )
        completed_count = completed_result.scalar() or 0

        # Cancelled
        cancelled_result = await db.execute(
            select(func.count())
            .select_from(Order)
            .where(Order.status == "cancelled")
        )
        cancelled_count = cancelled_result.scalar() or 0

        return {
            "all": all_count,
            "pending": pending_count,
            "preparing": preparing_count,
            "ready": ready_count,
            "completed": completed_count,
            "cancelled": cancelled_count
        }
