from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=False)
    is_admin = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Profile(Base):
    __tablename__ = "profile"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    title = Column(String(255), nullable=False)
    headline = Column(String(500), nullable=False)
    summary = Column(Text, nullable=False)
    philosophy = Column(Text, nullable=False)
    location = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=True)
    linkedin_url = Column(String(500), nullable=True)
    github_url = Column(String(500), nullable=True)
    resume_url = Column(String(500), nullable=True)
    years_of_experience = Column(Integer, default=10)
    languages = Column(String(255), default="English, Telugu, Hindi")
    creative_interests = Column(Text, nullable=True)
    about_content_json = Column(Text, nullable=True)
    sections_content_json = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

class Experience(Base):
    __tablename__ = "experiences"
    
    id = Column(Integer, primary_key=True, index=True)
    company = Column(String(255), nullable=False)
    role = Column(String(255), nullable=False)
    location = Column(String(255), nullable=False)
    start_date = Column(String(50), nullable=False)
    end_date = Column(String(50), nullable=True)
    is_current = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)
    description = Column(Text, nullable=True)
    career_progression_json = Column(Text, nullable=True) # JSON string of steps
    responsibilities_json = Column(Text, nullable=False) # JSON array of strings
    technologies_json = Column(Text, nullable=False) # JSON array of strings
    outcomes_json = Column(Text, nullable=True) # JSON array of strings
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    category = Column(String(100), nullable=False)
    client_org = Column(String(255), nullable=False)
    summary = Column(Text, nullable=False)
    challenge = Column(Text, nullable=False)
    solution = Column(Text, nullable=False)
    role = Column(String(255), nullable=False)
    responsibilities_json = Column(Text, nullable=False) # JSON array
    tech_stack_json = Column(Text, nullable=False) # JSON array
    impact_metrics_json = Column(Text, nullable=False) # JSON array of objects
    is_featured = Column(Boolean, default=True)
    published = Column(Boolean, default=True)
    order_index = Column(Integer, default=0)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    case_study = relationship("CaseStudy", back_populates="project", uselist=False, cascade="all, delete-orphan")

class CaseStudy(Base):
    __tablename__ = "case_studies"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False, unique=True)
    slug = Column(String(100), unique=True, index=True, nullable=False)
    title = Column(String(255), nullable=False)
    executive_summary = Column(Text, nullable=False)
    business_context = Column(Text, nullable=False)
    problem_statement = Column(Text, nullable=False)
    personas_json = Column(Text, nullable=False) # JSON array
    requirements_json = Column(Text, nullable=False) # JSON array
    product_strategy = Column(Text, nullable=False)
    discovery_json = Column(Text, nullable=False) # JSON
    stakeholder_map_json = Column(Text, nullable=False) # JSON
    feature_prioritization_json = Column(Text, nullable=False) # JSON
    roadmap_json = Column(Text, nullable=False) # JSON
    system_architecture = Column(Text, nullable=False)
    execution_delivery = Column(Text, nullable=False)
    testing_deployment = Column(Text, nullable=False)
    results_impact_json = Column(Text, nullable=False) # JSON
    learnings_json = Column(Text, nullable=False) # JSON
    published = Column(Boolean, default=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    project = relationship("Project", back_populates="case_study")

class Skill(Base):
    __tablename__ = "skills"
    
    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(100), nullable=False) # Product Strategy, Product Execution, Data & Analytics, Systems & Architecture, Leadership & Governance
    name = Column(String(100), nullable=False)
    proficiency_level = Column(String(50), default="Advanced") # Expert, Advanced, Proficient
    icon_name = Column(String(50), nullable=True)
    is_key_skill = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)

class Certification(Base):
    __tablename__ = "certifications"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    issuer = Column(String(255), nullable=False)
    issue_date = Column(String(50), nullable=False)
    expiry_date = Column(String(50), nullable=True)
    credential_id = Column(String(100), nullable=True)
    credential_url = Column(String(500), nullable=True)
    category = Column(String(100), default="Certification") # Certification, Education, Executive Program
    order_index = Column(Integer, default=0)

class Metric(Base):
    __tablename__ = "metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    label = Column(String(255), nullable=False)
    value_number = Column(String(50), nullable=False) # e.g. "1,200+"
    prefix = Column(String(20), nullable=True)
    suffix = Column(String(20), nullable=True)
    context_project = Column(String(100), nullable=False) # e.g. "Samarth eGov", "NFDC"
    description = Column(Text, nullable=False)
    icon_name = Column(String(50), nullable=True)
    order_index = Column(Integer, default=0)

class ContactMessage(Base):
    __tablename__ = "contact_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False)
    company = Column(String(255), nullable=True)
    subject = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

class ResumeFile(Base):
    __tablename__ = "resume_files"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)
    version = Column(String(50), default="1.0")
    uploaded_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    is_active = Column(Boolean, default=True)

class IntegrationSetting(Base):
    __tablename__ = "integration_settings"

    id = Column(Integer, primary_key=True, index=True)
    google_sheet_url = Column(String(1000), nullable=True)
    google_webhook_url = Column(String(1000), nullable=True)
    auto_sync_google_sheet = Column(Boolean, default=True)
    last_synced_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

