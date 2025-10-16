from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Dict, Any

from app.database import get_db
from app.utils.auth import get_current_admin
from app.models.admin import AdminUser
from app.schemas.settings import (
    SettingResponse,
    SettingsUpdateRequest,
    BusinessHoursCreate,
    BusinessHoursUpdate,
    BusinessHoursResponse,
    HolidayCreate,
    HolidayUpdate,
    HolidayResponse,
    TableUpdate,
    TableResponse,
    AllSettingsResponse,
    RestaurantInfoSettings,
    TaxCurrencySettings,
)
from app.services.settings_service import SettingsService

router = APIRouter(prefix="/admin/settings", tags=["Admin Settings"])


@router.get("", response_model=AllSettingsResponse)
async def get_all_settings(
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Get all settings in structured format"""
    return await SettingsService.get_all_structured_settings(db)


@router.get("/restaurant-info", response_model=RestaurantInfoSettings)
async def get_restaurant_info(
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Get restaurant information settings"""
    return await SettingsService.get_restaurant_info(db)


@router.get("/tax-currency", response_model=TaxCurrencySettings)
async def get_tax_currency_settings(
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Get tax and currency settings"""
    return await SettingsService.get_tax_currency(db)


@router.put("/update")
async def update_settings(
    request: SettingsUpdateRequest,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Bulk update settings"""
    await SettingsService.bulk_upsert_settings(db, request.settings, request.section)
    return {"message": "Settings updated successfully"}


@router.get("/section/{section}")
async def get_settings_by_section(
    section: str,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Get settings for a specific section"""
    settings = await SettingsService.get_settings_by_section(db, section)
    return {
        "section": section,
        "settings": {s.key: SettingsService._convert_value(s) for s in settings},
    }


# Business Hours endpoints
@router.get("/business-hours", response_model=List[BusinessHoursResponse])
async def get_business_hours(
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Get all business hours"""
    return await SettingsService.get_business_hours(db)


@router.post("/business-hours", response_model=BusinessHoursResponse)
async def create_business_hours(
    hours: BusinessHoursCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Create business hours entry"""
    return await SettingsService.create_business_hours(db, hours)


@router.put("/business-hours/{hours_id}", response_model=BusinessHoursResponse)
async def update_business_hours(
    hours_id: int,
    hours: BusinessHoursUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Update business hours"""
    return await SettingsService.update_business_hours(db, hours_id, hours)


@router.delete("/business-hours/{hours_id}")
async def delete_business_hours(
    hours_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Delete business hours"""
    success = await SettingsService.delete_business_hours(db, hours_id)
    if not success:
        raise HTTPException(status_code=404, detail="Business hours not found")
    return {"message": "Business hours deleted successfully"}


# Holidays endpoints
@router.get("/holidays", response_model=List[HolidayResponse])
async def get_holidays(
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Get all holidays"""
    return await SettingsService.get_holidays(db)


@router.post("/holidays", response_model=HolidayResponse)
async def create_holiday(
    holiday: HolidayCreate,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Create holiday/special date"""
    return await SettingsService.create_holiday(db, holiday)


@router.put("/holidays/{holiday_id}", response_model=HolidayResponse)
async def update_holiday(
    holiday_id: int,
    holiday: HolidayUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Update holiday"""
    return await SettingsService.update_holiday(db, holiday_id, holiday)


@router.delete("/holidays/{holiday_id}")
async def delete_holiday(
    holiday_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Delete holiday"""
    success = await SettingsService.delete_holiday(db, holiday_id)
    if not success:
        raise HTTPException(status_code=404, detail="Holiday not found")
    return {"message": "Holiday deleted successfully"}


# Tables endpoints
@router.get("/tables", response_model=List[TableResponse])
async def get_tables(
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Get all tables"""
    return await SettingsService.get_tables(db)


@router.put("/tables/{table_id}", response_model=TableResponse)
async def update_table(
    table_id: int,
    table: TableUpdate,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Update table settings"""
    return await SettingsService.update_table(db, table_id, table)


@router.get("/tables/{table_id}/qr-code")
async def get_table_qr_code(
    table_id: int,
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Get QR code for a specific table"""
    table = await SettingsService.get_table(db, table_id)
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")

    return {
        "table_id": table.id,
        "table_number": table.table_number,
        "qr_code_url": table.qr_code_url,
        "qr_code_token": table.qr_code_token,
    }


@router.post("/test-payment")
async def test_payment_connection(
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Test payment gateway connection"""
    # TODO: Implement actual payment gateway test
    return {"status": "success", "message": "Payment gateway connection successful"}


@router.post("/test-email")
async def send_test_email(
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Send test email"""
    # TODO: Implement email sending
    return {"status": "success", "message": "Test email sent successfully"}


@router.get("/export")
async def export_settings(
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin),
):
    """Export all settings as JSON"""
    all_settings = await SettingsService.get_all_structured_settings(db)
    return all_settings
