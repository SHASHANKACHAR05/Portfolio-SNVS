import { PortfolioBundle, Project, CaseStudy, ContactFormData, ContactMessageResponse, AdminSummary, GoogleSheetConfig } from '../types';

const API_BASE = '/api';

export async function fetchPortfolio(): Promise<PortfolioBundle> {
  const res = await fetch(`${API_BASE}/portfolio?_=${Date.now()}`, {
    cache: 'no-store',
  });
  if (!res.ok) {
    throw new Error(`Failed to load portfolio data (${res.status})`);
  }
  return res.json();
}

export async function fetchProjectBySlug(slug: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/portfolio/projects/${slug}`);
  if (!res.ok) {
    throw new Error(`Project ${slug} not found`);
  }
  return res.json();
}

export async function fetchCaseStudyBySlug(slug: string): Promise<CaseStudy> {
  const res = await fetch(`${API_BASE}/portfolio/case-studies/${slug}`);
  if (!res.ok) {
    throw new Error(`Case study ${slug} not found`);
  }
  return res.json();
}

export async function submitContact(data: ContactFormData): Promise<ContactMessageResponse> {
  const res = await fetch(`${API_BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to submit contact message');
  }
  return res.json();
}

export async function adminLogin(email: string, password: string): Promise<{ access_token: string; full_name: string }> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Invalid email or password');
  }
  return res.json();
}

export async function getAdminSummary(token: string): Promise<AdminSummary> {
  const res = await fetch(`${API_BASE}/admin/dashboard-summary`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to load admin summary');
  return res.json();
}

export async function getAdminMessages(token: string): Promise<ContactMessageResponse[]> {
  const res = await fetch(`${API_BASE}/admin/messages`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to load messages');
  return res.json();
}

export async function markAdminMessageRead(id: number, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/messages/${id}/read`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to update message status');
}

export async function deleteAdminMessage(id: number, token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/messages/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to delete message');
}

export async function toggleProjectPublishState(id: number, token: string): Promise<Project> {
  const res = await fetch(`${API_BASE}/admin/projects/${id}/publish`, {
    method: 'PATCH',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to toggle project state');
  return res.json();
}

export async function downloadAdminMessagesExcel(token: string): Promise<void> {
  const res = await fetch(`${API_BASE}/admin/messages/export/excel`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to export inquiries Excel file');
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  const cd = res.headers.get('Content-Disposition');
  const match = cd?.match(/filename="([^"]+)"/);
  a.download = match ? match[1] : 'inquiries_inbox.xlsx';
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}

export async function getGoogleSheetConfig(token: string): Promise<GoogleSheetConfig> {
  const res = await fetch(`${API_BASE}/admin/integrations/google-sheets`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) throw new Error('Failed to load Google Sheets configuration');
  return res.json();
}

export async function saveGoogleSheetConfig(
  config: { google_sheet_url: string; google_webhook_url: string; auto_sync_google_sheet: boolean },
  token: string
): Promise<GoogleSheetConfig> {
  const res = await fetch(`${API_BASE}/admin/integrations/google-sheets`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(config)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to save Google Sheets connection');
  }
  return res.json();
}

export async function syncGoogleSheet(
  token: string
): Promise<{ ok: boolean; detail: string; synced_count: number; last_synced_at: string }> {
  const res = await fetch(`${API_BASE}/admin/integrations/google-sheets/sync`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Failed to sync to Google Sheets');
  }
  return res.json();
}

// --- Full Admin CRUD APIs ---

async function adminRequest<T>(
  path: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  token: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${API_BASE}/admin${path}`, {
    method,
    cache: 'no-store',
    headers: {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      Authorization: `Bearer ${token}`
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Request failed (${res.status})`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const adminUpdateProfile = (data: Record<string, unknown>, token: string) =>
  adminRequest('/profile', 'PUT', token, data);

export const adminListProjects = (token: string) =>
  adminRequest<Project[]>('/projects', 'GET', token);

export const adminCreateProject = (data: Record<string, unknown>, token: string) =>
  adminRequest<Project>('/projects', 'POST', token, data);

export const adminUpdateProject = (id: number, data: Record<string, unknown>, token: string) =>
  adminRequest<Project>(`/projects/${id}`, 'PUT', token, data);

export const adminDeleteProject = (id: number, token: string) =>
  adminRequest<void>(`/projects/${id}`, 'DELETE', token);

export const adminCreateExperience = (data: Record<string, unknown>, token: string) =>
  adminRequest('/experiences', 'POST', token, data);

export const adminUpdateExperience = (id: number, data: Record<string, unknown>, token: string) =>
  adminRequest(`/experiences/${id}`, 'PUT', token, data);

export const adminDeleteExperience = (id: number, token: string) =>
  adminRequest<void>(`/experiences/${id}`, 'DELETE', token);

export const adminCreateSkill = (data: Record<string, unknown>, token: string) =>
  adminRequest('/skills', 'POST', token, data);

export const adminUpdateSkill = (id: number, data: Record<string, unknown>, token: string) =>
  adminRequest(`/skills/${id}`, 'PUT', token, data);

export const adminDeleteSkill = (id: number, token: string) =>
  adminRequest<void>(`/skills/${id}`, 'DELETE', token);

export const adminCreateCertification = (data: Record<string, unknown>, token: string) =>
  adminRequest('/certifications', 'POST', token, data);

export const adminUpdateCertification = (id: number, data: Record<string, unknown>, token: string) =>
  adminRequest(`/certifications/${id}`, 'PUT', token, data);

export const adminDeleteCertification = (id: number, token: string) =>
  adminRequest<void>(`/certifications/${id}`, 'DELETE', token);

export const adminCreateMetric = (data: Record<string, unknown>, token: string) =>
  adminRequest('/metrics', 'POST', token, data);

export const adminUpdateMetric = (id: number, data: Record<string, unknown>, token: string) =>
  adminRequest(`/metrics/${id}`, 'PUT', token, data);

export const adminDeleteMetric = (id: number, token: string) =>
  adminRequest<void>(`/metrics/${id}`, 'DELETE', token);

export const adminCreateCaseStudy = (data: Record<string, unknown>, token: string) =>
  adminRequest('/case-studies', 'POST', token, data);

export const adminUpdateCaseStudy = (id: number, data: Record<string, unknown>, token: string) =>
  adminRequest(`/case-studies/${id}`, 'PUT', token, data);

