import React, { useState, useEffect } from 'react';
import {
  X, CheckCircle2, Layers, Users, Compass, Cpu, TrendingUp, BookOpen, AlertCircle,
  Plus, Pencil, Trash2, Check
} from 'lucide-react';
import { Project, CaseStudy } from '../types';
import { InlineEditableText, useAdminEdit } from '../context/AdminEditContext';
import { adminCreateCaseStudy, adminDeleteProject, adminUpdateCaseStudy, adminUpdateProject } from '../services/api';

interface CaseStudyModalProps {
  project: Project | null;
  isOpen: boolean;
  onClose: () => void;
}

const inputCls =
  'w-full px-3 py-1.5 rounded-xl border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] text-xs focus:outline-none focus:border-[#4d6a10] focus:bg-white transition-colors';

export const CaseStudyModal: React.FC<CaseStudyModalProps> = ({ project, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'strategy' | 'architecture' | 'impact'>('overview');
  const { isEditMode, token, onRefreshData } = useAdminEdit();
  const [saving, setSaving] = useState(false);

  // Inline item edit/add states
  const [editingPersonaIdx, setEditingPersonaIdx] = useState<number | null>(null);
  const [personaDraft, setPersonaDraft] = useState({ role: '', need: '' });
  const [addingPersona, setAddingPersona] = useState(false);

  const [addingReq, setAddingReq] = useState(false);
  const [reqDraft, setReqDraft] = useState('');

  const [editingStakeholderIdx, setEditingStakeholderIdx] = useState<number | null>(null);
  const [stakeholderDraft, setStakeholderDraft] = useState({ group: '', priority: 'High', focus: '' });
  const [addingStakeholder, setAddingStakeholder] = useState(false);

  const [editingWaveIdx, setEditingWaveIdx] = useState<number | null>(null);
  const [waveDraft, setWaveDraft] = useState({ phase: '', timeline: '', deliverables: '' });
  const [addingWave, setAddingWave] = useState(false);

  const [editingImpactIdx, setEditingImpactIdx] = useState<number | null>(null);
  const [impactDraft, setImpactDraft] = useState({ metric: '', impact: '' });
  const [addingImpact, setAddingImpact] = useState(false);

  const [addingLearning, setAddingLearning] = useState(false);
  const [learningDraft, setLearningDraft] = useState('');

  // Feature Prioritization inline add state
  const [addingPrioritizationKey, setAddingPrioritizationKey] = useState<string | null>(null);
  const [prioritizationItemDraft, setPrioritizationItemDraft] = useState('');

  // Tech Stack inline add state
  const [addingTech, setAddingTech] = useState(false);
  const [techDraft, setTechDraft] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !project) return null;

  const cs: Partial<CaseStudy> = project.case_study || {};

  const parseJson = (val?: string) => {
    if (!val) return null;
    try {
      return JSON.parse(val);
    } catch {
      return null;
    }
  };

  const personas: { role: string; need: string }[] = parseJson(cs.personas_json) || [];
  const requirements: string[] = parseJson(cs.requirements_json) || [];
  const stakeholderMap: { group: string; priority: string; focus: string }[] = parseJson(cs.stakeholder_map_json) || [];
  const featurePrioritization = parseJson(cs.feature_prioritization_json) || {};
  const roadmap: { phase: string; timeline: string; deliverables: string }[] = parseJson(cs.roadmap_json) || [];
  const resultsImpact: { metric: string; impact: string }[] = parseJson(cs.results_impact_json) || [];
  const learnings: string[] = parseJson(cs.learnings_json) || [];

  const persistCaseStudy = async (patch: Partial<CaseStudy>) => {
    if (!token || !project) return;
    setSaving(true);
    try {
      const payload = {
        project_id: project.id,
        slug: cs.slug || `${project.slug}-case-study`,
        title: cs.title || project.title,
        executive_summary: cs.executive_summary || project.summary,
        business_context: cs.business_context || project.challenge,
        problem_statement: cs.problem_statement || project.challenge,
        personas_json: cs.personas_json || '[]',
        requirements_json: cs.requirements_json || '[]',
        product_strategy: cs.product_strategy || project.solution,
        discovery_json: cs.discovery_json || '[]',
        stakeholder_map_json: cs.stakeholder_map_json || '[]',
        feature_prioritization_json: cs.feature_prioritization_json || '{}',
        roadmap_json: cs.roadmap_json || '[]',
        system_architecture:
          cs.system_architecture ||
          'Architected distributed enterprise service layer integrating databases, API gateways, and user identity.',
        execution_delivery:
          cs.execution_delivery || 'Iterative sprint execution with continuous user acceptance feedback.',
        testing_deployment:
          cs.testing_deployment || 'Extensive automated regression, penetration drills, and zero-downtime cutovers.',
        results_impact_json: cs.results_impact_json || '[]',
        learnings_json: cs.learnings_json || '[]',
        published: cs.published ?? true,
        ...patch,
      };
      if (cs.id) {
        await adminUpdateCaseStudy(cs.id, payload, token);
      } else {
        await adminCreateCaseStudy(payload, token);
      }
      onRefreshData();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="petalyx-scope fixed inset-0 z-50 overflow-hidden bg-[#121410]/45 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
      style={{ color: 'var(--ink)' }}
    >
      <div
        data-lenis-prevent
        className="bg-white w-full max-w-5xl rounded-[24px] border border-[#eef0ea] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Olive Accent Bar */}
        <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-[#4d6a10] via-[#6f9a0c] to-[#b4cd52]" />

        {/* Modal Header */}
        <div className="px-6 py-4 shrink-0 max-h-[30vh] overflow-y-auto border-b border-[#eef0ea] flex items-start justify-between gap-4 bg-[#fafcf7]">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#e7efcf] text-[#4d6a10] border border-[#4d6a10]/20 font-bold">
                {project.category}
              </span>
              <span className="text-[#121410]/30 text-xs">&bull;</span>
              <span className="text-xs font-mono text-[#121410]/65">
                Client / Org: <strong className="text-[#121410]">{project.client_org}</strong>
              </span>
              {isEditMode && (
                <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#4d6a10] text-white font-bold">
                  Inline Edit Active
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-display font-extrabold text-[#121410] tracking-tight leading-snug">
              <InlineEditableText
                as="span"
                value={cs.title || project.title}
                onSave={(val) => persistCaseStudy({ title: val })}
              />
            </h2>
            <p className="text-xs font-mono text-[#121410]/65 mt-1">
              Role: <strong className="text-[#4d6a10]">{project.role}</strong>
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {isEditMode && (
              <button
                type="button"
                disabled={saving}
                onClick={async () => {
                  if (!token) return;
                  const ok = window.confirm(`Delete case study "${cs.title || project.title}"?`);
                  if (!ok) return;
                  setSaving(true);
                  try {
                    await adminDeleteProject(project.id, token);
                    onClose();
                    onRefreshData();
                  } finally {
                    setSaving(false);
                  }
                }}
                title="Delete this case study card"
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-mono text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Card</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl border border-[#eef0ea] bg-white text-[#121410]/65 hover:text-[#121410] hover:border-[#4d6a10]/40 hover:bg-[#e7efcf]/40 transition-colors focus:outline-none cursor-pointer"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body: Left Sidebar + Right Scrollable Content */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0 overflow-hidden">
          {/* Sidebar Navigation */}
          <aside className="md:w-60 lg:w-64 shrink-0 border-b md:border-b-0 md:border-r border-[#eef0ea] bg-[#fafcf7] p-4 flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto no-scrollbar text-xs">
            <span className="hidden md:block text-[10px] font-mono uppercase tracking-wider text-[#121410]/50 font-bold px-2 pb-1">
              Case Study Sections
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`py-2.5 px-3.5 rounded-xl border whitespace-nowrap md:whitespace-normal text-left transition-all flex items-center gap-2.5 cursor-pointer shrink-0 md:w-full ${
                activeTab === 'overview'
                  ? 'bg-[#4d6a10] border-[#4d6a10] text-white font-bold shadow-sm'
                  : 'bg-white border-[#d6ddd0] text-[#121410]/80 font-semibold hover:border-[#4d6a10] hover:text-[#4d6a10] hover:bg-[#e7efcf]/40 shadow-2xs'
              }`}
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span>1. Problem &amp; Discovery</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('strategy')}
              className={`py-2.5 px-3.5 rounded-xl border whitespace-nowrap md:whitespace-normal text-left transition-all flex items-center gap-2.5 cursor-pointer shrink-0 md:w-full ${
                activeTab === 'strategy'
                  ? 'bg-[#4d6a10] border-[#4d6a10] text-white font-bold shadow-sm'
                  : 'bg-white border-[#d6ddd0] text-[#121410]/80 font-semibold hover:border-[#4d6a10] hover:text-[#4d6a10] hover:bg-[#e7efcf]/40 shadow-2xs'
              }`}
            >
              <Layers className="w-4 h-4 shrink-0" />
              <span>2. Strategy &amp; Roadmap</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('architecture')}
              className={`py-2.5 px-3.5 rounded-xl border whitespace-nowrap md:whitespace-normal text-left transition-all flex items-center gap-2.5 cursor-pointer shrink-0 md:w-full ${
                activeTab === 'architecture'
                  ? 'bg-[#4d6a10] border-[#4d6a10] text-white font-bold shadow-sm'
                  : 'bg-white border-[#d6ddd0] text-[#121410]/80 font-semibold hover:border-[#4d6a10] hover:text-[#4d6a10] hover:bg-[#e7efcf]/40 shadow-2xs'
              }`}
            >
              <Cpu className="w-4 h-4 shrink-0" />
              <span>3. Architecture &amp; Delivery</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('impact')}
              className={`py-2.5 px-3.5 rounded-xl border whitespace-nowrap md:whitespace-normal text-left transition-all flex items-center gap-2.5 cursor-pointer shrink-0 md:w-full ${
                activeTab === 'impact'
                  ? 'bg-[#4d6a10] border-[#4d6a10] text-white font-bold shadow-sm'
                  : 'bg-white border-[#d6ddd0] text-[#121410]/80 font-semibold hover:border-[#4d6a10] hover:text-[#4d6a10] hover:bg-[#e7efcf]/40 shadow-2xs'
              }`}
            >
              <TrendingUp className="w-4 h-4 shrink-0" />
              <span>4. Impact &amp; Learnings</span>
            </button>
          </aside>

          {/* Modal Scrollable Body */}
          <div className="flex-1 p-6 overflow-y-auto space-y-8 text-sm bg-white">
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Executive Summary */}
                <div>
                  <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold mb-2">
                    Executive Summary
                  </h3>
                  <div className="text-[#121410] font-medium leading-relaxed bg-[#e7efcf]/45 p-4 rounded-[16px] border border-[#4d6a10]/20">
                    <InlineEditableText
                      as="p"
                      multiline
                      value={cs.executive_summary || project.summary}
                      onSave={(val) => persistCaseStudy({ executive_summary: val })}
                    />
                  </div>
                </div>

                {/* Context & Problem Grid */}
                <div className="grid md:grid-cols-2 gap-5">
                  <div className="p-5 rounded-[18px] border border-[#eef0ea] bg-[#fafcf7] space-y-2">
                    <h4 className="font-display font-bold text-[#121410] flex items-center gap-2 text-sm">
                      <span className="p-1.5 rounded-lg bg-[#e7efcf]">
                        <BookOpen className="w-4 h-4 text-[#4d6a10]" />
                      </span>
                      Business Context
                    </h4>
                    <div className="text-[#121410]/75 leading-relaxed text-xs">
                      <InlineEditableText
                        as="p"
                        multiline
                        value={cs.business_context || project.challenge}
                        onSave={(val) => persistCaseStudy({ business_context: val })}
                      />
                    </div>
                  </div>
                  <div className="p-5 rounded-[18px] border border-[#eef0ea] bg-[#fafcf7] space-y-2">
                    <h4 className="font-display font-bold text-[#121410] flex items-center gap-2 text-sm">
                      <span className="p-1.5 rounded-lg bg-[#e7efcf]">
                        <AlertCircle className="w-4 h-4 text-[#4d6a10]" />
                      </span>
                      Problem Statement
                    </h4>
                    <div className="text-[#121410]/75 leading-relaxed text-xs">
                      <InlineEditableText
                        as="p"
                        multiline
                        value={cs.problem_statement || project.challenge}
                        onSave={(val) => persistCaseStudy({ problem_statement: val })}
                      />
                    </div>
                  </div>
                </div>

                {/* User Personas */}
                {(personas.length > 0 || isEditMode) && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#4d6a10]" />
                        Target User Personas &amp; Pain Points
                      </h3>
                      {isEditMode && !addingPersona && (
                        <button
                          type="button"
                          onClick={() => {
                            setPersonaDraft({ role: '', need: '' });
                            setAddingPersona(true);
                            setEditingPersonaIdx(null);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/50 text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Persona</span>
                        </button>
                      )}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {personas.map((p, i) => (
                        <div key={i} className="relative p-4 rounded-[16px] border border-[#eef0ea] bg-[#fafcf7] group/p">
                          {isEditMode && editingPersonaIdx === i ? (
                            <div className="space-y-2">
                              <input
                                type="text"
                                value={personaDraft.role}
                                onChange={(e) => setPersonaDraft({ ...personaDraft, role: e.target.value })}
                                placeholder="Persona Role"
                                className={inputCls}
                                autoFocus
                              />
                              <textarea
                                rows={2}
                                value={personaDraft.need}
                                onChange={(e) => setPersonaDraft({ ...personaDraft, need: e.target.value })}
                                placeholder="Core Need / Pain Point"
                                className={inputCls}
                              />
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={saving || !personaDraft.role.trim()}
                                  onClick={async () => {
                                    const next = [...personas];
                                    next[i] = { role: personaDraft.role.trim(), need: personaDraft.need.trim() };
                                    await persistCaseStudy({ personas_json: JSON.stringify(next) });
                                    setEditingPersonaIdx(null);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4d6a10] text-white font-mono text-[10px] font-bold cursor-pointer"
                                >
                                  <Check className="w-3 h-3" /> Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingPersonaIdx(null)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#4d6a10]/20 text-[#121410]/70 font-mono text-[10px] cursor-pointer"
                                >
                                  <X className="w-3 h-3" /> Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-start justify-between gap-2">
                                <span className="font-bold text-[#121410] text-xs block mb-1">{p.role}</span>
                                {isEditMode && (
                                  <div className="flex items-center gap-1 shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setPersonaDraft({ ...p });
                                        setEditingPersonaIdx(i);
                                        setAddingPersona(false);
                                      }}
                                      className="p-1 rounded-md bg-[#e7efcf] text-[#4d6a10] hover:bg-[#4d6a10] hover:text-white cursor-pointer"
                                      title="Edit persona"
                                    >
                                      <Pencil className="w-2.5 h-2.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const next = personas.filter((_, idx) => idx !== i);
                                        await persistCaseStudy({ personas_json: JSON.stringify(next) });
                                      }}
                                      className="p-1 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
                                      title="Delete persona"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  </div>
                                )}
                              </div>
                              <p className="text-xs text-[#121410]/75">
                                <strong className="text-[#4d6a10]">Need:</strong> {p.need}
                              </p>
                            </>
                          )}
                        </div>
                      ))}

                      {isEditMode && addingPersona && (
                        <div className="p-4 rounded-[16px] border border-[#4d6a10] bg-white space-y-2">
                          <input
                            type="text"
                            value={personaDraft.role}
                            onChange={(e) => setPersonaDraft({ ...personaDraft, role: e.target.value })}
                            placeholder="Persona Role (e.g. Dean of Admissions)"
                            className={inputCls}
                            autoFocus
                          />
                          <textarea
                            rows={2}
                            value={personaDraft.need}
                            onChange={(e) => setPersonaDraft({ ...personaDraft, need: e.target.value })}
                            placeholder="Core Need / Pain Point"
                            className={inputCls}
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={saving || !personaDraft.role.trim()}
                              onClick={async () => {
                                const next = [...personas, { role: personaDraft.role.trim(), need: personaDraft.need.trim() }];
                                await persistCaseStudy({ personas_json: JSON.stringify(next) });
                                setAddingPersona(false);
                              }}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4d6a10] text-white font-mono text-[10px] font-bold cursor-pointer"
                            >
                              <Check className="w-3 h-3" /> Add
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddingPersona(false)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fafcf7] border border-[#4d6a10]/20 text-[#121410]/70 font-mono text-[10px] cursor-pointer"
                            >
                              <X className="w-3 h-3" /> Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Business Requirements */}
                {(requirements.length > 0 || isEditMode) && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold">
                        Core Business &amp; Technical Requirements
                      </h3>
                      {isEditMode && !addingReq && (
                        <button
                          type="button"
                          onClick={() => {
                            setReqDraft('');
                            setAddingReq(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/50 text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Requirement</span>
                        </button>
                      )}
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-2.5">
                      {requirements.map((req, i) => (
                        <li
                          key={i}
                          className="flex items-start justify-between gap-2 text-xs text-[#121410]/85 bg-[#fafcf7] p-3 rounded-[14px] border border-[#eef0ea]"
                        >
                          <div className="flex items-start gap-2 flex-1 min-w-0">
                            <CheckCircle2 className="w-4 h-4 text-[#4d6a10] shrink-0 mt-0.5" />
                            <InlineEditableText
                              as="span"
                              value={req}
                              onSave={async (val) => {
                                const next = [...requirements];
                                next[i] = val;
                                await persistCaseStudy({ requirements_json: JSON.stringify(next) });
                              }}
                            />
                          </div>
                          {isEditMode && (
                            <button
                              type="button"
                              onClick={async () => {
                                const next = requirements.filter((_, idx) => idx !== i);
                                await persistCaseStudy({ requirements_json: JSON.stringify(next) });
                              }}
                              className="p-1 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shrink-0 cursor-pointer"
                              title="Delete requirement"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </li>
                      ))}
                    </ul>
                    {isEditMode && addingReq && (
                      <div className="mt-2.5 p-3 rounded-[14px] border border-[#4d6a10] bg-white flex flex-col sm:flex-row gap-2">
                        <input
                          type="text"
                          value={reqDraft}
                          onChange={(e) => setReqDraft(e.target.value)}
                          placeholder="Enter new requirement..."
                          className={inputCls}
                          autoFocus
                        />
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            disabled={saving || !reqDraft.trim()}
                            onClick={async () => {
                              const next = [...requirements, reqDraft.trim()];
                              await persistCaseStudy({ requirements_json: JSON.stringify(next) });
                              setReqDraft('');
                              setAddingReq(false);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#4d6a10] text-white font-mono text-[10px] font-bold cursor-pointer"
                          >
                            <Check className="w-3 h-3" /> Add
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingReq(false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-[#fafcf7] border border-[#4d6a10]/20 text-[#121410]/70 font-mono text-[10px] cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: STRATEGY */}
            {activeTab === 'strategy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold mb-2">
                    Product Strategy &amp; Discovery Approach
                  </h3>
                  <div className="text-[#121410] font-medium leading-relaxed bg-[#e7efcf]/45 p-4 rounded-[16px] border border-[#4d6a10]/20">
                    <InlineEditableText
                      as="p"
                      multiline
                      value={cs.product_strategy || project.solution}
                      onSave={(val) => persistCaseStudy({ product_strategy: val })}
                    />
                  </div>
                </div>

                {/* Stakeholder Mapping */}
                {(stakeholderMap.length > 0 || isEditMode) && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold">
                        Stakeholder Mapping &amp; Governance
                      </h3>
                      {isEditMode && !addingStakeholder && (
                        <button
                          type="button"
                          onClick={() => {
                            setStakeholderDraft({ group: '', priority: 'High', focus: '' });
                            setAddingStakeholder(true);
                            setEditingStakeholderIdx(null);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/50 text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Stakeholder</span>
                        </button>
                      )}
                    </div>
                    <div className="overflow-x-auto rounded-[16px] border border-[#eef0ea]">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#fafcf7] border-b border-[#eef0ea] font-mono text-[#4d6a10]">
                          <tr>
                            <th className="py-3 px-4 font-bold">Stakeholder Group</th>
                            <th className="py-3 px-4 font-bold">Priority</th>
                            <th className="py-3 px-4 font-bold">Strategic Alignment &amp; Focus</th>
                            {isEditMode && <th className="py-3 px-3 font-bold text-right">Actions</th>}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#eef0ea] bg-white">
                          {stakeholderMap.map((st, i) => (
                            <tr key={i} className="hover:bg-[#fafcf7]">
                              {isEditMode && editingStakeholderIdx === i ? (
                                <td colSpan={4} className="p-3 bg-[#fafcf7]">
                                  <div className="grid sm:grid-cols-3 gap-2">
                                    <input
                                      type="text"
                                      value={stakeholderDraft.group}
                                      onChange={(e) => setStakeholderDraft({ ...stakeholderDraft, group: e.target.value })}
                                      placeholder="Group"
                                      className={inputCls}
                                    />
                                    <select
                                      value={stakeholderDraft.priority}
                                      onChange={(e) => setStakeholderDraft({ ...stakeholderDraft, priority: e.target.value })}
                                      className={inputCls}
                                    >
                                      <option value="High">High</option>
                                      <option value="Medium">Medium</option>
                                      <option value="Standard">Standard</option>
                                    </select>
                                    <input
                                      type="text"
                                      value={stakeholderDraft.focus}
                                      onChange={(e) => setStakeholderDraft({ ...stakeholderDraft, focus: e.target.value })}
                                      placeholder="Alignment & Focus"
                                      className={inputCls}
                                    />
                                  </div>
                                  <div className="flex items-center gap-1.5 mt-2">
                                    <button
                                      type="button"
                                      disabled={saving || !stakeholderDraft.group.trim()}
                                      onClick={async () => {
                                        const next = [...stakeholderMap];
                                        next[i] = { ...stakeholderDraft };
                                        await persistCaseStudy({ stakeholder_map_json: JSON.stringify(next) });
                                        setEditingStakeholderIdx(null);
                                      }}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4d6a10] text-white font-mono text-[10px] font-bold cursor-pointer"
                                    >
                                      <Check className="w-3 h-3" /> Save
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => setEditingStakeholderIdx(null)}
                                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#4d6a10]/20 text-[#121410]/70 font-mono text-[10px] cursor-pointer"
                                    >
                                      <X className="w-3 h-3" /> Cancel
                                    </button>
                                  </div>
                                </td>
                              ) : (
                                <>
                                  <td className="py-3 px-4 font-bold text-[#121410]">{st.group}</td>
                                  <td className="py-3 px-4">
                                    <span
                                      className={`px-2.5 py-0.5 rounded-full font-mono text-[10px] font-bold ${
                                        st.priority === 'High'
                                          ? 'bg-[#e7efcf] text-[#4d6a10] border border-[#4d6a10]/25'
                                          : 'bg-[#fafcf7] text-[#121410]/65 border border-[#eef0ea]'
                                      }`}
                                    >
                                      {st.priority}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-[#121410]/75">{st.focus}</td>
                                  {isEditMode && (
                                    <td className="py-3 px-3 text-right">
                                      <div className="inline-flex items-center gap-1">
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setStakeholderDraft({ ...st });
                                            setEditingStakeholderIdx(i);
                                            setAddingStakeholder(false);
                                          }}
                                          className="p-1 rounded-md bg-[#e7efcf] text-[#4d6a10] hover:bg-[#4d6a10] hover:text-white cursor-pointer"
                                        >
                                          <Pencil className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={async () => {
                                            const next = stakeholderMap.filter((_, idx) => idx !== i);
                                            await persistCaseStudy({ stakeholder_map_json: JSON.stringify(next) });
                                          }}
                                          className="p-1 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </td>
                                  )}
                                </>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {isEditMode && addingStakeholder && (
                      <div className="mt-2.5 p-3 rounded-[14px] border border-[#4d6a10] bg-white space-y-2">
                        <div className="grid sm:grid-cols-3 gap-2">
                          <input
                            type="text"
                            value={stakeholderDraft.group}
                            onChange={(e) => setStakeholderDraft({ ...stakeholderDraft, group: e.target.value })}
                            placeholder="Stakeholder Group"
                            className={inputCls}
                            autoFocus
                          />
                          <select
                            value={stakeholderDraft.priority}
                            onChange={(e) => setStakeholderDraft({ ...stakeholderDraft, priority: e.target.value })}
                            className={inputCls}
                          >
                            <option value="High">High</option>
                            <option value="Medium">Medium</option>
                            <option value="Standard">Standard</option>
                          </select>
                          <input
                            type="text"
                            value={stakeholderDraft.focus}
                            onChange={(e) => setStakeholderDraft({ ...stakeholderDraft, focus: e.target.value })}
                            placeholder="Strategic Alignment & Focus"
                            className={inputCls}
                          />
                        </div>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={saving || !stakeholderDraft.group.trim()}
                            onClick={async () => {
                              const next = [...stakeholderMap, { ...stakeholderDraft }];
                              await persistCaseStudy({ stakeholder_map_json: JSON.stringify(next) });
                              setAddingStakeholder(false);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#4d6a10] text-white font-mono text-[10px] font-bold cursor-pointer"
                          >
                            <Check className="w-3 h-3" /> Add Row
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingStakeholder(false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fafcf7] border border-[#4d6a10]/20 text-[#121410]/70 font-mono text-[10px] cursor-pointer"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Feature Prioritization Matrix */}
                {(featurePrioritization.framework || isEditMode) && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold flex items-center gap-1 flex-wrap">
                        <span>Feature Prioritization Framework (</span>
                        <InlineEditableText
                          as="span"
                          value={featurePrioritization.framework || 'MoSCoW Prioritization'}
                          onSave={async (val) => {
                            const updated = {
                              must_have: [],
                              should_have: [],
                              could_have: [],
                              wont_have: [],
                              ...featurePrioritization,
                              framework: val,
                            };
                            await persistCaseStudy({ feature_prioritization_json: JSON.stringify(updated) });
                          }}
                        />
                        <span>)</span>
                      </h3>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {Object.entries(
                        featurePrioritization.framework
                          ? featurePrioritization
                          : {
                              framework: 'MoSCoW Prioritization',
                              must_have: [],
                              should_have: [],
                              could_have: [],
                              wont_have: [],
                            }
                      ).map(([key, val]: [string, any], i) => {
                        if (key === 'framework' || !Array.isArray(val)) return null;
                        return (
                          <div key={i} className="p-4 rounded-[16px] border border-[#eef0ea] bg-[#fafcf7]">
                            <div className="flex items-center justify-between gap-2 mb-2">
                              <span className="font-mono text-xs uppercase tracking-wider text-[#4d6a10] font-bold block">
                                {key.replace(/_/g, ' ')}
                              </span>
                              {isEditMode && addingPrioritizationKey !== key && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAddingPrioritizationKey(key);
                                    setPrioritizationItemDraft('');
                                  }}
                                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/60 text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                  <span>Add</span>
                                </button>
                              )}
                            </div>
                            <ul className="space-y-1.5 text-xs text-[#121410]/75">
                              {val.map((item: string, idx: number) => (
                                <li key={idx} className="flex items-center justify-between gap-2 group/fp">
                                  <div className="flex items-center gap-2 flex-1 min-w-0">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#6f9a0c] shrink-0"></span>
                                    <InlineEditableText
                                      as="span"
                                      value={item}
                                      onSave={async (newText) => {
                                        const nextArr = [...val];
                                        nextArr[idx] = newText;
                                        const updated = {
                                          framework: featurePrioritization.framework || 'MoSCoW Prioritization',
                                          ...featurePrioritization,
                                          [key]: nextArr,
                                        };
                                        await persistCaseStudy({ feature_prioritization_json: JSON.stringify(updated) });
                                      }}
                                    />
                                  </div>
                                  {isEditMode && (
                                    <button
                                      type="button"
                                      disabled={saving}
                                      onClick={async () => {
                                        const nextArr = val.filter((_: string, itemIdx: number) => itemIdx !== idx);
                                        const updated = {
                                          framework: featurePrioritization.framework || 'MoSCoW Prioritization',
                                          ...featurePrioritization,
                                          [key]: nextArr,
                                        };
                                        await persistCaseStudy({ feature_prioritization_json: JSON.stringify(updated) });
                                      }}
                                      title="Delete item"
                                      className="p-1 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shrink-0 cursor-pointer"
                                    >
                                      <Trash2 className="w-2.5 h-2.5" />
                                    </button>
                                  )}
                                </li>
                              ))}
                              {val.length === 0 && !isEditMode && (
                                <li className="text-[11px] text-[#121410]/45 italic">No items listed</li>
                              )}
                            </ul>

                            {isEditMode && addingPrioritizationKey === key && (
                              <div className="mt-2.5 flex items-center gap-1.5">
                                <input
                                  type="text"
                                  value={prioritizationItemDraft}
                                  onChange={(e) => setPrioritizationItemDraft(e.target.value)}
                                  placeholder={`Add to ${key.replace(/_/g, ' ')}...`}
                                  className={inputCls}
                                  autoFocus
                                  onKeyDown={async (e) => {
                                    if (e.key === 'Enter' && prioritizationItemDraft.trim()) {
                                      const updated = {
                                        framework: featurePrioritization.framework || 'MoSCoW Prioritization',
                                        ...featurePrioritization,
                                        [key]: [...val, prioritizationItemDraft.trim()],
                                      };
                                      await persistCaseStudy({ feature_prioritization_json: JSON.stringify(updated) });
                                      setPrioritizationItemDraft('');
                                      setAddingPrioritizationKey(null);
                                    }
                                  }}
                                />
                                <button
                                  type="button"
                                  disabled={saving || !prioritizationItemDraft.trim()}
                                  onClick={async () => {
                                    const updated = {
                                      framework: featurePrioritization.framework || 'MoSCoW Prioritization',
                                      ...featurePrioritization,
                                      [key]: [...val, prioritizationItemDraft.trim()],
                                    };
                                    await persistCaseStudy({ feature_prioritization_json: JSON.stringify(updated) });
                                    setPrioritizationItemDraft('');
                                    setAddingPrioritizationKey(null);
                                  }}
                                  className="p-1.5 rounded-lg bg-[#4d6a10] text-white disabled:opacity-50 cursor-pointer shrink-0"
                                  title="Save item"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setAddingPrioritizationKey(null)}
                                  className="p-1.5 rounded-lg bg-white border border-[#4d6a10]/20 text-[#121410]/70 cursor-pointer shrink-0"
                                  title="Cancel"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Product Roadmap */}
                {(roadmap.length > 0 || isEditMode) && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold">
                        Phased Product Roadmap &amp; Execution Waves
                      </h3>
                      {isEditMode && !addingWave && (
                        <button
                          type="button"
                          onClick={() => {
                            setWaveDraft({ phase: '', timeline: '', deliverables: '' });
                            setAddingWave(true);
                            setEditingWaveIdx(null);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/50 text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Wave</span>
                        </button>
                      )}
                    </div>
                    <div className="space-y-3">
                      {roadmap.map((phase, i) => (
                        <div
                          key={i}
                          className="p-4 rounded-[16px] border border-[#eef0ea] bg-[#fafcf7] flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                        >
                          {isEditMode && editingWaveIdx === i ? (
                            <div className="w-full space-y-2">
                              <div className="grid sm:grid-cols-2 gap-2">
                                <input
                                  type="text"
                                  value={waveDraft.phase}
                                  onChange={(e) => setWaveDraft({ ...waveDraft, phase: e.target.value })}
                                  placeholder="Phase Title"
                                  className={inputCls}
                                />
                                <input
                                  type="text"
                                  value={waveDraft.timeline}
                                  onChange={(e) => setWaveDraft({ ...waveDraft, timeline: e.target.value })}
                                  placeholder="Timeline (e.g. Q1 - Q2)"
                                  className={inputCls}
                                />
                              </div>
                              <textarea
                                rows={2}
                                value={waveDraft.deliverables}
                                onChange={(e) => setWaveDraft({ ...waveDraft, deliverables: e.target.value })}
                                placeholder="Key Deliverables"
                                className={inputCls}
                              />
                              <div className="flex items-center gap-1.5">
                                <button
                                  type="button"
                                  disabled={saving || !waveDraft.phase.trim()}
                                  onClick={async () => {
                                    const next = [...roadmap];
                                    next[i] = { ...waveDraft };
                                    await persistCaseStudy({ roadmap_json: JSON.stringify(next) });
                                    setEditingWaveIdx(null);
                                  }}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4d6a10] text-white font-mono text-[10px] font-bold cursor-pointer"
                                >
                                  <Check className="w-3 h-3" /> Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingWaveIdx(null)}
                                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#4d6a10]/20 text-[#121410]/70 font-mono text-[10px] cursor-pointer"
                                >
                                  <X className="w-3 h-3" /> Cancel
                                </button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div>
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-display font-bold text-[#121410] text-xs">{phase.phase}</span>
                                  <span className="font-mono text-[10px] px-2.5 py-0.5 rounded-full bg-white border border-[#eef0ea] text-[#121410]/65 font-semibold">
                                    {phase.timeline}
                                  </span>
                                </div>
                                <p className="text-xs text-[#121410]/75 mt-1">{phase.deliverables}</p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[#4d6a10] bg-[#e7efcf] border border-[#4d6a10]/20 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold">
                                  Wave 0{i + 1}
                                </span>
                                {isEditMode && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setWaveDraft({ ...phase });
                                        setEditingWaveIdx(i);
                                        setAddingWave(false);
                                      }}
                                      className="p-1 rounded-md bg-[#e7efcf] text-[#4d6a10] hover:bg-[#4d6a10] hover:text-white cursor-pointer"
                                    >
                                      <Pencil className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={async () => {
                                        const next = roadmap.filter((_, idx) => idx !== i);
                                        await persistCaseStudy({ roadmap_json: JSON.stringify(next) });
                                      }}
                                      className="p-1 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      ))}

                      {isEditMode && addingWave && (
                        <div className="p-4 rounded-[16px] border border-[#4d6a10] bg-white space-y-2">
                          <div className="grid sm:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={waveDraft.phase}
                              onChange={(e) => setWaveDraft({ ...waveDraft, phase: e.target.value })}
                              placeholder="Phase Title"
                              className={inputCls}
                              autoFocus
                            />
                            <input
                              type="text"
                              value={waveDraft.timeline}
                              onChange={(e) => setWaveDraft({ ...waveDraft, timeline: e.target.value })}
                              placeholder="Timeline"
                              className={inputCls}
                            />
                          </div>
                          <textarea
                            rows={2}
                            value={waveDraft.deliverables}
                            onChange={(e) => setWaveDraft({ ...waveDraft, deliverables: e.target.value })}
                            placeholder="Deliverables"
                            className={inputCls}
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={saving || !waveDraft.phase.trim()}
                              onClick={async () => {
                                const next = [...roadmap, { ...waveDraft }];
                                await persistCaseStudy({ roadmap_json: JSON.stringify(next) });
                                setAddingWave(false);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#4d6a10] text-white font-mono text-[10px] font-bold cursor-pointer"
                            >
                              <Check className="w-3 h-3" /> Add Wave
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddingWave(false)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fafcf7] border border-[#4d6a10]/20 text-[#121410]/70 font-mono text-[10px] cursor-pointer"
                            >
                              <X className="w-3 h-3" /> Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: ARCHITECTURE */}
            {activeTab === 'architecture' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold mb-2">
                    System Architecture &amp; Integration Topology
                  </h3>
                  <div className="p-5 rounded-[18px] border border-[#eef0ea] bg-[#fafcf7] space-y-4">
                    <div className="text-[#121410]/80 text-xs leading-relaxed">
                      <InlineEditableText
                        as="p"
                        multiline
                        value={
                          cs.system_architecture ||
                          'Architected distributed enterprise service layer integrating databases, API gateways, and user identity.'
                        }
                        onSave={(val) => persistCaseStudy({ system_architecture: val })}
                      />
                    </div>

                    <div className="p-4 bg-white rounded-[14px] border border-[#eef0ea] font-mono text-xs space-y-2.5">
                      <div className="text-[#4d6a10] font-bold flex items-center justify-between">
                        <span>Client &amp; Gateway Layer</span>
                        <span className="text-[10px] text-[#121410]/55">HTTPS / TLS / OAuth2</span>
                      </div>
                      <div className="p-2.5 rounded-[10px] bg-[#fafcf7] border border-[#eef0ea] text-center text-[#121410] font-medium">
                        Role-Based Access Control (RBAC) &middot; Rate Limiting &middot; Reverse Proxy
                      </div>
                      <div className="text-center text-[#4d6a10] font-semibold">&darr; REST / JSON &amp; Webhooks &darr;</div>
                      <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-semibold text-[#121410]">
                        <div className="p-2.5 rounded-[10px] bg-[#e7efcf]/60 border border-[#4d6a10]/20">Core ERP Engine</div>
                        <div className="p-2.5 rounded-[10px] bg-[#e7efcf]/60 border border-[#4d6a10]/20">Integration APIs</div>
                        <div className="p-2.5 rounded-[10px] bg-[#e7efcf]/60 border border-[#4d6a10]/20">Analytics &amp; BI</div>
                      </div>
                      <div className="text-center text-[#4d6a10] font-semibold">&darr; Connection Pool / SQLAlchemy &darr;</div>
                      <div className="p-2.5 rounded-[10px] bg-[#fafcf7] border border-[#eef0ea] text-center text-[#121410] font-medium">
                        Enterprise Relational Store &amp; Archival Storage (GCP / On-Prem Managed)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-5">
                  <div className="p-5 rounded-[18px] border border-[#eef0ea] bg-[#fafcf7] space-y-2">
                    <h4 className="font-display font-bold text-[#4d6a10] text-xs uppercase tracking-wider">
                      Execution &amp; Delivery Cadence
                    </h4>
                    <div className="text-[#121410]/75 text-xs leading-relaxed">
                      <InlineEditableText
                        as="p"
                        multiline
                        value={
                          cs.execution_delivery ||
                          'Iterative sprint execution with continuous user acceptance feedback.'
                        }
                        onSave={(val) => persistCaseStudy({ execution_delivery: val })}
                      />
                    </div>
                  </div>
                  <div className="p-5 rounded-[18px] border border-[#eef0ea] bg-[#fafcf7] space-y-2">
                    <h4 className="font-display font-bold text-[#4d6a10] text-xs uppercase tracking-wider">
                      Testing, Security &amp; Deployment
                    </h4>
                    <div className="text-[#121410]/75 text-xs leading-relaxed">
                      <InlineEditableText
                        as="p"
                        multiline
                        value={
                          cs.testing_deployment ||
                          'Extensive automated regression, penetration drills, and zero-downtime cutovers.'
                        }
                        onSave={(val) => persistCaseStudy({ testing_deployment: val })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold">
                      Verified Technology Stack
                    </h3>
                    {isEditMode && !addingTech && (
                      <button
                        type="button"
                        onClick={() => {
                          setTechDraft('');
                          setAddingTech(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/50 text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Tech</span>
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 items-center">
                    {(parseJson(project.tech_stack_json) || []).map((t: string, i: number, arr: string[]) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1 rounded-full bg-[#e7efcf]/60 text-[#4d6a10] border border-[#4d6a10]/20 font-semibold"
                      >
                        <span>{t}</span>
                        {isEditMode && (
                          <button
                            type="button"
                            disabled={saving}
                            onClick={async () => {
                              if (!token) return;
                              setSaving(true);
                              try {
                                const nextTech = arr.filter((_, idx) => idx !== i);
                                await adminUpdateProject(
                                  project.id,
                                  {
                                    slug: project.slug,
                                    title: project.title,
                                    category: project.category,
                                    client_org: project.client_org,
                                    summary: project.summary,
                                    challenge: project.challenge,
                                    solution: project.solution,
                                    role: project.role,
                                    responsibilities_json: project.responsibilities_json,
                                    tech_stack_json: JSON.stringify(nextTech),
                                    impact_metrics_json: project.impact_metrics_json,
                                    is_featured: project.is_featured,
                                    published: project.published,
                                    order_index: project.order_index,
                                  },
                                  token
                                );
                                onRefreshData();
                              } finally {
                                setSaving(false);
                              }
                            }}
                            className="hover:text-red-600 cursor-pointer"
                            title="Remove tech"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                    {isEditMode && addingTech && (
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          value={techDraft}
                          onChange={(e) => setTechDraft(e.target.value)}
                          placeholder="e.g. FastAPI"
                          className="px-2.5 py-1 rounded-full border border-[#4d6a10] bg-white text-xs text-[#121410] focus:outline-none w-32"
                          autoFocus
                        />
                        <button
                          type="button"
                          disabled={saving || !techDraft.trim()}
                          onClick={async () => {
                            if (!token || !techDraft.trim()) return;
                            setSaving(true);
                            try {
                              const current = parseJson(project.tech_stack_json) || [];
                              const nextTech = [...current, techDraft.trim()];
                              await adminUpdateProject(
                                project.id,
                                {
                                  slug: project.slug,
                                  title: project.title,
                                  category: project.category,
                                  client_org: project.client_org,
                                  summary: project.summary,
                                  challenge: project.challenge,
                                  solution: project.solution,
                                  role: project.role,
                                  responsibilities_json: project.responsibilities_json,
                                  tech_stack_json: JSON.stringify(nextTech),
                                  impact_metrics_json: project.impact_metrics_json,
                                  is_featured: project.is_featured,
                                  published: project.published,
                                  order_index: project.order_index,
                                },
                                token
                              );
                              onRefreshData();
                              setTechDraft('');
                              setAddingTech(false);
                            } finally {
                              setSaving(false);
                            }
                          }}
                          className="p-1 rounded-full bg-[#4d6a10] text-white cursor-pointer"
                          title="Add"
                        >
                          <Check className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setAddingTech(false)}
                          className="p-1 rounded-full bg-[#fafcf7] border border-[#4d6a10]/20 text-[#121410]/70 cursor-pointer"
                          title="Cancel"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: IMPACT & LEARNINGS */}
            {activeTab === 'impact' && (
              <div className="space-y-6">
                {/* Measurable Results */}
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold">
                      Verified Business Impact &amp; Outcomes
                    </h3>
                    {isEditMode && !addingImpact && (
                      <button
                        type="button"
                        onClick={() => {
                          setImpactDraft({ metric: '', impact: '' });
                          setAddingImpact(true);
                          setEditingImpactIdx(null);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/50 text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Outcome</span>
                      </button>
                    )}
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {resultsImpact.map((r, i) => (
                      <div key={i} className="p-4 rounded-[16px] border border-[#4d6a10]/20 bg-[#e7efcf]/45">
                        {isEditMode && editingImpactIdx === i ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={impactDraft.metric}
                              onChange={(e) => setImpactDraft({ ...impactDraft, metric: e.target.value })}
                              placeholder="Metric (e.g. 99.95% Uptime)"
                              className={inputCls}
                            />
                            <textarea
                              rows={2}
                              value={impactDraft.impact}
                              onChange={(e) => setImpactDraft({ ...impactDraft, impact: e.target.value })}
                              placeholder="Business impact description"
                              className={inputCls}
                            />
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                disabled={saving || !impactDraft.metric.trim()}
                                onClick={async () => {
                                  const next = [...resultsImpact];
                                  next[i] = { ...impactDraft };
                                  await persistCaseStudy({ results_impact_json: JSON.stringify(next) });
                                  setEditingImpactIdx(null);
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4d6a10] text-white font-mono text-[10px] font-bold cursor-pointer"
                              >
                                <Check className="w-3 h-3" /> Save
                              </button>
                              <button
                                type="button"
                                onClick={() => setEditingImpactIdx(null)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#4d6a10]/20 text-[#121410]/70 font-mono text-[10px] cursor-pointer"
                              >
                                <X className="w-3 h-3" /> Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-display font-extrabold text-lg text-[#4d6a10] block">
                                {r.metric}
                              </span>
                              {isEditMode && (
                                <div className="flex items-center gap-1 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setImpactDraft({ ...r });
                                      setEditingImpactIdx(i);
                                      setAddingImpact(false);
                                    }}
                                    className="p-1 rounded-md bg-white text-[#4d6a10] hover:bg-[#4d6a10] hover:text-white cursor-pointer"
                                  >
                                    <Pencil className="w-3 h-3" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const next = resultsImpact.filter((_, idx) => idx !== i);
                                      await persistCaseStudy({ results_impact_json: JSON.stringify(next) });
                                    }}
                                    className="p-1 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                            <p className="text-xs text-[#121410]/80 mt-1 leading-relaxed">{r.impact}</p>
                          </>
                        )}
                      </div>
                    ))}

                    {isEditMode && addingImpact && (
                      <div className="p-4 rounded-[16px] border border-[#4d6a10] bg-white space-y-2">
                        <input
                          type="text"
                          value={impactDraft.metric}
                          onChange={(e) => setImpactDraft({ ...impactDraft, metric: e.target.value })}
                          placeholder="Metric (e.g. 40% Faster Rollout)"
                          className={inputCls}
                          autoFocus
                        />
                        <textarea
                          rows={2}
                          value={impactDraft.impact}
                          onChange={(e) => setImpactDraft({ ...impactDraft, impact: e.target.value })}
                          placeholder="Impact summary"
                          className={inputCls}
                        />
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={saving || !impactDraft.metric.trim()}
                            onClick={async () => {
                              const next = [...resultsImpact, { ...impactDraft }];
                              await persistCaseStudy({ results_impact_json: JSON.stringify(next) });
                              setAddingImpact(false);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#4d6a10] text-white font-mono text-[10px] font-bold cursor-pointer"
                          >
                            <Check className="w-3 h-3" /> Add
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingImpact(false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fafcf7] border border-[#4d6a10]/20 text-[#121410]/70 font-mono text-[10px] cursor-pointer"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Retrospective Learnings */}
                {(learnings.length > 0 || isEditMode) && (
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <h3 className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold">
                        Product Leader Retrospective &amp; Key Takeaways
                      </h3>
                      {isEditMode && !addingLearning && (
                        <button
                          type="button"
                          onClick={() => {
                            setLearningDraft('');
                            setAddingLearning(true);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/50 text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add Takeaway</span>
                        </button>
                      )}
                    </div>
                    <div className="space-y-2.5">
                      {learnings.map((l, i) => (
                        <div
                          key={i}
                          className="p-3.5 rounded-[14px] border border-[#eef0ea] bg-[#fafcf7] text-xs text-[#121410]/85 flex items-start justify-between gap-2.5"
                        >
                          <div className="flex items-start gap-2.5 flex-1 min-w-0">
                            <span className="font-mono text-[#4d6a10] font-bold shrink-0">0{i + 1}.</span>
                            <InlineEditableText
                              as="span"
                              multiline
                              value={l}
                              onSave={async (val) => {
                                const next = [...learnings];
                                next[i] = val;
                                await persistCaseStudy({ learnings_json: JSON.stringify(next) });
                              }}
                            />
                          </div>
                          {isEditMode && (
                            <button
                              type="button"
                              onClick={async () => {
                                const next = learnings.filter((_, idx) => idx !== i);
                                await persistCaseStudy({ learnings_json: JSON.stringify(next) });
                              }}
                              className="p-1 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shrink-0 cursor-pointer"
                              title="Delete takeaway"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      ))}

                      {isEditMode && addingLearning && (
                        <div className="p-3 rounded-[14px] border border-[#4d6a10] bg-white space-y-2">
                          <textarea
                            rows={2}
                            value={learningDraft}
                            onChange={(e) => setLearningDraft(e.target.value)}
                            placeholder="Write a key takeaway or retrospective learning..."
                            className={inputCls}
                            autoFocus
                          />
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              disabled={saving || !learningDraft.trim()}
                              onClick={async () => {
                                const next = [...learnings, learningDraft.trim()];
                                await persistCaseStudy({ learnings_json: JSON.stringify(next) });
                                setLearningDraft('');
                                setAddingLearning(false);
                              }}
                              className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#4d6a10] text-white font-mono text-[10px] font-bold cursor-pointer"
                            >
                              <Check className="w-3 h-3" /> Add Takeaway
                            </button>
                            <button
                              type="button"
                              onClick={() => setAddingLearning(false)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fafcf7] border border-[#4d6a10]/20 text-[#121410]/70 font-mono text-[10px] cursor-pointer"
                            >
                              <X className="w-3 h-3" /> Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-[#eef0ea] bg-[#fafcf7] flex items-center justify-between gap-4">
          <div className="text-xs font-mono text-[#121410]/65 truncate">
            Viewing: <strong className="text-[#121410]">{project.title}</strong>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="petalyx-btn !py-2 !px-4 !text-xs shrink-0"
          >
            Close Case Study
          </button>
        </div>
      </div>
    </div>
  );
};
