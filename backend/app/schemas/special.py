from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal


class SpecialItemBase(BaseModel):
    menu_item_id: Optional[int] = None
    quantity: int = 1
    display_order: int = 0

    # Custom item fields
    is_custom: bool = False
    custom_item_name: Optional[str] = None
    custom_item_description: Optional[str] = None
    custom_item_category: Optional[str] = None


class SpecialItemCreate(SpecialItemBase):
    pass


class SpecialItemResponse(SpecialItemBase):
    id: int
    special_id: int
    menu_item_name: Optional[str] = None

    class Config:
        from_attributes = True


class SpecialBase(BaseModel):
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    price: Decimal = Field(..., ge=0)
    image_url: Optional[str] = None
    is_active: bool = True
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    display_order: int = 0


class SpecialCreate(SpecialBase):
    items: List[SpecialItemCreate] = []


class SpecialUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, ge=0)
    image_url: Optional[str] = None
    is_active: Optional[bool] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    display_order: Optional[int] = None
    items: Optional[List[SpecialItemCreate]] = None


class SpecialResponse(SpecialBase):
    id: int
    created_at: datetime
    updated_at: datetime
    items: List[SpecialItemResponse] = []

    class Config:
        from_attributes = True


class SpecialListResponse(BaseModel):
    specials: List[SpecialResponse]
    total: int
