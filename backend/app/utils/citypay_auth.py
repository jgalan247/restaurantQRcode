"""
CityPay API Key Generator
Generates temporal cp-api-key for authentication with CityPay API
Based on: https://docs.citypay.com/authentication
"""
import hmac
import hashlib
import secrets
import base64
from datetime import datetime, timezone


def generate_api_key(client_id: str, licence_key: str) -> str:
    """
    Generate a temporal CityPay API key for cp-api-key authentication.
    Implementation based on CityPay's official Python SDK.

    The key format is: base64(clientId:nonce_hex:digest_hex)
    Where digest = HMAC-SHA256(clientId_bytes + nonce_bytes + timestamp_bytes, licence_key)

    Args:
        client_id: Your CityPay client ID (e.g., "PC603250")
        licence_key: Your CityPay licence key

    Returns:
        Base64-encoded API key string for cp-api-key header

    Example:
        >>> api_key = generate_api_key("PC603250", "your-licence-key")
        >>> configuration.api_key['cp-api-key'] = api_key
    """
    # Generate 16-byte (128-bit) random nonce
    nonce = secrets.token_bytes(16)

    # Get current UTC time in yyyyMMddHHmm format
    utc_now = datetime.now(timezone.utc)
    timestamp = utc_now.strftime("%Y%m%d%H%M")

    # Create message: clientId (UTF-8 bytes) + nonce (raw bytes) + timestamp (hex bytes)
    message = bytearray()
    message.extend(client_id.encode('utf-8'))
    message.extend(nonce)
    message.extend(bytearray.fromhex(timestamp.encode('utf-8').hex()))

    # Generate HMAC-SHA256 digest
    digest = hmac.new(
        key=licence_key.encode('utf-8'),
        msg=bytes(message),
        digestmod=hashlib.sha256
    ).digest()

    # Create packet: clientId:nonce_hex:digest_hex
    nonce_hex = nonce.hex().upper()
    digest_hex = digest.hex().upper()
    packet = f"{client_id}:{nonce_hex}:{digest_hex}"

    # Base64 encode the packet
    api_key = base64.b64encode(packet.encode('utf-8')).decode('utf-8')

    return api_key


def configure_citypay_client(client_id: str, licence_key: str, sandbox: bool = True):
    """
    Configure CityPay API client with automatic key generation.

    Args:
        client_id: Your CityPay client ID
        licence_key: Your CityPay licence key
        sandbox: True for sandbox environment, False for production

    Returns:
        Configured citypay.Configuration object

    Example:
        >>> config = configure_citypay_client("PC603250", "your-key", sandbox=True)
        >>> with citypay.ApiClient(config) as api_client:
        >>>     api = citypay.PaylinkApi(api_client)
    """
    import citypay

    # Set host based on environment
    host = "https://sandbox.citypay.com" if sandbox else "https://api.citypay.com"

    # Create configuration
    configuration = citypay.Configuration(host=host)

    # Generate and set API key
    configuration.api_key['cp-api-key'] = generate_api_key(client_id, licence_key)

    return configuration


# Example usage
if __name__ == "__main__":
    import os

    # Test key generation
    client_id = os.environ.get("CITYPAY_CLIENT_ID", "PC603250")
    licence_key = os.environ.get("CITYPAY_LICENCE_KEY", "test-key")

    api_key = generate_api_key(client_id, licence_key)
    print(f"Generated API Key: {api_key[:50]}...")
    print(f"API Key Length: {len(api_key)}")

    # Decode to show format
    decoded = base64.b64decode(api_key).decode('utf-8')
    parts = decoded.split(':')
    print(f"\nDecoded format:")
    print(f"  Client ID: {parts[0]}")
    print(f"  Nonce: {parts[1][:20]}...")
    print(f"  Hash: {parts[2][:20]}...")
