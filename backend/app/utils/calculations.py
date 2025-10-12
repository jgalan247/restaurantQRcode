from decimal import Decimal
from datetime import datetime
import secrets
import string


def calculate_gst(amount: Decimal, gst_rate: float) -> Decimal:
    """Calculate GST amount"""
    return Decimal(str(float(amount) * gst_rate)).quantize(Decimal('0.01'))


def calculate_tip(subtotal: Decimal, tip_percentage: float) -> Decimal:
    """Calculate tip amount"""
    if tip_percentage <= 0:
        return Decimal('0.00')
    return Decimal(str(float(subtotal) * (tip_percentage / 100))).quantize(Decimal('0.01'))


def generate_order_number() -> str:
    """Generate unique order number"""
    timestamp = datetime.now().strftime('%y%m%d')
    random_part = ''.join(secrets.choice(string.digits) for _ in range(4))
    return f"LH{timestamp}{random_part}"


def generate_session_token() -> str:
    """Generate session token for customer"""
    return secrets.token_urlsafe(32)


def generate_split_token() -> str:
    """Generate unique token for payment split"""
    return secrets.token_urlsafe(32)


def calculate_split_amounts(
    subtotal: Decimal,
    gst_amount: Decimal,
    tip_amount: Decimal,
    people_count: int
) -> Decimal:
    """Calculate amount per person for equal split"""
    total = subtotal + gst_amount + tip_amount
    return Decimal(str(float(total) / people_count)).quantize(Decimal('0.01'))
