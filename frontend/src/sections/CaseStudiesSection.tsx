import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, ArrowRight, FolderOpen, Plus, Pencil, X } from 'lucide-react';
import { Project } from '../types';
import Folder, { FolderItem } from '../components/folder/Folder';
import AeroShards from '../components/aero-shards/AeroShards';
import { InlineEditableText, useAdminEdit } from '../context/AdminEditContext';
import { adminCreateCaseStudy, adminCreateProject, adminUpdateProfile } from '../services/api';

interface CaseStudiesSectionProps {
  projects: Project[];
  onOpenCaseStudy: (project: Project) => void;
}

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] text-xs focus:outline-none focus:border-[#4d6a10] focus:bg-white transition-colors';

const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || `case-study-${Date.now()}`;

export const CaseStudiesSection: React.FC<CaseStudiesSectionProps> = ({ projects, onOpenCaseStudy }) => {
  const { isEditMode, token, data, onRefreshData } = useAdminEdit();
  const [isFolderOpen, setIsFolderOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add New Case Study Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState({
    title: '',
    category: 'Enterprise ERP',
    client_org: '',
    role: 'Lead Product Manager',
    executive_summary: '',
    business_context: '',
    problem_statement: '',
    product_strategy: '',
    tech_stack_csv: '',
  });

  const [folderSize, setFolderSize] = useState<number>(() => {
    if (typeof window === 'undefined') return 2.0;
    if (window.innerWidth < 640) return 1.15;
    if (window.innerWidth < 1024) return 1.65;
    return 2.0;
  });

  const parsedSections = useMemo<Record<string, any>>(() => {
    const raw = data?.profile?.sections_content_json;
    if (!raw) return {};
    try {
      return JSON.parse(raw) || {};
    } catch {
      return {};
    }
  }, [data?.profile?.sections_content_json]);

  const sectionBadge: string = parsedSections?.caseStudiesBadge || 'Deep-Dive Problem Solving & Execution';
  const sectionTitlePrefix: string = parsedSections?.caseStudiesTitlePrefix || 'Product Management';
  const sectionTitleAccent: string = parsedSections?.caseStudiesTitleAccent || 'Case Studies.';
  const sectionSubtitle: string =
    parsedSections?.caseStudiesSubtitle ||
    'Detailed case breakdowns highlighting discovery interviews, stakeholder alignment, user journeys, feature prioritization (MoSCoW), architectural decisions, and retrospective learnings.';

  const persistSectionsPatch = async (patch: Record<string, unknown>) => {
    if (!token) return;
    setSaving(true);
    try {
      const merged = { ...parsedSections, ...patch };
      await adminUpdateProfile({ sections_content_json: JSON.stringify(merged) }, token);
      onRefreshData();
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const updateSize = () => {
      if (window.innerWidth < 640) setFolderSize(1.15);
      else if (window.innerWidth < 1024) setFolderSize(1.65);
      else setFolderSize(2.0);
    };
    window.addEventListener('resize', updateSize, { passive: true });
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  const handleCreateCaseStudy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newForm.title.trim() || !newForm.client_org.trim()) return;
    setSaving(true);
    try {
      const baseSlug = `${slugify(newForm.title)}-${Date.now().toString().slice(-4)}`;
      const techArr = newForm.tech_stack_csv
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter(Boolean);
      const summary = newForm.executive_summary.trim() || newForm.title.trim();
      const challenge = newForm.problem_statement.trim() || newForm.business_context.trim() || summary;
      const solution = newForm.product_strategy.trim() || summary;

      const createdProj = await adminCreateProject(
        {
          slug: baseSlug,
          title: newForm.title.trim(),
          category: newForm.category.trim() || 'Enterprise Product',
          client_org: newForm.client_org.trim(),
          summary,
          challenge,
          solution,
          role: newForm.role.trim() || 'Product Manager',
          responsibilities_json: JSON.stringify([solution]),
          tech_stack_json: JSON.stringify(techArr.length > 0 ? techArr : ['Product Strategy', 'Cloud ERP']),
          impact_metrics_json: JSON.stringify([]),
          is_featured: true,
          published: true,
          order_index: projects.length + 1,
        },
        token
      );

      await adminCreateCaseStudy(
        {
          project_id: createdProj.id,
          slug: `${baseSlug}-case-study`,
          title: newForm.title.trim(),
          executive_summary: summary,
          business_context: newForm.business_context.trim() || challenge,
          problem_statement: challenge,
          personas_json: JSON.stringify([]),
          requirements_json: JSON.stringify([]),
          product_strategy: solution,
          discovery_json: JSON.stringify([]),
          stakeholder_map_json: JSON.stringify([]),
          feature_prioritization_json: JSON.stringify({
            framework: 'MoSCoW Prioritization',
            must_have: [],
            should_have: [],
            could_have: [],
            wont_have: [],
          }),
          roadmap_json: JSON.stringify([]),
          system_architecture:
            'Architected distributed enterprise service layer integrating databases, API gateways, and user identity.',
          execution_delivery: 'Iterative sprint execution with continuous user acceptance feedback.',
          testing_deployment: 'Extensive automated regression, security reviews, and zero-downtime cutovers.',
          results_impact_json: JSON.stringify([]),
          learnings_json: JSON.stringify([]),
          published: true,
        },
        token
      );

      onRefreshData();
      setNewForm({
        title: '',
        category: 'Enterprise ERP',
        client_org: '',
        role: 'Lead Product Manager',
        executive_summary: '',
        business_context: '',
        problem_statement: '',
        product_strategy: '',
        tech_stack_csv: '',
      });
      setShowAddModal(false);
    } finally {
      setSaving(false);
    }
  };

  const folderItems = useMemo<FolderItem[]>(() => {
    const base: FolderItem[] = projects.map((proj, idx) => {
      const numStr = String(idx + 1).padStart(2, '0');
      const shortCategory = proj.category.split('/')[0].trim();
      const title = proj.case_study?.title || proj.title;
      const summary = proj.case_study?.executive_summary || proj.summary;

      return {
        title,
        description: `${proj.client_org} · ${proj.role}`,
        content: (
          <div className="w-full h-full p-2.5 sm:p-3 flex flex-col justify-between text-left bg-white text-[#121410] border border-[#4d6a10]/20 rounded-[inherit] overflow-hidden select-none">
            <div className="space-y-1.5 min-h-0">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[7px] sm:text-[8px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-[#e7efcf] text-[#4d6a10] border border-[#4d6a10]/25 font-bold shrink-0">
                  CASE STUDY {numStr}
                </span>
                <span className="text-[7px] sm:text-[8px] font-mono text-[#121410]/60 truncate">
                  {shortCategory}
                </span>
              </div>

              <h3 className="font-display font-extrabold text-[9.5px] sm:text-[11px] text-[#121410] leading-tight line-clamp-3">
                {title}
              </h3>

              <p className="text-[7.5px] sm:text-[8.5px] text-[#121410]/70 leading-snug line-clamp-4">
                {summary}
              </p>
            </div>

            <div className="pt-1.5 mt-1 border-t border-[#eef0ea] space-y-0.5 shrink-0">
              <div className="text-[7px] sm:text-[8px] font-mono text-[#121410]/70 truncate">
                <strong className="text-[#121410]">Client:</strong> {proj.client_org}
              </div>
              <div className="text-[7px] sm:text-[8px] font-mono text-[#121410]/70 truncate">
                <strong className="text-[#121410]">Role:</strong> {proj.role}
              </div>
              <div className="pt-0.5 flex items-center justify-between text-[7.5px] sm:text-[8.5px] font-bold text-[#4d6a10]">
                <span>Explore Complete Case Study</span>
                <ArrowRight className="w-2.5 h-2.5 shrink-0" />
              </div>
            </div>
          </div>
        ),
      };
    });

    if (isEditMode) {
      base.push({
        title: 'Add Case Study',
        description: 'Click to add a new case study card',
        content: (
          <div className="w-full h-full p-3 flex flex-col items-center justify-center text-center bg-[#fafcf7] text-[#4d6a10] border-2 border-dashed border-[#4d6a10]/55 rounded-[inherit] select-none gap-1.5">
            <span className="w-7 h-7 rounded-full bg-[#4d6a10] text-white flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </span>
            <span className="font-display font-extrabold text-[10px] sm:text-[11px] text-[#121410]">
              Add Card
            </span>
            <span className="font-mono text-[7px] sm:text-[8px] text-[#4d6a10]/85 uppercase">
              Click to add case study
            </span>
          </div>
        ),
      });
    }

    return base;
  }, [projects, isEditMode]);

  return (
    <section
      id="case-studies"
      className={`petalyx-scope relative py-20 md:py-24 bg-[#fafcf7] overflow-x-clip border-b border-[#eef0ea] ${
        isFolderOpen ? 'z-20' : 'z-10'
      }`}
      style={{ color: 'var(--ink)' }}
    >
      {/* Subtle Petalyx Grid Pattern Field */}
      <div className="absolute inset-0 petalyx-sq-field pointer-events-none opacity-50 z-0" />

      {/* Interactive AeroShards Background (WebGPU with automatic Canvas 2D fallback) */}
      <div className="absolute inset-0 pointer-events-none z-[1] opacity-90" aria-hidden="true">
        <AeroShards
          shardColor="#4d6a10"
          accentColor="#84a92c"
          lightMode={true}
          placement="full"
          material="glass"
          markers="plus"
          count={1300}
          depthOfField={0.75}
          vignette={0.3}
          mouseInteraction
          pulseOnClick
          holdToGather
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top-Right Corner Edit Button (Visible in On-Page Edit Mode) */}
        {isEditMode && (
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#4d6a10] text-white hover:bg-[#3f590d] font-mono text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        )}

        {/* Centered Header */}
        <div className="flex flex-col items-center text-center mb-2">
          <div className="inline-flex items-center gap-2 petalyx-pill mb-3">
            <BookOpen className="w-3.5 h-3.5 text-[#4d6a10]" />
            <InlineEditableText
              as="span"
              value={sectionBadge}
              onSave={(val) => persistSectionsPatch({ caseStudiesBadge: val })}
            />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-[#121410] tracking-tight leading-[1.15]">
            <InlineEditableText
              as="span"
              value={sectionTitlePrefix}
              onSave={(val) => persistSectionsPatch({ caseStudiesTitlePrefix: val })}
            />{' '}
            <span className="text-[#4d6a10] italic">
              <InlineEditableText
                as="span"
                value={sectionTitleAccent}
                onSave={(val) => persistSectionsPatch({ caseStudiesTitleAccent: val })}
              />
            </span>
          </h2>
          <div className="text-xs sm:text-sm text-[#121410]/70 mt-2 max-w-2xl leading-relaxed">
            <InlineEditableText
              as="p"
              multiline
              value={sectionSubtitle}
              onSave={(val) => persistSectionsPatch({ caseStudiesSubtitle: val })}
            />
          </div>
        </div>

        {/* Single Interactive Folder Stage */}
        {folderItems.length > 0 && (
          <div className="flex flex-col items-center">
            <div
              className={`relative w-full flex items-end justify-center pt-20 sm:pt-28 md:pt-32 pb-8 ${
                isFolderOpen ? 'z-30' : 'z-10'
              }`}
            >
              <Folder
                key={`${projects.map((p) => `${p.id}:${p.case_study?.title || p.title}`).join('|')}-${isEditMode ? 'edit' : 'view'}`}
                items={folderItems}
                label={`${projects.length} Case ${projects.length === 1 ? 'Study' : 'Studies'}`}
                variant="glass"
                theme="light"
                color="#4d6a10"
                paperColor="#ffffff"
                layout="spread"
                tabPosition="left"
                size={folderSize}
                openOn="click"
                defaultOpen={false}
                zoomOnClick={false}
                closeOnOutsideClick={true}
                onOpenChange={setIsFolderOpen}
                onItemClick={(_, idx) => {
                  if (isEditMode && idx === projects.length) {
                    setShowAddModal(true);
                  } else {
                    const selected = projects[idx];
                    if (selected) onOpenCaseStudy(selected);
                  }
                }}
              />
            </div>

            {/* Interactive Helper & Quick-Access Case Study Pills */}
            <div className="mt-2 flex flex-col items-center gap-4 text-center">
              <div className="inline-flex items-center gap-2 text-xs font-mono text-[#121410]/65">
                <FolderOpen className="w-3.5 h-3.5 text-[#4d6a10]" />
                <span>
                  {isFolderOpen
                    ? 'Click any fanned case study card to open its complete breakdown'
                    : `Click the folder to fan out all ${projects.length} case studies`}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-2.5">
                {projects.map((proj, idx) => (
                  <button
                    key={proj.id}
                    type="button"
                    onClick={() => onOpenCaseStudy(proj)}
                    className="px-3.5 py-2 rounded-full border border-[#4d6a10]/25 bg-white hover:bg-[#4d6a10] hover:text-white hover:border-[#4d6a10] text-[#121410] text-xs font-semibold transition-all shadow-2xs flex items-center gap-2 cursor-pointer group"
                  >
                    <span className="font-mono text-[10px] font-bold text-[#4d6a10] group-hover:text-[#e7efcf]">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <span>{proj.category.split('/')[0].trim()}</span>
                    <ArrowRight className="w-3 h-3 text-[#4d6a10] group-hover:text-white" />
                  </button>
                ))}
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-dashed border-[#4d6a10]/60 bg-[#e7efcf]/70 text-[#4d6a10] hover:bg-[#e7efcf] font-mono text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Card</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add New Case Study Card Modal */}
      {isEditMode && showAddModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#121410]/55 backdrop-blur-sm overflow-hidden"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowAddModal(false)}
        >
          <div
            data-lenis-prevent
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[24px] border border-[#4d6a10]/30 bg-white shadow-2xl p-6 sm:p-7 space-y-4 text-[#121410] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#4d6a10]/15">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold block">
                  Product Management Case Studies
                </span>
                <h3 className="font-display font-extrabold text-lg text-[#121410]">
                  Add New Case Study Card
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-full border border-[#4d6a10]/20 bg-[#fafcf7] text-[#121410]/70 hover:bg-[#4d6a10] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCaseStudy} className="space-y-3.5">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                  Case Study Title *
                </label>
                <input
                  type="text"
                  required
                  value={newForm.title}
                  onChange={(e) => setNewForm({ ...newForm, title: e.target.value })}
                  placeholder="e.g. Case Study: Launching AI-Assisted Campus Operations"
                  className={inputCls}
                  autoFocus
                />
              </div>

              <div className="grid sm:grid-cols-3 gap-2.5">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={newForm.category}
                    onChange={(e) => setNewForm({ ...newForm, category: e.target.value })}
                    placeholder="Enterprise ERP"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                    Client / Organization *
                  </label>
                  <input
                    type="text"
                    required
                    value={newForm.client_org}
                    onChange={(e) => setNewForm({ ...newForm, client_org: e.target.value })}
                    placeholder="e.g. Ministry of Education"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                    Your Role
                  </label>
                  <input
                    type="text"
                    value={newForm.role}
                    onChange={(e) => setNewForm({ ...newForm, role: e.target.value })}
                    placeholder="Product Owner"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                  Executive Summary *
                </label>
                <textarea
                  rows={2}
                  required
                  value={newForm.executive_summary}
                  onChange={(e) => setNewForm({ ...newForm, executive_summary: e.target.value })}
                  placeholder="High-level summary shown on the card and Case Study header..."
                  className={inputCls}
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                    Business Context
                  </label>
                  <textarea
                    rows={2}
                    value={newForm.business_context}
                    onChange={(e) => setNewForm({ ...newForm, business_context: e.target.value })}
                    placeholder="Organizational context..."
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                    Problem Statement
                  </label>
                  <textarea
                    rows={2}
                    value={newForm.problem_statement}
                    onChange={(e) => setNewForm({ ...newForm, problem_statement: e.target.value })}
                    placeholder="Core problem solved..."
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                  Product Strategy &amp; Solution
                </label>
                <textarea
                  rows={2}
                  value={newForm.product_strategy}
                  onChange={(e) => setNewForm({ ...newForm, product_strategy: e.target.value })}
                  placeholder="How you approached discovery, architecture, and rollout..."
                  className={inputCls}
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                  Technology Stack (comma separated)
                </label>
                <input
                  type="text"
                  value={newForm.tech_stack_csv}
                  onChange={(e) => setNewForm({ ...newForm, tech_stack_csv: e.target.value })}
                  placeholder="e.g. GCP, FastAPI, React, PostgreSQL"
                  className={inputCls}
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#4d6a10]/15">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-full border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] font-mono text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !newForm.title.trim() || !newForm.client_org.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4d6a10] text-white font-mono text-xs font-bold hover:bg-[#3f590d] disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{saving ? 'Creating...' : 'Add Case Study Card'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
