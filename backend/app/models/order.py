from sqlalchemy import Column, Integer, String, Numeric, TIMESTAMP, Text, ForeignKey, CheckConstraint
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String(20), unique=True, nullable=False, index=True)
    table_id = Column(Integer, ForeignKey("tables.id"), nullable=False, index=True)
    session_token = Column(String(255), nullable=False)
    status = Column(String(50), default="cart")
    subtotal = Column(Numeric(10, 2), default=0.00)
    gst_amount = Column(Numeric(10, 2), default=0.00)
    tip_amount = Column(Numeric(10, 2), default=0.00)
    total_amount = Column(Numeric(10, 2), default=0.00)
    customer_notes = Column(Text)
    created_at = Column(TIMESTAMP, server_default=func.now(), index=True)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())
    completed_at = Column(TIMESTAMP)

    # Relationships
    table = relationship("Table", back_populates="orders")
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    payment_splits = relationship("PaymentSplit", back_populates="order", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint(
            "status IN ('cart', 'pending_payment', 'paid', 'preparing', 'completed', 'cancelled')",
            name="check_order_status"
        ),
    )


class OrderItem(Base):
    __tablename__ = "order_items"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id"), nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    unit_price = Column(Numeric(10, 2), nullable=False)
    item_total = Column(Numeric(10, 2), nullable=False)
    special_notes = Column(Text)
    selected_modifiers = Column(JSONB, default=[])
    variant = Column(String(50))  # 'small_glass', 'large_glass', 'bottle'
    variant_display = Column(String(100))  # 'Small Glass (125ml)', etc.
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    order = relationship("Order", back_populates="items")
    menu_item = relationship("MenuItem")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_quantity_positive"),
    )
