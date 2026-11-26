from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.all_models import ContactMessage, IntegrationSetting
from app.schemas.all_schemas import ContactCreate, ContactResponse
from app.services.email_service import send_contact_notification
from app.services.sheets_service import push_inquiries_to_webhook

router = APIRouter(prefix="/contact", tags=["Contact"])

@router.post("", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def submit_contact_form(data: ContactCreate, db: Session = Depends(get_db)):
    # Basic anti-spam check
    if len(data.message.strip()) < 5:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Message is too short. Please provide meaningful details."
        )

    # Save to database
    db_msg = ContactMessage(
        name=data.name.strip(),
        email=data.email.strip(),
        company=data.company.strip() if data.company else None,
        subject=data.subject.strip(),
        message=data.message.strip()
    )
    db.add(db_msg)
    db.commit()
    db.refresh(db_msg)

    # Trigger email notification
    send_contact_notification(
        name=db_msg.name,
        email=db_msg.email,
        company=db_msg.company or "",
        subject=db_msg.subject,
        message=db_msg.message
    )

    # Auto-sync to connected Google Sheet webhook if configured
    try:
        setting = db.query(IntegrationSetting).first()
        if setting and setting.auto_sync_google_sheet and setting.google_webhook_url:
            ok, _ = push_inquiries_to_webhook(setting.google_webhook_url, [db_msg], mode="append")
            if ok:
                setting.last_synced_at = datetime.now(timezone.utc)
                db.commit()
    except Exception:
        pass

    return db_msg

