export interface Profile {
  id: number;
  name: string;
  title: string;
  headline: string;
  summary: string;
  philosophy: string;
  location: string;
  email: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  resume_url?: string;
  years_of_experience: number;
  languages: string;
  creative_interests?: string;
  about_content_json?: string | null;
  sections_content_json?: string | null;
}

export interface Metric {
  id: number;
  label: string;
  value_number: string;
  prefix?: string;
  suffix?: string;
  context_project: string;
  description: string;
  icon_name?: string;
  order_index: number;
}

export interface Experience {
  id: number;
  company: string;
  role: string;
  location: string;
  start_date: string;
  end_date?: string;
  is_current: boolean;
  order_index: number;
  description?: string;
  career_progression_json?: string; // stringified array
  responsibilities_json: string; // stringified array
  technologies_json: string; // stringified array
  outcomes_json?: string; // stringified array
}

export interface Project {
  id: number;
  slug: string;
  title: string;
  category: string;
  client_org: string;
  summary: string;
  challenge: string;
  solution: string;
  role: string;
  responsibilities_json: string;
  tech_stack_json: string;
  impact_metrics_json: string;
  is_featured: boolean;
  published: boolean;
  order_index: number;
  case_study?: CaseStudy;
}

export interface CaseStudy {
  id: number;
  project_id: number;
  slug: string;
  title: string;
  executive_summary: string;
  business_context: string;
  problem_statement: string;
  personas_json: string;
  requirements_json: string;
  product_strategy: string;
  discovery_json: string;
  stakeholder_map_json: string;
  feature_prioritization_json: string;
  roadmap_json: string;
  system_architecture: string;
  execution_delivery: string;
  testing_deployment: string;
  results_impact_json: string;
  learnings_json: string;
  published: boolean;
}

export interface Skill {
  id: number;
  category: string;
  name: string;
  proficiency_level: string;
  icon_name?: string;
  is_key_skill: boolean;
  order_index: number;
}

export interface Certification {
  id: number;
  title: string;
  issuer: string;
  issue_date: string;
  expiry_date?: string;
  credential_id?: string;
  credential_url?: string;
  category: string;
  order_index: number;
}

export interface PortfolioBundle {
  profile: Profile;
  metrics: Metric[];
  experiences: Experience[];
  projects: Project[];
  skills: Skill[];
  certifications: Certification[];
}

export interface ContactFormData {
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
}

export interface ContactMessageResponse {
  id: number;
  name: string;
  email: string;
  company?: string;
  subject: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface AdminSummary {
  projects: { total: number; published: number };
  messages: { total: number; unread: number };
  experiences_count: number;
  skills_count: number;
  certifications_count: number;
}

export interface GoogleSheetConfig {
  google_sheet_url: string | null;
  google_webhook_url: string | null;
  auto_sync_google_sheet: boolean;
  last_synced_at: string | null;
}

