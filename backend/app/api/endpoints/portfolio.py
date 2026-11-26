

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.all_models import (
    Profile, Metric, Experience, Project, CaseStudy, Skill, Certification
)
from app.schemas.all_schemas import (
    PortfolioBundle, ProfileResponse, MetricResponse, ExperienceResponse,
    ProjectResponse, CaseStudyResponse, SkillResponse, CertificationResponse
)
from app.services.cache import get_portfolio_cache, set_portfolio_cache

router = APIRouter(prefix="/portfolio", tags=["Public Portfolio"])

@router.get("", response_model=PortfolioBundle)
def get_full_portfolio(response: Response, db: Session = Depends(get_db)):
    cached = get_portfolio_cache()
    if cached is not None:
        response.headers["X-Cache"] = "HIT"
        response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
        return cached

    profile = db.query(Profile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Portfolio profile not initialized")
    
    metrics = db.query(Metric).order_by(Metric.order_index.asc()).all()
    experiences = db.query(Experience).order_by(Experience.order_index.asc()).all()
    projects = db.query(Project).filter(Project.published == True).order_by(Project.order_index.asc()).all()
    skills = db.query(Skill).order_by(Skill.order_index.asc()).all()
    certifications = db.query(Certification).order_by(Certification.order_index.asc()).all()

    bundle = PortfolioBundle(
        profile=ProfileResponse.model_validate(profile),
        metrics=[MetricResponse.model_validate(m) for m in metrics],
        experiences=[ExperienceResponse.model_validate(e) for e in experiences],
        projects=[ProjectResponse.model_validate(p) for p in projects],
        skills=[SkillResponse.model_validate(s) for s in skills],
        certifications=[CertificationResponse.model_validate(c) for c in certifications],
    )
    payload = bundle.model_dump(mode="json")
    set_portfolio_cache(payload)
    response.headers["X-Cache"] = "MISS"
    response.headers["Cache-Control"] = "no-store, no-cache, must-revalidate"
    return payload

@router.get("/profile", response_model=ProfileResponse)
def get_profile(db: Session = Depends(get_db)):
    profile = db.query(Profile).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    return profile

@router.get("/metrics", response_model=List[MetricResponse])
def get_metrics(db: Session = Depends(get_db)):
    return db.query(Metric).order_by(Metric.order_index.asc()).all()

@router.get("/experiences", response_model=List[ExperienceResponse])
def get_experiences(db: Session = Depends(get_db)):
    return db.query(Experience).order_by(Experience.order_index.asc()).all()

@router.get("/projects", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    return db.query(Project).filter(Project.published == True).order_by(Project.order_index.asc()).all()

@router.get("/projects/{slug}", response_model=ProjectResponse)
def get_project_by_slug(slug: str, db: Session = Depends(get_db)):
    project = db.query(Project).filter(Project.slug == slug, Project.published == True).first()
    if not project:
        raise HTTPException(status_code=404, detail=f"Project '{slug}' not found")
    return project

@router.get("/case-studies/{slug}", response_model=CaseStudyResponse)
def get_case_study_by_slug(slug: str, db: Session = Depends(get_db)):
    case_study = db.query(CaseStudy).filter(CaseStudy.slug == slug, CaseStudy.published == True).first()
    if not case_study:
        raise HTTPException(status_code=404, detail=f"Case study '{slug}' not found")
    return case_study

@router.get("/skills", response_model=List[SkillResponse])
def get_skills(db: Session = Depends(get_db)):
    return db.query(Skill).order_by(Skill.order_index.asc()).all()

@router.get("/certifications", response_model=List[CertificationResponse])
def get_certifications(db: Session = Depends(get_db)):
    return db.query(Certification).order_by(Certification.order_index.asc()).all()
