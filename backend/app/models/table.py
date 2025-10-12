from sqlalchemy import Column, Integer, String, TIMESTAMP, CheckConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Table(Base):
    __tablename__ = "tables"

    id = Column(Integer, primary_key=True, index=True)
    table_number = Column(String(10), unique=True, nullable=False, index=True)
    qr_code_url = Column(String(500), unique=True, nullable=False)
    qr_code_token = Column(String(255), unique=True, nullable=False, index=True)
    seating_capacity = Column(Integer, default=4)
    status = Column(
        String(20),
        default='available',
        nullable=False
    )
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    # Relationships
    orders = relationship("Order", back_populates="table")

    __table_args__ = (
        CheckConstraint(
            "status IN ('available', 'occupied', 'reserved', 'maintenance')",
            name="check_table_status"
        ),
    )
