from fastapi_mail import FastMail, MessageSchema, ConnectionConfig
from jinja2 import Environment, FileSystemLoader
from pathlib import Path
from decimal import Decimal
from typing import Dict, Any

from app.config import get_settings

settings = get_settings()

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_FROM_NAME=settings.MAIL_FROM_NAME,
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
    USE_CREDENTIALS=True,
)

templates_path = Path(__file__).parent.parent / "templates" / "email"
jinja_env = Environment(loader=FileSystemLoader(str(templates_path)))


async def send_payment_link_email(
    email: str, payment_url: str, amount: Decimal, order_number: str
):
    """Send payment link to customer"""

    template = jinja_env.get_template("payment_link.html")
    html_body = template.render(
        payment_url=payment_url, amount=f"${amount:.2f}", order_number=order_number
    )

    message = MessageSchema(
        subject=f"Payment Required - Order {order_number}",
        recipients=[email],
        body=html_body,
        subtype="html",
    )

    fm = FastMail(conf)
    await fm.send_message(message)


async def send_receipt_email(email: str, order_data: Dict[str, Any]):
    """Send order receipt"""

    template = jinja_env.get_template("receipt.html")
    html_body = template.render(**order_data)

    message = MessageSchema(
        subject=f"Receipt - Order {order_data['order_number']}",
        recipients=[email],
        body=html_body,
        subtype="html",
    )

    fm = FastMail(conf)
    await fm.send_message(message)
