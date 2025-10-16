"""
Admin Reports & Analytics API

Provides comprehensive reporting and analytics endpoints for the admin dashboard.
"""

from fastapi import APIRouter, Depends, Query, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import date, datetime, timedelta
from typing import Optional, List
import csv
import io

from app.database import get_db
from app.utils.auth import get_current_admin
from app.models.admin import AdminUser
from app.services.report_service import ReportService
from app.schemas.analytics import (
    KeyMetricsResponse,
    RevenueOverTimeItem,
    OrdersByTimeItem,
    RevenueByCategoryItem,
    TopItemResponse,
    SalesByTableItem,
    PaymentMethodItem,
    DailySalesSummaryItem,
    ComprehensiveReportResponse
)

router = APIRouter(prefix="/admin/reports", tags=["Admin Reports"])


# ============================================================================
# KEY METRICS
# ============================================================================

@router.get("/metrics", response_model=KeyMetricsResponse)
async def get_key_metrics(
    start_date: date = Query(..., description="Report start date"),
    end_date: date = Query(..., description="Report end date"),
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get key metrics overview with trend comparison

    Returns:
        - Total revenue for period
        - Total orders
        - Average order value
        - Most popular item
        - Trend percentages vs previous period
    """
    return await ReportService.get_key_metrics(db, start_date, end_date)


# ============================================================================
# REVENUE OVER TIME
# ============================================================================

@router.get("/revenue-over-time", response_model=List[RevenueOverTimeItem])
async def get_revenue_over_time(
    start_date: date = Query(..., description="Report start date"),
    end_date: date = Query(..., description="Report end date"),
    granularity: str = Query('day', description="Granularity: day, week, month"),
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get revenue data over time for line/bar charts

    Args:
        granularity: 'day', 'week', or 'month'

    Returns:
        List of data points with date/period, revenue, and order count
    """
    if granularity not in ['day', 'week', 'month']:
        raise HTTPException(status_code=400, detail="Invalid granularity. Use: day, week, month")

    return await ReportService.get_revenue_over_time(db, start_date, end_date, granularity)


# ============================================================================
# ORDERS BY TIME OF DAY
# ============================================================================

@router.get("/orders-by-time", response_model=List[OrdersByTimeItem])
async def get_orders_by_time(
    start_date: date = Query(..., description="Report start date"),
    end_date: date = Query(..., description="Report end date"),
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get order distribution by hour of day

    Returns:
        List of 24 hours with order counts
    """
    return await ReportService.get_orders_by_time(db, start_date, end_date)


# ============================================================================
# REVENUE BY CATEGORY
# ============================================================================

@router.get("/revenue-by-category", response_model=List[RevenueByCategoryItem])
async def get_revenue_by_category(
    start_date: date = Query(..., description="Report start date"),
    end_date: date = Query(..., description="Report end date"),
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get revenue breakdown by category for pie/donut charts

    Returns:
        List of categories with revenue and percentage
    """
    return await ReportService.get_revenue_by_category(db, start_date, end_date)


# ============================================================================
# TOP & BOTTOM ITEMS
# ============================================================================

@router.get("/top-items", response_model=List[TopItemResponse])
async def get_top_items(
    start_date: date = Query(..., description="Report start date"),
    end_date: date = Query(..., description="Report end date"),
    limit: int = Query(20, ge=1, le=100, description="Number of items to return"),
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get top selling items

    Returns:
        List of top items with rank, name, category, quantity, revenue
    """
    return await ReportService.get_top_items(db, start_date, end_date, limit)


@router.get("/bottom-items", response_model=List[TopItemResponse])
async def get_bottom_items(
    start_date: date = Query(..., description="Report start date"),
    end_date: date = Query(..., description="Report end date"),
    limit: int = Query(10, ge=1, le=50, description="Number of items to return"),
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get worst performing items (items with sales but lowest quantity)

    Returns:
        List of bottom items with rank, name, category, quantity, revenue
    """
    return await ReportService.get_bottom_items(db, start_date, end_date, limit)


# ============================================================================
# SALES BY TABLE
# ============================================================================

@router.get("/sales-by-table", response_model=List[SalesByTableItem])
async def get_sales_by_table(
    start_date: date = Query(..., description="Report start date"),
    end_date: date = Query(..., description="Report end date"),
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get sales breakdown by table

    Returns:
        List of tables with order count, total revenue, avg order value
    """
    return await ReportService.get_sales_by_table(db, start_date, end_date)


# ============================================================================
# PAYMENT METHODS
# ============================================================================

@router.get("/payment-methods", response_model=List[PaymentMethodItem])
async def get_payment_methods(
    start_date: date = Query(..., description="Report start date"),
    end_date: date = Query(..., description="Report end date"),
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get breakdown by payment method

    Returns:
        List of payment methods with counts, revenue, percentage
    """
    return await ReportService.get_payment_methods_breakdown(db, start_date, end_date)


# ============================================================================
# DAILY SUMMARY
# ============================================================================

@router.get("/daily-summary", response_model=List[DailySalesSummaryItem])
async def get_daily_summary(
    start_date: date = Query(..., description="Report start date"),
    end_date: date = Query(..., description="Report end date"),
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get daily sales summary table

    Returns:
        List of days with order count, revenue, avg order value
    """
    return await ReportService.get_daily_sales_summary(db, start_date, end_date)


# ============================================================================
# COMPREHENSIVE REPORT
# ============================================================================

@router.get("/comprehensive", response_model=ComprehensiveReportResponse)
async def get_comprehensive_report(
    start_date: date = Query(..., description="Report start date"),
    end_date: date = Query(..., description="Report end date"),
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Get all report data in one call

    Useful for export functionality and comprehensive views
    """
    return await ReportService.get_comprehensive_report(db, start_date, end_date)


# ============================================================================
# EXPORT FUNCTIONALITY
# ============================================================================

@router.get("/export/csv")
async def export_report_csv(
    start_date: date = Query(..., description="Report start date"),
    end_date: date = Query(..., description="Report end date"),
    report_type: str = Query('comprehensive', description="Type of report to export"),
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Export report data as CSV

    Args:
        report_type: 'comprehensive', 'top-items', 'daily-summary', 'sales-by-table'

    Returns:
        CSV file download
    """
    output = io.StringIO()
    writer = csv.writer(output)

    if report_type == 'top-items':
        # Export top items
        items = await ReportService.get_top_items(db, start_date, end_date, limit=50)
        writer.writerow(['Rank', 'Item Name', 'Category', 'Quantity Sold', 'Revenue'])
        for item in items:
            writer.writerow([
                item['rank'],
                item['name'],
                item['category'],
                item['quantity'],
                f"£{item['revenue']:.2f}"
            ])

    elif report_type == 'daily-summary':
        # Export daily summary
        daily_data = await ReportService.get_daily_sales_summary(db, start_date, end_date)
        writer.writerow(['Date', 'Orders', 'Total Revenue', 'Avg Order Value'])
        for day in daily_data:
            writer.writerow([
                day['date'],
                day['order_count'],
                f"£{day['total_revenue']:.2f}",
                f"£{day['avg_order_value']:.2f}"
            ])

    elif report_type == 'sales-by-table':
        # Export sales by table
        table_data = await ReportService.get_sales_by_table(db, start_date, end_date)
        writer.writerow(['Table Number', 'Orders', 'Total Revenue', 'Avg Order Value'])
        for table in table_data:
            writer.writerow([
                table['table_number'],
                table['order_count'],
                f"£{table['total_revenue']:.2f}",
                f"£{table['avg_order_value']:.2f}"
            ])

    else:  # comprehensive
        # Export comprehensive report
        report = await ReportService.get_comprehensive_report(db, start_date, end_date)

        # Key metrics section
        writer.writerow(['SALES REPORT'])
        writer.writerow([f"Period: {report['report_period']['start_date']} to {report['report_period']['end_date']}"])
        writer.writerow([])

        writer.writerow(['KEY METRICS'])
        metrics = report['key_metrics']
        writer.writerow(['Metric', 'Value', 'Trend'])
        writer.writerow(['Total Revenue', f"£{metrics['total_revenue']:.2f}", f"{metrics['revenue_trend']:+.1f}%"])
        writer.writerow(['Total Orders', metrics['total_orders'], f"{metrics['orders_trend']:+.1f}%"])
        writer.writerow(['Avg Order Value', f"£{metrics['avg_order_value']:.2f}", f"{metrics['avg_order_value_trend']:+.1f}%"])
        writer.writerow(['Most Popular Item', f"{metrics['popular_item']['name']} ({metrics['popular_item']['quantity']} sold)", ''])
        writer.writerow([])

        # Top items section
        writer.writerow(['TOP 20 ITEMS'])
        writer.writerow(['Rank', 'Item Name', 'Category', 'Quantity', 'Revenue'])
        for item in report['top_items']:
            writer.writerow([
                item['rank'],
                item['name'],
                item['category'],
                item['quantity'],
                f"£{item['revenue']:.2f}"
            ])
        writer.writerow([])

        # Revenue by category
        writer.writerow(['REVENUE BY CATEGORY'])
        writer.writerow(['Category', 'Revenue', 'Percentage'])
        for cat in report['revenue_by_category']:
            writer.writerow([
                cat['category'],
                f"£{cat['revenue']:.2f}",
                f"{cat['percentage']:.1f}%"
            ])
        writer.writerow([])

        # Daily summary
        writer.writerow(['DAILY SUMMARY'])
        writer.writerow(['Date', 'Orders', 'Revenue', 'Avg Order Value'])
        for day in report['daily_summary']:
            writer.writerow([
                day['date'],
                day['order_count'],
                f"£{day['total_revenue']:.2f}",
                f"£{day['avg_order_value']:.2f}"
            ])

    # Prepare file for download
    output.seek(0)
    filename = f"report_{report_type}_{start_date}_{end_date}.csv"

    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )


@router.get("/export/json")
async def export_report_json(
    start_date: date = Query(..., description="Report start date"),
    end_date: date = Query(..., description="Report end date"),
    db: AsyncSession = Depends(get_db),
    current_admin: AdminUser = Depends(get_current_admin)
):
    """
    Export comprehensive report as JSON

    Returns:
        JSON file download with complete report data
    """
    report = await ReportService.get_comprehensive_report(db, start_date, end_date)

    # Return as downloadable JSON
    import json
    filename = f"report_comprehensive_{start_date}_{end_date}.json"

    return StreamingResponse(
        iter([json.dumps(report, indent=2)]),
        media_type="application/json",
        headers={
            "Content-Disposition": f"attachment; filename={filename}"
        }
    )
