from typing import List, Optional, Any
from pydantic import BaseModel
from datetime import datetime

# Token Schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_email: str
    full_name: str

class TokenPayload(BaseModel):
    sub: Optional[str] = None
    exp: Optional[int] = None

class LoginRequest(BaseModel):
    email: str
    password: str

# User Schemas
class UserBase(BaseModel):
    email: str
    full_name: str
    is_admin: bool = True

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    created_at: datetime
    class Config:
        from_attributes = True

# Profile Schemas
class ProfileBase(BaseModel):
    name: str
    title: str
    headline: str
    summary: str
    philosophy: str
    location: str
    email: str
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    resume_url: Optional[str] = None
    years_of_experience: int = 10
    languages: str = "English, Telugu, Hindi"
    creative_interests: Optional[str] = None
    about_content_json: Optional[str] = None
    sections_content_json: Optional[str] = None

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    headline: Optional[str] = None
    summary: Optional[str] = None
    philosophy: Optional[str] = None
    location: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    linkedin_url: Optional[str] = None
    github_url: Optional[str] = None
    resume_url: Optional[str] = None
    years_of_experience: Optional[int] = None
    languages: Optional[str] = None
    creative_interests: Optional[str] = None
    about_content_json: Optional[str] = None
    sections_content_json: Optional[str] = None

class ProfileResponse(ProfileBase):
    id: int
    class Config:
        from_attributes = True

# Experience Schemas
class ExperienceBase(BaseModel):
    company: str
    role: str
    location: str
    start_date: str
    end_date: Optional[str] = None
    is_current: bool = False
    order_index: int = 0
    description: Optional[str] = None
    career_progression_json: Optional[str] = None
    responsibilities_json: str
    technologies_json: str
    outcomes_json: Optional[str] = None

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceResponse(ExperienceBase):
    id: int
    class Config:
        from_attributes = True

# Project & Case Study Schemas
class ProjectBase(BaseModel):
    slug: str
    title: str
    category: str
    client_org: str
    summary: str
    challenge: str
    solution: str
    role: str
    responsibilities_json: str
    tech_stack_json: str
    impact_metrics_json: str
    is_featured: bool = True
    published: bool = True
    order_index: int = 0

class ProjectCreate(ProjectBase):
    pass

class CaseStudyBase(BaseModel):
    slug: str
    title: str
    executive_summary: str
    business_context: str
    problem_statement: str
    personas_json: str
    requirements_json: str
    product_strategy: str
    discovery_json: str
    stakeholder_map_json: str
    feature_prioritization_json: str
    roadmap_json: str
    system_architecture: str
    execution_delivery: str
    testing_deployment: str
    results_impact_json: str
    learnings_json: str
    published: bool = True

class CaseStudyCreate(CaseStudyBase):
    project_id: int

class CaseStudyResponse(CaseStudyBase):
    id: int
    project_id: int
    class Config:
        from_attributes = True

class ProjectResponse(ProjectBase):
    id: int
    case_study: Optional[CaseStudyResponse] = None
    class Config:
        from_attributes = True

# Skill Schemas
class SkillBase(BaseModel):
    category: str
    name: str
    proficiency_level: str = "Advanced"
    icon_name: Optional[str] = None
    is_key_skill: bool = False
    order_index: int = 0

class SkillCreate(SkillBase):
    pass

class SkillResponse(SkillBase):
    id: int
    class Config:
        from_attributes = True

# Certification Schemas
class CertificationBase(BaseModel):
    title: str
    issuer: str
    issue_date: str
    expiry_date: Optional[str] = None
    credential_id: Optional[str] = None
    credential_url: Optional[str] = None
    category: str = "Certification"
    order_index: int = 0

class CertificationCreate(CertificationBase):
    pass

class CertificationResponse(CertificationBase):
    id: int
    class Config:
        from_attributes = True

# Metric Schemas
class MetricBase(BaseModel):
    label: str
    value_number: str
    prefix: Optional[str] = None
    suffix: Optional[str] = None
    context_project: str
    description: str
    icon_name: Optional[str] = None
    order_index: int = 0

class MetricCreate(MetricBase):
    pass

class MetricResponse(MetricBase):
    id: int
    class Config:
        from_attributes = True

# Contact Schemas
class ContactCreate(BaseModel):
    name: str
    email: str
    company: Optional[str] = None
    subject: str
    message: str

class ContactResponse(BaseModel):
    id: int
    name: str
    email: str
    company: Optional[str] = None
    subject: str
    message: str
    is_read: bool
    created_at: datetime
    class Config:
        from_attributes = True

# Full Public Portfolio Bundle Response
class PortfolioBundle(BaseModel):
    profile: ProfileResponse
    metrics: List[MetricResponse]
    experiences: List[ExperienceResponse]
    projects: List[ProjectResponse]
    skills: List[SkillResponse]
    certifications: List[CertificationResponse]

# Google Sheets Integration Schemas
class GoogleSheetConfigUpdate(BaseModel):
    google_sheet_url: Optional[str] = None
    google_webhook_url: Optional[str] = None
    auto_sync_google_sheet: bool = True

class GoogleSheetConfigResponse(BaseModel):
    google_sheet_url: Optional[str] = None
    google_webhook_url: Optional[str] = None
    auto_sync_google_sheet: bool = True
    last_synced_at: Optional[datetime] = None
    class Config:
        from_attributes = True
