from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, TIMESTAMP, ForeignKey, ARRAY, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Category(Base):
    __tablename__ = "categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    display_order = Column(Integer, default=0, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    menu_items = relationship("MenuItem", back_populates="category", cascade="all, delete-orphan")


class MenuItem(Base):
    __tablename__ = "menu_items"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(200), nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    dietary_tags = Column(ARRAY(String(10)))  # ['v', 'vg']
    is_available = Column(Boolean, default=True)
    image_url = Column(Text)
    display_order = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    category = relationship("Category", back_populates="menu_items")
    modifiers = relationship("ItemModifier", back_populates="menu_item", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("price >= 0", name="check_price_positive"),
    )


class ItemModifier(Base):
    __tablename__ = "item_modifiers"

    id = Column(Integer, primary_key=True, index=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=False, index=True)
    name = Column(String(100), nullable=False)
    price = Column(Numeric(10, 2), default=0.00)
    modifier_type = Column(String(50), default='addon')  # 'addon', 'size', 'spice_level'
    is_required = Column(Boolean, default=False)
    display_order = Column(Integer, default=0)

    # Relationships
    menu_item = relationship("MenuItem", back_populates="modifiers")
