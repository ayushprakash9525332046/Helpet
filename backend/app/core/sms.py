import random
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


def send_otp_sms(phone: str, otp: str, purpose: str = "login") -> bool:
    messages = {
        "login": f"Your Helpet login OTP is {otp}. Valid for 10 minutes. Do not share.",
        "reset": f"Your Helpet password reset OTP is {otp}. Valid for 10 minutes. Do not share.",
        "verify": f"Your Helpet verification OTP is {otp}. Valid for 10 minutes. Do not share.",
    }
    body = messages.get(purpose, f"Your Helpet OTP is {otp}. Valid for 10 minutes.")

    sid   = getattr(settings, "TWILIO_ACCOUNT_SID",   None)
    token = getattr(settings, "TWILIO_AUTH_TOKEN",    None)
    from_ = getattr(settings, "TWILIO_PHONE_NUMBER",  None)

    # Check for actual credentials (not just placeholders)
    if not sid or not token or not from_ or sid.startswith("AC...") or token == "your_token" or from_.startswith("+1..."):
        # Development mode — print OTP to console
        print(f"\n{'='*60}")
        print(f"  DEV OTP  |  Phone: {phone}  |  Code: {otp}  |  Purpose: {purpose}")
        print(f"  NOTE: To send actual SMS, provide TWILIO credentials in .env")
        print(f"{'='*60}\n")
        logger.info(f"[DEV OTP] {phone}: {otp} ({purpose})")
        return True

    try:
        from twilio.rest import Client
        client = Client(sid, token)
        to = f"+91{phone}" if not phone.startswith("+") else phone
        client.messages.create(body=body, from_=from_, to=to)
        return True
    except Exception as e:
        logger.error(f"SMS send failed for {phone}: {e}")
        return False
