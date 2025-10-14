from fastapi import APIRouter
from app.api.v1 import menu, orders, payment, tables, admin, admin_auth, admin_menu, admin_orders, admin_reports, admin_settings, customer_promotions

api_router = APIRouter()

api_router.include_router(menu.router, prefix="/menu", tags=["menu"])
api_router.include_router(orders.router, prefix="/orders", tags=["orders"])
api_router.include_router(payment.router, prefix="/payment", tags=["payment"])
api_router.include_router(tables.router, prefix="/tables", tags=["tables"])
api_router.include_router(customer_promotions.router, tags=["Customer Promotions"])
api_router.include_router(admin_auth.router, tags=["Admin Auth"])
api_router.include_router(admin.router, tags=["Admin Dashboard"])
api_router.include_router(admin_menu.router, tags=["Admin Menu Management"])
api_router.include_router(admin_orders.router, tags=["Admin Orders"])
api_router.include_router(admin_reports.router, tags=["Admin Reports"])
api_router.include_router(admin_settings.router, tags=["Admin Settings"])
