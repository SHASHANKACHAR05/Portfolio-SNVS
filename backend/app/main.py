import os
from pathlib import Path
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.core.config import settings
from app.database.session import engine, Base, get_db
from app.services.seed_data import seed_database
from app.services.cache import invalidate_portfolio_cache
from app.api.api_router import api_router
from app.models.all_models import Profile, Experience, Certification, Skill

def _ensure_sqlite_columns():
    if engine.dialect.name != "sqlite":
        return
    with engine.begin() as conn:
        cols = [row[1] for row in conn.execute(text("PRAGMA table_info(profile)")).fetchall()]
        if "about_content_json" not in cols:
            conn.execute(text("ALTER TABLE profile ADD COLUMN about_content_json TEXT"))
        if "sections_content_json" not in cols:
            conn.execute(text("ALTER TABLE profile ADD COLUMN sections_content_json TEXT"))

def init_db():
    Base.metadata.create_all(bind=engine)
    _ensure_sqlite_columns()
    db = next(get_db())
    try:
        seed_database(db)
    finally:
        db.close()

# Ensure DB is created & seeded
init_db()

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Full-stack Product Management & Technology Leadership Portfolio API for N V Sai Bharath Singamsetty",
    version="2.0.0",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan
)

# Configure CORS & GZip compression
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(GZipMiddleware, minimum_size=500)

@app.middleware("http")
async def cache_and_asset_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    if (
        request.url.path.startswith("/api/admin")
        and request.method in ("POST", "PUT", "PATCH", "DELETE")
        and response.status_code < 400
    ):
        invalidate_portfolio_cache()
    if request.url.path.startswith("/assets/") and response.status_code == 200:
        response.headers.setdefault("Cache-Control", "public, max-age=31536000, immutable")
    return response

# Mount API Router
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/api/health", tags=["Health Check"])
def health_check():
    return {
        "status": "healthy",
        "service": "N V Sai Bharath Singamsetty Portfolio API",
        "version": "2.0.0",
        "environment": "production" if os.getenv("ENVIRONMENT") == "production" else "development"
    }

@app.get("/api/portfolio/resume/download", tags=["Public Portfolio"])
def download_resume(db: Session = Depends(get_db)):
    """
    Dynamically generates and returns an executive Markdown/Text resume.
    """
    profile = db.query(Profile).first()
    experiences = db.query(Experience).order_by(Experience.order_index.asc()).all()
    certifications = db.query(Certification).order_by(Certification.order_index.asc()).all()
    skills = db.query(Skill).order_by(Skill.order_index.asc()).all()

    lines = [
        f"==================================================================",
        f"  {profile.name.upper()}",
        f"  {profile.title}",
        f"  Location: {profile.location} | Email: {profile.email}",
        f"  LinkedIn: {profile.linkedin_url}",
        f"==================================================================",
        "",
        "EXECUTIVE SUMMARY",
        "------------------------------------------------------------------",
        profile.summary,
        "",
        "CORE PROFESSIONAL PHILOSOPHY",
        "------------------------------------------------------------------",
        profile.philosophy,
        "",
        "PROFESSIONAL EXPERIENCE",
        "------------------------------------------------------------------"
    ]

    for exp in experiences:
        dates = f"{exp.start_date} – {exp.end_date or 'Present'}"
        lines.append(f"\n{exp.role.upper()} | {exp.company}")
        lines.append(f"{exp.location} | {dates}")
        if exp.career_progression_json:
            import json
            prog = json.loads(exp.career_progression_json)
            lines.append(f"Progression: {' -> '.join(prog)}")
        lines.append("Key Responsibilities:")
        import json
        resp = json.loads(exp.responsibilities_json)
        for r in resp:
            lines.append(f"  • {r}")

    lines.append("\nEDUCATION & CREDENTIALS")
    lines.append("------------------------------------------------------------------")
    for c in certifications:
        lines.append(f"• {c.title} – {c.issuer} ({c.issue_date})")

    lines.append("\nTECHNICAL & MANAGEMENT COMPETENCIES")
    lines.append("------------------------------------------------------------------")
    skill_groups = {}
    for s in skills:
        skill_groups.setdefault(s.category, []).append(s.name)
    for cat, items in skill_groups.items():
        lines.append(f"{cat}: {', '.join(items)}")

    content = "\n".join(lines)
    return Response(
        content=content,
        media_type="text/plain",
        headers={
            "Content-Disposition": "attachment; filename=N_V_Sai_Bharath_Singamsetty_Resume.txt"
        }
    )

# Static file serving for production build
DIST_DIR = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if DIST_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(DIST_DIR / "assets")), name="assets")

    @app.get("/{full_path:path}", include_in_schema=False)
    async def serve_frontend(full_path: str):
        file_path = DIST_DIR / full_path
        if file_path.exists() and file_path.is_file():
            return FileResponse(str(file_path))
        return FileResponse(str(DIST_DIR / "index.html"))
