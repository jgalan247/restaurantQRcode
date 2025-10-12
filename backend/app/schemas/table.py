from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class TableBase(BaseModel):
    table_number: str = Field(max_length=10)
    seating_capacity: int = Field(default=4, ge=1, le=20)
    status: str = Field(default="available")


class TableCreate(TableBase):
    pass


class TableUpdate(BaseModel):
    table_number: Optional[str] = Field(None, max_length=10)
    seating_capacity: Optional[int] = Field(None, ge=1, le=20)
    status: Optional[str] = None


class TableResponse(TableBase):
    id: int
    qr_code_url: str
    qr_code_token: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
