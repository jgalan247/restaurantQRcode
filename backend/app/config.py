from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from typing import List


class Settings(BaseSettings):
    # App
    APP_NAME: str = "La Hacienda Ordering System"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = False

    # Database
    DATABASE_URL: str

    # Security
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # CORS
    CORS_ORIGINS: str = '["http://localhost:5173","http://localhost:3000"]'

    # CityPay PayLink
    CITYPAY_MERCHANT_ID: str
    CITYPAY_API_KEY: str  # This is the licenceKey
    CITYPAY_BASE_URL: str = "https://secure.citypay.com"

    # Email
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: str
    MAIL_PORT: int = 587
    MAIL_SERVER: str
    MAIL_FROM_NAME: str = "La Hacienda Restaurant"

    # Business Logic
    GST_RATE: float = 0.05  # 5%
    CURRENCY: str = "GBP"
    FRONTEND_URL: str = "https://seahorse-app-zxz5f.ondigitalocean.app"  # Production URL

    # Restaurant Details (for invoices)
    RESTAURANT_NAME: str = "La Hacienda"
    RESTAURANT_ADDRESS: str = "123 Mexican Street, London, UK, SW1A 1AA"
    RESTAURANT_PHONE: str = "+44 20 1234 5678"
    RESTAURANT_EMAIL: str = "info@lahacienda.co.uk"
    RESTAURANT_VAT_NUMBER: str = "GB123456789"  # Optional, set empty string if not VAT registered

    model_config = SettingsConfigDict(
        env_file=".env",
        case_sensitive=True
    )

    @property
    def cors_origins_list(self) -> List[str]:
        """Parse CORS origins from JSON string"""
        import json
        return json.loads(self.CORS_ORIGINS)


@lru_cache()
def get_settings() -> Settings:
    return Settings()
