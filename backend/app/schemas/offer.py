from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date
from decimal import Decimal
from enum import Enum


class DiscountType(str, Enum):
    fixed = "fixed"
    percentage = "percentage"
    bogo = "bogo"
    free_item = "free_item"


class OfferBase(BaseModel):
    name: str = Field(..., max_length=200)
    description: Optional[str] = None
    discount_type: DiscountType
    discount_value: Decimal = Field(default=0, ge=0)
    minimum_spend: Decimal = Field(default=0, ge=0)
    applicable_days: Optional[List[str]] = None
    applicable_times_start: Optional[str] = None
    applicable_times_end: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: bool = True
    is_featured: bool = False
    max_usage: Optional[int] = None


class OfferCreate(OfferBase):
    pass


class OfferUpdate(BaseModel):
    name: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None
    discount_type: Optional[DiscountType] = None
    discount_value: Optional[Decimal] = Field(None, ge=0)
    minimum_spend: Optional[Decimal] = Field(None, ge=0)
    applicable_days: Optional[List[str]] = None
    applicable_times_start: Optional[str] = None
    applicable_times_end: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    is_active: Optional[bool] = None
    is_featured: Optional[bool] = None
    max_usage: Optional[int] = None


class OfferResponse(OfferBase):
    id: int
    usage_count: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
        json_encoders = {
            Decimal: lambda v: float(v) if v is not None else None
        }


class OfferListResponse(BaseModel):
    offers: List[OfferResponse]
    total: int


class OfferStatistics(BaseModel):
    offer_id: int
    offer_name: str
    usage_count: int
    total_discount_given: Decimal
    total_revenue_with_offer: Decimal
