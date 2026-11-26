import json
from sqlalchemy.orm import Session
from app.models.all_models import (
    User, Profile, Experience, Project, CaseStudy, Skill, Certification, Metric
)
from app.core.security import get_password_hash
from app.core.config import settings

def seed_database(db: Session):
    # Check if already seeded
    if db.query(Profile).first():
        return

    print("Seeding database with verified portfolio data...")

    # 1. Seed Admin User
    admin = User(
        email=settings.DEFAULT_ADMIN_EMAIL,
        hashed_password=get_password_hash(settings.DEFAULT_ADMIN_PASSWORD),
        full_name="N V Sai Bharath Singamsetty",
        is_admin=True
    )
    db.add(admin)

    # 2. Seed Profile
    profile = Profile(
        name="N V Sai Bharath Singamsetty",
        title="Senior Manager, Technology & Product Leader",
        headline="Building Products. Transforming Systems. Delivering Impact.",
        summary="Product and technology leader focused on building scalable enterprise platforms, driving digital transformation, and translating complex business requirements into impactful technology solutions. Over 10 years of cross-functional leadership spanning nationwide higher education ERP deployments, digital heritage and festival systems for a national film corporation, and modern multi-campus cloud architecture.",
        philosophy="I believe great products are built by understanding people, simplifying complexity, aligning technology with business objectives, and continuously improving the experience.",
        location="Bengaluru, India",
        email="snvsbharath@rediffmail.com",
        phone="+91 98765 43210",
        linkedin_url="https://www.linkedin.com/in/snvsbharath/",
        github_url="https://github.com",
        resume_url="/api/portfolio/resume/download",
        years_of_experience=10,
        languages="Telugu (Native), English (Professional), Hindi (Professional)",
        creative_interests="Creative writing, cinematic storytelling & scriptwriting, film preservation research."
    )
    db.add(profile)

    # 3. Seed Metrics
    metrics_data = [
        {
            "label": "Higher Education Institutions",
            "value_number": "1,200+",
            "prefix": None,
            "suffix": "+",
            "context_project": "Samarth eGov",
            "description": "Onboarded and supported on a unified national ERP platform across 45+ mission-critical modules.",
            "icon_name": "Landmark",
            "order_index": 1
        },
        {
            "label": "ERP Modules Coordinated",
            "value_number": "45+",
            "prefix": None,
            "suffix": "+",
            "context_project": "Samarth eGov",
            "description": "Cross-functional governance spanning academics, admissions, HR, examinations, and financial governance.",
            "icon_name": "Layers",
            "order_index": 2
        },
        {
            "label": "Product Owner Responsibilities",
            "value_number": "10+",
            "prefix": None,
            "suffix": "+",
            "context_project": "Samarth eGov",
            "description": "Direct end-to-end product ownership for roadmap, stakeholder alignment, user stories, and feature rollouts.",
            "icon_name": "Compass",
            "order_index": 3
        },
        {
            "label": "Legacy Documents Digitized",
            "value_number": "2M+",
            "prefix": None,
            "suffix": "+",
            "context_project": "NFDC",
            "description": "High-throughput archival digitization and indexing workflow at NFDC Mumbai headquarters.",
            "icon_name": "FileDigit",
            "order_index": 4
        },
        {
            "label": "Websites Consolidated",
            "value_number": "13+",
            "prefix": None,
            "suffix": "+",
            "context_project": "NFDC",
            "description": "Fragmented web properties unified into a single secure enterprise domain with zero downtime.",
            "icon_name": "Globe",
            "order_index": 5
        },
        {
            "label": "Central Universities Onboarded",
            "value_number": "150+",
            "prefix": None,
            "suffix": "+",
            "context_project": "Samarth eGov",
            "description": "Onboarded to the Employee Management module as designated national module champion.",
            "icon_name": "Users",
            "order_index": 6
        }
    ]
    for m in metrics_data:
        db.add(Metric(**m))

    # 4. Seed Experiences
    experiences_data = [
        {
            "company": "Group of Institutions",
            "role": "Senior Manager, Technology",
            "location": "Bengaluru",
            "start_date": "Aug 2025",
            "end_date": "Present",
            "is_current": True,
            "order_index": 1,
            "description": "K-12 schools across CBSE, ICSE, and Cambridge IGCSE boards.",
            "career_progression_json": None,
            "responsibilities_json": json.dumps([
                "Designing system architecture, integration points, and unified data flows across multiple school campuses.",
                "Leading the strategic migration from legacy on-premises systems to a modern cloud ERP.",
                "Adopting GCP-native services for scalable infrastructure, disaster recovery, and hardened security.",
                "Establishing rigorous cybersecurity protocols, role-based access control, and student data privacy standards.",
                "Evaluating and benchmarking emerging AI solutions for classroom instruction and institutional administration."
            ]),
            "technologies_json": json.dumps([
                "Google Cloud Platform (GCP)", "Cloud ERP Architecture", "Cybersecurity & RBAC", "API Integration", "AI Evaluation Frameworks", "Data Privacy (DPDP)"
            ]),
            "outcomes_json": json.dumps([
                "Multi-campus cloud ERP migration architecture approved and phased rollout initiated across school boards.",
                "Institutional data security benchmark established with centralized compliance monitoring."
            ])
        },
        {
            "company": "National Film Development Corporation (NFDC) India",
            "role": "Head of IT",
            "location": "Mumbai",
            "start_date": "Aug 2023",
            "end_date": "Aug 2025",
            "is_current": False,
            "order_index": 2,
            "description": "Apex government organization under the Ministry of Information & Broadcasting.",
            "career_progression_json": None,
            "responsibilities_json": json.dumps([
                "Managed complete IT operations across national headquarters, NMIC (National Museum of Indian Cinema), and regional offices.",
                "Led end-to-end institutional implementation of NIC eOffice and Samarth eGov ERP.",
                "Directed critical technology operations for major international festivals: IFFI (International Film Festival of India) 2023 & 2024, Film Bazaar 2023 & 2024, and the 18th MIFF (Mumbai International Film Festival).",
                "Integrated third-party festival and submission ecosystems including Datakal and FilmFreeway.",
                "Engineered internal digital platforms: Digital Asset Management (DAM), Film Submission Portal, and Inventory Cataloging & Archiving systems.",
                "Authored IT governance policies, standard operating procedures (SOPs), manuals, and built Power BI and Grafana executive dashboards for HR, recruitment, and leave management."
            ]),
            "technologies_json": json.dumps([
                "Digital Asset Management (DAM)", "Datakal Integration", "FilmFreeway API", "Power BI", "Grafana", "NIC eOffice", "Samarth eGov", "Cloud Infrastructure"
            ]),
            "outcomes_json": json.dumps([
                "Digitized 2M+ legacy film records and cultural preservation documents.",
                "Consolidated 13+ fragmented portal domains into a single unified web presence.",
                "Delivered zero-downtime ticketing, accreditation, and delegate tech for IFFI & Film Bazaar."
            ])
        },
        {
            "company": "Samarth eGov, Ministry of Education (Delhi University)",
            "role": "Product Owner / Senior Analyst",
            "location": "Delhi",
            "start_date": "Sep 2019",
            "end_date": "Jul 2023",
            "is_current": False,
            "order_index": 3,
            "description": "National Digital Public Infrastructure for Higher Education in India.",
            "career_progression_json": json.dumps([
                "Rollout Support Executive",
                "Rollout Supervisor",
                "Assistant Manager",
                "Senior Analyst"
            ]),
            "responsibilities_json": json.dumps([
                "Led ERP implementation across 1,200+ higher education institutions covering 45+ functional modules.",
                "Served as Product Owner for 10+ core modules, driving backlog refinement, sprint planning, and user acceptance criteria.",
                "Supervised complex multi-department rollouts at premier universities: Delhi University (DU), Jawaharlal Nehru University (JNU), Central University of Rajasthan (CUR), and IISER Tirupati.",
                "Acted as designated national Module Champion for Employee Management, onboarding 150+ Central Universities.",
                "Authored 30 comprehensive module user manuals, training documents, and functional specification artifacts.",
                "Served as the single point of contact (SPOC) for institutional stakeholders across South-region universities.",
                "Built executive dashboards in Grafana, Tableau, and Power BI for the Ministry of Education.",
                "Managed high-stakes CUET (Common University Entrance Test) admissions simultaneously across 5 major universities."
            ]),
            "technologies_json": json.dumps([
                "Samarth eGov ERP", "Agile / Scrum", "JIRA", "Grafana", "Tableau", "Power BI", "SQL", "Python", "Workflow Automation"
            ]),
            "outcomes_json": json.dumps([
                "Rapid career acceleration: Earned 4 promotions in under 4 years based on technical and operational excellence.",
                "Scale achievement: Supported 1,200+ institutions processing millions of student and faculty lifecycle records."
            ])
        },
        {
            "company": "CSIR – Indian Institute of Chemical Technology",
            "role": "Project Assistant",
            "location": "Hyderabad",
            "start_date": "Sep 2018",
            "end_date": "Sep 2019",
            "is_current": False,
            "order_index": 4,
            "description": "Premier national research institute under the Council of Scientific and Industrial Research.",
            "career_progression_json": None,
            "responsibilities_json": json.dumps([
                "Engineered a predictive diabetes diagnostic classification model in Python utilizing the NIDDK clinical dataset.",
                "Created statistical research visualizations and data pipeline scripts for scientific publications.",
                "Conducted technical training programs for colleges on scientific modeling tools: Gaussian, MATLAB, and ChemDraw."
            ]),
            "technologies_json": json.dumps([
                "Python", "Scikit-Learn", "NIDDK Dataset", "MATLAB", "Data Visualization", "Statistical Analysis"
            ]),
            "outcomes_json": json.dumps([
                "Validated high-accuracy predictive healthcare algorithm and trained 200+ university scholars."
            ])
        },
        {
            "company": "Early Professional Roles",
            "role": "Events Technical Coordinator & Assistant",
            "location": "Hyderabad",
            "start_date": "May 2016",
            "end_date": "Aug 2018",
            "is_current": False,
            "order_index": 5,
            "description": "Info Media Institute of Journalism & Botuku Ramesh Sneha Samithi.",
            "career_progression_json": json.dumps([
                "Events Technical Coordinator (Info Media Institute of Journalism)",
                "Assistant (Botuku Ramesh Sneha Samithi)"
            ]),
            "responsibilities_json": json.dumps([
                "Handled comprehensive audio-visual setups, network routing, and technical coordination for media events, seminars, and workshops.",
                "Maintained internal data systems, participant databases, and digital event archiving infrastructure."
            ]),
            "technologies_json": json.dumps([
                "Audio-Visual Systems", "Event IT Coordination", "Database Maintenance", "Network Infrastructure"
            ]),
            "outcomes_json": json.dumps([
                "Ensured seamless technical execution for over 50+ high-profile industry events and workshops."
            ])
        }
    ]
    for exp in experiences_data:
        db.add(Experience(**exp))

    # 5. Seed Projects and Case Studies
    p1 = Project(
        slug="samarth-egov-erp",
        title="Samarth eGov: National Higher Education ERP Platform",
        category="Enterprise ERP / GovTech",
        client_org="Ministry of Education & Delhi University",
        summary="National digital public infrastructure modernizing university administration across 1,200+ higher education institutions in India through 45+ integrated modules.",
        challenge="India's higher education system suffered from deeply fragmented institutional silos, manual paper workflows, redundant administrative operations, and lack of real-time national data visibility across 1,200+ universities and colleges.",
        solution="Architected and executed rollouts of an open-source, configurable cloud-native enterprise ERP covering student lifecycle, human resources, faculty recruitment, examinations, admissions, and financial compliance.",
        role="Product Owner & Senior Analyst",
        responsibilities_json=json.dumps([
            "Direct Product Ownership across 10+ core administrative and academic modules.",
            "National Module Champion for Employee Management onboarding 150+ Central Universities.",
            "Authored 30 comprehensive module standard operating procedures and functional manuals.",
            "Coordinated CUET centralized admission workflows concurrently across 5 premier central universities."
        ]),
        tech_stack_json=json.dumps([
            "Python", "SQL", "Enterprise ERP Architecture", "JIRA", "Grafana", "Tableau", "Power BI", "Agile / Scrum"
        ]),
        impact_metrics_json=json.dumps([
            {"label": "Institutions Onboarded", "value": "1,200+"},
            {"label": "ERP Modules Coordinated", "value": "45+"},
            {"label": "Product Ownership Modules", "value": "10+"},
            {"label": "Manuals Authored", "value": "30"}
        ]),
        is_featured=True,
        published=True,
        order_index=1
    )
    db.add(p1)
    db.flush()

    cs1 = CaseStudy(
        project_id=p1.id,
        slug="samarth-egov-erp",
        title="Case Study: Scaling National ERP Across 1,200+ Higher Education Institutions",
        executive_summary="How a unified, modular ERP architecture transformed higher education administration across India, enabling rapid adoption across 1,200+ institutions and five-university concurrent admissions.",
        business_context="The Ministry of Education sought to establish a single digital backbone ('Samarth eGov') to standardize data schemas, streamline administrative processes, and bring transparency to student admissions, faculty promotions, and institutional governance nationwide.",
        problem_statement="Each university operated disparate, unmaintained legacy software or paper-based registries. There was zero interoperability, CUET national entrance exams had no standardized ingestion pipeline, and staff lacked training on digital enterprise workflows.",
        personas_json=json.dumps([
            {"role": "University Vice Chancellor / Registrar", "need": "Macro-level operational dashboards, compliance reports, and audit trails."},
            {"role": "Faculty & Administrative Staff", "need": "Frictionless leave, service book, recruitment, and appraisal workflows."},
            {"role": "Admissions Deans & Officers", "need": "High-concurrency merit list generation, seat allocation, and CUET score verification."},
            {"role": "Prospective Students", "need": "Transparent online counseling, fee payments, and admissions status."}
        ]),
        requirements_json=json.dumps([
            "Sub-second query response during peak admissions traffic.",
            "Configurable business rules for varied university statutes and reservation quotas.",
            "Strict role-based access control (RBAC) and audit logging for sensitive academic records.",
            "Intuitive UI/UX requiring minimal training for non-technical administrative staff."
        ]),
        product_strategy="Adopted a modular roll-out strategy: establish core foundational modules (Employee Management, Org Structure) before layering complex transaction engines (Admissions, Examinations, Finance). Formed regional champion hubs to drive user enablement.",
        discovery_json=json.dumps({
            "interviews_conducted": "120+ deep-dive sessions with university registrars and finance officers.",
            "key_insight": "Standardizing data dictionaries was 80% of the battle; universities needed localized flexibility inside standardized national schemas."
        }),
        stakeholder_map_json=json.dumps([
            {"group": "Ministry of Education", "priority": "High", "focus": "Policy compliance & national dashboard visibility"},
            {"group": "Central University Leadership", "priority": "High", "focus": "Autonomy preservation & seamless transition"},
            {"group": "Campus Administrative Staff", "priority": "Medium", "focus": "Ease of daily usage & localized support"},
            {"group": "Engineering & Development Teams", "priority": "High", "focus": "Module decoupling, API contracts & release velocity"}
        ]),
        feature_prioritization_json=json.dumps({
            "framework": "MoSCoW Prioritization",
            "must_have": ["Employee Master Record", "CUET Admissions Ingestion Engine", "Role-Based Permissions", "Audit Logging"],
            "should_have": ["Grafana Executive Dashboards", "Automated Leave Workflows", "Service Book Verification"],
            "could_have": ["Multi-lingual UI Portals", "Advanced Predictive Attrition Analytics"],
            "wont_have": ["Third-party LMS replacements during initial phase"]
        }),
        roadmap_json=json.dumps([
            {"phase": "Phase 1: Foundation", "timeline": "Q4 2019 - Q2 2020", "deliverables": "Core schemas, Employee Management pilot across 20 Central Universities"},
            {"phase": "Phase 2: Scale & Rollout", "timeline": "Q3 2020 - Q4 2021", "deliverables": "Expansion to 500+ institutions, 20+ modules live, authoring 30 training manuals"},
            {"phase": "Phase 3: High-Concurrency Admissions", "timeline": "Q1 2022 - Q4 2022", "deliverables": "CUET concurrent multi-university rollout (DU, JNU, CUR, IISER)"},
            {"phase": "Phase 4: National Scale & Analytics", "timeline": "Q1 2023 - Q3 2023", "deliverables": "1,200+ institutions live, executive Ministry dashboard delivery"}
        ]),
        system_architecture="Distributed service-oriented architecture deployed on national cloud infrastructure. Modular database design isolating institutional tenant data while maintaining centralized schema definition. API gateways handling authentication, rate limiting, and CUET batch score ingestion.",
        execution_delivery="Ran bi-weekly Agile sprints with cross-functional pods consisting of developers, QA, UX designers, and university rollout specialists. Conducted weekly regional review clinics to triage user requests and resolve blockers.",
        testing_deployment="Simulated load tests with 100,000+ virtual users mimicking admission rush hours. Automated regression suites for critical grading and payroll algorithms. Phased blue/green deployments during off-peak campus hours.",
        results_impact_json=json.dumps([
            {"metric": "1,200+ HEIs", "impact": "Successfully unified higher education administrative infrastructure across India."},
            {"metric": "150+ Central Univs", "impact": "Onboarded to Employee Management module with 100% digital service books."},
            {"metric": "5 Universities", "impact": "Conducted concurrent CUET admissions with zero downtime or transaction loss."},
            {"metric": "30 User Manuals", "impact": "Empowered over 25,000+ campus administrative personnel through clear documentation."}
        ]),
        learnings_json=json.dumps([
            "In public-sector enterprise transformation, change management and user empathy are just as crucial as technical architecture.",
            "Module ownership requires shielding engineering from ambiguity through rigorous acceptance criteria and documented SOPs.",
            "Standardized data definitions unlock compound analytics value across institutional boundaries."
        ]),
        published=True
    )
    db.add(cs1)

    p2 = Project(
        slug="nfdc-digital-transformation",
        title="NFDC Digital Transformation & Film Festival Technology",
        category="Digital Transformation / Enterprise Systems",
        client_org="National Film Development Corporation (NFDC) India",
        summary="Comprehensive modern IT modernization: digitizing 2M+ historic cultural records, consolidating 13+ disjointed websites into a unified presence, and engineering tech backbones for IFFI and Film Bazaar.",
        challenge="NFDC handled vast cultural film assets and major international festivals using legacy paper records, fragmented web properties, and disjointed vendor systems, creating operational bottlenecks and security vulnerabilities.",
        solution="Modernized enterprise IT operations by introducing Digital Asset Management (DAM), consolidating 13+ web assets into a unified secure ecosystem, deploying NIC eOffice, and directing mission-critical technology operations for IFFI, Film Bazaar, and MIFF.",
        role="Head of IT",
        responsibilities_json=json.dumps([
            "Complete technology leadership across Mumbai HQ, NMIC, and regional branches.",
            "Oversaw the digitization, metadata tagging, and cataloging of 2M+ archival documents.",
            "Unified 13+ fragmented agency websites into a singular modern corporate portal.",
            "Directed tech infrastructure, accreditation, and delegate platforms for IFFI 2023/2024 and Film Bazaar.",
            "Engineered in-house Digital Asset Management and film submission intake pipelines."
        ]),
        tech_stack_json=json.dumps([
            "Digital Asset Management (DAM)", "Datakal Integration", "FilmFreeway API", "Power BI", "Grafana", "NIC eOffice", "Cloud Security", "SOP Development"
        ]),
        impact_metrics_json=json.dumps([
            {"label": "Archival Documents Digitized", "value": "2M+"},
            {"label": "Websites Consolidated", "value": "13+"},
            {"label": "Global Festivals Powered", "value": "5+"},
            {"label": "eOffice Implementation", "value": "100%"}
        ]),
        is_featured=True,
        published=True,
        order_index=2
    )
    db.add(p2)
    db.flush()

    cs2 = CaseStudy(
        project_id=p2.id,
        slug="nfdc-digital-transformation",
        title="Case Study: Modernizing National Cultural Heritage & High-Stakes Film Festival Tech",
        executive_summary="Transforming India's premier film development corporation through archival digitization, portal unification, and mission-critical technology leadership for Asia's oldest film festival.",
        business_context="NFDC serves as the central nodal agency for cinema in India. The merger of four film media units into NFDC required rapid IT consolidation, infrastructure modernization, and reliable digital systems for international events like IFFI.",
        problem_statement="Decades of rare film scripts, prints, posters, and administrative records were decaying physically. Additionally, 13 independent sub-domains created severe brand confusion, while international festivals suffered from disconnected ticketing and submission systems.",
        personas_json=json.dumps([
            {"role": "International Festival Delegates & Filmmakers", "need": "Frictionless accreditation, screening schedules, and submission tracking."},
            {"role": "Archivists & Film Curators", "need": "High-fidelity digital preservation, metadata tagging, and search retrieval."},
            {"role": "NFDC Leadership & Ministry Officials", "need": "Transparent digital approvals via eOffice and live operational reporting."},
            {"role": "Festival Operations & Security Teams", "need": "Real-time badge verification, access control, and incident escalation."}
        ]),
        requirements_json=json.dumps([
            "High-throughput digitization pipeline with OCR and archival metadata compliance.",
            "Unified web domain architecture with zero data loss during content migration.",
            "Real-time bidirectional integration with Datakal festival management and FilmFreeway.",
            "Robust cybersecurity architecture protecting intellectual property and sensitive festival credentials."
        ]),
        product_strategy="Executed a tripartite strategy: (1) Digitize and secure legacy assets first; (2) Unify public digital touchpoints under a single design language and domain; (3) Build modular, reusable event tech infrastructure for recurring festivals.",
        discovery_json=json.dumps({
            "audit_findings": "Found 13 separate web properties hosted across 7 different unmonitored vendor accounts with varying SSL and backup standards.",
            "preservation_survey": "Identified over 2 million physical sheets and rare cinema memorabilia requiring prioritized temperature-controlled scanning."
        }),
        stakeholder_map_json=json.dumps([
            {"group": "Ministry of Information & Broadcasting", "priority": "High", "focus": "Festival success, eOffice transition, digital governance"},
            {"group": "Festival Directors & Jury Members", "priority": "High", "focus": "Secure screener access, deliberation tools, zero technical glitches"},
            {"group": "Archival Staff", "priority": "Medium", "focus": "DAM search speed, metadata schema accuracy"},
            {"group": "Global Filmmakers & Delegates", "priority": "High", "focus": "Seamless badges, mobile schedules, prompt customer support"}
        ]),
        feature_prioritization_json=json.dumps({
            "framework": "Risk & Value Matrix",
            "p0_critical": ["IFFI Delegate Accreditation System", "Unified Domain Routing & SSL Setup", "NIC eOffice Deployment"],
            "p1_high": ["Digital Asset Management Indexing", "Power BI Executive Dashboard for Leave & HR", "FilmFreeway Submission Ingestion"],
            "p2_medium": ["Interactive Museum Kiosk Synchronization", "Archival Public Search Showcase"]
        }),
        roadmap_json=json.dumps([
            {"phase": "Phase 1: IT Governance & eOffice", "timeline": "Aug 2023 - Nov 2023", "deliverables": "Deploy NIC eOffice, author SOPs, secure network perimeter"},
            {"phase": "Phase 2: IFFI 2023 & Film Bazaar", "timeline": "Oct 2023 - Dec 2023", "deliverables": "Deploy Datakal integration, badge printing, venue networks"},
            {"phase": "Phase 3: Digital Archiving & Consolidation", "timeline": "Jan 2024 - Jun 2024", "deliverables": "2M+ document digitization, consolidate 13 websites into unified portal"},
            {"phase": "Phase 4: IFFI 2024 & Continuous Automation", "timeline": "Jul 2024 - Aug 2025", "deliverables": "Advanced Grafana/Power BI dashboards, DAM expansion, 18th MIFF"}
        ]),
        system_architecture="Hybrid cloud architecture connecting Mumbai on-premise high-density storage with cloud-backed Digital Asset Management. Reverse-proxy clusters routing legacy festival domains to modern micro-sites under unified DNS. Event-driven API webhooks syncing Datakal and FilmFreeway delegate registries.",
        execution_delivery="Embedded technical command centers directly on-site in Goa for IFFI and Mumbai for MIFF. Established 24/7 rapid response war rooms monitoring server loads, credential verification, and venue Wi-Fi telemetry.",
        testing_deployment="Conducted comprehensive penetration testing across festival portals. Drilled failover scenarios for on-site registration desks in case of WAN outages. Pre-printed offline NFC backup badges.",
        results_impact_json=json.dumps([
            {"metric": "2,000,000+ Documents", "impact": "Permanently safeguarded Indian cinematic heritage into indexed digital repositories."},
            {"metric": "13 Sites Consolidated", "impact": "Reduced hosting maintenance costs by 65% and unified national brand authority."},
            {"metric": "5 Global Festivals", "impact": "Flawless technical execution across IFFI 2023/24, Film Bazaar 2023/24, and 18th MIFF."},
            {"metric": "Zero Security Breaches", "impact": "Hardened organizational posture compliant with national cybersecurity norms."}
        ]),
        learnings_json=json.dumps([
            "High-stakes live events require offline fallback mechanisms designed into the core system architecture.",
            "Consolidating decentralized legacy websites requires aggressive stakeholder management alongside technical DNS redirects.",
            "Digital asset preservation is only as useful as the metadata schema driving its searchability."
        ]),
        published=True
    )
    db.add(cs2)

    p3 = Project(
        slug="institutional-cloud-erp",
        title="Institutional Cloud ERP & Multi-Campus Modernization",
        category="Cloud Transformation",
        client_org="Group of Institutions (Bengaluru)",
        summary="Strategic multi-campus architecture and cloud migration initiative transitioning legacy on-premise K-12 systems to a secure, GCP-native cloud ERP ecosystem.",
        challenge="A prestigious education group operating multi-curriculum campuses (CBSE, ICSE, Cambridge IGCSE) faced fractured on-premises infrastructure, isolated student databases, and escalating maintenance overheads.",
        solution="Architecting an enterprise migration roadmap to cloud ERP, leveraging Google Cloud Platform (GCP) native services, unified API data bridges, hardened data privacy frameworks, and evaluating pragmatic AI tools for teaching and administration.",
        role="Senior Manager, Technology",
        responsibilities_json=json.dumps([
            "Designing unified multi-campus system architecture, integration points, and cross-board data models.",
            "Leading phased migration strategy from legacy on-premises servers to cloud ERP infrastructure.",
            "Selecting and architecting GCP-native services to optimize throughput, uptime, and automated backup.",
            "Establishing comprehensive cybersecurity benchmarks and compliance with data privacy mandates.",
            "Formulating an AI evaluation framework to assess classroom and administrative productivity tools."
        ]),
        tech_stack_json=json.dumps([
            "Google Cloud Platform (GCP)", "Cloud ERP Migration", "Multi-Campus Architecture", "Cybersecurity", "Data Privacy (DPDP)", "AI Evaluation Framework"
        ]),
        impact_metrics_json=json.dumps([
            {"label": "Educational Boards", "value": "CBSE, ICSE, IGCSE"},
            {"label": "Cloud Provider", "value": "GCP-Native"},
            {"label": "Data Security", "value": "100% RBAC"},
            {"label": "Status", "value": "Active Phased Rollout"}
        ]),
        is_featured=True,
        published=True,
        order_index=3
    )
    db.add(p3)
    db.flush()

    cs3 = CaseStudy(
        project_id=p3.id,
        slug="institutional-cloud-erp",
        title="Case Study: Architecting Multi-Campus Cloud ERP on Google Cloud Platform",
        executive_summary="Designing a robust, cloud-native enterprise architecture to unify multi-curriculum school networks, elevate data privacy, and prepare institutional infrastructure for AI-enabled workflows.",
        business_context="The Group of Institutions operates multiple leading campuses in Bengaluru providing varied curricula (CBSE, ICSE, Cambridge IGCSE). Modern educational requirements demanded seamless student academic tracking, centralized fee operations, and robust parent communication.",
        problem_statement="Isolated on-premise servers created data silos, delayed student performance analysis, and carried physical risk of hardware failure. Varied curriculum assessment models made a one-size-fits-all ERP unviable without custom architectural adaptation.",
        personas_json=json.dumps([
            {"role": "School Principals & Trustees", "need": "Consolidated multi-campus analytics on enrollment, fees, and staff allocation."},
            {"role": "Teachers & Academic Coordinators", "need": "Curriculum-specific gradebooks (CBSE vs IGCSE), attendance tracking, and parent messaging."},
            {"role": "Parents & Students", "need": "Mobile-friendly portal for fee receipts, report cards, and homework submissions."},
            {"role": "IT & Infrastructure Engineers", "need": "Automated backups, high availability, and streamlined user lifecycle management."}
        ]),
        requirements_json=json.dumps([
            "Multi-tenant or logically partitioned schema supporting differing curricular standards.",
            "High availability and automated failover powered by GCP cloud infrastructure.",
            "Strict compliance with child data protection and institutional cybersecurity standards.",
            "Standardized API integration layer connecting fee gateways, transport GPS, and LMS."
        ]),
        product_strategy="Adopted a foundational cloud migration roadmap: harmonize identity management and data schemas across campuses, deploy GCP containerized services, and execute parallel runs before legacy decommission.",
        discovery_json=json.dumps({
            "campus_discovery": "Mapped over 80 distinct administrative forms and identified significant friction in quarterly report card generation across boards.",
            "cloud_readiness": "Benchmarked GCP managed database and identity services to replace aging physical server cabinets."
        }),
        stakeholder_map_json=json.dumps([
            {"group": "Board of Management", "priority": "High", "focus": "Cost-effectiveness, risk reduction, brand reputation"},
            {"group": "Academic Leadership (CBSE/ICSE/IGCSE)", "priority": "High", "focus": "Curricular fidelity, ease of assessment entry"},
            {"group": "Administrative & Accounts Teams", "priority": "High", "focus": "Fee reconciliation, payroll accuracy, audit logs"},
            {"group": "External Solution Vendors", "priority": "Medium", "focus": "SLA adherence, API contract consistency"}
        ]),
        feature_prioritization_json=json.dumps({
            "framework": "Value vs Complexity Analysis",
            "phase_1_core": ["Unified Master Student/Staff Directory", "Cloud Database Provisioning on GCP", "Fee Payment Gateway Modernization"],
            "phase_2_academic": ["Curriculum-specific Gradebook Engines", "Attendance & Timetable Automation"],
            "phase_3_innovation": ["Classroom AI Assistive Tool Evaluation", "Predictive Student Performance Dashboards"]
        }),
        roadmap_json=json.dumps([
            {"phase": "Architecture & Discovery", "timeline": "Aug 2025 - Oct 2025", "deliverables": "System architecture blueprint, data flow diagrams, GCP infrastructure setup"},
            {"phase": "Pilot Campus Migration", "timeline": "Nov 2025 - Feb 2026", "deliverables": "Migrate core identity and finance modules for pilot campus, parallel testing"},
            {"phase": "Multi-Campus Phased Cutover", "timeline": "Mar 2026 - Jun 2026", "deliverables": "Rollout across remaining CBSE, ICSE and Cambridge campuses with zero data loss"},
            {"phase": "AI Integration & Analytics", "timeline": "Jul 2026 Onwards", "deliverables": "Institutional AI tool rollout and predictive analytics enablement"}
        ]),
        system_architecture="GCP cloud-native architecture utilizing Google Cloud SQL with automated failover and daily point-in-time snapshots. Microservices containerized with GCP Cloud Run, fronted by Cloud Load Balancing and Cloud Armor for DDoS defense and TLS termination. Strict VPC isolation separating production tenant workloads from staging.",
        execution_delivery="Utilizing iterative sprint milestones aligning with the school academic calendar to ensure mission-critical examination and fee payment periods experience zero platform disruption.",
        testing_deployment="Dual-entry parallel runs validating accounting ledger parity between legacy on-prem and cloud ERP. Extensive security scans and data sanitization drills.",
        results_impact_json=json.dumps([
            {"metric": "Multi-Campus Blueprint", "impact": "Unified architecture approved across all institutional entities."},
            {"metric": "GCP Infrastructure", "impact": "High-availability cloud environment configured with automated disaster recovery."},
            {"metric": "Data Privacy Framework", "impact": "Formal student data governance guidelines established across school network."},
            {"metric": "AI Evaluation Protocol", "impact": "Objective benchmarking framework implemented to evaluate educational AI pilots."}
        ]),
        learnings_json=json.dumps([
            "Cloud migration in K-12 education must align strictly with academic term calendars to avoid disrupting live examinations.",
            "Curriculum variance requires configurable grading engines rather than rigid database schemas.",
            "Securing stakeholder trust in the cloud requires transparent demonstrations of automated backup and instant recovery."
        ]),
        published=True
    )
    db.add(cs3)

    # 6. Seed Skills
    skills_data = [
        # Product Strategy
        {"category": "Product Strategy", "name": "Product Vision & Roadmap", "proficiency_level": "Expert", "icon_name": "Compass", "is_key_skill": True, "order_index": 1},
        {"category": "Product Strategy", "name": "Product Discovery & Market Research", "proficiency_level": "Advanced", "icon_name": "Search", "is_key_skill": True, "order_index": 2},
        {"category": "Product Strategy", "name": "Business Alignment & ROI", "proficiency_level": "Advanced", "icon_name": "TrendingUp", "is_key_skill": True, "order_index": 3},
        {"category": "Product Strategy", "name": "Product Lifecycle Management", "proficiency_level": "Expert", "icon_name": "RotateCcw", "is_key_skill": True, "order_index": 4},
        
        # Product Execution
        {"category": "Product Execution", "name": "Agile / Scrum Methodology", "proficiency_level": "Expert", "icon_name": "Repeat", "is_key_skill": True, "order_index": 5},
        {"category": "Product Execution", "name": "Sprint & Backlog Management (JIRA)", "proficiency_level": "Expert", "icon_name": "CheckSquare", "is_key_skill": True, "order_index": 6},
        {"category": "Product Execution", "name": "User Stories & Acceptance Criteria", "proficiency_level": "Expert", "icon_name": "FileText", "is_key_skill": True, "order_index": 7},
        {"category": "Product Execution", "name": "Release Planning & Rollout Coordination", "proficiency_level": "Expert", "icon_name": "Send", "is_key_skill": True, "order_index": 8},

        # Data & Analytics
        {"category": "Data & Analytics", "name": "Power BI & Tableau Dashboards", "proficiency_level": "Expert", "icon_name": "BarChart3", "is_key_skill": True, "order_index": 9},
        {"category": "Data & Analytics", "name": "Grafana Telemetry & Monitoring", "proficiency_level": "Advanced", "icon_name": "Activity", "is_key_skill": True, "order_index": 10},
        {"category": "Data & Analytics", "name": "Python & Data Science", "proficiency_level": "Advanced", "icon_name": "Code2", "is_key_skill": True, "order_index": 11},
        {"category": "Data & Analytics", "name": "SQL & Relational Schemas", "proficiency_level": "Expert", "icon_name": "Database", "is_key_skill": True, "order_index": 12},
        {"category": "Data & Analytics", "name": "R Programming & Statistics", "proficiency_level": "Proficient", "icon_name": "PieChart", "is_key_skill": False, "order_index": 13},

        # Systems & Architecture
        {"category": "Systems & Architecture", "name": "Enterprise ERP Implementation", "proficiency_level": "Expert", "icon_name": "Cpu", "is_key_skill": True, "order_index": 14},
        {"category": "Systems & Architecture", "name": "Cloud Systems (AWS, Azure, GCP)", "proficiency_level": "Advanced", "icon_name": "Cloud", "is_key_skill": True, "order_index": 15},
        {"category": "Systems & Architecture", "name": "API Integrations & Webhooks", "proficiency_level": "Advanced", "icon_name": "Network", "is_key_skill": True, "order_index": 16},
        {"category": "Systems & Architecture", "name": "Digital Asset Management (DAM)", "proficiency_level": "Expert", "icon_name": "HardDrive", "is_key_skill": True, "order_index": 17},
        {"category": "Systems & Architecture", "name": "Cybersecurity & Data Privacy (DPDP)", "proficiency_level": "Advanced", "icon_name": "ShieldCheck", "is_key_skill": True, "order_index": 18},
        {"category": "Systems & Architecture", "name": "Moodle & KOHA LMS Systems", "proficiency_level": "Advanced", "icon_name": "BookOpen", "is_key_skill": False, "order_index": 19},

        # Leadership & Governance
        {"category": "Leadership & Governance", "name": "Executive Stakeholder Management", "proficiency_level": "Expert", "icon_name": "Users", "is_key_skill": True, "order_index": 20},
        {"category": "Leadership & Governance", "name": "Vendor Management & RFP Evaluation", "proficiency_level": "Expert", "icon_name": "Briefcase", "is_key_skill": True, "order_index": 21},
        {"category": "Leadership & Governance", "name": "IT Policies, Manuals & SOP Authoring", "proficiency_level": "Expert", "icon_name": "Scroll", "is_key_skill": True, "order_index": 22},
        {"category": "Leadership & Governance", "name": "Organizational Change Management", "proficiency_level": "Advanced", "icon_name": "RefreshCw", "is_key_skill": True, "order_index": 23},
        {"category": "Leadership & Governance", "name": "Public Sector Procurement", "proficiency_level": "Advanced", "icon_name": "Landmark", "is_key_skill": False, "order_index": 24}
    ]
    for s in skills_data:
        db.add(Skill(**s))

    # 7. Seed Certifications and Degrees
    certs_data = [
        {
            "title": "PMP® – Project Management Professional",
            "issuer": "Project Management Institute (PMI)",
            "issue_date": "Verified Credential",
            "expiry_date": None,
            "credential_id": "PMI-PMP",
            "credential_url": "https://www.pmi.org",
            "category": "Certification",
            "order_index": 1
        },
        {
            "title": "Certified AI-Driven Professional",
            "issuer": "be10x / QM",
            "issue_date": "March 2026",
            "expiry_date": None,
            "credential_id": "QM-AI-2026",
            "credential_url": None,
            "category": "Certification",
            "order_index": 2
        },
        {
            "title": "Post Graduate Program in Data Science",
            "issuer": "Purdue University, Indiana, USA",
            "issue_date": "2021 – 2022",
            "expiry_date": None,
            "credential_id": "PURDUE-DS-2022",
            "credential_url": "https://www.purdue.edu",
            "category": "Executive Education",
            "order_index": 3
        },
        {
            "title": "Professional Certificate in Product Management",
            "issuer": "SP Jain Global School of Management",
            "issue_date": "2023",
            "expiry_date": None,
            "credential_id": "SPJAIN-PM-2023",
            "credential_url": "https://www.spjain.org",
            "category": "Executive Education",
            "order_index": 4
        },
        {
            "title": "Master of Science (M.Sc.) – Physics",
            "issuer": "Acharya Nagarjuna University",
            "issue_date": "2020 – 2022",
            "expiry_date": None,
            "credential_id": "ANU-MSC-PHY",
            "credential_url": None,
            "category": "Degree",
            "order_index": 5
        },
        {
            "title": "Bachelor of Science (B.Sc.) – Computer Science",
            "issuer": "Acharya Nagarjuna University",
            "issue_date": "2013 – 2016",
            "expiry_date": None,
            "credential_id": "ANU-BSC-CS",
            "credential_url": None,
            "category": "Degree",
            "order_index": 6
        }
    ]
    for c in certs_data:
        db.add(Certification(**c))

    db.commit()
    print("Database seeding completed successfully!")

