import React, { useEffect, useState } from 'react';
import {
  Plus, Pencil, Trash2, Check, X, User, BarChart3, Briefcase, FolderGit2, Wrench, GraduationCap, Sparkles, ExternalLink
} from 'lucide-react';
import { PortfolioBundle, Experience, Project, Skill, Certification, Metric } from '../types';
import {
  adminUpdateProfile,
  adminCreateMetric, adminUpdateMetric, adminDeleteMetric,
  adminCreateExperience, adminUpdateExperience, adminDeleteExperience,
  adminCreateProject, adminUpdateProject, adminDeleteProject,
  adminCreateSkill, adminUpdateSkill, adminDeleteSkill,
  adminCreateCertification, adminUpdateCertification, adminDeleteCertification
} from '../services/api';

export type EditSectionKey = 'profile' | 'metrics' | 'experiences' | 'projects' | 'skills' | 'certifications';

interface AdminEditInfoManagerProps {
  token: string;
  data: PortfolioBundle | null;
  onRefreshData: () => void;
  initialSection?: EditSectionKey;
  sectionHeading?: string;
  onLaunchLivePreview?: (section: EditSectionKey) => void;
  isLivePreviewMode?: boolean;
}

const SECTION_TABS: { key: EditSectionKey; label: string; heading: string; icon: React.ReactNode }[] = [
  { key: 'profile', label: 'Overview & Profile', heading: 'Overview & Executive Profile', icon: <User className="w-3.5 h-3.5" /> },
  { key: 'metrics', label: 'Verified Impact', heading: 'Verified Impact & Scale', icon: <BarChart3 className="w-3.5 h-3.5" /> },
  { key: 'experiences', label: 'Career Experience', heading: 'Career Experience & Trajectory', icon: <Briefcase className="w-3.5 h-3.5" /> },
  { key: 'projects', label: 'Flagship Projects', heading: 'Flagship Products & Platforms', icon: <FolderGit2 className="w-3.5 h-3.5" /> },
  { key: 'skills', label: 'Tech Stack & Tools', heading: 'Technology Stack & Tools Ecosystem', icon: <Wrench className="w-3.5 h-3.5" /> },
  { key: 'certifications', label: 'Education & Certifications', heading: 'Education & Certifications', icon: <GraduationCap className="w-3.5 h-3.5" /> },
];

