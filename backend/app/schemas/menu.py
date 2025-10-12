from pydantic import BaseModel, Field
from typing import Optional, List
from decimal import Decimal


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
    items: List[MenuItemResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True
