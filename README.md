# N V Sai Bharath Singamsetty — Executive Product Management & Technology Leadership Portfolio

A production-grade, full-stack personal portfolio and product leadership case-study platform built for **N V Sai Bharath Singamsetty**.

Positioning:
* **Product Manager & Technical Product Manager**
* **Product Owner**
* **Technology Leader**
* **Digital Transformation Professional**
* **ERP & Enterprise Systems Specialist**
* **AI and Automation Enthusiast**

---

## 1. Key Features & Architecture

* **Executive Editorial Design**: Sophisticated, typography-led aesthetic inspired by top technology consulting firms and modern SaaS product leaders.
* **Full-Stack Architecture**:
  * **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, and Recharts analytics.
  * **Backend**: Python 3.12+, FastAPI, Pydantic, SQLAlchemy, REST API architecture.
  * **Database**: PostgreSQL support with seamless local SQLite zero-config fallback (`portfolio.db`).
  * **Authentication**: Secure JWT (HMAC-SHA256) bearer token authentication with role protection for the admin dashboard.
  * **Admin Control Center**: Built-in executive portal to manage projects, toggle publishing states, edit headline/philosophy, and inspect live contact form submissions.
  * **Contact Processing**: Functional contact endpoint (`/api/contact`) with database logging, anti-spam validation, and SMTP email dispatch.
  * **Dynamic Resume Generation**: Live executive CV generation and download at `/api/portfolio/resume/download`.
  * **Interactive Case Studies**: Deep-dive modals covering Problem Discovery, Personas, Quad-factor Prioritization, System Architecture, Roadmaps, and Retrospective Learnings.
  * **Product Thinking Stepper**: Interactive 9-stage lifecycle stepper (`Discover → Define → Strategize → Prioritize → Design → Develop → Deliver → Measure → Improve`) plus an interactive MoSCoW prioritization simulator.

---

## 2. Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide React, Recharts |
| **Backend** | Python 3.12+, FastAPI, SQLAlchemy 2.1, Pydantic v2, PyJWT, Bcrypt / PBKDF2 |
| **Database** | SQLite (local auto-provisioned) / PostgreSQL (production-ready via Docker) |
| **DevOps** | Docker, Docker Compose, Multi-stage Dockerfiles, Nginx reverse proxy |
| **Testing** | Pytest, FastAPI TestClient, HTTPX, TypeScript compiler (`tsc`) |

---

## 3. Directory Structure

```
portfolio/
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── endpoints/
│   │   │   │   ├── admin.py       # Protected CRUD & telemetry endpoints
│   │   │   │   ├── auth.py        # JWT login & user verification
│   │   │   │   ├── contact.py     # Contact form intake & dispatch
│   │   │   │   └── portfolio.py   # Public bundle & case studies API
│   │   │   ├── api_router.py
│   │   │   └── deps.py            # OAuth2 & admin permission dependencies
│   │   ├── core/
│   │   │   ├── config.py          # App settings & environment variables
│   │   │   └── security.py        # Password hashing & JWT token handlers
│   │   ├── database/
│   │   │   └── session.py         # SQLAlchemy engine & session factory
│   │   ├── models/
│   │   │   └── all_models.py      # User, Profile, Experience, Project, CaseStudy, etc.
│   │   ├── schemas/
│   │   │   └── all_schemas.py     # Pydantic validation schemas
│   │   ├── services/
│   │   │   ├── email_service.py   # SMTP notification service
│   │   │   └── seed_data.py       # Auto-seed database with verified portfolio data
│   │   └── main.py                # FastAPI app, static assets & OpenAPI docs
│   ├── tests/
│   │   └── test_api.py            # Comprehensive test suite (100% passing)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/            # Navbar, Footer, ThemeToggle, CaseStudyModal, AdminDashboard
│   │   ├── sections/              # Hero, Metrics, About, Experience, Portfolio, CaseStudies, etc.
│   │   ├── services/              # API fetch client
│   │   ├── types/                 # TypeScript interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── run_portfolio.py               # Master single-command launcher
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 4. Quick Start (Local Development)

### Prerequisites
* Python 3.12+ installed
* Node.js 18+ and npm installed

### Option A: Master Single-Command Launch (Fastest)
From the `portfolio` directory:
```bash
python run_portfolio.py
```
This automatically initializes the database, executes verified seed data insertion, and serves the full website with backend APIs on:
* **Web Application**: [http://localhost:8000](http://localhost:8000)
* **Swagger OpenAPI Docs**: [http://localhost:8000/docs](http://localhost:8000/docs)
* **ReDoc Documentation**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

### Option B: Running Frontend & Backend Separately (Development Mode)

#### 1. Backend Setup:
```bash
cd portfolio/backend
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend will be live at `http://127.0.0.1:8000`.

#### 2. Frontend Setup:
```bash
cd portfolio/frontend
npm install
npm run dev
```
Frontend Vite development server will be live at `http://localhost:5173`. Requests to `/api/*` are automatically proxied to `http://127.0.0.1:8000`.

---

## 5. Pre-Configured Admin Credentials

The database is pre-seeded with secure administrative credentials:
* **Admin Email**: `admin@portfolio.local`
* **Password**: `Admin@Bharath2026`

To access the admin dashboard:
1. Click **"Admin"** in the top navigation bar or the footer.
2. Sign in with the credentials above.
3. You can inspect contact submissions, toggle project publishing, and update profile statements.

---

## 6. Running Tests

Execute the backend pytest suite:
```bash
cd portfolio
python -m pytest backend/tests -v
```
All 6 integration tests (health check, public bundle, case studies by slug, contact submissions, JWT auth, and admin authorization protection) pass with 100% success.

---

## 7. Docker Deployment

To launch the full production stack with PostgreSQL, FastAPI backend, and Nginx-powered React frontend:
```bash
cd portfolio
docker compose up --build -d
```
* **Frontend**: `http://localhost` (Port 80)
* **Backend API & Swagger**: `http://localhost:8000` (Port 8000)
* **PostgreSQL Database**: `localhost:5432`

---

## 8. Verified Portfolio Data Extraction Summary

All information displayed across the site has been faithfully extracted from `N V Sai Bharath Singamsetty.html`:
1. **Current Role**: Senior Manager, Technology, Group of Institutions (Bengaluru, Aug 2025 – Present) — K-12 multi-campus architecture (CBSE, ICSE, Cambridge IGCSE), GCP-native cloud ERP migration.
2. **Previous Role**: Head of IT, National Film Development Corporation (NFDC India, Mumbai, Aug 2023 – Aug 2025) — Digitized 2M+ legacy film records, unified 13+ domains, directed technology for IFFI 2023 & 2024, Film Bazaar, and 18th MIFF.
3. **National ERP Progression**: Samarth eGov, Ministry of Education / Delhi University (Sep 2019 – Jul 2023) — 4 promotions in <4 years (Rollout Support Executive → Rollout Supervisor → Assistant Manager → Senior Analyst), Product Owner for 10+ modules, 1,200+ HEIs, 150+ Central Universities onboarded to Employee Management, 30 module manuals authored, concurrent CUET admissions for 5 universities.
4. **Research Assistant**: CSIR – Indian Institute of Chemical Technology (Sep 2018 – Sep 2019) — Diabetes prediction model in Python (NIDDK dataset).
5. **Credentials**: PMP® (Project Management Institute), Certified AI-Driven Professional (be10x / QM 2026), PG Program in Data Science (Purdue University), Professional Certificate in Product Management (SP Jain Global School of Management), M.Sc. Physics & B.Sc. Computer Science (Acharya Nagarjuna University).

