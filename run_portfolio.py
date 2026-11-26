"""
N V Sai Bharath Singamsetty - Full-Stack Portfolio Master Launcher
Starts the Python FastAPI backend server which simultaneously serves the REST APIs,
PostgreSQL/SQLite database, and the production-built React frontend.
"""

import sys
import os
from pathlib import Path

# Add backend directory to sys.path
backend_dir = Path(__file__).resolve().parent / "backend"
sys.path.insert(0, str(backend_dir))

import uvicorn

if __name__ == "__main__":
    print("=" * 70)
    print(" N V SAI BHARATH SINGAMSETTY - EXECUTIVE PORTFOLIO PLATFORM")
    print(" Product Management & Technology Leadership")
    print("=" * 70)
    print("\n[+] Initializing FastAPI + SQLAlchemy Database...")
    print("[+] Public Portfolio Web App : http://localhost:8000")
    print("[+] Swagger / OpenAPI Docs   : http://localhost:8000/docs")
    print("[+] ReDoc Documentation      : http://localhost:8000/redoc")
    print("[+] Health Check Endpoint    : http://localhost:8000/api/health")
    print("\n[+] Admin Seed Credentials:")
    print("    Email    : admin@portfolio.local")
    print("    Password : Admin@Bharath2026")
    print("\nPress Ctrl+C to stop the server.\n")

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=False)
