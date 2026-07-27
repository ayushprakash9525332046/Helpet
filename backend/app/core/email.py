import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger(__name__)

_SUBJECTS = {
    "login":  "Your Helpet Login OTP",
    "reset":  "Your Helpet Password Reset OTP",
    "verify": "Verify your Helpet Account",
}


def send_otp_email(email: str, otp: str, purpose: str = "login") -> bool:
    subject = _SUBJECTS.get(purpose, "Your Helpet OTP")

    smtp_user = getattr(settings, "SMTP_USER", None)
    smtp_pass = getattr(settings, "SMTP_PASSWORD", None)

    if not smtp_user or not smtp_pass:
        print(f"\n{'='*60}")
        print(f"  DEV OTP  |  Email: {email}  |  Code: {otp}  |  Purpose: {purpose}")
        print(f"  NOTE: Set SMTP_USER and SMTP_PASSWORD in .env to send real emails")
        print(f"{'='*60}\n")
        logger.info(f"[DEV OTP] {email}: {otp} ({purpose})")
        return True

    html = f"""
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;
                background:#f8fafc;border-radius:16px">
      <h2 style="color:#1e40af;margin:0 0 8px"">Helpet</h2>
      <p style="color:#475569;margin:0 0 24px">{subject}</p>
      <div style="background:#1e40af;color:#fff;font-size:32px;font-weight:bold;
                  letter-spacing:12px;text-align:center;padding:20px;border-radius:12px">
        {otp}
      </div>
      <p style="color:#94a3b8;font-size:13px;margin-top:24px">
        Valid for 10 minutes. Do not share this code with anyone.
      </p>
    </div>
    """

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Helpet <{smtp_user}>"
        msg["To"] = email
        msg.attach(MIMEText(html, "html"))

        with smtplib.SMTP("smtp.gmail.com", 587, timeout=10) as server:
            server.ehlo()
            server.starttls()
            server.login(smtp_user, smtp_pass)
            server.sendmail(smtp_user, email, msg.as_string())

        logger.info(f"Email OTP sent to {email}")
        return True
    except Exception as e:
        logger.error(f"Email send failed for {email}: {e}")
        return False
