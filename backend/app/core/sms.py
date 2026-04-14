import random
import logging

logger = logging.getLogger(__name__)


def generate_otp() -> str:
    return str(random.randint(100000, 999999))


def send_otp_sms(phone: str, otp: str, purpose: str = "login") -> bool:
    # SMS disabled — switched to email OTP (free, no TRAI DLT required)
    # Re-enable after TRAI DLT registration is approved for sender HELPET
    logger.info(f"[SMS DISABLED] {phone}: {otp} ({purpose}) — using email OTP instead")
    return True
