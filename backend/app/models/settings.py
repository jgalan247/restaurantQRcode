from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, Date, Time
from sqlalchemy.sql import func
from app.database import Base


class Setting(Base):
    __tablename__ = "settings"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(255), unique=True, nullable=False, index=True)
    value = Column(Text)
    value_type = Column(String(50), default='string')
    section = Column(String(100), index=True)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    updated_by = Column(Integer, nullable=True)


class BusinessHours(Base):
    __tablename__ = "business_hours"

    id = Column(Integer, primary_key=True, index=True)
    day_of_week = Column(String(20), nullable=False, index=True)
    is_open = Column(Boolean, default=True)
    open_time = Column(Time)
    close_time = Column(Time)
    slot_type = Column(String(50), default='regular')
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class Holiday(Base):
    __tablename__ = "holidays"

    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    is_closed = Column(Boolean, default=True)
    special_hours_start = Column(Time)
    special_hours_end = Column(Time)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