const parseJsonList = (raw?: string): string[] => {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const linesToJson = (text: string): string =>
  JSON.stringify(
    text
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
  );

const csvToJson = (text: string): string =>
  JSON.stringify(
    text
      .split(',')
      .map((l) => l.trim())
      .filter(Boolean)
  );

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `project-${Date.now()}`;

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-[#4d6a10]/20 bg-[#fafcf7] text-[#121410] text-xs focus:outline-none focus:border-[#4d6a10] focus:bg-white transition-colors';
const labelCls = 'block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1';

export const AdminEditInfoManager: React.FC<AdminEditInfoManagerProps> = ({
  token,
  data,
  onRefreshData,
  initialSection = 'profile',
  sectionHeading,
  onLaunchLivePreview,
  isLivePreviewMode = false,
}) => {
  const [section, setSection] = useState<EditSectionKey>(initialSection);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  const notify = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    if (type === 'success') {
      window.setTimeout(() => setNotice((curr) => (curr?.text === text ? null : curr)), 3500);
    }
  };

  // --- PROFILE STATE ---
  const [profileForm, setProfileForm] = useState({
    name: '',
    title: '',
    headline: '',
    summary: '',
    philosophy: '',
    location: '',
    email: '',
    phone: '',
    linkedin_url: '',
    github_url: '',
    resume_url: '',
    years_of_experience: 10,
    languages: '',
    creative_interests: '',
  });

  useEffect(() => {
    if (!data?.profile) return;
    const p = data.profile;
    setProfileForm({
      name: p.name || '',
      title: p.title || '',
      headline: p.headline || '',
      summary: p.summary || '',
      philosophy: p.philosophy || '',
      location: p.location || '',
      email: p.email || '',
      phone: p.phone || '',
      linkedin_url: p.linkedin_url || '',
      github_url: p.github_url || '',
      resume_url: p.resume_url || '',
      years_of_experience: p.years_of_experience || 10,
      languages: p.languages || '',
      creative_interests: p.creative_interests || '',
    });
  }, [data?.profile]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await adminUpdateProfile(
        {
          ...profileForm,
          years_of_experience: Number(profileForm.years_of_experience) || 0,
        },
        token
      );
      onRefreshData();
      notify('success', 'Profile & bio updated live.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to update profile.');
    } finally {
      setBusy(false);
    }
  };

  // --- METRICS STATE ---
  const [editingMetricId, setEditingMetricId] = useState<number | null>(null);
  const [metricForm, setMetricForm] = useState({
    label: '',
    value_number: '',
    context_project: '',
    description: '',
    order_index: 0,
  });

  const resetMetricForm = () => {
    setEditingMetricId(null);
    setMetricForm({
      label: '',
      value_number: '',
      context_project: '',
      description: '',
      order_index: (data?.metrics?.length || 0) + 1,
    });
  };

  const handleSaveMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingMetricId) {
        await adminUpdateMetric(editingMetricId, metricForm, token);
        notify('success', 'Metric card updated.');
      } else {
        await adminCreateMetric(metricForm, token);
        notify('success', 'New metric card added.');
      }
      resetMetricForm();
      onRefreshData();
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to save metric.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteMetric = async (id: number) => {
    if (!window.confirm('Delete this metric card?')) return;
    setBusy(true);
    try {
      await adminDeleteMetric(id, token);
      onRefreshData();
      notify('success', 'Metric card deleted.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to delete metric.');
    } finally {
      setBusy(false);
    }
  };

  // --- EXPERIENCE STATE ---
  const [editingExpId, setEditingExpId] = useState<number | null>(null);
  const [expForm, setExpForm] = useState({
    company: '',
    role: '',
    location: '',
    start_date: '',
    end_date: '',
    is_current: false,
    description: '',
    responsibilitiesText: '',
    technologiesText: '',
    outcomesText: '',
    order_index: 0,
  });

  const resetExpForm = () => {
    setEditingExpId(null);
    setExpForm({
      company: '',
      role: '',
      location: '',
      start_date: '',
      end_date: '',
      is_current: false,
      description: '',
      responsibilitiesText: '',
      technologiesText: '',
      outcomesText: '',
      order_index: (data?.experiences?.length || 0) + 1,
    });
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        company: expForm.company,
        role: expForm.role,
        location: expForm.location,
        start_date: expForm.start_date,
        end_date: expForm.is_current ? null : expForm.end_date || null,
        is_current: expForm.is_current,
        description: expForm.description || null,
        responsibilities_json: linesToJson(expForm.responsibilitiesText),
        technologies_json: csvToJson(expForm.technologiesText),
        outcomes_json: linesToJson(expForm.outcomesText),
        order_index: Number(expForm.order_index) || 0,
      };
      if (editingExpId) {
        await adminUpdateExperience(editingExpId, payload, token);
        notify('success', 'Experience updated.');
      } else {
        await adminCreateExperience(payload, token);
        notify('success', 'New experience added.');
      }
      resetExpForm();
      onRefreshData();
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to save experience.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteExperience = async (id: number) => {
    if (!window.confirm('Delete this experience entry?')) return;
    setBusy(true);
    try {
      await adminDeleteExperience(id, token);
      onRefreshData();
      notify('success', 'Experience deleted.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to delete experience.');
    } finally {
      setBusy(false);
    }
  };

  // --- PROJECT STATE ---
  const [editingProjId, setEditingProjId] = useState<number | null>(null);
  const [projForm, setProjForm] = useState({
    title: '',
    slug: '',
    category: 'Enterprise ERP',
    client_org: '',
    role: '',
    summary: '',
    challenge: '',
    solution: '',
    responsibilitiesText: '',
    techStackText: '',
    is_featured: true,
    published: true,
    order_index: 0,
  });

  const resetProjForm = () => {
    setEditingProjId(null);
    setProjForm({
      title: '',
      slug: '',
      category: 'Enterprise ERP',
      client_org: '',
      role: '',
      summary: '',
      challenge: '',
      solution: '',
      responsibilitiesText: '',
      techStackText: '',
      is_featured: true,
      published: true,
      order_index: (data?.projects?.length || 0) + 1,
    });
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        title: projForm.title,
        slug: (projForm.slug || slugify(projForm.title)).trim(),
        category: projForm.category,
        client_org: projForm.client_org,
        role: projForm.role,
        summary: projForm.summary,
        challenge: projForm.challenge || projForm.summary,
        solution: projForm.solution || projForm.summary,
        responsibilities_json: linesToJson(projForm.responsibilitiesText),
        tech_stack_json: csvToJson(projForm.techStackText),
        impact_metrics_json: '[]',
        is_featured: projForm.is_featured,
        published: projForm.published,
        order_index: Number(projForm.order_index) || 0,
      };
      if (editingProjId) {
        await adminUpdateProject(editingProjId, payload, token);
        notify('success', 'Project updated.');
      } else {
        await adminCreateProject(payload, token);
        notify('success', 'New project added.');
      }
      resetProjForm();
      onRefreshData();
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to save project.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteProject = async (id: number) => {
    if (!window.confirm('Delete this project permanently?')) return;
    setBusy(true);
    try {
      await adminDeleteProject(id, token);
      onRefreshData();
      notify('success', 'Project deleted.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to delete project.');
    } finally {
      setBusy(false);
    }
  };

  // --- SKILLS STATE ---
  const [editingSkillId, setEditingSkillId] = useState<number | null>(null);
  const [skillForm, setSkillForm] = useState({
    category: 'Product Strategy',
    name: '',
    proficiency_level: 'Expert',
    is_key_skill: true,
    order_index: 0,
  });

  const resetSkillForm = () => {
    setEditingSkillId(null);
    setSkillForm({
      category: 'Product Strategy',
      name: '',
      proficiency_level: 'Expert',
      is_key_skill: true,
      order_index: (data?.skills?.length || 0) + 1,
    });
  };

  const handleSaveSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      if (editingSkillId) {
        await adminUpdateSkill(editingSkillId, skillForm, token);
        notify('success', 'Skill updated.');
      } else {
        await adminCreateSkill(skillForm, token);
        notify('success', 'New skill/tool added.');
      }
      resetSkillForm();
      onRefreshData();
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to save skill.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteSkill = async (id: number) => {
    if (!window.confirm('Delete this skill?')) return;
    setBusy(true);
    try {
      await adminDeleteSkill(id, token);
      onRefreshData();
      notify('success', 'Skill deleted.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to delete skill.');
    } finally {
      setBusy(false);
    }
  };

  // --- EDUCATION & CERTIFICATIONS STATE ---
  const [editingCertId, setEditingCertId] = useState<number | null>(null);
  const [certForm, setCertForm] = useState({
    title: '',
    issuer: '',
    issue_date: '',
    expiry_date: '',
    credential_id: '',
    credential_url: '',
    category: 'Certification',
    order_index: 0,
  });

  const resetCertForm = () => {
    setEditingCertId(null);
    setCertForm({
      title: '',
      issuer: '',
      issue_date: '',
      expiry_date: '',
      credential_id: '',
      credential_url: '',
      category: 'Certification',
      order_index: (data?.certifications?.length || 0) + 1,
    });
  };

  const handleSaveCert = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...certForm,
        expiry_date: certForm.expiry_date || null,
        credential_id: certForm.credential_id || null,
        credential_url: certForm.credential_url || null,
        order_index: Number(certForm.order_index) || 0,
      };
      if (editingCertId) {
        await adminUpdateCertification(editingCertId, payload, token);
        notify('success', 'Education / Certification updated.');
      } else {
        await adminCreateCertification(payload, token);
        notify('success', 'New Education / Certification added.');
      }
      resetCertForm();
      onRefreshData();
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to save credential.');
    } finally {
      setBusy(false);
    }
  };

  const handleDeleteCert = async (id: number) => {
    if (!window.confirm('Delete this education/certification entry?')) return;
    setBusy(true);
    try {
      await adminDeleteCertification(id, token);
      onRefreshData();
      notify('success', 'Credential deleted.');
    } catch (err) {
      notify('error', err instanceof Error ? err.message : 'Failed to delete credential.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Banner to launch Live Website Preview Editor */}
      {!isLivePreviewMode && onLaunchLivePreview && (
        <div className="p-4 rounded-2xl border border-[#4d6a10]/25 bg-[#e7efcf]/55 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="p-2 rounded-xl bg-[#4d6a10] text-white shrink-0">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h4 className="font-display font-bold text-sm text-[#121410]">
                Live Website Preview Editor (Full CRUD)
              </h4>
              <p className="text-[11px] text-[#121410]/70">
                Edit lines, add cards, projects, skills, or certifications right on top of the live portfolio preview and watch changes apply immediately.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onLaunchLivePreview(section)}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4d6a10] text-white font-mono text-xs font-bold hover:bg-[#3f590d] transition-colors shadow-xs cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Live Preview Editor</span>
          </button>
        </div>
      )}

      {/* In Live On-Page Edit Mode: show only the Section Heading; in Dashboard: show section tabs */}
      {isLivePreviewMode ? (
        <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#4d6a10]/15">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-[#e7efcf] text-[#4d6a10]">
              {SECTION_TABS.find((t) => t.key === section)?.icon}
            </span>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold block">
                Editing Section
              </span>
              <h4 className="font-display font-extrabold text-base text-[#121410] leading-tight">
                {sectionHeading || SECTION_TABS.find((t) => t.key === section)?.heading}
              </h4>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5 pb-2 border-b border-[#4d6a10]/15">
          {SECTION_TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setSection(t.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-mono text-[11px] font-semibold border transition-colors cursor-pointer ${
                section === t.key
                  ? 'bg-[#4d6a10] text-white border-[#4d6a10] shadow-2xs'
                  : 'bg-[#fafcf7] text-[#121410]/80 border-[#4d6a10]/20 hover:border-[#4d6a10]/50 hover:text-[#4d6a10]'
              }`}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      )}

      {/* Status Toast */}
      {notice && (
        <div
          className={`px-3.5 py-2.5 rounded-xl border font-mono text-[11px] flex items-center justify-between gap-2 ${
            notice.type === 'success'
              ? 'border-[#4d6a10]/35 bg-[#e7efcf] text-[#4d6a10] font-semibold'
              : 'border-red-500/30 bg-red-50 text-red-700 font-semibold'
          }`}
        >
          <span>{notice.text}</span>
          <button type="button" onClick={() => setNotice(null)} className="opacity-70 hover:opacity-100">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 1. PROFILE & BIO */}
      {section === 'profile' && (
        <form onSubmit={handleSaveProfile} className="space-y-3">
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>Full Name</label>
              <input className={inputCls} value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} required />
            </div>
            <div>
              <label className={labelCls}>Role / Title</label>
              <input className={inputCls} value={profileForm.title} onChange={(e) => setProfileForm({ ...profileForm, title: e.target.value })} required />
            </div>
          </div>

          <div>
            <label className={labelCls}>Executive Headline</label>
            <input className={inputCls} value={profileForm.headline} onChange={(e) => setProfileForm({ ...profileForm, headline: e.target.value })} required />
          </div>

          <div>
            <label className={labelCls}>Biography / Executive Summary</label>
            <textarea rows={3} className={inputCls} value={profileForm.summary} onChange={(e) => setProfileForm({ ...profileForm, summary: e.target.value })} required />
          </div>

          <div>
            <label className={labelCls}>Product Philosophy</label>
            <textarea rows={2} className={inputCls} value={profileForm.philosophy} onChange={(e) => setProfileForm({ ...profileForm, philosophy: e.target.value })} required />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>Location</label>
              <input className={inputCls} value={profileForm.location} onChange={(e) => setProfileForm({ ...profileForm, location: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input type="email" className={inputCls} value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Years of Experience</label>
              <input type="number" className={inputCls} value={profileForm.years_of_experience} onChange={(e) => setProfileForm({ ...profileForm, years_of_experience: Number(e.target.value) })} />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <label className={labelCls}>LinkedIn URL</label>
              <input className={inputCls} value={profileForm.linkedin_url} onChange={(e) => setProfileForm({ ...profileForm, linkedin_url: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Languages</label>
              <input className={inputCls} value={profileForm.languages} onChange={(e) => setProfileForm({ ...profileForm, languages: e.target.value })} />
            </div>
          </div>

          <button
            type="submit"
            disabled={busy}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-[#4d6a10] text-white font-mono text-xs font-bold hover:bg-[#3f590d] disabled:opacity-50 transition-colors cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>{busy ? 'Saving...' : 'Save Profile Changes'}</span>
          </button>
        </form>
      )}

      {/* 2. METRIC CARDS CRUD */}
      {section === 'metrics' && (
        <div className="space-y-4">
          <form onSubmit={handleSaveMetric} className="p-4 rounded-2xl border border-[#4d6a10]/20 bg-[#fafcf7] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#121410]">
                {editingMetricId ? 'Edit Metric Card' : '+ Add New Metric Card'}
              </span>
              {editingMetricId && (
                <button type="button" onClick={resetMetricForm} className="text-[11px] font-mono text-[#4d6a10] hover:underline">
                  Cancel Edit
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-3 gap-2.5">
              <div>
                <label className={labelCls}>Value (e.g. 1,200+)</label>
                <input className={inputCls} value={metricForm.value_number} onChange={(e) => setMetricForm({ ...metricForm, value_number: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>Card Title / Label</label>
                <input className={inputCls} value={metricForm.label} onChange={(e) => setMetricForm({ ...metricForm, label: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>Project / Org Tag</label>
                <input className={inputCls} value={metricForm.context_project} onChange={(e) => setMetricForm({ ...metricForm, context_project: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className={labelCls}>Description</label>
              <input className={inputCls} value={metricForm.description} onChange={(e) => setMetricForm({ ...metricForm, description: e.target.value })} required />
            </div>
            <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4d6a10] text-white font-mono text-xs font-bold hover:bg-[#3f590d] cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>{editingMetricId ? 'Update Metric Card' : 'Add Metric Card'}</span>
            </button>
          </form>

          <div className="space-y-2">
            {(data?.metrics || []).map((m: Metric) => (
              <div key={m.id} className="p-3.5 rounded-xl border border-[#4d6a10]/20 bg-white flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-display font-extrabold text-sm text-[#4d6a10]">{m.value_number}</span>
                    <span className="font-bold text-[#121410] truncate">{m.label}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#e7efcf] text-[#4d6a10]">{m.context_project}</span>
                  </div>
                  <p className="text-[11px] text-[#121410]/65 truncate mt-0.5">{m.description}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingMetricId(m.id);
                      setMetricForm({
                        label: m.label,
                        value_number: m.value_number,
                        context_project: m.context_project,
                        description: m.description,
                        order_index: m.order_index,
                      });
                    }}
                    className="p-1.5 rounded-lg border border-[#4d6a10]/20 text-[#4d6a10] hover:bg-[#e7efcf] cursor-pointer"
                    title="Edit metric"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteMetric(m.id)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                    title="Delete metric"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. EXPERIENCE CRUD */}
      {section === 'experiences' && (
        <div className="space-y-4">
          <form onSubmit={handleSaveExperience} className="p-4 rounded-2xl border border-[#4d6a10]/20 bg-[#fafcf7] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#121410]">
                {editingExpId ? 'Edit Experience' : '+ Add New Experience Role'}
              </span>
              {editingExpId && (
                <button type="button" onClick={resetExpForm} className="text-[11px] font-mono text-[#4d6a10] hover:underline">
                  Cancel Edit
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div>
                <label className={labelCls}>Company / Organization</label>
                <input className={inputCls} value={expForm.company} onChange={(e) => setExpForm({ ...expForm, company: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>Role Title</label>
                <input className={inputCls} value={expForm.role} onChange={(e) => setExpForm({ ...expForm, role: e.target.value })} required />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-2.5">
              <div>
                <label className={labelCls}>Location</label>
                <input className={inputCls} value={expForm.location} onChange={(e) => setExpForm({ ...expForm, location: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>Start Date</label>
                <input className={inputCls} placeholder="e.g. Jan 2022" value={expForm.start_date} onChange={(e) => setExpForm({ ...expForm, start_date: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>End Date</label>
                <input className={inputCls} placeholder="Present or Dec 2024" disabled={expForm.is_current} value={expForm.end_date} onChange={(e) => setExpForm({ ...expForm, end_date: e.target.value })} />
              </div>
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-[#121410] font-medium cursor-pointer">
              <input type="checkbox" checked={expForm.is_current} onChange={(e) => setExpForm({ ...expForm, is_current: e.target.checked })} className="accent-[#4d6a10]" />
              <span>Current Role</span>
            </label>
            <div>
              <label className={labelCls}>Role Summary / Description</label>
              <textarea rows={2} className={inputCls} value={expForm.description} onChange={(e) => setExpForm({ ...expForm, description: e.target.value })} />
            </div>
            <div>
              <label className={labelCls}>Responsibilities (One bullet line per row)</label>
              <textarea rows={3} className={inputCls} placeholder="Add each responsibility on a new line..." value={expForm.responsibilitiesText} onChange={(e) => setExpForm({ ...expForm, responsibilitiesText: e.target.value })} required />
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div>
                <label className={labelCls}>Key Outcomes (One per line)</label>
                <textarea rows={2} className={inputCls} value={expForm.outcomesText} onChange={(e) => setExpForm({ ...expForm, outcomesText: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Technologies (Comma separated)</label>
                <textarea rows={2} className={inputCls} placeholder="Jira, SQL, GCP, Power BI" value={expForm.technologiesText} onChange={(e) => setExpForm({ ...expForm, technologiesText: e.target.value })} />
              </div>
            </div>
            <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4d6a10] text-white font-mono text-xs font-bold hover:bg-[#3f590d] cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>{editingExpId ? 'Update Experience' : 'Add Experience'}</span>
            </button>
          </form>

          <div className="space-y-2">
            {(data?.experiences || []).map((exp: Experience) => (
              <div key={exp.id} className="p-3.5 rounded-xl border border-[#4d6a10]/20 bg-white flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-[#121410] truncate">{exp.role}</div>
                  <div className="text-[11px] font-mono text-[#4d6a10]">{exp.company} &middot; {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingExpId(exp.id);
                      setExpForm({
                        company: exp.company,
                        role: exp.role,
                        location: exp.location,
                        start_date: exp.start_date,
                        end_date: exp.end_date || '',
                        is_current: exp.is_current,
                        description: exp.description || '',
                        responsibilitiesText: parseJsonList(exp.responsibilities_json).join('\n'),
                        technologiesText: parseJsonList(exp.technologies_json).join(', '),
                        outcomesText: parseJsonList(exp.outcomes_json).join('\n'),
                        order_index: exp.order_index,
                      });
                    }}
                    className="p-1.5 rounded-lg border border-[#4d6a10]/20 text-[#4d6a10] hover:bg-[#e7efcf] cursor-pointer"
                    title="Edit experience"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteExperience(exp.id)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                    title="Delete experience"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. PROJECTS CRUD */}
      {section === 'projects' && (
        <div className="space-y-4">
          <form onSubmit={handleSaveProject} className="p-4 rounded-2xl border border-[#4d6a10]/20 bg-[#fafcf7] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#121410]">
                {editingProjId ? 'Edit Project' : '+ Add New Project Card'}
              </span>
              {editingProjId && (
                <button type="button" onClick={resetProjForm} className="text-[11px] font-mono text-[#4d6a10] hover:underline">
                  Cancel Edit
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div>
                <label className={labelCls}>Project Title</label>
                <input className={inputCls} value={projForm.title} onChange={(e) => setProjForm({ ...projForm, title: e.target.value, slug: editingProjId ? projForm.slug : slugify(e.target.value) })} required />
              </div>
              <div>
                <label className={labelCls}>URL Slug</label>
                <input className={inputCls} value={projForm.slug} onChange={(e) => setProjForm({ ...projForm, slug: e.target.value })} required />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-2.5">
              <div>
                <label className={labelCls}>Category</label>
                <input className={inputCls} value={projForm.category} onChange={(e) => setProjForm({ ...projForm, category: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>Client / Organization</label>
                <input className={inputCls} value={projForm.client_org} onChange={(e) => setProjForm({ ...projForm, client_org: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>Your Role</label>
                <input className={inputCls} value={projForm.role} onChange={(e) => setProjForm({ ...projForm, role: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className={labelCls}>Summary</label>
              <textarea rows={2} className={inputCls} value={projForm.summary} onChange={(e) => setProjForm({ ...projForm, summary: e.target.value })} required />
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div>
                <label className={labelCls}>Challenge</label>
                <textarea rows={2} className={inputCls} value={projForm.challenge} onChange={(e) => setProjForm({ ...projForm, challenge: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>Solution</label>
                <textarea rows={2} className={inputCls} value={projForm.solution} onChange={(e) => setProjForm({ ...projForm, solution: e.target.value })} required />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div>
                <label className={labelCls}>Key Responsibilities (One per line)</label>
                <textarea rows={2} className={inputCls} value={projForm.responsibilitiesText} onChange={(e) => setProjForm({ ...projForm, responsibilitiesText: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Tech Stack (Comma separated)</label>
                <textarea rows={2} className={inputCls} value={projForm.techStackText} onChange={(e) => setProjForm({ ...projForm, techStackText: e.target.value })} />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="inline-flex items-center gap-2 text-xs text-[#121410] font-medium cursor-pointer">
                <input type="checkbox" checked={projForm.published} onChange={(e) => setProjForm({ ...projForm, published: e.target.checked })} className="accent-[#4d6a10]" />
                <span>Published</span>
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-[#121410] font-medium cursor-pointer">
                <input type="checkbox" checked={projForm.is_featured} onChange={(e) => setProjForm({ ...projForm, is_featured: e.target.checked })} className="accent-[#4d6a10]" />
                <span>Featured</span>
              </label>
            </div>
            <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4d6a10] text-white font-mono text-xs font-bold hover:bg-[#3f590d] cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>{editingProjId ? 'Update Project' : 'Add Project'}</span>
            </button>
          </form>

          <div className="space-y-2">
            {(data?.projects || []).map((p: Project) => (
              <div key={p.id} className="p-3.5 rounded-xl border border-[#4d6a10]/20 bg-white flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="font-bold text-[#121410] truncate">{p.title}</div>
                  <div className="text-[11px] font-mono text-[#4d6a10]">{p.client_org} &middot; {p.category}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingProjId(p.id);
                      setProjForm({
                        title: p.title,
                        slug: p.slug,
                        category: p.category,
                        client_org: p.client_org,
                        role: p.role,
                        summary: p.summary,
                        challenge: p.challenge,
                        solution: p.solution,
                        responsibilitiesText: parseJsonList(p.responsibilities_json).join('\n'),
                        techStackText: parseJsonList(p.tech_stack_json).join(', '),
                        is_featured: p.is_featured,
                        published: p.published,
                        order_index: p.order_index,
                      });
                    }}
                    className="p-1.5 rounded-lg border border-[#4d6a10]/20 text-[#4d6a10] hover:bg-[#e7efcf] cursor-pointer"
                    title="Edit project"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProject(p.id)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                    title="Delete project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. SKILLS & TOOLS CRUD */}
      {section === 'skills' && (
        <div className="space-y-4">
          <form onSubmit={handleSaveSkill} className="p-4 rounded-2xl border border-[#4d6a10]/20 bg-[#fafcf7] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#121410]">
                {editingSkillId ? 'Edit Skill / Tool' : '+ Add New Skill / Tool'}
              </span>
              {editingSkillId && (
                <button type="button" onClick={resetSkillForm} className="text-[11px] font-mono text-[#4d6a10] hover:underline">
                  Cancel Edit
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-3 gap-2.5">
              <div>
                <label className={labelCls}>Category</label>
                <input className={inputCls} value={skillForm.category} onChange={(e) => setSkillForm({ ...skillForm, category: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>Skill / Tool Name</label>
                <input className={inputCls} value={skillForm.name} onChange={(e) => setSkillForm({ ...skillForm, name: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>Proficiency</label>
                <select className={inputCls} value={skillForm.proficiency_level} onChange={(e) => setSkillForm({ ...skillForm, proficiency_level: e.target.value })}>
                  <option value="Expert">Expert</option>
                  <option value="Advanced">Advanced</option>
                  <option value="Proficient">Proficient</option>
                </select>
              </div>
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-[#121410] font-medium cursor-pointer">
              <input type="checkbox" checked={skillForm.is_key_skill} onChange={(e) => setSkillForm({ ...skillForm, is_key_skill: e.target.checked })} className="accent-[#4d6a10]" />
              <span>Highlight as Core Competency</span>
            </label>
            <div>
              <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4d6a10] text-white font-mono text-xs font-bold hover:bg-[#3f590d] cursor-pointer">
                <Plus className="w-3.5 h-3.5" />
                <span>{editingSkillId ? 'Update Skill' : 'Add Skill'}</span>
              </button>
            </div>
          </form>

          <div className="grid sm:grid-cols-2 gap-2">
            {(data?.skills || []).map((s: Skill) => (
              <div key={s.id} className="p-3 rounded-xl border border-[#4d6a10]/20 bg-white flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-bold text-[#121410] truncate flex items-center gap-1.5">
                    <span>{s.name}</span>
                    {s.is_key_skill && <span className="w-1.5 h-1.5 rounded-full bg-[#6f9a0c] shrink-0" />}
                  </div>
                  <div className="text-[10px] font-mono text-[#4d6a10] truncate">{s.category} &middot; {s.proficiency_level}</div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSkillId(s.id);
                      setSkillForm({
                        category: s.category,
                        name: s.name,
                        proficiency_level: s.proficiency_level,
                        is_key_skill: s.is_key_skill,
                        order_index: s.order_index,
                      });
                    }}
                    className="p-1.5 rounded-lg border border-[#4d6a10]/20 text-[#4d6a10] hover:bg-[#e7efcf] cursor-pointer"
                    title="Edit skill"
                  >
                    <Pencil className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteSkill(s.id)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                    title="Delete skill"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. EDUCATION & CERTIFICATIONS CRUD */}
      {section === 'certifications' && (
        <div className="space-y-4">
          <form onSubmit={handleSaveCert} className="p-4 rounded-2xl border border-[#4d6a10]/20 bg-[#fafcf7] space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-[#121410]">
                {editingCertId ? 'Edit Education / Certification' : '+ Add Education or Certification'}
              </span>
              {editingCertId && (
                <button type="button" onClick={resetCertForm} className="text-[11px] font-mono text-[#4d6a10] hover:underline">
                  Cancel Edit
                </button>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-2.5">
              <div>
                <label className={labelCls}>Degree / Certification Title</label>
                <input className={inputCls} value={certForm.title} onChange={(e) => setCertForm({ ...certForm, title: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>Institution / Issuer</label>
                <input className={inputCls} value={certForm.issuer} onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })} required />
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-2.5">
              <div>
                <label className={labelCls}>Category</label>
                <select className={inputCls} value={certForm.category} onChange={(e) => setCertForm({ ...certForm, category: e.target.value })}>
                  <option value="Certification">Certification</option>
                  <option value="Executive Education">Executive Education</option>
                  <option value="Degree">Degree</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>Issue Date / Year</label>
                <input className={inputCls} placeholder="e.g. 2024 or 2020 - 2022" value={certForm.issue_date} onChange={(e) => setCertForm({ ...certForm, issue_date: e.target.value })} required />
              </div>
              <div>
                <label className={labelCls}>Credential ID (Optional)</label>
                <input className={inputCls} value={certForm.credential_id} onChange={(e) => setCertForm({ ...certForm, credential_id: e.target.value })} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Verification URL (Optional)</label>
              <input type="url" className={inputCls} placeholder="https://..." value={certForm.credential_url} onChange={(e) => setCertForm({ ...certForm, credential_url: e.target.value })} />
            </div>
            <button type="submit" disabled={busy} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4d6a10] text-white font-mono text-xs font-bold hover:bg-[#3f590d] cursor-pointer">
              <Plus className="w-3.5 h-3.5" />
              <span>{editingCertId ? 'Update Credential' : 'Add Credential'}</span>
            </button>
          </form>

          <div className="space-y-2">
            {(data?.certifications || []).map((c: Certification) => (
              <div key={c.id} className="p-3.5 rounded-xl border border-[#4d6a10]/20 bg-white flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#e7efcf] text-[#4d6a10] font-bold">{c.category}</span>
                    <span className="font-bold text-[#121410] truncate">{c.title}</span>
                  </div>
                  <div className="text-[11px] text-[#121410]/65 mt-0.5">{c.issuer} &middot; {c.issue_date}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingCertId(c.id);
                      setCertForm({
                        title: c.title,
                        issuer: c.issuer,
                        issue_date: c.issue_date,
                        expiry_date: c.expiry_date || '',
                        credential_id: c.credential_id || '',
                        credential_url: c.credential_url || '',
                        category: c.category,
                        order_index: c.order_index,
                      });
                    }}
                    className="p-1.5 rounded-lg border border-[#4d6a10]/20 text-[#4d6a10] hover:bg-[#e7efcf] cursor-pointer"
                    title="Edit credential"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCert(c.id)}
                    className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 cursor-pointer"
                    title="Delete credential"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

