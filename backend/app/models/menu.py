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

    # Variant pricing fields (for wines, drinks with multiple sizes)
    has_variants = Column(Boolean, default=False)
    price_small_glass = Column(Numeric(10, 2))  # 125ml
    price_large_glass = Column(Numeric(10, 2))  # 250ml
    price_bottle = Column(Numeric(10, 2))  # 750ml

    # Filter-related fields
    spice_level = Column(String(20))  # 'mild', 'medium', 'hot', 'extra-hot'
    is_lite_bite = Column(Boolean, default=False)
    is_child_friendly = Column(Boolean, default=False)
    is_salad = Column(Boolean, default=False)
    is_deal = Column(Boolean, default=False)
    is_gluten_free = Column(Boolean, default=False)
    calories = Column(Integer)
    allergens = Column(ARRAY(String(50)))  # ['nuts', 'dairy', 'gluten', etc.]

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


class ChefCombo(Base):
    __tablename__ = "chef_combos"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    price = Column(Numeric(10, 2), nullable=False)
    image_url = Column(Text)
    is_active = Column(Boolean, default=True)
    display_order = Column(Integer, default=0)
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    items = relationship("ChefComboItem", back_populates="combo", cascade="all, delete-orphan")

    __table_args__ = (
        CheckConstraint("price >= 0", name="check_combo_price_positive"),
    )


class ChefComboItem(Base):
    __tablename__ = "chef_combo_items"

    id = Column(Integer, primary_key=True, index=True)
    combo_id = Column(Integer, ForeignKey("chef_combos.id", ondelete="CASCADE"), nullable=False, index=True)
    menu_item_id = Column(Integer, ForeignKey("menu_items.id", ondelete="CASCADE"), nullable=False, index=True)
    quantity = Column(Integer, default=1)

    # Relationships
    combo = relationship("ChefCombo", back_populates="items")
    menu_item = relationship("MenuItem")


class BudgetBuilderLog(Base):
    __tablename__ = "budget_builder_logs"

    id = Column(Integer, primary_key=True, index=True)
    budget_amount = Column(Numeric(10, 2), nullable=False)
    dietary_preferences = Column(ARRAY(String(50)))
    meal_preferences = Column(ARRAY(String(50)))
    combo_selected = Column(Integer)  # Index of combo selected (0-4)
    upgrade_accepted = Column(Boolean, default=False)
    upgrade_amount = Column(Numeric(10, 2))
    created_at = Column(TIMESTAMP, server_default=func.now())
