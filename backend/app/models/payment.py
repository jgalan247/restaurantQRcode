from sqlalchemy import Column, Integer, String, Numeric, TIMESTAMP, ForeignKey, ARRAY, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class PaymentSplit(Base):
    __tablename__ = "payment_splits"

    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id", ondelete="CASCADE"), nullable=False, index=True)
    split_token = Column(String(255), unique=True, nullable=False, index=True)
    customer_name = Column(String(100))
    customer_email = Column(String(255), nullable=False)
    amount_to_pay = Column(Numeric(10, 2), nullable=False)
    order_item_ids = Column(ARRAY(Integer))  # Array of order_item IDs
    payment_status = Column(String(50), default='pending')
    payment_provider_id = Column(String(255))  # CityPay transaction ID
    payment_method = Column(String(50))  # 'card', 'apple_pay', etc.
    created_at = Column(TIMESTAMP, server_default=func.now())
    paid_at = Column(TIMESTAMP)

    # Relationships
    order = relationship("Order", back_populates="payment_splits")

    __table_args__ = (
        CheckConstraint("amount_to_pay >= 0", name="check_amount_positive"),
        CheckConstraint(
            "payment_status IN ('pending', 'processing', 'completed', 'failed', 'refunded')",
            name="check_payment_status"
        ),
    )
