"""
Report and Analytics Service

Provides comprehensive analytics and reporting functionality for the admin dashboard.
Handles data aggregation, calculations, and report generation.
"""

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, and_, or_, case, distinct
from datetime import date, datetime, timedelta
from typing import Dict, List, Any, Optional, Tuple
from decimal import Decimal

from app.models.order import Order, OrderItem
from app.models.menu import MenuItem, Category
from app.models.table import Table


class ReportService:
    """Service for generating reports and analytics"""

    @staticmethod
    async def get_key_metrics(
        db: AsyncSession,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """
        Get key metrics overview with trend comparison

        Returns:
            - total_revenue: Total revenue for period
            - total_orders: Total completed orders
            - avg_order_value: Average order amount
            - popular_item: Most sold item with quantity
            - revenue_trend: Percentage change vs previous period
            - orders_trend: Percentage change vs previous period
        """
        # Calculate period duration for comparison
        period_days = (end_date - start_date).days + 1
        prev_start_date = start_date - timedelta(days=period_days)
        prev_end_date = start_date - timedelta(days=1)

        # Current period metrics
        current_query = select(
            func.count(Order.id).label('total_orders'),
            func.coalesce(func.sum(Order.total_amount), 0).label('total_revenue')
        ).where(
            and_(
                Order.status.in_(['completed']),
                Order.completed_at >= start_date,
                Order.completed_at < end_date + timedelta(days=1)
            )
        )
        current_result = await db.execute(current_query)
        current_data = current_result.first()

        total_orders = current_data.total_orders or 0
        total_revenue = float(current_data.total_revenue or 0)
        avg_order_value = total_revenue / total_orders if total_orders > 0 else 0

        # Previous period metrics for trends
        prev_query = select(
            func.count(Order.id).label('total_orders'),
            func.coalesce(func.sum(Order.total_amount), 0).label('total_revenue')
        ).where(
            and_(
                Order.status.in_(['completed']),
                Order.completed_at >= prev_start_date,
                Order.completed_at < prev_end_date + timedelta(days=1)
            )
        )
        prev_result = await db.execute(prev_query)
        prev_data = prev_result.first()

        prev_orders = prev_data.total_orders or 0
        prev_revenue = float(prev_data.total_revenue or 0)

        # Calculate trends (percentage change)
        revenue_trend = ((total_revenue - prev_revenue) / prev_revenue * 100) if prev_revenue > 0 else 0
        orders_trend = ((total_orders - prev_orders) / prev_orders * 100) if prev_orders > 0 else 0

        # Get most popular item
        popular_item_query = select(
            MenuItem.name,
            func.sum(OrderItem.quantity).label('total_quantity')
        ).join(
            OrderItem, OrderItem.menu_item_id == MenuItem.id
        ).join(
            Order, Order.id == OrderItem.order_id
        ).where(
            and_(
                Order.status.in_(['completed']),
                Order.completed_at >= start_date,
                Order.completed_at < end_date + timedelta(days=1)
            )
        ).group_by(
            MenuItem.id, MenuItem.name
        ).order_by(
            func.sum(OrderItem.quantity).desc()
        ).limit(1)

        popular_result = await db.execute(popular_item_query)
        popular_item_data = popular_result.first()

        popular_item = {
            'name': popular_item_data.name if popular_item_data else 'N/A',
            'quantity': int(popular_item_data.total_quantity) if popular_item_data else 0
        }

        return {
            'total_revenue': round(total_revenue, 2),
            'total_orders': total_orders,
            'avg_order_value': round(avg_order_value, 2),
            'popular_item': popular_item,
            'revenue_trend': round(revenue_trend, 2),
            'orders_trend': round(orders_trend, 2),
            'avg_order_value_trend': round(orders_trend, 2)  # Similar trend
        }

    @staticmethod
    async def get_revenue_over_time(
        db: AsyncSession,
        start_date: date,
        end_date: date,
        granularity: str = 'day'  # 'day', 'week', 'month'
    ) -> List[Dict[str, Any]]:
        """
        Get revenue data over time for line/bar chart

        Returns list of: { date/period, revenue, order_count }
        """
        # Build query based on granularity
        if granularity == 'day':
            date_trunc = func.date(Order.completed_at)
            date_label = 'date'
        elif granularity == 'week':
            date_trunc = func.date_trunc('week', Order.completed_at)
            date_label = 'week'
        else:  # month
            date_trunc = func.date_trunc('month', Order.completed_at)
            date_label = 'month'

        query = select(
            date_trunc.label('period'),
            func.count(Order.id).label('order_count'),
            func.coalesce(func.sum(Order.total_amount), 0).label('revenue')
        ).where(
            and_(
                Order.status.in_(['completed']),
                Order.completed_at >= start_date,
                Order.completed_at < end_date + timedelta(days=1)
            )
        ).group_by(
            'period'
        ).order_by(
            'period'
        )

        result = await db.execute(query)
        rows = result.all()

        return [
            {
                date_label: row.period.strftime('%Y-%m-%d') if isinstance(row.period, (date, datetime)) else str(row.period),
                'revenue': round(float(row.revenue), 2),
                'order_count': row.order_count
            }
            for row in rows
        ]

    @staticmethod
    async def get_orders_by_time(
        db: AsyncSession,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """
        Get order distribution by hour of day

        Returns list of: { hour, order_count }
        """
        query = select(
            func.extract('hour', Order.created_at).label('hour'),
            func.count(Order.id).label('order_count')
        ).where(
            and_(
                Order.status.in_(['completed']),
                Order.completed_at >= start_date,
                Order.completed_at < end_date + timedelta(days=1)
            )
        ).group_by(
            'hour'
        ).order_by(
            'hour'
        )

        result = await db.execute(query)
        rows = result.all()

        # Fill in missing hours with 0
        hours_data = {int(row.hour): row.order_count for row in rows}

        return [
            {
                'hour': hour,
                'time': f"{hour:02d}:00",
                'order_count': hours_data.get(hour, 0)
            }
            for hour in range(24)
        ]

    @staticmethod
    async def get_revenue_by_category(
        db: AsyncSession,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """
        Get revenue breakdown by category for pie chart

        Returns list of: { category, revenue, percentage }
        """
        query = select(
            Category.name,
            func.coalesce(func.sum(OrderItem.item_total), 0).label('revenue')
        ).join(
            MenuItem, MenuItem.category_id == Category.id
        ).join(
            OrderItem, OrderItem.menu_item_id == MenuItem.id
        ).join(
            Order, Order.id == OrderItem.order_id
        ).where(
            and_(
                Order.status.in_(['completed']),
                Order.completed_at >= start_date,
                Order.completed_at < end_date + timedelta(days=1)
            )
        ).group_by(
            Category.id, Category.name
        ).order_by(
            func.sum(OrderItem.item_total).desc()
        )

        result = await db.execute(query)
        rows = result.all()

        total_revenue = sum(float(row.revenue) for row in rows)

        return [
            {
                'category': row.name,
                'revenue': round(float(row.revenue), 2),
                'percentage': round((float(row.revenue) / total_revenue * 100), 2) if total_revenue > 0 else 0
            }
            for row in rows
        ]

    @staticmethod
    async def get_top_items(
        db: AsyncSession,
        start_date: date,
        end_date: date,
        limit: int = 20
    ) -> List[Dict[str, Any]]:
        """
        Get top selling items

        Returns list of: { rank, name, category, quantity, revenue }
        """
        query = select(
            MenuItem.name,
            Category.name.label('category'),
            func.sum(OrderItem.quantity).label('total_quantity'),
            func.coalesce(func.sum(OrderItem.item_total), 0).label('total_revenue')
        ).join(
            OrderItem, OrderItem.menu_item_id == MenuItem.id
        ).join(
            Order, Order.id == OrderItem.order_id
        ).join(
            Category, Category.id == MenuItem.category_id
        ).where(
            and_(
                Order.status.in_(['completed']),
                Order.completed_at >= start_date,
                Order.completed_at < end_date + timedelta(days=1)
            )
        ).group_by(
            MenuItem.id, MenuItem.name, Category.name
        ).order_by(
            func.sum(OrderItem.quantity).desc()
        ).limit(limit)

        result = await db.execute(query)
        rows = result.all()

        return [
            {
                'rank': idx + 1,
                'name': row.name,
                'category': row.category,
                'quantity': int(row.total_quantity),
                'revenue': round(float(row.total_revenue), 2)
            }
            for idx, row in enumerate(rows)
        ]

    @staticmethod
    async def get_bottom_items(
        db: AsyncSession,
        start_date: date,
        end_date: date,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Get worst performing items (items with sales but lowest quantity)

        Returns list of: { rank, name, category, quantity, revenue }
        """
        query = select(
            MenuItem.name,
            Category.name.label('category'),
            func.sum(OrderItem.quantity).label('total_quantity'),
            func.coalesce(func.sum(OrderItem.item_total), 0).label('total_revenue')
        ).join(
            OrderItem, OrderItem.menu_item_id == MenuItem.id
        ).join(
            Order, Order.id == OrderItem.order_id
        ).join(
            Category, Category.id == MenuItem.category_id
        ).where(
            and_(
                Order.status.in_(['completed']),
                Order.completed_at >= start_date,
                Order.completed_at < end_date + timedelta(days=1)
            )
        ).group_by(
            MenuItem.id, MenuItem.name, Category.name
        ).having(
            func.sum(OrderItem.quantity) > 0  # Must have some sales
        ).order_by(
            func.sum(OrderItem.quantity).asc()  # Ascending for worst
        ).limit(limit)

        result = await db.execute(query)
        rows = result.all()

        return [
            {
                'rank': idx + 1,
                'name': row.name,
                'category': row.category,
                'quantity': int(row.total_quantity),
                'revenue': round(float(row.total_revenue), 2)
            }
            for idx, row in enumerate(rows)
        ]

    @staticmethod
    async def get_sales_by_table(
        db: AsyncSession,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """
        Get sales breakdown by table

        Returns list of: { table_number, order_count, total_revenue, avg_order_value }
        """
        query = select(
            Table.table_number,
            func.count(Order.id).label('order_count'),
            func.coalesce(func.sum(Order.total_amount), 0).label('total_revenue'),
            func.coalesce(func.avg(Order.total_amount), 0).label('avg_order_value')
        ).join(
            Order, Order.table_id == Table.id
        ).where(
            and_(
                Order.status.in_(['completed']),
                Order.completed_at >= start_date,
                Order.completed_at < end_date + timedelta(days=1)
            )
        ).group_by(
            Table.id, Table.table_number
        ).order_by(
            func.sum(Order.total_amount).desc()
        )

        result = await db.execute(query)
        rows = result.all()

        return [
            {
                'table_number': row.table_number,
                'order_count': row.order_count,
                'total_revenue': round(float(row.total_revenue), 2),
                'avg_order_value': round(float(row.avg_order_value), 2)
            }
            for row in rows
        ]

    @staticmethod
    async def get_payment_methods_breakdown(
        db: AsyncSession,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """
        Get breakdown by payment method

        Note: Current schema doesn't have payment_method field.
        This is a placeholder that assumes all payments are via Stripe.
        """
        # Get total completed orders
        query = select(
            func.count(Order.id).label('order_count'),
            func.coalesce(func.sum(Order.total_amount), 0).label('total_revenue')
        ).where(
            and_(
                Order.status.in_(['completed']),
                Order.completed_at >= start_date,
                Order.completed_at < end_date + timedelta(days=1)
            )
        )

        result = await db.execute(query)
        data = result.first()

        # For now, all payments are Stripe (card)
        # In future, add payment_method field to orders table
        return [
            {
                'method': 'Card (Stripe)',
                'order_count': data.order_count or 0,
                'revenue': round(float(data.total_revenue or 0), 2),
                'percentage': 100.0
            }
        ]

    @staticmethod
    async def get_daily_sales_summary(
        db: AsyncSession,
        start_date: date,
        end_date: date
    ) -> List[Dict[str, Any]]:
        """
        Get daily sales summary table

        Returns list of: { date, order_count, total_revenue, avg_order_value }
        """
        query = select(
            func.date(Order.completed_at).label('date'),
            func.count(Order.id).label('order_count'),
            func.coalesce(func.sum(Order.total_amount), 0).label('total_revenue'),
            func.coalesce(func.avg(Order.total_amount), 0).label('avg_order_value')
        ).where(
            and_(
                Order.status.in_(['completed']),
                Order.completed_at >= start_date,
                Order.completed_at < end_date + timedelta(days=1)
            )
        ).group_by(
            'date'
        ).order_by(
            'date'
        )

        result = await db.execute(query)
        rows = result.all()

        return [
            {
                'date': row.date.strftime('%Y-%m-%d'),
                'order_count': row.order_count,
                'total_revenue': round(float(row.total_revenue), 2),
                'avg_order_value': round(float(row.avg_order_value), 2)
            }
            for row in rows
        ]

    @staticmethod
    async def get_comprehensive_report(
        db: AsyncSession,
        start_date: date,
        end_date: date
    ) -> Dict[str, Any]:
        """
        Get all report data in one call (for export functionality)
        """
        metrics = await ReportService.get_key_metrics(db, start_date, end_date)
        revenue_over_time = await ReportService.get_revenue_over_time(db, start_date, end_date)
        orders_by_time = await ReportService.get_orders_by_time(db, start_date, end_date)
        revenue_by_category = await ReportService.get_revenue_by_category(db, start_date, end_date)
        top_items = await ReportService.get_top_items(db, start_date, end_date, limit=20)
        bottom_items = await ReportService.get_bottom_items(db, start_date, end_date, limit=10)
        sales_by_table = await ReportService.get_sales_by_table(db, start_date, end_date)
        payment_methods = await ReportService.get_payment_methods_breakdown(db, start_date, end_date)
        daily_summary = await ReportService.get_daily_sales_summary(db, start_date, end_date)

        return {
            'report_period': {
                'start_date': start_date.strftime('%Y-%m-%d'),
                'end_date': end_date.strftime('%Y-%m-%d')
            },
            'key_metrics': metrics,
            'revenue_over_time': revenue_over_time,
            'orders_by_time': orders_by_time,
            'revenue_by_category': revenue_by_category,
            'top_items': top_items,
            'bottom_items': bottom_items,
            'sales_by_table': sales_by_table,
            'payment_methods': payment_methods,
            'daily_summary': daily_summary
        }
