from pydantic import BaseModel, Field, EmailStr, HttpUrl
from typing import Optional, List, Dict, Any
from datetime import datetime, date, time
from decimal import Decimal


# Settings
class SettingBase(BaseModel):
    key: str = Field(..., max_length=255)
    value: Optional[str] = None
    value_type: str = Field(default='string', max_length=50)
    section: Optional[str] = Field(None, max_length=100)


class SettingCreate(SettingBase):
    pass


class SettingUpdate(BaseModel):
    value: Optional[str] = None
    value_type: Optional[str] = None
    section: Optional[str] = None


class SettingResponse(SettingBase):
    id: int
    updated_at: datetime
    updated_by: Optional[int] = None

    class Config:
        from_attributes = True


# Tables
class TableBase(BaseModel):
    table_number: str
    is_active: bool = True
    capacity: Optional[int] = 2
    location: Optional[str] = None
    notes: Optional[str] = None


class TableCreate(TableBase):
    pass


class TableUpdate(BaseModel):
    table_number: Optional[str] = None
    is_active: Optional[bool] = None
    capacity: Optional[int] = None
    location: Optional[str] = None
    notes: Optional[str] = None


class TableResponse(BaseModel):
    id: int
    table_number: str
    is_active: Optional[bool] = None
    capacity: Optional[int] = None
    qr_code_url: Optional[str] = None
    qr_code_token: Optional[str] = None
    seating_capacity: Optional[int] = None
    status: Optional[str] = None
    location: Optional[str] = None
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Business Hours
class BusinessHoursBase(BaseModel):
    day_of_week: str = Field(..., max_length=20)
    is_open: bool = True
    open_time: Optional[time] = None
    close_time: Optional[time] = None
    slot_type: str = Field(default='regular', max_length=50)


class BusinessHoursCreate(BusinessHoursBase):
    pass


class BusinessHoursUpdate(BaseModel):
    is_open: Optional[bool] = None
    open_time: Optional[time] = None
    close_time: Optional[time] = None
    slot_type: Optional[str] = None


class BusinessHoursResponse(BusinessHoursBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Holidays
class HolidayBase(BaseModel):
    date: date
    name: str = Field(..., max_length=255)
    is_closed: bool = True
    special_hours_start: Optional[time] = None
    special_hours_end: Optional[time] = None


class HolidayCreate(HolidayBase):
    pass


class HolidayUpdate(BaseModel):
    name: Optional[str] = None
    is_closed: Optional[bool] = None
    special_hours_start: Optional[time] = None
    special_hours_end: Optional[time] = None


class HolidayResponse(HolidayBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# Composite Settings Responses
class RestaurantInfoSettings(BaseModel):
    restaurant_name: str
    legal_business_name: Optional[str] = None
    logo_url: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    postcode: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None
    description: Optional[str] = None
    cuisine_type: Optional[str] = None


class TaxCurrencySettings(BaseModel):
    tax_name: str = "VAT"
    tax_rate: Decimal = Decimal("5.0")
    tax_id: Optional[str] = None
    tax_included: bool = False
    currency: str = "GBP"
    currency_symbol: str = "£"
    currency_position: str = "before"
    decimal_places: int = 2


class PaymentSettings(BaseModel):
    provider: str = "citypay"
    test_mode: bool = True
    merchant_id: Optional[str] = None
    api_key: Optional[str] = None
    webhook_url: Optional[str] = None
    accept_cards: bool = True
    accept_apple_pay: bool = True
    accept_google_pay: bool = True
    accept_paypal: bool = False
    require_payment: str = "before"  # before or after
    service_charge_enabled: bool = False
    service_charge_percentage: Decimal = Decimal("10.0")
    tipping_enabled: bool = True
    tip_suggestions: List[int] = [10, 15, 20]


class NotificationSettings(BaseModel):
    email_notifications: bool = True
    email_address: Optional[str] = None
    notify_new_order: bool = True
    notify_payment_success: bool = True
    notify_payment_failed: bool = True
    daily_summary: bool = True
    weekly_report: bool = True
    sms_enabled: bool = False
    sms_phone: Optional[str] = None
    sms_new_order: bool = False
    sound_enabled: bool = True
    sound_type: str = "chime"
    sound_volume: int = 80


class AdvancedSettings(BaseModel):
    accept_orders_when_closed: bool = False
    order_prep_time: int = 15
    max_orders_per_hour: Optional[int] = None
    require_customer_phone: bool = False
    show_prices: bool = True
    show_calories: bool = True
    show_allergens: bool = True
    allow_special_instructions: bool = True
    max_instruction_length: int = 200
    maintenance_mode: bool = False
    maintenance_message: Optional[str] = None


class AllSettingsResponse(BaseModel):
    restaurant_info: RestaurantInfoSettings
    tax_currency: TaxCurrencySettings
    payment: PaymentSettings
    notifications: NotificationSettings
    advanced: AdvancedSettings
    business_hours: List[BusinessHoursResponse]
    holidays: List[HolidayResponse]
    tables: List[TableResponse]


class SettingsUpdateRequest(BaseModel):
    settings: Dict[str, Any]
    section: Optional[str] = None
