from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api.deps import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderCalculation
from app.services.order_service import OrderService

router = APIRouter()


@router.post("/", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
async def create_order(order_data: OrderCreate, db: AsyncSession = Depends(get_db)):
    """Create a new order"""
    order_service = OrderService(db)
    try:
        order = await order_service.create_order(order_data)
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/{order_id}", response_model=OrderResponse)
async def get_order(order_id: int, db: AsyncSession = Depends(get_db)):
    """Get order by ID"""
    order_service = OrderService(db)
    order = await order_service.get_order(order_id)
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    return order


@router.post("/{order_id}/calculate", response_model=OrderCalculation)
async def calculate_order_total(
    order_id: int, tip_percentage: float = 0, db: AsyncSession = Depends(get_db)
):
    """Calculate order totals with tip"""
    order_service = OrderService(db)
    try:
        calculation = await order_service.calculate_totals(order_id, tip_percentage)
        return calculation
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.patch("/{order_id}/status")
async def update_order_status(
    order_id: int, new_status: str, db: AsyncSession = Depends(get_db)
):
    """Update order status"""
    order_service = OrderService(db)
    try:
        order = await order_service.update_status(order_id, new_status)
        return {"message": "Order status updated", "order_id": order.id, "status": order.status}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/table/{table_number}", response_model=List[OrderResponse])
async def get_orders_by_table(table_number: str, db: AsyncSession = Depends(get_db)):
    """Get all orders for a specific table"""
    order_service = OrderService(db)
    orders = await order_service.get_orders_by_table(table_number)
    return orders
