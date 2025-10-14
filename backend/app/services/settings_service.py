from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from sqlalchemy.orm import selectinload
from fastapi import HTTPException
from decimal import Decimal

from app.models.settings import Setting, BusinessHours, Holiday
from app.models.table import Table
from app.schemas.settings import (
    SettingCreate,
    SettingUpdate,
    TableCreate,
    TableUpdate,
    BusinessHoursCreate,
    BusinessHoursUpdate,
    HolidayCreate,
    HolidayUpdate,
    RestaurantInfoSettings,
    TaxCurrencySettings,
    PaymentSettings,
    NotificationSettings,
    AdvancedSettings,
    AllSettingsResponse,
)


class SettingsService:
    """Service for managing restaurant settings"""

    @staticmethod
    async def get_setting(db: AsyncSession, key: str) -> Optional[Setting]:
        """Get a single setting by key"""
        result = await db.execute(select(Setting).where(Setting.key == key))
        return result.scalar_one_or_none()

    @staticmethod
    async def get_settings_by_section(db: AsyncSession, section: str) -> List[Setting]:
        """Get all settings for a section"""
        result = await db.execute(select(Setting).where(Setting.section == section))
        return result.scalars().all()

    @staticmethod
    async def get_all_settings(db: AsyncSession) -> List[Setting]:
        """Get all settings"""
        result = await db.execute(select(Setting))
        return result.scalars().all()

    @staticmethod
    async def upsert_setting(
        db: AsyncSession, key: str, value: str, value_type: str = "string", section: str = None
    ) -> Setting:
        """Create or update a setting"""
        setting = await SettingsService.get_setting(db, key)
        if setting:
            setting.value = value
            setting.value_type = value_type
            if section:
                setting.section = section
        else:
            setting = Setting(key=key, value=value, value_type=value_type, section=section)
            db.add(setting)
        await db.commit()
        await db.refresh(setting)
        return setting

    @staticmethod
    async def bulk_upsert_settings(
        db: AsyncSession, settings_dict: Dict[str, Any], section: Optional[str] = None
    ) -> List[Setting]:
        """Bulk create or update settings"""
        results = []
        for key, value in settings_dict.items():
            # Determine value type
            value_type = "string"
            if isinstance(value, bool):
                value_type = "boolean"
                value = str(value).lower()
            elif isinstance(value, (int, float, Decimal)):
                value_type = "number"
                value = str(value)
            elif isinstance(value, list):
                value_type = "json"
                import json
                value = json.dumps(value)

            setting = await SettingsService.upsert_setting(
                db, key=key, value=value, value_type=value_type, section=section
            )
            results.append(setting)
        return results

    @staticmethod
    async def delete_setting(db: AsyncSession, key: str) -> bool:
        """Delete a setting"""
        setting = await SettingsService.get_setting(db, key)
        if not setting:
            return False
        await db.delete(setting)
        await db.commit()
        return True

    @staticmethod
    def _convert_value(setting: Setting) -> Any:
        """Convert setting value based on type"""
        if setting.value is None:
            return None
        if setting.value_type == "boolean":
            return setting.value.lower() == "true"
        elif setting.value_type == "number":
            try:
                if "." in setting.value:
                    return Decimal(setting.value)
                return int(setting.value)
            except:
                return setting.value
        elif setting.value_type == "json":
            import json
            try:
                return json.loads(setting.value)
            except:
                return setting.value
        return setting.value

    @staticmethod
    async def get_restaurant_info(db: AsyncSession) -> RestaurantInfoSettings:
        """Get restaurant info settings"""
        settings = await SettingsService.get_settings_by_section(db, "restaurant_info")
        settings_dict = {s.key: SettingsService._convert_value(s) for s in settings}

        return RestaurantInfoSettings(
            restaurant_name=settings_dict.get("restaurant_name", "La Hacienda"),
            legal_business_name=settings_dict.get("legal_business_name"),
            logo_url=settings_dict.get("logo_url"),
            address=settings_dict.get("restaurant_address"),
            city=settings_dict.get("restaurant_city"),
            postcode=settings_dict.get("restaurant_postcode"),
            country=settings_dict.get("restaurant_country"),
            phone=settings_dict.get("restaurant_phone"),
            email=settings_dict.get("restaurant_email"),
            website=settings_dict.get("restaurant_website"),
            facebook=settings_dict.get("facebook"),
            instagram=settings_dict.get("instagram"),
            twitter=settings_dict.get("twitter"),
            description=settings_dict.get("restaurant_description"),
            cuisine_type=settings_dict.get("cuisine_type"),
        )

    @staticmethod
    async def get_tax_currency(db: AsyncSession) -> TaxCurrencySettings:
        """Get tax and currency settings"""
        settings = await SettingsService.get_settings_by_section(db, "tax_currency")
        settings_dict = {s.key: SettingsService._convert_value(s) for s in settings}

        return TaxCurrencySettings(
            tax_name=settings_dict.get("tax_name", "VAT"),
            tax_rate=Decimal(str(settings_dict.get("tax_rate", 5))),
            tax_id=settings_dict.get("tax_id"),
            tax_included=settings_dict.get("tax_included", False),
            currency=settings_dict.get("currency", "GBP"),
            currency_symbol=settings_dict.get("currency_symbol", "£"),
            currency_position=settings_dict.get("currency_position", "before"),
            decimal_places=settings_dict.get("decimal_places", 2),
        )

    @staticmethod
    async def get_all_structured_settings(db: AsyncSession) -> AllSettingsResponse:
        """Get all settings in structured format"""
        # Get all sections
        restaurant_info = await SettingsService.get_restaurant_info(db)
        tax_currency = await SettingsService.get_tax_currency(db)

        # Get business hours
        result = await db.execute(select(BusinessHours).order_by(BusinessHours.id))
        business_hours = result.scalars().all()

        # Get holidays
        result = await db.execute(select(Holiday).order_by(Holiday.date))
        holidays = result.scalars().all()

        # Get tables
        result = await db.execute(select(Table).order_by(Table.table_number))
        tables = result.scalars().all()

        # Get other sections (with defaults)
        payment_settings = PaymentSettings()
        notification_settings = NotificationSettings()
        advanced_settings = AdvancedSettings()

        return AllSettingsResponse(
            restaurant_info=restaurant_info,
            tax_currency=tax_currency,
            payment=payment_settings,
            notifications=notification_settings,
            advanced=advanced_settings,
            business_hours=business_hours,
            holidays=holidays,
            tables=tables,
        )

    # Business Hours
    @staticmethod
    async def get_business_hours(db: AsyncSession) -> List[BusinessHours]:
        """Get all business hours"""
        result = await db.execute(select(BusinessHours).order_by(BusinessHours.id))
        return result.scalars().all()

    @staticmethod
    async def create_business_hours(db: AsyncSession, hours: BusinessHoursCreate) -> BusinessHours:
        """Create business hours entry"""
        db_hours = BusinessHours(**hours.model_dump())
        db.add(db_hours)
        await db.commit()
        await db.refresh(db_hours)
        return db_hours

    @staticmethod
    async def update_business_hours(
        db: AsyncSession, hours_id: int, hours: BusinessHoursUpdate
    ) -> BusinessHours:
        """Update business hours"""
        result = await db.execute(select(BusinessHours).where(BusinessHours.id == hours_id))
        db_hours = result.scalar_one_or_none()
        if not db_hours:
            raise HTTPException(status_code=404, detail="Business hours not found")

        for key, value in hours.model_dump(exclude_unset=True).items():
            setattr(db_hours, key, value)

        await db.commit()
        await db.refresh(db_hours)
        return db_hours

    @staticmethod
    async def delete_business_hours(db: AsyncSession, hours_id: int) -> bool:
        """Delete business hours"""
        result = await db.execute(select(BusinessHours).where(BusinessHours.id == hours_id))
        db_hours = result.scalar_one_or_none()
        if not db_hours:
            return False
        await db.delete(db_hours)
        await db.commit()
        return True

    # Holidays
    @staticmethod
    async def get_holidays(db: AsyncSession) -> List[Holiday]:
        """Get all holidays"""
        result = await db.execute(select(Holiday).order_by(Holiday.date))
        return result.scalars().all()

    @staticmethod
    async def create_holiday(db: AsyncSession, holiday: HolidayCreate) -> Holiday:
        """Create holiday"""
        db_holiday = Holiday(**holiday.model_dump())
        db.add(db_holiday)
        await db.commit()
        await db.refresh(db_holiday)
        return db_holiday

    @staticmethod
    async def update_holiday(db: AsyncSession, holiday_id: int, holiday: HolidayUpdate) -> Holiday:
        """Update holiday"""
        result = await db.execute(select(Holiday).where(Holiday.id == holiday_id))
        db_holiday = result.scalar_one_or_none()
        if not db_holiday:
            raise HTTPException(status_code=404, detail="Holiday not found")

        for key, value in holiday.model_dump(exclude_unset=True).items():
            setattr(db_holiday, key, value)

        await db.commit()
        await db.refresh(db_holiday)
        return db_holiday

    @staticmethod
    async def delete_holiday(db: AsyncSession, holiday_id: int) -> bool:
        """Delete holiday"""
        result = await db.execute(select(Holiday).where(Holiday.id == holiday_id))
        db_holiday = result.scalar_one_or_none()
        if not db_holiday:
            return False
        await db.delete(db_holiday)
        await db.commit()
        return True

    # Tables
    @staticmethod
    async def get_tables(db: AsyncSession) -> List[Table]:
        """Get all tables"""
        result = await db.execute(select(Table).order_by(Table.table_number))
        return result.scalars().all()

    @staticmethod
    async def get_table(db: AsyncSession, table_id: int) -> Optional[Table]:
        """Get single table"""
        result = await db.execute(select(Table).where(Table.id == table_id))
        return result.scalar_one_or_none()

    @staticmethod
    async def update_table(db: AsyncSession, table_id: int, table: TableUpdate) -> Table:
        """Update table"""
        db_table = await SettingsService.get_table(db, table_id)
        if not db_table:
            raise HTTPException(status_code=404, detail="Table not found")

        for key, value in table.model_dump(exclude_unset=True).items():
            setattr(db_table, key, value)

        await db.commit()
        await db.refresh(db_table)
        return db_table
