import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

logger = logging.getLogger("uvicorn.error")

def send_contact_notification(name: str, email: str, company: str, subject: str, message: str) -> bool:
    """
    Sends an email notification when a new contact message is received.
    If SMTP credentials are not set, it gracefully logs the message.
    """
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.info(
            f"[MOCK EMAIL NOTIFICATION]\n"
            f"To: {settings.EMAILS_TO}\n"
            f"From: {name} <{email}> (Company: {company or 'N/A'})\n"
            f"Subject: [Portfolio Contact] {subject}\n"
            f"Message: {message}\n"
        )
        return True

    try:
        msg = MIMEMultipart()
        msg['From'] = settings.SMTP_USERNAME
        msg['To'] = settings.EMAILS_TO
        msg['Subject'] = f"[Portfolio Contact] {subject} - from {name}"

        body = (
            f"You received a new contact submission from your portfolio website:\n\n"
            f"Name: {name}\n"
            f"Email: {email}\n"
            f"Company: {company or 'N/A'}\n"
            f"Subject: {subject}\n\n"
            f"Message:\n{message}\n\n"
            f"--\nN V Sai Bharath Singamsetty Portfolio Platform"
        )
        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP(settings.SMTP_SERVER, settings.SMTP_PORT)
        if settings.SMTP_TLS:
            server.starttls()
        server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()
        logger.info(f"Contact email successfully dispatched to {settings.EMAILS_TO}")
        return True
    except Exception as e:
        logger.error(f"Failed to send email via SMTP: {str(e)}")
        return False

