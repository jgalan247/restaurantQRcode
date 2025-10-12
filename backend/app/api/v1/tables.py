from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.api.deps import get_db
from app.models.table import Table
from app.schemas.table import TableResponse, TableCreate, TableUpdate
from app.services.qr_service import generate_qr_code
from app.config import get_settings

router = APIRouter()
settings = get_settings()


@router.get("/", response_model=List[TableResponse])
async def get_tables(db: AsyncSession = Depends(get_db)):
    """Get all tables"""
    result = await db.execute(select(Table).order_by(Table.table_number))
    tables = result.scalars().all()
    return tables


@router.get("/{table_number}", response_model=TableResponse)
async def get_table(table_number: str, db: AsyncSession = Depends(get_db)):
    """Get table by number"""
    result = await db.execute(
        select(Table).where(Table.table_number == table_number)
    )
    table = result.scalar_one_or_none()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")
    return table


@router.post("/", response_model=TableResponse, status_code=status.HTTP_201_CREATED)
async def create_table(table_data: TableCreate, db: AsyncSession = Depends(get_db)):
    """Create a new table with QR code"""

    # Check if table number already exists
    existing = await db.execute(
        select(Table).where(Table.table_number == table_data.table_number)
    )
    if existing.scalar_one_or_none():
        raise HTTPException(
            status_code=400, detail="Table with this number already exists"
        )

    # Generate QR code
    qr_code_url, qr_code_token = generate_qr_code(
        table_data.table_number, settings.FRONTEND_URL
    )

    # Create table
    table = Table(
        table_number=table_data.table_number,
        seating_capacity=table_data.seating_capacity,
        status=table_data.status,
        qr_code_url=qr_code_url,
        qr_code_token=qr_code_token,
    )
    db.add(table)
    await db.commit()
    await db.refresh(table)

    return table


@router.patch("/{table_number}", response_model=TableResponse)
async def update_table(
    table_number: str, table_data: TableUpdate, db: AsyncSession = Depends(get_db)
):
    """Update table details"""
    result = await db.execute(
        select(Table).where(Table.table_number == table_number)
    )
    table = result.scalar_one_or_none()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")

    # Update fields if provided
    if table_data.table_number is not None:
        table.table_number = table_data.table_number
    if table_data.seating_capacity is not None:
        table.seating_capacity = table_data.seating_capacity
    if table_data.status is not None:
        table.status = table_data.status

    await db.commit()
    await db.refresh(table)

    return table


@router.delete("/{table_number}")
async def delete_table(table_number: str, db: AsyncSession = Depends(get_db)):
    """Delete a table"""
    result = await db.execute(
        select(Table).where(Table.table_number == table_number)
    )
    table = result.scalar_one_or_none()
    if not table:
        raise HTTPException(status_code=404, detail="Table not found")

    await db.delete(table)
    await db.commit()

    return {"message": "Table deleted successfully"}
