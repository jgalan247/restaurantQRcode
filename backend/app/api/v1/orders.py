from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import Response
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.api.deps import get_db
from app.schemas.order import OrderCreate, OrderResponse, OrderCalculation, InvoiceResponse
from app.services.order_service import OrderService
from app.services.invoice_service import InvoiceService

router = APIRouter()


@router.post("", response_model=OrderResponse, status_code=status.HTTP_201_CREATED)
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


@router.get("/{order_id}/invoice", response_model=InvoiceResponse)
async def get_invoice(order_id: int, db: AsyncSession = Depends(get_db)):
    """Get invoice data for an order"""
    invoice_service = InvoiceService(db)
    invoice = await invoice_service.get_invoice_data(order_id)
    if not invoice:
        raise HTTPException(status_code=404, detail="Order not found")
    return invoice


@router.get("/{order_id}/invoice/pdf")
async def download_invoice_pdf(order_id: int, db: AsyncSession = Depends(get_db)):
    """Download invoice as PDF"""
    try:
        invoice_service = InvoiceService(db)

        # Get invoice data first to get order number
        invoice = await invoice_service.get_invoice_data(order_id)
        if not invoice:
            raise HTTPException(status_code=404, detail="Order not found")

        # Generate PDF
        pdf_bytes = await invoice_service.generate_pdf(order_id)
        if not pdf_bytes:
            raise HTTPException(status_code=500, detail="Failed to generate PDF")

        # Generate filename
        filename = invoice_service.get_pdf_filename(invoice.order_number)

        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="{filename}"'
            }
        )
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        # Log unexpected errors
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Unexpected error generating PDF for order {order_id}: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate PDF invoice: {str(e)}"
        )
