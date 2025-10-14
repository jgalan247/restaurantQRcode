from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date
from decimal import Decimal


class DashboardOverview(BaseModel):
    """Dashboard home overview statistics"""
    today_sales: Decimal
    today_orders: int
    average_order_value: Decimal
    most_popular_item: Optional[str] = None
    most_popular_item_count: int = 0
    pending_orders: int
    preparing_orders: int


class DailySalesReport(BaseModel):
    """Daily sales summary"""
    date: date
    total_revenue: Decimal
    order_count: int
    average_order_value: Decimal
    revenue_by_payment_method: dict  # {"card": 1500.00, "cash": 200.00}
    orders_by_hour: List[dict]  # [{"hour": 12, "count": 15, "revenue": 450.00}]


class CategoryRevenue(BaseModel):
    """Revenue breakdown by category"""
    category_id: int
    category_name: str
    revenue: Decimal
    order_count: int
    percentage_of_total: float


class PopularItem(BaseModel):
    """Most demanded/popular menu item"""
    item_id: int
    item_name: str
    category_name: str
    quantity_sold: int
    revenue: Decimal
    percentage_of_orders: float
    average_price: Decimal


class SalesReportResponse(BaseModel):
    """Complete sales report"""
    start_date: date
    end_date: date
    total_revenue: Decimal
    total_orders: int
    average_order_value: Decimal
    revenue_by_category: List[CategoryRevenue]
    revenue_by_payment_method: dict
    top_items: List[PopularItem]
    daily_breakdown: List[DailySalesReport]


class ItemPerformance(BaseModel):
    """Detailed item performance analytics"""
    item_id: int
    item_name: str
    category_name: str
    times_ordered: int
    quantity_sold: int
    total_revenue: Decimal
    average_price: Decimal
    percentage_of_total_orders: float
    percentage_of_total_revenue: float
    trend: str  # 'growing', 'stable', 'declining'


class AnalyticsResponse(BaseModel):
    """Comprehensive analytics data"""
    date_range: dict
    all_items: List[ItemPerformance]
    summary: dict


class OrderStatusStats(BaseModel):
    """Order status statistics"""
    status: str
    count: int
    percentage: float


class RevenueChartData(BaseModel):
    """Data for revenue charts"""
    date: str
    revenue: Decimal
    orders: int


class OrdersHistoryFilter(BaseModel):
    """Filters for order history"""
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[str] = None
    table_number: Optional[int] = None
    min_amount: Optional[Decimal] = None
    max_amount: Optional[Decimal] = None


class OrderHistoryItem(BaseModel):
    """Order history list item"""
    id: int
    order_number: str
    table_number: int
    status: str
    total_amount: Decimal
    items_count: int
    created_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class OrderHistoryResponse(BaseModel):
    """Paginated order history"""
    orders: List[OrderHistoryItem]
    total: int
    page: int
    page_size: int
    total_pages: int


# ============================================================================
# REPORTS & ANALYTICS SCHEMAS
# ============================================================================

class PopularItemResponse(BaseModel):
    """Popular item for key metrics"""
    name: str
    quantity: int


class KeyMetricsResponse(BaseModel):
    """Key metrics overview with trends"""
    total_revenue: float
    total_orders: int
    avg_order_value: float
    popular_item: PopularItemResponse
    revenue_trend: float  # Percentage change
    orders_trend: float  # Percentage change
    avg_order_value_trend: float  # Percentage change


class RevenueOverTimeItem(BaseModel):
    """Revenue data point for time series"""
    date: Optional[str] = None
    week: Optional[str] = None
    month: Optional[str] = None
    revenue: float
    order_count: int


class OrdersByTimeItem(BaseModel):
    """Order distribution by hour"""
    hour: int
    time: str
    order_count: int


class RevenueByCategoryItem(BaseModel):
    """Category revenue breakdown"""
    category: str
    revenue: float
    percentage: float


class TopItemResponse(BaseModel):
    """Top/bottom performing item"""
    rank: int
    name: str
    category: str
    quantity: int
    revenue: float


class SalesByTableItem(BaseModel):
    """Sales breakdown by table"""
    table_number: str
    order_count: int
    total_revenue: float
    avg_order_value: float


class PaymentMethodItem(BaseModel):
    """Payment method breakdown"""
    method: str
    order_count: int
    revenue: float
    percentage: float


class DailySalesSummaryItem(BaseModel):
    """Daily sales summary"""
    date: str
    order_count: int
    total_revenue: float
    avg_order_value: float


class ReportPeriodResponse(BaseModel):
    """Report date range"""
    start_date: str
    end_date: str


class ComprehensiveReportResponse(BaseModel):
    """Complete report with all data"""
    report_period: ReportPeriodResponse
    key_metrics: KeyMetricsResponse
    revenue_over_time: List[RevenueOverTimeItem]
    orders_by_time: List[OrdersByTimeItem]
    revenue_by_category: List[RevenueByCategoryItem]
    top_items: List[TopItemResponse]
    bottom_items: List[TopItemResponse]
    sales_by_table: List[SalesByTableItem]
    payment_methods: List[PaymentMethodItem]
    daily_summary: List[DailySalesSummaryItem]
