"""
Invoice Service - Generate and manage invoices for orders
"""
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from decimal import Decimal
from datetime import datetime
from weasyprint import HTML
import io

from app.models.order import Order, OrderItem
from app.models.payment import PaymentSplit
from app.models.menu import MenuItem
from app.models.table import Table
from app.schemas.order import (
    InvoiceResponse,
    InvoiceRestaurantDetails,
    InvoiceItemDetail
)
from app.config import get_settings


class InvoiceService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.settings = get_settings()

    async def get_invoice_data(self, order_id: int) -> Optional[InvoiceResponse]:
        """
        Retrieve complete invoice data for an order
        """
        # Fetch order with all related data
        result = await self.db.execute(
            select(Order)
            .where(Order.id == order_id)
            .options(
                selectinload(Order.items).selectinload(OrderItem.menu_item),
                selectinload(Order.table),
                selectinload(Order.payment_splits)
            )
        )
        order = result.scalar_one_or_none()

        if not order:
            return None

        # Get restaurant details from config
        restaurant = InvoiceRestaurantDetails(
            name=self.settings.RESTAURANT_NAME,
            address=self.settings.RESTAURANT_ADDRESS,
            phone=self.settings.RESTAURANT_PHONE,
            email=self.settings.RESTAURANT_EMAIL,
            vat_number=self.settings.RESTAURANT_VAT_NUMBER if self.settings.RESTAURANT_VAT_NUMBER else None
        )

        # Build invoice items
        invoice_items = []
        for order_item in order.items:
            # Extract modifier names from selected_modifiers JSONB
            modifier_names = []
            if order_item.selected_modifiers:
                for mod in order_item.selected_modifiers:
                    if isinstance(mod, dict) and 'name' in mod:
                        modifier_names.append(mod['name'])

            invoice_items.append(InvoiceItemDetail(
                name=order_item.menu_item.name,
                quantity=order_item.quantity,
                unit_price=order_item.unit_price,
                modifiers=modifier_names,
                special_notes=order_item.special_notes,
                line_total=order_item.item_total
            ))

        # Determine payment method and status
        payment_method = None
        payment_status = order.status

        if order.payment_splits:
            # Check if any payment is completed
            completed_splits = [ps for ps in order.payment_splits if ps.payment_status == 'completed']
            if completed_splits:
                payment_status = 'paid'
                if completed_splits[0].payment_method:
                    payment_method = completed_splits[0].payment_method
            else:
                payment_status = 'pending_payment'

        # Get customer info from first payment split
        customer_name = None
        customer_email = None
        if order.payment_splits:
            first_split = order.payment_splits[0]
            customer_name = first_split.customer_name
            customer_email = first_split.customer_email

        # Build invoice response
        invoice = InvoiceResponse(
            restaurant=restaurant,
            order_number=order.order_number,
            invoice_number=order.order_number,  # Using order number as invoice number
            order_date=order.created_at,
            table_number=order.table.table_number if order.table else None,
            customer_name=customer_name,
            customer_email=customer_email,
            items=invoice_items,
            subtotal=order.subtotal,
            vat_rate=self.settings.GST_RATE,
            vat_amount=order.gst_amount,
            tip_amount=order.tip_amount,
            total_amount=order.total_amount,
            payment_method=payment_method,
            payment_status=payment_status
        )

        return invoice

    def generate_invoice_html(self, invoice: InvoiceResponse) -> str:
        """
        Generate HTML for invoice (for display and PDF generation)
        """
        # Format date
        order_date_str = invoice.order_date.strftime("%d %B %Y %H:%M")

        # Build items HTML
        items_html = ""
        for item in invoice.items:
            modifiers_str = ""
            if item.modifiers:
                modifiers_str = f"<br><small style='color: #666;'>+ {', '.join(item.modifiers)}</small>"

            notes_str = ""
            if item.special_notes:
                notes_str = f"<br><small style='color: #666; font-style: italic;'>Note: {item.special_notes}</small>"

            items_html += f"""
            <tr>
                <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb;">
                    <strong>{item.name}</strong>
                    {modifiers_str}
                    {notes_str}
                </td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">{item.quantity}</td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">£{item.unit_price:.2f}</td>
                <td style="padding: 12px 8px; border-bottom: 1px solid #e5e7eb; text-align: right;"><strong>£{item.line_total:.2f}</strong></td>
            </tr>
            """

        # Customer info section
        customer_html = ""
        if invoice.customer_name or invoice.customer_email:
            customer_html = f"""
            <div style="margin-top: 16px; padding: 12px; background-color: #f9fafb; border-radius: 8px;">
                <p style="margin: 0; font-size: 14px; color: #4b5563;">
                    <strong>Customer:</strong><br>
                    {invoice.customer_name if invoice.customer_name else 'Guest'}<br>
                    {invoice.customer_email if invoice.customer_email else ''}
                </p>
            </div>
            """

        # VAT info
        vat_percentage = int(invoice.vat_rate * 100)

        # Payment status badge
        status_color = "#10b981" if invoice.payment_status == "paid" else "#f59e0b"
        status_text = "PAID" if invoice.payment_status == "paid" else "PENDING PAYMENT"

        html = f"""
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <title>Invoice {invoice.invoice_number}</title>
            <style>
                @page {{
                    size: A4;
                    margin: 1cm;
                }}
                body {{
                    font-family: 'Helvetica', 'Arial', sans-serif;
                    color: #1f2937;
                    line-height: 1.6;
                }}
            </style>
        </head>
        <body>
            <!-- Header with branding -->
            <div style="border-bottom: 4px solid #ea580c; padding-bottom: 16px; margin-bottom: 24px;">
                <h1 style="color: #ea580c; margin: 0; font-size: 32px;">{invoice.restaurant.name}</h1>
                <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 14px;">
                    {invoice.restaurant.address}<br>
                    Tel: {invoice.restaurant.phone} | Email: {invoice.restaurant.email}
                    {f'<br>VAT No: {invoice.restaurant.vat_number}' if invoice.restaurant.vat_number else ''}
                </p>
            </div>

            <!-- Invoice header -->
            <div style="display: flex; justify-content: space-between; margin-bottom: 24px;">
                <div>
                    <h2 style="margin: 0 0 8px 0; font-size: 24px;">INVOICE</h2>
                    <p style="margin: 4px 0; font-size: 14px;">
                        <strong>Invoice #:</strong> {invoice.invoice_number}<br>
                        <strong>Order #:</strong> {invoice.order_number}<br>
                        <strong>Date:</strong> {order_date_str}
                        {f'<br><strong>Table:</strong> {invoice.table_number}' if invoice.table_number else ''}
                    </p>
                </div>
                <div>
                    <span style="display: inline-block; padding: 8px 16px; background-color: {status_color}; color: white; border-radius: 6px; font-weight: bold; font-size: 14px;">
                        {status_text}
                    </span>
                </div>
            </div>

            {customer_html}

            <!-- Items table -->
            <table style="width: 100%; margin-top: 24px; border-collapse: collapse;">
                <thead>
                    <tr style="background-color: #f3f4f6;">
                        <th style="padding: 12px 8px; text-align: left; border-bottom: 2px solid #d1d5db;">Item</th>
                        <th style="padding: 12px 8px; text-align: center; border-bottom: 2px solid #d1d5db; width: 80px;">Qty</th>
                        <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #d1d5db; width: 100px;">Price</th>
                        <th style="padding: 12px 8px; text-align: right; border-bottom: 2px solid #d1d5db; width: 100px;">Total</th>
                    </tr>
                </thead>
                <tbody>
                    {items_html}
                </tbody>
            </table>

            <!-- Totals -->
            <div style="margin-top: 24px; text-align: right;">
                <table style="width: 300px; margin-left: auto; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 8px; text-align: left; font-size: 14px;">Subtotal:</td>
                        <td style="padding: 8px; text-align: right; font-size: 14px;">£{invoice.subtotal:.2f}</td>
                    </tr>
                    <tr>
                        <td style="padding: 8px; text-align: left; font-size: 14px;">VAT ({vat_percentage}%):</td>
                        <td style="padding: 8px; text-align: right; font-size: 14px;">£{invoice.vat_amount:.2f}</td>
                    </tr>
                    {f'''<tr>
                        <td style="padding: 8px; text-align: left; font-size: 14px;">Tip:</td>
                        <td style="padding: 8px; text-align: right; font-size: 14px;">£{invoice.tip_amount:.2f}</td>
                    </tr>''' if invoice.tip_amount > 0 else ''}
                    <tr style="border-top: 2px solid #d1d5db;">
                        <td style="padding: 12px 8px; text-align: left; font-size: 18px; font-weight: bold;">TOTAL:</td>
                        <td style="padding: 12px 8px; text-align: right; font-size: 18px; font-weight: bold;">£{invoice.total_amount:.2f}</td>
                    </tr>
                </table>
            </div>

            {f'<div style="margin-top: 16px; text-align: right; color: #6b7280; font-size: 14px;">Payment Method: {invoice.payment_method.replace("_", " ").title()}</div>' if invoice.payment_method else ''}

            <!-- Footer -->
            <div style="margin-top: 48px; padding-top: 24px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280; font-size: 12px;">
                <p style="margin: 8px 0;">Thank you for dining with us!</p>
                <p style="margin: 8px 0;">We hope to see you again soon.</p>
                <p style="margin: 8px 0; font-style: italic;">Authentic Mexican Cuisine Made Fresh Daily</p>
            </div>
        </body>
        </html>
        """

        return html

    async def generate_pdf(self, order_id: int) -> Optional[bytes]:
        """
        Generate PDF invoice for an order
        Returns PDF bytes or None if order not found
        """
        try:
            invoice = await self.get_invoice_data(order_id)
            if not invoice:
                return None

            html = self.generate_invoice_html(invoice)

            # Generate PDF using WeasyPrint
            pdf_file = HTML(string=html).write_pdf()

            return pdf_file
        except Exception as e:
            # Log the error for debugging
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"PDF generation failed for order {order_id}: {str(e)}", exc_info=True)
            raise

    def get_pdf_filename(self, order_number: str) -> str:
        """
        Generate standard PDF filename
        Format: invoice_ORDER123_2025-10-13.pdf
        """
        date_str = datetime.now().strftime("%Y-%m-%d")
        return f"invoice_{order_number}_{date_str}.pdf"
