from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, TIMESTAMP, Date, CheckConstraint, ARRAY
from sqlalchemy.sql import func
from app.database import Base


class Offer(Base):
    """Promotional offers and discounts"""
    __tablename__ = "offers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    discount_type = Column(String(50), nullable=False)  # 'fixed', 'percentage', 'bogo', 'free_item'
    discount_value = Column(Numeric(10, 2), default=0.00)  # Amount or percentage value
    minimum_spend = Column(Numeric(10, 2), default=0.00)
    applicable_days = Column(ARRAY(String(10)))  # ['monday', 'tuesday', etc.]
    applicable_times_start = Column(String(10))  # '12:00'
    applicable_times_end = Column(String(10))  # '15:00'
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    is_active = Column(Boolean, default=True)
    is_featured = Column(Boolean, default=False)  # Featured offers displayed prominently
    usage_count = Column(Integer, default=0)
    max_usage = Column(Integer, nullable=True)  # Null = unlimited
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint(
            "discount_type IN ('fixed', 'percentage', 'bogo', 'free_item')",
            name="check_offer_discount_type"
        ),
        CheckConstraint("discount_value >= 0", name="check_discount_value_positive"),
        CheckConstraint("minimum_spend >= 0", name="check_minimum_spend_positive"),
    )
