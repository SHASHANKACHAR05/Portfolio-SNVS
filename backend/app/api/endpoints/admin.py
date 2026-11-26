from datetime import datetime, timezone
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.api.deps import get_current_admin_user
from app.models.all_models import (
    User, Profile, Experience, Project, CaseStudy, Skill, Certification, Metric, ContactMessage, IntegrationSetting
)
from app.schemas.all_schemas import (
    ProfileUpdate, ProfileResponse,
    ExperienceCreate, ExperienceResponse,
    ProjectCreate, ProjectResponse,
    CaseStudyCreate, CaseStudyResponse,
    SkillCreate, SkillResponse,
    CertificationCreate, CertificationResponse,
    MetricCreate, MetricResponse,
    ContactResponse,
    GoogleSheetConfigUpdate, GoogleSheetConfigResponse
)
from app.services.sheets_service import build_inquiries_excel, push_inquiries_to_webhook

router = APIRouter(prefix="/admin", tags=["Admin Portal"], dependencies=[Depends(get_current_admin_user)])

# --- Dashboard Overview Stats ---
@router.get("/dashboard-summary")
def get_dashboard_summary(db: Session = Depends(get_db)):
    total_projects = db.query(Project).count()
    published_projects = db.query(Project).filter(Project.published == True).count()
    total_messages = db.query(ContactMessage).count()
    unread_messages = db.query(ContactMessage).filter(ContactMessage.is_read == False).count()
    total_experiences = db.query(Experience).count()
    total_skills = db.query(Skill).count()
    total_certifications = db.query(Certification).count()

    return {
        "projects": {"total": total_projects, "published": published_projects},
        "messages": {"total": total_messages, "unread": unread_messages},
        "experiences_count": total_experiences,
        "skills_count": total_skills,
        "certifications_count": total_certifications
    }

