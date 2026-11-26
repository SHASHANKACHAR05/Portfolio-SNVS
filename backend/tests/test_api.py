import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"

def test_portfolio_public_bundle():
    response = client.get("/api/portfolio")
    assert response.status_code == 200
    data = response.json()
    assert "profile" in data
    assert data["profile"]["name"] == "N V Sai Bharath Singamsetty"
    assert len(data["metrics"]) >= 6
    assert len(data["experiences"]) >= 5
    assert len(data["projects"]) >= 3
    assert len(data["skills"]) >= 15
    assert len(data["certifications"]) >= 6

def test_project_by_slug():
    response = client.get("/api/portfolio/projects/samarth-egov-erp")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "samarth-egov-erp"
    assert "Samarth eGov" in data["title"]
    assert data["case_study"] is not None
    assert data["case_study"]["slug"] == "samarth-egov-erp"

def test_case_study_by_slug():
    response = client.get("/api/portfolio/case-studies/nfdc-digital-transformation")
    assert response.status_code == 200
    data = response.json()
    assert data["slug"] == "nfdc-digital-transformation"
    assert "Film Festival" in data["title"]

def test_contact_submission():
    payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "company": "Global Tech Corp",
        "subject": "Executive Product Leadership Inquiry",
        "message": "We would love to discuss a Director of Product role with your team."
    }
    response = client.post("/api/contact", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["name"] == "Jane Doe"
    assert data["email"] == "jane@example.com"
    assert data["id"] is not None

def test_admin_auth_and_protected_access():
    # Login with valid seed credentials
    login_payload = {
        "email": settings.DEFAULT_ADMIN_EMAIL,
        "password": settings.DEFAULT_ADMIN_PASSWORD
    }
    login_resp = client.post("/api/auth/login", json=login_payload)
    assert login_resp.status_code == 200
    token = login_resp.json()["access_token"]
    assert token is not None

    headers = {"Authorization": f"Bearer {token}"}

    # Fetch admin summary
    summary_resp = client.get("/api/admin/dashboard-summary", headers=headers)
    assert summary_resp.status_code == 200
    summary = summary_resp.json()
    assert summary["projects"]["total"] >= 3
    assert summary["messages"]["total"] >= 1

    # Unauthorized access check
    unauth_resp = client.get("/api/admin/dashboard-summary")
    assert unauth_resp.status_code == 401
