from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from decimal import Decimal

# Define UK-required allergen types
AllergenType = Literal[
    'gluten', 'crustaceans', 'eggs', 'fish', 'peanuts',
    'soybeans', 'milk', 'nuts', 'celery', 'mustard',
    'sesame', 'sulphites', 'lupin', 'molluscs'
]


class ModifierBase(BaseModel):
    name: str = Field(max_length=100)
    price: Decimal = Field(ge=0, decimal_places=2)
    modifier_type: str = "addon"
    is_required: bool = False


class ModifierCreate(ModifierBase):
    menu_item_id: int


class ModifierResponse(ModifierBase):
    id: int
    display_order: int

    class Config:
        from_attributes = True


class MenuItemBase(BaseModel):
    name: str = Field(max_length=200)
    description: Optional[str] = None
    price: Decimal = Field(ge=0, decimal_places=2)
    dietary_tags: List[str] = Field(default_factory=list)
    is_available: bool = True

    # Filter-related fields
    spice_level: Optional[str] = None
    is_lite_bite: bool = False
    is_child_friendly: bool = False
    is_salad: bool = False
    is_deal: bool = False
    is_gluten_free: bool = False
    calories: Optional[int] = None

    # UK Law Compliance: 14 major allergens must be clearly displayed
    allergens: List[str] = Field(
        default_factory=list,
        description="List of allergens present in this item (UK Food Information Regulations 2014)"
    )


class MenuItemCreate(MenuItemBase):
    category_id: int
    image_url: Optional[str] = None


class MenuItemUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0)
    dietary_tags: Optional[List[str]] = None
    is_available: Optional[bool] = None
    image_url: Optional[str] = None


class MenuItemResponse(MenuItemBase):
    id: int
    category_id: int
    image_url: Optional[str]
    display_order: int
    modifiers: List[ModifierResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


class CategoryBase(BaseModel):
    name: str = Field(max_length=100)
    description: Optional[str] = None
    is_active: bool = True


class CategoryCreate(CategoryBase):
    display_order: int = 0


class CategoryResponse(CategoryBase):
    id: int
    display_order: int
    menu_items: List[MenuItemResponse] = Field(default_factory=list, serialization_alias="items")

    class Config:
        from_attributes = True
        populate_by_name = True


# Budget Builder schemas
class ChefComboItemResponse(BaseModel):
    menu_item: MenuItemResponse
    quantity: int

    class Config:
        from_attributes = True


class ChefComboResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: Decimal
    image_url: Optional[str]
    display_order: int
    items: List[ChefComboItemResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True


class BudgetBuilderRequest(BaseModel):
    budget: Decimal = Field(ge=15, le=100)
    dietary_preferences: List[str] = Field(default_factory=list)  # ['vegetarian', 'vegan', 'gluten_free']
    meal_preferences: List[str] = Field(default_factory=list)  # ['starter', 'main', 'dessert', 'drink']
    allergen_exclusions: List[str] = Field(default_factory=list)  # allergens to exclude


class ComboItemDetail(BaseModel):
    id: int
    name: str
    description: Optional[str]
    price: Decimal
    category: str
    image_url: Optional[str]
    dietary_tags: List[str]
    calories: Optional[int]
    allergens: List[str]


class UpgradeSuggestion(BaseModel):
    description: str  # "For £2 more, swap the house wine for Pinot Grigio"
    additional_cost: Decimal
    from_item_id: Optional[int]
    to_item_id: int
    to_item: ComboItemDetail


class MealComboResponse(BaseModel):
    combo_id: Optional[int]  # None for custom combos, ID for chef combos
    combo_type: str  # 'custom' or 'chef'
    name: str
    description: Optional[str]
    items: List[ComboItemDetail]
    total_price: Decimal
    budget_remaining: Decimal
    savings: Optional[Decimal] = None  # For chef combos
    upgrade_suggestions: List[UpgradeSuggestion] = Field(default_factory=list)


class BudgetBuilderResponse(BaseModel):
    budget: Decimal
    meal_combos: List[MealComboResponse]
    chef_combos: List[ChefComboResponse]


class BudgetBuilderLogRequest(BaseModel):
    budget_amount: Decimal
    dietary_preferences: List[str]
    meal_preferences: List[str]
    combo_selected: Optional[int]
    upgrade_accepted: bool = False
    upgrade_amount: Optional[Decimal] = None
