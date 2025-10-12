from pydantic import BaseModel, Field, EmailStr, field_validator
from typing import Optional, List
from decimal import Decimal
from datetime import datetime


class ModifierSelection(BaseModel):
    modifier_id: int
    name: str
    price: Decimal = Field(decimal_places=2)


class OrderItemCreate(BaseModel):
    menu_item_id: int
    quantity: int = Field(ge=1, le=50)
    special_notes: Optional[str] = Field(None, max_length=500)
    selected_modifiers: List[ModifierSelection] = Field(default_factory=list)


class OrderItemResponse(BaseModel):
    id: int
    menu_item_id: int
    quantity: int
    unit_price: Decimal
    item_total: Decimal
    special_notes: Optional[str]
    selected_modifiers: List[dict]

    class Config:
        from_attributes = True


class OrderCreate(BaseModel):
    table_number: str
    session_token: str
    items: List[OrderItemCreate] = Field(min_length=1)
    customer_notes: Optional[str] = Field(None, max_length=1000)


class OrderCalculation(BaseModel):
    subtotal: Decimal
    gst_amount: Decimal
    tip_amount: Decimal
    total_amount: Decimal


class OrderResponse(BaseModel):
    id: int
    order_number: str
    table_id: int
    status: str
    items: List[OrderItemResponse]
    subtotal: Decimal
    gst_amount: Decimal
    tip_amount: Decimal
    total_amount: Decimal
    customer_notes: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True


class PaymentSplitCreate(BaseModel):
    customer_name: Optional[str] = Field(None, max_length=100)
    customer_email: EmailStr
    amount_to_pay: Decimal = Field(gt=0, decimal_places=2)
    order_item_ids: Optional[List[int]] = None


class PaymentSplitResponse(BaseModel):
    id: int
    split_token: str
    customer_name: Optional[str]
    customer_email: str
    amount_to_pay: Decimal
    payment_status: str
    payment_url: Optional[str] = None

    class Config:
        from_attributes = True


class SplitEqualRequest(BaseModel):
    people_count: int = Field(ge=2, le=10)
    emails: List[EmailStr] = Field(min_length=2, max_length=10)
    tip_percentage: float = Field(default=0, ge=0, le=100)

    @field_validator('emails')
    @classmethod
    def validate_emails_count(cls, v, info):
        people_count = info.data.get('people_count')
        if people_count and len(v) != people_count:
            raise ValueError(f"Must provide exactly {people_count} email addresses")
        return v


class SplitByItemsRequest(BaseModel):
    splits: List[PaymentSplitCreate] = Field(min_length=1)
    tip_percentage: float = Field(default=0, ge=0, le=100)

    @field_validator('splits')
    @classmethod
    def validate_total_coverage(cls, v):
        if not v:
            raise ValueError("At least one split is required")
        return v
