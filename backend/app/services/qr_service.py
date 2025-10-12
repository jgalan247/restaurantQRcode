import qrcode
from pathlib import Path
from app.config import get_settings
from app.utils.calculations import generate_session_token

settings = get_settings()


def generate_qr_code(table_number: str, base_url: str = None) -> tuple[str, str]:
    """
    Generate QR code for table

    Returns:
        tuple: (qr_code_url, qr_code_token)
    """
    if base_url is None:
        base_url = settings.FRONTEND_URL

    # Generate unique token for this table
    token = generate_session_token()

    # Create URL with table number and session token
    url = f"{base_url}/menu?table={table_number}&session={token}"

    # Generate QR code
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(url)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Save to static folder
    static_dir = Path("static/qrcodes")
    static_dir.mkdir(parents=True, exist_ok=True)
    img_path = static_dir / f"table_{table_number}.png"
    img.save(img_path)

    # Return relative URL and token
    qr_code_url = f"/static/qrcodes/table_{table_number}.png"

    return qr_code_url, token
