from fastapi import APIRouter
from app.api.v1 import menu, orders, payment, tables

api_router = APIRouter()

api_router.include_router(menu.router, prefix="/menu", tags=["menu"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(payment.router, prefix="/payment", tags=["payment"])
api_router.include_router(tables.router, prefix="/tables", tags=["tables"])
