from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from decimal import Decimal
from datetime import datetime
from typing import Optional

from app.models.order import Order, OrderItem
from app.models.menu import MenuItem
from app.models.table import Table
from app.schemas.order import OrderCreate, OrderCalculation
from app.utils.calculations import calculate_gst, calculate_tip, generate_order_number
from app.config import get_settings

settings = get_settings()


class OrderService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create_order(self, order_data: OrderCreate) -> Order:
        """Create new order with items"""

        # Verify table exists
        table_result = await self.db.execute(
            select(Table).where(Table.table_number == order_data.table_number)
        )
        table = table_result.scalar_one_or_none()
        if not table:
            raise ValueError("Invalid table number")

        # Create order
        order = Order(
            order_number=generate_order_number(),
            table_id=table.id,
            session_token=order_data.session_token,
            status="cart",
            customer_notes=order_data.customer_notes,
        )
        self.db.add(order)
        await self.db.flush()

        # Add order items
        subtotal = Decimal("0.00")
        for item_data in order_data.items:
            # Get menu item
            menu_item_result = await self.db.execute(
                select(MenuItem).where(MenuItem.id == item_data.menu_item_id)
            )
            menu_item = menu_item_result.scalar_one_or_none()
            if not menu_item or not menu_item.is_available:
                raise ValueError(f"Menu item {item_data.menu_item_id} not available")

            # Calculate item total
            unit_price = menu_item.price
            modifiers_total = sum(
                Decimal(str(m.price)) for m in item_data.selected_modifiers
            )
            item_total = (unit_price + modifiers_total) * item_data.quantity

            order_item = OrderItem(
                order_id=order.id,
                menu_item_id=menu_item.id,
                quantity=item_data.quantity,
                unit_price=unit_price,
                item_total=item_total,
                special_notes=item_data.special_notes,
                selected_modifiers=[m.model_dump() for m in item_data.selected_modifiers],
            )
            self.db.add(order_item)
            subtotal += item_total

        # Update order totals
        order.subtotal = subtotal
        order.gst_amount = calculate_gst(subtotal, settings.GST_RATE)
        order.total_amount = order.subtotal + order.gst_amount

        await self.db.commit()
        await self.db.refresh(order)
        return order

    async def get_order(self, order_id: int) -> Optional[Order]:
        """Get order by ID with all relationships"""
        result = await self.db.execute(
            select(Order)
            .options(
                selectinload(Order.items),
                selectinload(Order.table),
                selectinload(Order.payment_splits),
            )
            .where(Order.id == order_id)
        )
        return result.scalar_one_or_none()

    async def calculate_totals(
        self, order_id: int, tip_percentage: float = 0
    ) -> OrderCalculation:
        """Calculate order totals including tip"""
        result = await self.db.execute(select(Order).where(Order.id == order_id))
        order = result.scalar_one_or_none()
        if not order:
            raise ValueError("Order not found")

        tip = calculate_tip(order.subtotal, tip_percentage)
        total = order.subtotal + order.gst_amount + tip

        return OrderCalculation(
            subtotal=order.subtotal,
            gst_amount=order.gst_amount,
            tip_amount=tip,
            total_amount=total,
        )

    async def update_status(self, order_id: int, status: str) -> Order:
        """Update order status"""
        result = await self.db.execute(select(Order).where(Order.id == order_id))
        order = result.scalar_one_or_none()
        if not order:
            raise ValueError("Order not found")

        order.status = status
        if status == "completed":
            order.completed_at = datetime.now()

        await self.db.commit()
        await self.db.refresh(order)
        return order

    async def get_orders_by_table(self, table_number: str) -> list[Order]:
        """Get all orders for a table"""
        result = await self.db.execute(
            select(Order)
            .join(Table)
            .where(Table.table_number == table_number)
            .options(selectinload(Order.items))
            .order_by(Order.created_at.desc())
        )
        return list(result.scalars().all())
