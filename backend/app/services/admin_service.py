from datetime import datetime, timedelta, date
from typing import List, Optional, Dict
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, desc, extract
from sqlalchemy.orm import selectinload, joinedload

from app.models.admin import AdminUser
from app.models.order import Order, OrderItem
from app.models.menu import MenuItem, Category
from app.models.special import Special, SpecialItem
from app.models.offer import Offer
from app.schemas.admin import AdminUserCreate, AdminUserUpdate
from app.schemas.analytics import (
    DashboardOverview,
    DailySalesReport,
    CategoryRevenue,
    PopularItem,
    SalesReportResponse,
    ItemPerformance,
    OrderHistoryItem,
    OrderHistoryResponse,
)
from app.utils.auth import get_password_hash, verify_password


class AdminService:
    """Service for admin user management and authentication"""

    @staticmethod
    async def get_admin_by_username(db: AsyncSession, username: str) -> Optional[AdminUser]:
        """Get admin user by username"""
        result = await db.execute(
            select(AdminUser).where(AdminUser.username == username)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def get_admin_by_email(db: AsyncSession, email: str) -> Optional[AdminUser]:
        """Get admin user by email"""
        result = await db.execute(
            select(AdminUser).where(AdminUser.email == email)
        )
        return result.scalar_one_or_none()

    @staticmethod
    async def authenticate_admin(
        db: AsyncSession, username: str, password: str
    ) -> Optional[AdminUser]:
        """Authenticate admin user"""
        import logging
        logger = logging.getLogger(__name__)

        logger.info(f"Authenticating admin: {username}")

        admin = await AdminService.get_admin_by_username(db, username)
        if not admin:
            logger.warning(f"Admin user not found: {username}")
            return None

        logger.info(f"Admin found: {username}, checking password...")

        if not verify_password(password, admin.hashed_password):
            logger.warning(f"Invalid password for admin: {username}")
            return None

        logger.info(f"Password verified for admin: {username}")

        if not admin.is_active:
            logger.warning(f"Admin account is inactive: {username}")
            return None

        # Update last login
        admin.last_login = datetime.utcnow()
        await db.commit()
        logger.info(f"Admin authenticated successfully: {username}")
        return admin

    @staticmethod
    async def create_admin(
        db: AsyncSession, admin_data: AdminUserCreate
    ) -> AdminUser:
        """Create a new admin user"""
        hashed_password = get_password_hash(admin_data.password)
        admin = AdminUser(
            username=admin_data.username,
            email=admin_data.email,
            hashed_password=hashed_password,
            full_name=admin_data.full_name,
            role=admin_data.role,
        )
        db.add(admin)
        await db.commit()
        await db.refresh(admin)
        return admin

    @staticmethod
    async def update_admin(
        db: AsyncSession, admin_id: int, admin_data: AdminUserUpdate
    ) -> Optional[AdminUser]:
        """Update admin user"""
        result = await db.execute(
            select(AdminUser).where(AdminUser.id == admin_id)
        )
        admin = result.scalar_one_or_none()
        if not admin:
            return None

        if admin_data.email:
            admin.email = admin_data.email
        if admin_data.full_name:
            admin.full_name = admin_data.full_name
        if admin_data.role:
            admin.role = admin_data.role
        if admin_data.password:
            admin.hashed_password = get_password_hash(admin_data.password)
        if admin_data.is_active is not None:
            admin.is_active = admin_data.is_active

        await db.commit()
        await db.refresh(admin)
        return admin


class AnalyticsService:
    """Service for analytics and reporting"""

    @staticmethod
    async def get_dashboard_overview(db: AsyncSession) -> DashboardOverview:
        """Get dashboard overview statistics for today"""
        today = date.today()
        today_start = datetime.combine(today, datetime.min.time())
        today_end = datetime.combine(today, datetime.max.time())

        # Today's completed orders
        orders_query = select(Order).where(
            and_(
                Order.created_at >= today_start,
                Order.created_at <= today_end,
                Order.status.in_(["paid", "preparing", "completed"])
            )
        )
        result = await db.execute(orders_query)
        today_orders = result.scalars().all()

        today_sales = sum(order.total_amount for order in today_orders)
        today_orders_count = len(today_orders)
        avg_order_value = today_sales / today_orders_count if today_orders_count > 0 else Decimal(0)

        # Most popular item today
        popular_item_query = select(
            MenuItem.name,
            func.sum(OrderItem.quantity).label("total_quantity")
        ).join(
            OrderItem, OrderItem.menu_item_id == MenuItem.id
        ).join(
            Order, Order.id == OrderItem.order_id
        ).where(
            and_(
                Order.created_at >= today_start,
                Order.created_at <= today_end,
                Order.status.in_(["paid", "preparing", "completed"])
            )
        ).group_by(MenuItem.id, MenuItem.name).order_by(desc("total_quantity")).limit(1)

        result = await db.execute(popular_item_query)
        popular_item = result.first()

        # Pending and preparing orders count
        pending_query = select(func.count(Order.id)).where(Order.status == "pending_payment")
        result = await db.execute(pending_query)
        pending_count = result.scalar() or 0

        preparing_query = select(func.count(Order.id)).where(Order.status == "preparing")
        result = await db.execute(preparing_query)
        preparing_count = result.scalar() or 0

        return DashboardOverview(
            today_sales=today_sales,
            today_orders=today_orders_count,
            average_order_value=avg_order_value,
            most_popular_item=popular_item[0] if popular_item else None,
            most_popular_item_count=int(popular_item[1]) if popular_item else 0,
            pending_orders=pending_count,
            preparing_orders=preparing_count,
        )

    @staticmethod
    async def get_sales_report(
        db: AsyncSession,
        start_date: date,
        end_date: date
    ) -> SalesReportResponse:
        """Get comprehensive sales report for date range"""
        start_datetime = datetime.combine(start_date, datetime.min.time())
        end_datetime = datetime.combine(end_date, datetime.max.time())

        # Get all completed orders in range
        orders_query = select(Order).where(
            and_(
                Order.created_at >= start_datetime,
                Order.created_at <= end_datetime,
                Order.status.in_(["paid", "preparing", "completed"])
            )
        )
        result = await db.execute(orders_query)
        orders = result.scalars().all()

        total_revenue = sum(order.total_amount for order in orders)
        total_orders = len(orders)
        avg_order_value = total_revenue / total_orders if total_orders > 0 else Decimal(0)

        # Revenue by category
        category_revenue_query = select(
            Category.id,
            Category.name,
            func.sum(OrderItem.item_total).label("revenue"),
            func.count(OrderItem.id).label("count")
        ).join(
            MenuItem, MenuItem.category_id == Category.id
        ).join(
            OrderItem, OrderItem.menu_item_id == MenuItem.id
        ).join(
            Order, Order.id == OrderItem.order_id
        ).where(
            and_(
                Order.created_at >= start_datetime,
                Order.created_at <= end_datetime,
                Order.status.in_(["paid", "preparing", "completed"])
            )
        ).group_by(Category.id, Category.name)

        result = await db.execute(category_revenue_query)
        category_data = result.all()

        revenue_by_category = [
            CategoryRevenue(
                category_id=row[0],
                category_name=row[1],
                revenue=row[2],
                order_count=row[3],
                percentage_of_total=float((row[2] / total_revenue * 100) if total_revenue > 0 else 0)
            )
            for row in category_data
        ]

        # Top items
        top_items_query = select(
            MenuItem.id,
            MenuItem.name,
            Category.name.label("category_name"),
            func.sum(OrderItem.quantity).label("quantity_sold"),
            func.sum(OrderItem.item_total).label("revenue"),
            func.avg(OrderItem.unit_price).label("avg_price")
        ).join(
            Category, Category.id == MenuItem.category_id
        ).join(
            OrderItem, OrderItem.menu_item_id == MenuItem.id
        ).join(
            Order, Order.id == OrderItem.order_id
        ).where(
            and_(
                Order.created_at >= start_datetime,
                Order.created_at <= end_datetime,
                Order.status.in_(["paid", "preparing", "completed"])
            )
        ).group_by(
            MenuItem.id, MenuItem.name, Category.name
        ).order_by(desc("quantity_sold")).limit(10)

        result = await db.execute(top_items_query)
        top_items_data = result.all()

        top_items = [
            PopularItem(
                item_id=row[0],
                item_name=row[1],
                category_name=row[2],
                quantity_sold=row[3],
                revenue=row[4],
                percentage_of_orders=float((row[3] / total_orders * 100) if total_orders > 0 else 0),
                average_price=row[5]
            )
            for row in top_items_data
        ]

        # Daily breakdown (simplified for now)
        daily_breakdown = []

        return SalesReportResponse(
            start_date=start_date,
            end_date=end_date,
            total_revenue=total_revenue,
            total_orders=total_orders,
            average_order_value=avg_order_value,
            revenue_by_category=revenue_by_category,
            revenue_by_payment_method={},  # TODO: Implement when payment method tracking is added
            top_items=top_items,
            daily_breakdown=daily_breakdown
        )

    @staticmethod
    async def get_order_history(
        db: AsyncSession,
        page: int = 1,
        page_size: int = 20,
        start_date: Optional[date] = None,
        end_date: Optional[date] = None,
        status: Optional[str] = None,
        table_number: Optional[int] = None
    ) -> OrderHistoryResponse:
        """Get paginated order history with filters"""
        offset = (page - 1) * page_size

        # Build base query
        query = select(Order).options(
            selectinload(Order.items),
            selectinload(Order.table)
        )

        filters = []
        if start_date:
            start_datetime = datetime.combine(start_date, datetime.min.time())
            filters.append(Order.created_at >= start_datetime)
        if end_date:
            end_datetime = datetime.combine(end_date, datetime.max.time())
            filters.append(Order.created_at <= end_datetime)
        if status:
            filters.append(Order.status == status)
        if table_number:
            filters.append(Order.table.has(number=table_number))

        if filters:
            query = query.where(and_(*filters))

        # Get total count
        count_query = select(func.count(Order.id))
        if filters:
            count_query = count_query.where(and_(*filters))
        result = await db.execute(count_query)
        total = result.scalar() or 0

        # Get paginated results
        query = query.order_by(desc(Order.created_at)).offset(offset).limit(page_size)
        result = await db.execute(query)
        orders = result.scalars().all()

        order_items = [
            OrderHistoryItem(
                id=order.id,
                order_number=order.order_number,
                table_number=order.table.number,
                status=order.status,
                total_amount=order.total_amount,
                items_count=len(order.items),
                created_at=order.created_at,
                completed_at=order.completed_at
            )
            for order in orders
        ]

        total_pages = (total + page_size - 1) // page_size

        return OrderHistoryResponse(
            orders=order_items,
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages
        )
