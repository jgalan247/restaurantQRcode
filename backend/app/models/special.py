from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, TIMESTAMP, ForeignKey, Date, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Special(Base):
    """Menu of the Day / Special Combo Model"""
    __tablename__ = "specials"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    image_url = Column(Text)
    is_active = Column(Boolean, default=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    display_order = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    items = relationship("SpecialItem", back_populates="special", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("price >= 0", name="check_special_price_positive"),
    )


class SpecialItem(Base):
    """Items included in a special combo"""
    __tablename__ = "special_items"

    id = Column(Integer, primary_key=True, index=True)
    special_id = Column(Integer, ForeignKey("specials.id", ondelete="CASCADE"), nullable=False, index=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=True, index=True)
    quantity = Column(Integer, default=1)
    display_order = Column(Integer, default=0)

    # Custom item fields (for special-only items not on regular menu)
    is_custom = Column(Boolean, default=False)
    custom_item_name = Column(String(255), nullable=True)
    custom_item_description = Column(Text, nullable=True)
    custom_item_category = Column(String(100), nullable=True)

    # Relationships
    special = relationship("Special", back_populates="items")
    menu_item = relationship("MenuItem")

    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_special_item_quantity_positive"),
    )