# --- Profile Management ---
@router.put("/profile", response_model=ProfileResponse)
def update_profile(data: ProfileUpdate, db: Session = Depends(get_db)):
    profile = db.query(Profile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, val in update_data.items():
        setattr(profile, field, val)
    
    db.commit()
    db.refresh(profile)
    return profile

# --- Experiences CRUD ---
@router.post("/experiences", response_model=ExperienceResponse, status_code=status.HTTP_201_CREATED)
def create_experience(data: ExperienceCreate, db: Session = Depends(get_db)):
    exp = Experience(**data.model_dump())
    db.add(exp)
    db.commit()
    db.refresh(exp)
    return exp

@router.put("/experiences/{exp_id}", response_model=ExperienceResponse)
def update_experience(exp_id: int, data: ExperienceCreate, db: Session = Depends(get_db)):
    exp = db.query(Experience).filter(Experience.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience record not found")
    for key, value in data.model_dump().items():
        setattr(exp, key, value)
    db.commit()
    db.refresh(exp)
    return exp

@router.delete("/experiences/{exp_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_experience(exp_id: int, db: Session = Depends(get_db)):
    exp = db.query(Experience).filter(Experience.id == exp_id).first()
    if not exp:
        raise HTTPException(status_code=404, detail="Experience record not found")
    db.delete(exp)
    db.commit()
    return None

# --- Projects CRUD ---
@router.get("/projects", response_model=List[ProjectResponse])
def admin_list_projects(db: Session = Depends(get_db)):
    return db.query(Project).order_by(Project.order_index.asc()).all()

@router.post("/projects", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(data: ProjectCreate, db: Session = Depends(get_db)):
    existing = db.query(Project).filter(Project.slug == data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="A project with this slug already exists")
    project = Project(**data.model_dump())
    db.add(project)
    db.commit()
    db.refresh(project)
    return project

@router.put("/projects/{project_id}", response_model=ProjectResponse)
def update_project(project_id: int, data: ProjectCreate, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    for key, value in data.model_dump().items():
        setattr(project, key, value)
    db.commit()
    db.refresh(project)
    return project

@router.patch("/projects/{project_id}/publish", response_model=ProjectResponse)
def toggle_project_publish(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    project.published = not project.published
    db.commit()
    db.refresh(project)
    return project

@router.delete("/projects/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(project_id: int, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    db.delete(project)
    db.commit()
    return None

# --- Case Studies CRUD ---
@router.post("/case-studies", response_model=CaseStudyResponse, status_code=status.HTTP_201_CREATED)
def create_case_study(data: CaseStudyCreate, db: Session = Depends(get_db)):
    existing = db.query(CaseStudy).filter(CaseStudy.slug == data.slug).first()
    if existing:
        raise HTTPException(status_code=400, detail="A case study with this slug already exists")
    cs = CaseStudy(**data.model_dump())
    db.add(cs)
    db.commit()
    db.refresh(cs)
    return cs

@router.put("/case-studies/{cs_id}", response_model=CaseStudyResponse)
def update_case_study(cs_id: int, data: CaseStudyCreate, db: Session = Depends(get_db)):
    cs = db.query(CaseStudy).filter(CaseStudy.id == cs_id).first()
    if not cs:
        raise HTTPException(status_code=404, detail="Case study not found")
    for key, value in data.model_dump().items():
        setattr(cs, key, value)
    db.commit()
    db.refresh(cs)
    return cs

# --- Skills CRUD ---
@router.post("/skills", response_model=SkillResponse, status_code=status.HTTP_201_CREATED)
def create_skill(data: SkillCreate, db: Session = Depends(get_db)):
    s = Skill(**data.model_dump())
    db.add(s)
    db.commit()
    db.refresh(s)
    return s

@router.put("/skills/{skill_id}", response_model=SkillResponse)
def update_skill(skill_id: int, data: SkillCreate, db: Session = Depends(get_db)):
    s = db.query(Skill).filter(Skill.id == skill_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Skill not found")
    for key, value in data.model_dump().items():
        setattr(s, key, value)
    db.commit()
    db.refresh(s)
    return s

@router.delete("/skills/{skill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_skill(skill_id: int, db: Session = Depends(get_db)):
    s = db.query(Skill).filter(Skill.id == skill_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Skill not found")
    db.delete(s)
    db.commit()
    return None

# --- Certifications CRUD ---
@router.post("/certifications", response_model=CertificationResponse, status_code=status.HTTP_201_CREATED)
def create_certification(data: CertificationCreate, db: Session = Depends(get_db)):
    c = Certification(**data.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c

@router.put("/certifications/{cert_id}", response_model=CertificationResponse)
def update_certification(cert_id: int, data: CertificationCreate, db: Session = Depends(get_db)):
    c = db.query(Certification).filter(Certification.id == cert_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Certification not found")
    for key, value in data.model_dump().items():
        setattr(c, key, value)
    db.commit()
    db.refresh(c)
    return c

@router.delete("/certifications/{cert_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_certification(cert_id: int, db: Session = Depends(get_db)):
    c = db.query(Certification).filter(Certification.id == cert_id).first()
    if not c:
        raise HTTPException(status_code=404, detail="Certification not found")
    db.delete(c)
    db.commit()
    return None

# --- Metrics CRUD ---
@router.post("/metrics", response_model=MetricResponse, status_code=status.HTTP_201_CREATED)
def create_metric(data: MetricCreate, db: Session = Depends(get_db)):
    m = Metric(**data.model_dump())
    db.add(m)
    db.commit()
    db.refresh(m)
    return m

@router.put("/metrics/{metric_id}", response_model=MetricResponse)
def update_metric(metric_id: int, data: MetricCreate, db: Session = Depends(get_db)):
    m = db.query(Metric).filter(Metric.id == metric_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Metric not found")
    for key, value in data.model_dump().items():
        setattr(m, key, value)
    db.commit()
    db.refresh(m)
    return m

@router.delete("/metrics/{metric_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_metric(metric_id: int, db: Session = Depends(get_db)):
    m = db.query(Metric).filter(Metric.id == metric_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Metric not found")
    db.delete(m)
    db.commit()
    return None

# --- Contact Messages Management ---
@router.get("/messages", response_model=List[ContactResponse])
def get_contact_messages(db: Session = Depends(get_db)):
    return db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()

@router.patch("/messages/{msg_id}/read", response_model=ContactResponse)
def mark_message_read(msg_id: int, db: Session = Depends(get_db)):
    msg = db.query(ContactMessage).filter(ContactMessage.id == msg_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    msg.is_read = True
    db.commit()
    db.refresh(msg)
    return msg

@router.delete("/messages/{msg_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_contact_message(msg_id: int, db: Session = Depends(get_db)):
    msg = db.query(ContactMessage).filter(ContactMessage.id == msg_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")
    db.delete(msg)
    db.commit()
    return None

@router.get("/messages/export/excel")
def export_messages_excel(db: Session = Depends(get_db)):
    messages = db.query(ContactMessage).order_by(ContactMessage.created_at.desc()).all()
    buffer = build_inquiries_excel(messages)
    filename = f"inquiries_inbox_{datetime.now(timezone.utc).strftime('%Y%m%d_%H%M')}.xlsx"
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )

# --- Google Sheets Integration ---
def _get_or_create_integration(db: Session) -> IntegrationSetting:
    setting = db.query(IntegrationSetting).first()
    if not setting:
        setting = IntegrationSetting()
        db.add(setting)
        db.commit()
        db.refresh(setting)
    return setting

@router.get("/integrations/google-sheets", response_model=GoogleSheetConfigResponse)
def get_google_sheet_config(db: Session = Depends(get_db)):
    return _get_or_create_integration(db)

@router.put("/integrations/google-sheets", response_model=GoogleSheetConfigResponse)
def update_google_sheet_config(data: GoogleSheetConfigUpdate, db: Session = Depends(get_db)):
    sheet_url = (data.google_sheet_url or "").strip() or None
    webhook_url = (data.google_webhook_url or "").strip() or None

    if sheet_url and not sheet_url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Google Sheet link must start with https://")
    if webhook_url and not webhook_url.startswith(("http://", "https://")):
        raise HTTPException(status_code=400, detail="Google Apps Script webhook URL must start with https://")

    setting = _get_or_create_integration(db)
    setting.google_sheet_url = sheet_url
    setting.google_webhook_url = webhook_url
    setting.auto_sync_google_sheet = data.auto_sync_google_sheet
    db.commit()
    db.refresh(setting)
    return setting

@router.post("/integrations/google-sheets/sync")
def sync_messages_to_google_sheet(db: Session = Depends(get_db)):
    setting = _get_or_create_integration(db)
    if not setting.google_webhook_url:
        raise HTTPException(
            status_code=400,
            detail="Please add your Google Apps Script Web App URL first to enable 1-click live sync."
        )
    messages = db.query(ContactMessage).order_by(ContactMessage.created_at.asc()).all()
    ok, detail = push_inquiries_to_webhook(setting.google_webhook_url, messages, mode="sync_all")
    if not ok:
        raise HTTPException(status_code=502, detail=detail)
    setting.last_synced_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(setting)
    return {
        "ok": True,
        "detail": detail,
        "synced_count": len(messages),
        "last_synced_at": setting.last_synced_at.isoformat(),
    }

