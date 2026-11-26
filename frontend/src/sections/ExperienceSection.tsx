import React, { useEffect, useMemo, useRef, useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowLeft01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import { Experience } from '../types';
import { Calendar, MapPin, CheckCircle2, ChevronRight, Layers, X, Plus, Trash2, Check } from 'lucide-react';
import { CardSwap, Card, CardSwapHandle } from '../components/card-swap/CardSwap';
import Topography from '../components/topography/Topography';
import { InlineEditableText, InlineSectionEditor, useAdminEdit } from '../context/AdminEditContext';
import { adminUpdateExperience } from '../services/api';

interface ExperienceSectionProps {
  experiences: Experience[];
}

interface MappedRole {
  id: number;
  raw: Experience;
  num: string;
  period: string;
  badge: string;
  title: string;
  org: string;
  location: string;
  subtitle: string;
  progression: string[];
  sectionHeading: string;
  summary: string;
  highlights: string[];
  fullDeliverables: string[];
  tags: string[];
  fullTechStack: string[];
  outcomes: string[];
}

const parseJsonArray = (val?: string | null): string[] => {
  if (!val) return [];
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
};

const inputCls =
  'w-full px-3 py-1.5 rounded-xl border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] text-xs focus:outline-none focus:border-[#4d6a10] focus:bg-white transition-colors';

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experiences }) => {
  const cardSwapRef = useRef<CardSwapHandle>(null);
  const { isEditMode, token, onRefreshData } = useAdminEdit();

  const [activeRoleIdx, setActiveRoleIdx] = useState<number>(0);
  const [modalExpId, setModalExpId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Inline add states inside Role Details Modal
  const [addingDeliverable, setAddingDeliverable] = useState(false);
  const [deliverableDraft, setDeliverableDraft] = useState('');

  const [addingTech, setAddingTech] = useState(false);
  const [techDraft, setTechDraft] = useState('');

  const [addingProgression, setAddingProgression] = useState(false);
  const [progressionDraft, setProgressionDraft] = useState('');

  const [addingOutcome, setAddingOutcome] = useState(false);
  const [outcomeDraft, setOutcomeDraft] = useState('');

  const roles: MappedRole[] = useMemo(() => {
    const sorted = [...experiences].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    return sorted.map((exp, idx) => {
      const fullDeliverables = parseJsonArray(exp.responsibilities_json);
      const fullTechStack = parseJsonArray(exp.technologies_json);
      const progression = parseJsonArray(exp.career_progression_json);
      const outcomes = parseJsonArray(exp.outcomes_json);
      const num = String(idx + 1).padStart(2, '0');
      const endLabel = exp.is_current ? 'Present' : exp.end_date || 'Present';
      const period = `${exp.start_date} – ${endLabel}`;
      const badge = exp.is_current
        ? 'Current Leadership'
        : idx === 1
        ? 'Public Corporation'
        : idx === 2
        ? 'National eGov Scale'
        : 'Career Milestone';
      const sectionHeading =
        idx === 0
          ? 'Architectural Scope & Deliverables'
          : idx === 1
          ? 'Mission-Critical Deliverables & Cultural Preservation'
          : idx === 2
          ? 'National Scale & Ownership'
          : 'Key Scope & Deliverables';

      return {
        id: exp.id,
        raw: exp,
        num,
        period,
        badge,
        title: exp.role,
        org: exp.company,
        location: exp.location,
        subtitle: exp.description || '',
        progression,
        sectionHeading,
        summary: exp.description || fullDeliverables[0] || '',
        highlights: fullDeliverables.slice(0, 3),
        fullDeliverables,
        tags: fullTechStack.slice(0, 4),
        fullTechStack,
        outcomes,
      };
    });
  }, [experiences]);

  const safeIdx = roles.length > 0 ? Math.min(activeRoleIdx, roles.length - 1) : 0;
  const activeRole = roles[safeIdx];
  const modalRole = modalExpId !== null ? roles.find((r) => r.id === modalExpId) || null : null;

  const persistExperience = async (exp: Experience, patch: Partial<Experience>) => {
    if (!token) return;
    setSaving(true);
    try {
      const payload = {
        company: exp.company,
        role: exp.role,
        location: exp.location,
        start_date: exp.start_date,
        end_date: exp.end_date ?? null,
        is_current: exp.is_current,
        order_index: exp.order_index,
        description: exp.description ?? null,
        career_progression_json: exp.career_progression_json ?? null,
        responsibilities_json: exp.responsibilities_json || '[]',
        technologies_json: exp.technologies_json || '[]',
        outcomes_json: exp.outcomes_json ?? null,
        ...patch,
      };
      await adminUpdateExperience(exp.id, payload, token);
      onRefreshData();
    } finally {
      setSaving(false);
    }
  };

  // Close role modal on Escape key
  useEffect(() => {
    if (!modalRole) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setModalExpId(null);
    };
    window.addEventListener('keydown', onKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = '';
    };
  }, [modalRole]);

  if (!activeRole) {
    return (
      <section
        id="experience"
        className="petalyx-scope relative py-20 md:py-24 bg-[#fafcf7] border-b border-[#eef0ea]"
        style={{ color: 'var(--ink)' }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <InlineSectionEditor section="experiences" label="Experience Roles" />
        </div>
      </section>
    );
  }

  return (
    <section
      id="experience"
      className="petalyx-scope relative py-20 md:py-24 bg-[#fafcf7] border-b border-[#eef0ea] overflow-x-clip"
      style={{ color: 'var(--ink)' }}
    >
      {/* Subtle Petalyx Grid Pattern Field */}
      <div className="absolute inset-0 petalyx-sq-field pointer-events-none opacity-35 z-0" />

      {/* Interactive Topography WebGL2 Background */}
      <div className="absolute inset-0 pointer-events-none z-[1]" aria-hidden="true">
        <Topography
          color="#4d6a10"
          lineCount={22}
          lineWidth={1.2}
          elevation={1}
          foreground={0.2}
          tilt={32}
          speed={1.04}
          direction="forward"
          glow={0.6}
          depthOfField={0.4}
          fog={0.35}
          hoverEffect="lift"
          clickEffect="pulse"
          scale={0.9}
          lightMode={true}
          opacity={0.45}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <InlineSectionEditor section="experiences" label="Experience Roles" />
        {/* Balanced 2-Column Layout: Header + Synced Role Summary on Left, CardSwap Stack on Right */}
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column (5 cols): Section Header + Synced Role Summary + Controls */}
          <div className="lg:col-span-5 space-y-6 text-left">
            <div>
              <div className="inline-flex items-center gap-2 petalyx-pill mb-3">
                <Layers className="w-3.5 h-3.5 text-[#4d6a10]" />
                <span>Career Trajectory &amp; Delivery</span>
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-[#121410] tracking-tight leading-[1.12]">
                Roles, <span className="text-[#4d6a10] italic">newest first.</span>
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-[#121410] mt-2 leading-relaxed">
                Over a decade of enterprise impact spanning nationwide public higher education ERP, public cultural media corporations, and multi-campus cloud architecture.
              </p>
            </div>

            <div className="pt-5 border-t border-[#4d6a10]/20 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-extrabold text-[#4d6a10] uppercase tracking-wider">
                  <span>Role {activeRole.num}</span>
                  <span>&bull;</span>
                  <span>{activeRole.period}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold text-[#121410] tracking-tight">
                  {activeRole.title}
                </h3>
                <p className="text-sm font-bold text-[#121410]">
                  {activeRole.org} &middot; {activeRole.location}
                </p>
              </div>

              <p className="text-xs sm:text-sm font-semibold text-[#121410] leading-relaxed">
                {activeRole.summary}
              </p>

              {/* Quick-Select Pills + Prev/Next Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  {roles.map((r, idx) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => {
                        setActiveRoleIdx(idx);
                        cardSwapRef.current?.goTo(idx);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                        safeIdx === idx
                          ? 'bg-[#4d6a10] border-[#4d6a10] text-white shadow-sm'
                          : 'bg-white border-[#eef0ea] text-[#121410]/70 hover:border-[#4d6a10] hover:text-[#4d6a10]'
                      }`}
                    >
                      {r.num}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cardSwapRef.current?.prev()}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full bg-white border border-[#eef0ea] text-xs font-bold text-[#121410] hover:border-[#4d6a10] hover:text-[#4d6a10] transition-colors shadow-2xs cursor-pointer"
                    aria-label="Previous role card"
                  >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={15} />
                    <span>Prev</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => cardSwapRef.current?.next()}
                    className="inline-flex items-center gap-1 px-3.5 py-2 rounded-full bg-[#4d6a10] border border-[#4d6a10] text-xs font-bold text-white hover:bg-[#5a7c14] transition-colors shadow-sm cursor-pointer"
                    aria-label="Next role card"
                  >
                    <span>Next</span>
                    <HugeiconsIcon icon={ArrowRight01Icon} size={15} />
                  </button>
                </div>
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setModalExpId(activeRole.id)}
                  className="petalyx-btn !py-2 !px-4 !text-xs cursor-pointer"
                >
                  <span>View Complete Role Details</span>
                  <ChevronRight className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (7 cols): Bounded CardSwap Stack */}
          <div className="lg:col-span-7 h-[410px] sm:h-[440px] relative">
            <CardSwap
              key={roles.map((r) => r.id).join('-')}
              ref={cardSwapRef}
              width={480}
              height={360}
              cardDistance={40}
              verticalDistance={28}
              depth={65}
              skewAmount={4}
              visibleCards={Math.min(3, roles.length)}
              delay={5500}
              pauseOnHover={true}
              draggable={true}
              swapOnFrontClick={false}
              theme="light"
              onChange={(idx) => setActiveRoleIdx(idx)}
              onCardClick={(idx) => {
                setActiveRoleIdx(idx);
                if (roles[idx]) setModalExpId(roles[idx].id);
              }}
            >
              {roles.map((role) => (
                <Card key={role.id} className="p-6 sm:p-7 flex flex-col justify-between text-left bg-white border border-[#eef0ea]">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-[#e7efcf] text-[#4d6a10] border border-[#4d6a10]/20 uppercase tracking-wider">
                        {role.badge}
                      </span>
                      <span className="text-2xl font-extrabold text-[#b4cd52] leading-none">
                        {role.num}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#4d6a10] mb-1">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{role.period}</span>
                      </div>
                      <h4 className="text-xl sm:text-2xl font-extrabold text-[#121410] tracking-tight leading-snug">
                        {role.title}
                      </h4>
                      <div className="flex items-center gap-1.5 text-xs font-medium text-[#121410]/65 mt-0.5">
                        <span className="font-bold text-[#121410]">{role.org}</span>
                        <span>&bull;</span>
                        <MapPin className="w-3 h-3 text-[#4d6a10]" />
                        <span>{role.location}</span>
                      </div>
                    </div>

                    <ul className="space-y-1.5 pt-2 border-t border-[#eef0ea] text-xs text-[#121410]/85">
                      {role.highlights.map((hl, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#4d6a10] shrink-0 mt-0.5" />
                          <span className="line-clamp-2">{hl}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-3 border-t border-[#eef0ea] flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex flex-wrap gap-1.5">
                      {role.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#fafcf7] text-[#4d6a10] border border-[#eef0ea]"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <span className="text-[10px] font-bold text-[#4d6a10]">
                      Click card for full details &rarr;
                    </span>
                  </div>
                </Card>
              ))}
            </CardSwap>
          </div>
        </div>
      </div>

      {/* ========================================================
          COMPLETE ROLE DETAILS POP-UP MODAL (WITH ON-PAGE EDIT)
      ======================================================== */}
      {modalRole && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-[#121410]/45 backdrop-blur-sm overflow-hidden"
          onClick={() => setModalExpId(null)}
        >
          <div
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-[24px] bg-white border border-[#eef0ea] shadow-2xl overflow-hidden text-left"
          >
            {/* Top Olive-to-Lime Accent Bar */}
            <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-[#4d6a10] via-[#6f9a0c] to-[#b4cd52]" />

            {/* Modal Header */}
            <div className="p-5 sm:p-7 pb-4 shrink-0 max-h-[42vh] overflow-y-auto flex items-start justify-between gap-4 bg-[#fafcf7] border-b border-[#eef0ea]">
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#4d6a10] uppercase tracking-wider flex-wrap">
                  <Calendar className="w-4 h-4 text-[#4d6a10]" />
                  {isEditMode ? (
                    <span className="inline-flex items-center gap-1.5 flex-wrap">
                      <InlineEditableText
                        as="span"
                        value={modalRole.raw.start_date}
                        onSave={(val) => persistExperience(modalRole.raw, { start_date: val })}
                      />
                      <span>–</span>
                      <InlineEditableText
                        as="span"
                        value={modalRole.raw.is_current ? 'Present' : modalRole.raw.end_date || 'Present'}
                        onSave={(val) =>
                          persistExperience(modalRole.raw, {
                            end_date: val,
                            is_current: val.trim().toLowerCase() === 'present',
                          })
                        }
                      />
                    </span>
                  ) : (
                    <span>{modalRole.period}</span>
                  )}
                  <span className="px-2.5 py-0.5 rounded-full bg-[#e7efcf] text-[#4d6a10] border border-[#4d6a10]/20 text-[10px] font-bold tracking-normal uppercase ml-1">
                    {modalRole.badge}
                  </span>
                  {isEditMode && (
                    <span className="px-2 py-0.5 rounded-full bg-[#4d6a10] text-white text-[10px] font-mono font-bold tracking-normal">
                      Inline Edit Active
                    </span>
                  )}
                </div>

                <h3 className="text-2xl sm:text-4xl font-extrabold text-[#121410] tracking-tight leading-tight">
                  <InlineEditableText
                    as="span"
                    value={modalRole.title}
                    onSave={(val) => persistExperience(modalRole.raw, { role: val })}
                  />
                </h3>

                <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-[#121410]/70 flex-wrap">
                  <span className="font-bold text-[#121410]">
                    <InlineEditableText
                      as="span"
                      value={modalRole.org}
                      onSave={(val) => persistExperience(modalRole.raw, { company: val })}
                    />
                  </span>
                  <span>&bull;</span>
                  <div className="flex items-center gap-1 text-xs sm:text-sm font-normal">
                    <MapPin className="w-3.5 h-3.5 text-[#4d6a10]" />
                    <InlineEditableText
                      as="span"
                      value={modalRole.location}
                      onSave={(val) => persistExperience(modalRole.raw, { location: val })}
                    />
                  </div>
                </div>

                {(modalRole.subtitle || isEditMode) && (
                  <p className="text-xs sm:text-sm text-[#121410]/65 italic pt-0.5">
                    <InlineEditableText
                      as="span"
                      multiline
                      value={modalRole.subtitle || 'Add role overview / context...'}
                      onSave={(val) => persistExperience(modalRole.raw, { description: val })}
                    />
                  </p>
                )}

                {(modalRole.progression.length > 0 || isEditMode) && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#4d6a10] block">
                        Career Progression
                      </span>
                      {isEditMode && !addingProgression && (
                        <button
                          type="button"
                          onClick={() => {
                            setProgressionDraft('');
                            setAddingProgression(true);
                          }}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/60 text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          <span>Add Step</span>
                        </button>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5 text-xs items-center">
                      {modalRole.progression.map((step, i, arr) => (
                        <span
                          key={i}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white border border-[#eef0ea] font-semibold text-[#121410]"
                        >
                          <InlineEditableText
                            as="span"
                            value={step}
                            onSave={async (val) => {
                              const next = [...arr];
                              next[i] = val;
                              await persistExperience(modalRole.raw, {
                                career_progression_json: JSON.stringify(next),
                              });
                            }}
                          />
                          {isEditMode && (
                            <button
                              type="button"
                              disabled={saving}
                              onClick={async () => {
                                const next = arr.filter((_, idx) => idx !== i);
                                await persistExperience(modalRole.raw, {
                                  career_progression_json: next.length ? JSON.stringify(next) : null,
                                });
                              }}
                              className="text-red-500 hover:text-red-700 cursor-pointer"
                              title="Remove step"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          )}
                          {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-[#4d6a10]" />}
                        </span>
                      ))}
                      {isEditMode && addingProgression && (
                        <div className="inline-flex items-center gap-1">
                          <input
                            type="text"
                            value={progressionDraft}
                            onChange={(e) => setProgressionDraft(e.target.value)}
                            placeholder="e.g. Senior Analyst"
                            className="px-2.5 py-1 rounded-full border border-[#4d6a10] bg-white text-xs text-[#121410] focus:outline-none w-36"
                            autoFocus
                          />
                          <button
                            type="button"
                            disabled={saving || !progressionDraft.trim()}
                            onClick={async () => {
                              const next = [...modalRole.progression, progressionDraft.trim()];
                              await persistExperience(modalRole.raw, {
                                career_progression_json: JSON.stringify(next),
                              });
                              setProgressionDraft('');
                              setAddingProgression(false);
                            }}
                            className="p-1 rounded-full bg-[#4d6a10] text-white cursor-pointer"
                            title="Add"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingProgression(false)}
                            className="p-1 rounded-full bg-[#fafcf7] border border-[#4d6a10]/20 text-[#121410]/70 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setModalExpId(null)}
                className="p-2 rounded-xl bg-white hover:bg-[#e7efcf]/50 text-[#121410]/65 hover:text-[#121410] border border-[#eef0ea] transition-colors shrink-0 cursor-pointer"
                aria-label="Close role details"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Deliverables Card Body */}
            <div className="flex-1 min-h-0 p-5 sm:p-7 space-y-4 overflow-y-auto bg-white">
              <div className="p-6 rounded-[18px] bg-[#fafcf7] border border-[#eef0ea] space-y-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#4d6a10]">
                    {modalRole.sectionHeading}
                  </h4>
                  {isEditMode && !addingDeliverable && (
                    <button
                      type="button"
                      onClick={() => {
                        setDeliverableDraft('');
                        setAddingDeliverable(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/60 text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Deliverable</span>
                    </button>
                  )}
                </div>

                <ul className="space-y-2.5 text-xs sm:text-sm text-[#121410]/90 leading-relaxed">
                  {modalRole.fullDeliverables.map((item, i) => (
                    <li key={i} className="flex items-start justify-between gap-2.5">
                      <div className="flex items-start gap-2.5 flex-1 min-w-0">
                        <CheckCircle2 className="w-4 h-4 text-[#4d6a10] shrink-0 mt-0.5" />
                        <InlineEditableText
                          as="span"
                          multiline
                          value={item}
                          onSave={async (val) => {
                            const next = [...modalRole.fullDeliverables];
                            next[i] = val;
                            await persistExperience(modalRole.raw, {
                              responsibilities_json: JSON.stringify(next),
                            });
                          }}
                        />
                      </div>
                      {isEditMode && (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={async () => {
                            const next = modalRole.fullDeliverables.filter((_, idx) => idx !== i);
                            await persistExperience(modalRole.raw, {
                              responsibilities_json: JSON.stringify(next),
                            });
                          }}
                          className="p-1 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shrink-0 cursor-pointer"
                          title="Delete deliverable"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      )}
                    </li>
                  ))}
                </ul>

                {isEditMode && addingDeliverable && (
                  <div className="p-3 rounded-[14px] border border-[#4d6a10] bg-white space-y-2">
                    <textarea
                      rows={2}
                      value={deliverableDraft}
                      onChange={(e) => setDeliverableDraft(e.target.value)}
                      placeholder="Write a new responsibility or deliverable..."
                      className={inputCls}
                      autoFocus
                    />
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        disabled={saving || !deliverableDraft.trim()}
                        onClick={async () => {
                          const next = [...modalRole.fullDeliverables, deliverableDraft.trim()];
                          await persistExperience(modalRole.raw, {
                            responsibilities_json: JSON.stringify(next),
                          });
                          setDeliverableDraft('');
                          setAddingDeliverable(false);
                        }}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#4d6a10] text-white font-mono text-[10px] font-bold cursor-pointer"
                      >
                        <Check className="w-3 h-3" /> Save Deliverable
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingDeliverable(false)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fafcf7] border border-[#4d6a10]/20 text-[#121410]/70 font-mono text-[10px] cursor-pointer"
                      >
                        <X className="w-3 h-3" /> Cancel
                      </button>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-[#eef0ea] flex flex-wrap gap-1.5 items-center">
                  {modalRole.fullTechStack.map((tech, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#e7efcf]/70 text-[#4d6a10] border border-[#4d6a10]/20"
                    >
                      <span>{tech}</span>
                      {isEditMode && (
                        <button
                          type="button"
                          disabled={saving}
                          onClick={async () => {
                            const next = modalRole.fullTechStack.filter((_, idx) => idx !== i);
                            await persistExperience(modalRole.raw, {
                              technologies_json: JSON.stringify(next),
                            });
                          }}
                          className="hover:text-red-600 cursor-pointer"
                          title="Remove tag"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </span>
                  ))}
                  {isEditMode && !addingTech && (
                    <button
                      type="button"
                      onClick={() => {
                        setTechDraft('');
                        setAddingTech(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-[#4d6a10]/50 bg-white text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Tag</span>
                    </button>
                  )}
                  {isEditMode && addingTech && (
                    <div className="inline-flex items-center gap-1">
                      <input
                        type="text"
                        value={techDraft}
                        onChange={(e) => setTechDraft(e.target.value)}
                        placeholder="e.g. GCP"
                        className="px-2.5 py-1 rounded-full border border-[#4d6a10] bg-white text-xs text-[#121410] focus:outline-none w-32"
                        autoFocus
                      />
                      <button
                        type="button"
                        disabled={saving || !techDraft.trim()}
                        onClick={async () => {
                          const next = [...modalRole.fullTechStack, techDraft.trim()];
                          await persistExperience(modalRole.raw, {
                            technologies_json: JSON.stringify(next),
                          });
                          setTechDraft('');
                          setAddingTech(false);
                        }}
                        className="p-1 rounded-full bg-[#4d6a10] text-white cursor-pointer"
                        title="Add tag"
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

              {(modalRole.outcomes.length > 0 || isEditMode) && (
                <div className="p-5 rounded-[16px] bg-[#e7efcf]/45 border border-[#4d6a10]/20 space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#4d6a10]">
                      Key Outcomes &amp; Impact
                    </span>
                    {isEditMode && !addingOutcome && (
                      <button
                        type="button"
                        onClick={() => {
                          setOutcomeDraft('');
                          setAddingOutcome(true);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-dashed border-[#4d6a10]/50 bg-white text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Outcome</span>
                      </button>
                    )}
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#121410]/85">
                    {modalRole.outcomes.map((out, i) => (
                      <li key={i} className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-2 flex-1 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#4d6a10] shrink-0 mt-1.5" />
                          <InlineEditableText
                            as="span"
                            multiline
                            value={out}
                            onSave={async (val) => {
                              const next = [...modalRole.outcomes];
                              next[i] = val;
                              await persistExperience(modalRole.raw, {
                                outcomes_json: JSON.stringify(next),
                              });
                            }}
                          />
                        </div>
                        {isEditMode && (
                          <button
                            type="button"
                            disabled={saving}
                            onClick={async () => {
                              const next = modalRole.outcomes.filter((_, idx) => idx !== i);
                              await persistExperience(modalRole.raw, {
                                outcomes_json: next.length ? JSON.stringify(next) : null,
                              });
                            }}
                            className="p-1 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shrink-0 cursor-pointer"
                            title="Delete outcome"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                  {isEditMode && addingOutcome && (
                    <div className="flex items-center gap-1.5 pt-1">
                      <input
                        type="text"
                        value={outcomeDraft}
                        onChange={(e) => setOutcomeDraft(e.target.value)}
                        placeholder="Add measurable outcome..."
                        className={inputCls}
                        autoFocus
                      />
                      <button
                        type="button"
                        disabled={saving || !outcomeDraft.trim()}
                        onClick={async () => {
                          const next = [...modalRole.outcomes, outcomeDraft.trim()];
                          await persistExperience(modalRole.raw, {
                            outcomes_json: JSON.stringify(next),
                          });
                          setOutcomeDraft('');
                          setAddingOutcome(false);
                        }}
                        className="p-1.5 rounded-lg bg-[#4d6a10] text-white cursor-pointer"
                        title="Add"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingOutcome(false)}
                        className="p-1.5 rounded-lg bg-white border border-[#4d6a10]/20 text-[#121410]/70 cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="shrink-0 px-6 sm:px-8 py-4 border-t border-[#eef0ea] bg-[#fafcf7] flex items-center justify-between gap-3">
              <span className="text-[11px] text-[#121410]/60">
                Press <kbd className="px-1.5 py-0.5 rounded bg-white border border-[#eef0ea] text-[#121410] font-semibold">ESC</kbd> to close
              </span>
              <button
                type="button"
                onClick={() => setModalExpId(null)}
                className="petalyx-btn !py-2 !px-4 !text-xs cursor-pointer"
              >
                Close Role Details
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
