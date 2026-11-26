import React, { useEffect, useMemo, useState } from 'react';
import {
  Sparkles, Compass, Layers, CheckCircle2, Wrench, Trophy, Maximize2,
  Plus, Trash2, Check, X, Pencil, ChevronLeft, ChevronRight
} from 'lucide-react';
import TiltedCard from '../components/tilted-card/TiltedCard';
import CircularGallery, { CircularGalleryItem } from '../components/circular-gallery/CircularGallery';
import { ProductThinkingModal } from '../components/sea-ring/ProductThinkingModal';
import { LIFECYCLE_STAGES, LifecycleStage } from '../components/sea-ring/seaRingData';
import { OptionWheel } from '../components/option-wheel/OptionWheel';
import { InlineEditableText, useAdminEdit } from '../context/AdminEditContext';
import { adminUpdateProfile } from '../services/api';

const WHEEL_STAGE_ITEMS = [
  '1. DISCOVER',
  '2. DEFINE',
  '3. STRATEGIZE',
  '4. PRIORITIZE',
  '5. DESIGN',
  '6. DEVELOP',
  '7. DELIVER',
  '8. MEASURE',
  '9. IMPROVE',
];

interface MoscowCardData {
  title: string;
  tag: string;
  subtitle: string;
  accent: string;
  pillBg: string;
  pillText: string;
  borderTint: string;
  items: string[];
}

const MOSCOW_CARDS: MoscowCardData[] = [
  {
    title: 'Must Have (P0)',
    tag: 'CRITICAL SCOPE',
    subtitle: 'Non-negotiable for release viability:',
    accent: '#b91c1c',
    pillBg: '#fef2f2',
    pillText: '#b91c1c',
    borderTint: 'rgba(185, 28, 28, 0.25)',
    items: [
      'Employee Master Service Book Database schema synchronization.',
      'CUET high-concurrency score verification and quota merit engine.',
      'Granular Role-Based Access Control (RBAC) and immutable audit log trails.',
      'TLS 1.3 encryption and automated disaster recovery daily snapshots.',
    ],
  },
  {
    title: 'Should Have (P1)',
    tag: 'HIGH VALUE',
    subtitle: 'High value, workarounds possible if necessary:',
    accent: '#b45309',
    pillBg: '#fffbeb',
    pillText: '#92400e',
    borderTint: 'rgba(180, 83, 9, 0.25)',
    items: [
      'Grafana executive telemetry dashboards for Ministry leadership.',
      'Automated leave workflow escalation and digital signatures.',
      'Batch SMS and email notifications to prospective candidates.',
    ],
  },
  {
    title: 'Could Have (P2)',
    tag: 'ENHANCEMENT',
    subtitle: 'Desirable enhancements if capacity allows:',
    accent: '#4d6a10',
    pillBg: '#e7efcf',
    pillText: '#4d6a10',
    borderTint: 'rgba(77, 106, 16, 0.28)',
    items: [
      'Native multi-lingual localized user interfaces (Hindi, Telugu).',
      'Historical attrition trend visualizers and predictive forecasting.',
      'Interactive campus tour multimedia embeds.',
    ],
  },
  {
    title: "Won't Have",
    tag: 'DEFERRED',
    subtitle: 'Explicitly deferred out of current wave scope:',
    accent: '#374151',
    pillBg: '#f3f4f6',
    pillText: '#121410',
    borderTint: 'rgba(18, 20, 16, 0.18)',
    items: [
      'Custom LMS replacement (utilize existing Moodle connectors instead).',
      'On-premise biometric hardware integrations during cloud pilot wave.',
    ],
  },
];

function wrapCanvasLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function renderMoscowCardImage(card: MoscowCardData): string {
  const width = 760;
  const height = 860;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Clean light surface
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(1, '#fafcf7');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle grid lines
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.045)';
  ctx.lineWidth = 1;
  for (let x = 48; x < width; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 48; y < height; y += 64) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Border & top accent bar
  ctx.strokeStyle = card.borderTint;
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, width - 20, height - 20);

  ctx.fillStyle = card.accent;
  ctx.fillRect(10, 10, width - 20, 14);

  // Category Pill
  ctx.font = '700 26px "JetBrains Mono", ui-monospace, monospace';
  const pillW = Math.min(420, ctx.measureText(card.title).width + 60);
  ctx.fillStyle = card.pillBg;
  ctx.beginPath();
  ctx.roundRect(52, 62, pillW, 56, 28);
  ctx.fill();
  ctx.strokeStyle = card.borderTint;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = card.pillText;
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'center';
  ctx.fillText(card.title, 52 + pillW / 2, 91);

  // Right tag
  ctx.font = '700 20px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillStyle = 'rgba(18, 20, 16, 0.45)';
  ctx.textAlign = 'right';
  ctx.fillText(card.tag, width - 52, 91);

  // Subtitle
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = card.pillText;
  ctx.font = '700 27px "JetBrains Mono", ui-monospace, monospace';
  const subLines = wrapCanvasLines(ctx, card.subtitle, width - 104);
  let y = 178;
  for (const line of subLines) {
    ctx.fillText(line, 52, y);
    y += 36;
  }

  // Divider
  y += 10;
  ctx.strokeStyle = 'rgba(18, 20, 16, 0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(52, y);
  ctx.lineTo(width - 52, y);
  ctx.stroke();
  y += 46;

  // Bullet items
  ctx.font = '500 30px "Inter Tight", system-ui, sans-serif';
  for (const item of card.items) {
    // Bullet dot
    ctx.fillStyle = card.accent;
    ctx.beginPath();
    ctx.arc(62, y - 10, 6.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'rgba(18, 20, 16, 0.88)';
    const lines = wrapCanvasLines(ctx, item, width - 144);
    for (const line of lines) {
      ctx.fillText(line, 88, y);
      y += 40;
    }
    y += 20;
  }

  // Footer
  ctx.strokeStyle = 'rgba(18, 20, 16, 0.08)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(52, height - 86);
  ctx.lineTo(width - 52, height - 86);
  ctx.stroke();

  ctx.fillStyle = 'rgba(18, 20, 16, 0.45)';
  ctx.font = '600 18px "JetBrains Mono", ui-monospace, monospace';
  ctx.textAlign = 'left';
  ctx.fillText('SAMARTH EGOV ROLLOUT', 52, height - 46);
  ctx.textAlign = 'right';
  ctx.fillStyle = card.accent;
  ctx.fillText('MOSCOW FRAMEWORK', width - 52, height - 46);

  return canvas.toDataURL('image/png');
}

function renderAddMoscowCardImage(): string {
  const width = 760;
  const height = 860;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#fafcf7');
  bg.addColorStop(1, '#eef5df');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  ctx.save();
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.55)';
  ctx.lineWidth = 7;
  ctx.setLineDash([20, 14]);
  ctx.beginPath();
  ctx.roundRect(32, 32, width - 64, height - 64, 40);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#4d6a10';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2 - 50, 72, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 11;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(width / 2 - 30, height / 2 - 50);
  ctx.lineTo(width / 2 + 30, height / 2 - 50);
  ctx.moveTo(width / 2, height / 2 - 80);
  ctx.lineTo(width / 2, height / 2 - 20);
  ctx.stroke();

  ctx.fillStyle = '#121410';
  ctx.font = '800 46px "Inter Tight", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Add Card', width / 2, height / 2 + 84);

  ctx.fillStyle = 'rgba(77, 106, 16, 0.85)';
  ctx.font = '600 22px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillText('CLICK TO ADD MOSCOW BUCKET', width / 2, height / 2 + 134);

  return canvas.toDataURL('image/png');
}

interface QuadFactor {
  title: string;
  weight: string;
  desc: string;
}

const DEFAULT_QUAD_FACTORS: QuadFactor[] = [
  {
    title: '1. Business & Institutional Impact',
    weight: '35% Weight',
    desc: 'Revenue enablement, regulatory compliance, risk elimination, audit fidelity.',
  },
  {
    title: '2. User & Stakeholder Value',
    weight: '30% Weight',
    desc: 'Reduction in administrative friction, time saved per transaction, UX delight.',
  },
  {
    title: '3. Development & Migration Effort',
    weight: '20% Weight',
    desc: 'Engineering complexity, integration dependencies, data migration load.',
  },
  {
    title: '4. Strategic Architectural Fit',
    weight: '15% Weight',
    desc: 'Reusability across campuses, cloud-native synergy, technical debt avoidance.',
  },
];

const inputCls =
  'w-full px-3 py-1.5 rounded-xl border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] text-xs focus:outline-none focus:border-[#4d6a10] focus:bg-white transition-colors';

export const ProductThinkingSection: React.FC = () => {
  const { isEditMode, token, data, onRefreshData } = useAdminEdit();
  const [saving, setSaving] = useState(false);

  // Quad-Factor inline add/edit state
  const [addingFactor, setAddingFactor] = useState(false);
  const [factorDraft, setFactorDraft] = useState<QuadFactor>({ title: '', weight: '', desc: '' });

  // MoSCoW pop-up modal & add card modal state
  const [moscowModalIdx, setMoscowModalIdx] = useState<number | null>(null);
  const [addingMoscowItemInModal, setAddingMoscowItemInModal] = useState(false);
  const [moscowItemDraft, setMoscowItemDraft] = useState('');
  const [showAddMoscowModal, setShowAddMoscowModal] = useState(false);
  const [newMoscowForm, setNewMoscowForm] = useState({
    title: '',
    tag: '',
    subtitle: '',
    itemsText: '',
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

  const stages: LifecycleStage[] = useMemo(() => {
    if (
      Array.isArray(parsedSections?.productThinkingStages) &&
      parsedSections.productThinkingStages.length === LIFECYCLE_STAGES.length
    ) {
      return parsedSections.productThinkingStages;
    }
    return LIFECYCLE_STAGES;
  }, [parsedSections]);

  const quadMatrixTitle: string = parsedSections?.quadMatrixTitle || 'Quad-Factor Scoring Matrix';
  const quadMatrixDesc: string =
    parsedSections?.quadMatrixDesc ||
    'Every roadmap candidate is scored objectively across four distinct vectors to ensure strategic alignment and eliminate subjective bias.';
  const quadFactors: QuadFactor[] = useMemo(() => {
    if (Array.isArray(parsedSections?.quadFactors) && parsedSections.quadFactors.length > 0) {
      return parsedSections.quadFactors;
    }
    return DEFAULT_QUAD_FACTORS;
  }, [parsedSections]);

  const moscowTitle: string = parsedSections?.moscowTitle || 'MoSCoW Backlog Categorization';
  const moscowDesc: string =
    parsedSections?.moscowDesc ||
    'Real-world categorization applied during the Samarth eGov national rollout to protect release velocity.';
  const moscowCards: MoscowCardData[] = useMemo(() => {
    if (Array.isArray(parsedSections?.moscowCards) && parsedSections.moscowCards.length > 0) {
      return parsedSections.moscowCards;
    }
    return MOSCOW_CARDS;
  }, [parsedSections]);

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

  // Active stage index synced with OptionWheel & live detail panel
  const [activeStageIndex, setActiveStageIndex] = useState<number>(0);

  // Modal State for 9-Point Phase Pop-up Detail Cards (track by ID so edits refresh live)
  const [activeModalStageId, setActiveModalStageId] = useState<string | null>(null);

  const currentWheelStage = stages[activeStageIndex] || stages[0];
  const activeModalStage = activeModalStageId ? stages.find((s) => s.id === activeModalStageId) || null : null;

  const moscowGalleryItems = useMemo<CircularGalleryItem[]>(() => {
    if (typeof document === 'undefined') return [];
    const base: CircularGalleryItem[] = moscowCards.map((card) => ({
      image: renderMoscowCardImage(card),
      text: card.title,
      alt: `${card.title} — ${card.subtitle}`,
    }));
    if (isEditMode) {
      base.push({
        image: renderAddMoscowCardImage(),
        text: '+ Add Card',
        alt: 'Add new MoSCoW category card',
      });
    }
    return base;
  }, [moscowCards, isEditMode]);

  // Close MoSCoW modal on Escape / navigate with arrows (skip when typing)
  useEffect(() => {
    if (moscowModalIdx === null || moscowCards.length === 0) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (e.key === 'Escape') setMoscowModalIdx(null);
      else if (e.key === 'ArrowRight') {
        setMoscowModalIdx((prev) => ((prev ?? 0) + 1) % moscowCards.length);
      } else if (e.key === 'ArrowLeft') {
        setMoscowModalIdx((prev) => ((prev ?? 0) - 1 + moscowCards.length) % moscowCards.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [moscowModalIdx, moscowCards.length]);

  const activeMoscowCard = moscowModalIdx !== null ? moscowCards[moscowModalIdx] || null : null;

  const handleOpenStageModal = (stage: LifecycleStage) => {
    const idx = stages.findIndex((s) => s.id === stage.id);
    if (idx !== -1) setActiveStageIndex(idx);
    setActiveModalStageId(stage.id);
  };

  const handleNextStage = () => {
    if (!activeModalStage) return;
    const currentIndex = stages.findIndex((s) => s.id === activeModalStage.id);
    const nextIndex = (currentIndex + 1) % stages.length;
    setActiveStageIndex(nextIndex);
    setActiveModalStageId(stages[nextIndex].id);
  };

  const handlePrevStage = () => {
    if (!activeModalStage) return;
    const currentIndex = stages.findIndex((s) => s.id === activeModalStage.id);
    const prevIndex = (currentIndex - 1 + stages.length) % stages.length;
    setActiveStageIndex(prevIndex);
    setActiveModalStageId(stages[prevIndex].id);
  };

  const handleSaveStage = async (updatedStage: LifecycleStage) => {
    const nextStages = stages.map((s) => (s.id === updatedStage.id ? updatedStage : s));
    await persistSectionsPatch({ productThinkingStages: nextStages });
  };

  return (
    <section
      id="product-thinking"
      className="petalyx-scope py-20 md:py-24 border-b border-[#eef0ea] relative overflow-x-clip bg-white text-[#121410]"
      style={{ color: 'var(--ink)' }}
    >
      {/* Subtle Petalyx Grid Pattern Field */}
      <div className="absolute inset-0 petalyx-sq-field pointer-events-none opacity-40 z-0" />

      {/* ========================================================
          SECTION HEADER (Centered in max-w-7xl)
      ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mb-12">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="flex flex-col items-center space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 petalyx-pill">
              <Sparkles className="w-3.5 h-3.5 text-[#4d6a10]" />
              <span>Methodology &amp; Product Philosophy</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#121410] font-display tracking-tight leading-[1.15]">
              How I Think <span className="text-[#4d6a10] italic">About Products.</span>
            </h2>

            <p className="text-sm sm:text-base text-[#121410]/70 leading-relaxed">
              A disciplined, human-centric lifecycle balancing empathy with engineering rigor. Scroll, drag, or click the 9-stage Option Wheel below to inspect comprehensive objectives, deliverables, and governance tools.
            </p>
          </div>

          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-mono text-[#121410]/65 bg-[#fafcf7] border border-[#eef0ea] px-3.5 py-1.5 rounded-full">
              9 Strategic Lifecycle Stages &middot; Interactive Lifecycle Dial
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================
          1. INTERACTIVE 9-STAGE OPTION WHEEL & SYNCED DETAIL CARD (FULL WIDTH)
      ======================================================== */}
      <div className="w-full relative z-10 mb-16">
        <div className="w-full bg-[#fafcf7] border-y border-[#4d6a10]/20 shadow-sm overflow-hidden text-[#121410]">
          <div className="grid lg:grid-cols-12 items-stretch">
            {/* Left Column: Bounded OptionWheel */}
            <div className="lg:col-span-5 h-[360px] sm:h-[420px] px-4 sm:px-8 py-4 border-b lg:border-b-0 lg:border-r border-[#4d6a10]/20 bg-[#fafcf7] overflow-x-clip">
              <OptionWheel
                items={WHEEL_STAGE_ITEMS}
                activeIndex={activeStageIndex}
                onChange={(idx) => setActiveStageIndex(idx)}
                onSelectActive={(idx) => {
                  const stage = stages[idx];
                  if (stage) handleOpenStageModal(stage);
                }}
                textColor="#45503f"
                activeColor="#4d6a10"
                side="left"
                fontSize={27}
                spacing={56}
                curve={22}
                tilt={11}
                blur={1.4}
                fade={true}
                minOpacity={0.3}
                smoothing={0.14}
                inset={46}
                loop={true}
                draggable={true}
              />
            </div>

            {/* Right Column: Synced Stage Detail Card */}
            <div className="lg:col-span-7 p-6 sm:p-8 lg:px-12 flex flex-col justify-between gap-5 bg-white">
              <div className="space-y-5">
                {/* Header + Pop-up Trigger */}
                <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-[#4d6a10]/20">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#e7efcf] text-[#4d6a10] border border-[#4d6a10]/30">
                        STAGE {currentWheelStage.num}
                      </span>
                      <span className="text-xs text-[#121410]/80 uppercase tracking-wider font-semibold">
                        {currentWheelStage.badge}
                      </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl font-extrabold text-[#121410] tracking-tight">
                      {currentWheelStage.name}
                    </h3>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenStageModal(currentWheelStage)}
                    className="petalyx-btn !py-2 !px-4 !text-xs shrink-0 cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-white" />
                    <span>Open Pop-Up Details</span>
                  </button>
                </div>

                {/* Strategic Objective */}
                <div className="p-4 rounded-[16px] bg-[#fafcf7] border border-[#4d6a10]/25 shadow-2xs flex items-start gap-2.5">
                  <Compass className="w-4 h-4 text-[#4d6a10] shrink-0 mt-0.5" />
                  <div className="text-sm text-[#121410] leading-relaxed font-medium">
                    <span className="text-xs uppercase tracking-wider font-bold text-[#4d6a10] block mb-0.5">
                      Strategic Objective
                    </span>
                    {currentWheelStage.objective}
                  </div>
                </div>

                {/* Activities & Deliverables Grid */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-[16px] bg-[#fafcf7] border border-[#4d6a10]/25 shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4d6a10]">
                      <Layers className="w-3.5 h-3.5" />
                      <span>Core Activities</span>
                    </div>
                    <ul className="space-y-2 text-sm text-[#121410]/90 leading-relaxed">
                      {currentWheelStage.activities.map((act, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#6f9a0c] mt-2 shrink-0" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-[16px] bg-[#fafcf7] border border-[#4d6a10]/25 shadow-2xs space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#4d6a10]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Concrete Deliverables</span>
                    </div>
                    <ul className="space-y-2 text-sm text-[#121410]/90 leading-relaxed">
                      {currentWheelStage.deliverables.map((del, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#4d6a10] shrink-0 mt-0.5" />
                          <span>{del}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Tools & Expected Outcome Footer */}
              <div className="space-y-3 pt-3 border-t border-[#4d6a10]/20">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="inline-flex items-center gap-1 text-xs font-bold uppercase tracking-wider text-[#121410]/80 mr-1">
                    <Wrench className="w-3.5 h-3.5 text-[#4d6a10]" />
                    Tools:
                  </span>
                  {currentWheelStage.tools.map((tool, i) => (
                    <span
                      key={i}
                      className="text-xs px-3 py-1 rounded-full bg-[#fafcf7] border border-[#4d6a10]/25 text-[#121410] font-medium"
                    >
                      {tool}
                    </span>
                  ))}
                </div>

                <div className="p-3.5 rounded-[16px] bg-[#e7efcf]/65 border border-[#4d6a10]/30 shadow-2xs flex items-start gap-2">
                  <Trophy className="w-4 h-4 text-[#4d6a10] shrink-0 mt-0.5" />
                  <p className="text-sm text-[#121410] leading-relaxed font-medium">
                    <strong className="text-[#4d6a10]">Outcome: </strong>
                    {currentWheelStage.outcome}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. QUAD-FACTOR SCORING & MOSCOW SIMULATOR (Contained in max-w-7xl)
      ======================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="pt-8 border-t border-[#eef0ea] grid lg:grid-cols-12 gap-8 items-start">
          
          {/* Prioritization Decision Engine (5 cols) — wrapped in TiltedCard */}
          <div className="lg:col-span-5">
            <TiltedCard
              containerWidth="100%"
              containerHeight="auto"
              imageWidth="100%"
              imageHeight="auto"
              rotateAmplitude={8}
              scaleOnHover={1.03}
              glare={0.3}
              glareColor="#ffffff"
              shadow={0.4}
              radius={22}
              smoothness={0.65}
              parallax={0.6}
              captionText="Quad-Factor Scoring Matrix"
              showTooltip={true}
              intro={true}
              introDelay={200}
              floating={false}
              gyroscope={false}
              style={{ background: '#fafcf7', border: '1px solid #eef0ea', boxSizing: 'border-box' }}
            >
              <div className="p-6 sm:p-7 space-y-4">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold block">
                  Prioritization Decision Engine
                </span>
                <h3 className="font-display font-bold text-xl text-[#121410]">
                  <InlineEditableText
                    as="span"
                    value={quadMatrixTitle}
                    onSave={(val) => persistSectionsPatch({ quadMatrixTitle: val })}
                  />
                </h3>
                <div className="text-xs sm:text-sm text-[#121410]/70 leading-relaxed">
                  <InlineEditableText
                    as="p"
                    multiline
                    value={quadMatrixDesc}
                    onSave={(val) => persistSectionsPatch({ quadMatrixDesc: val })}
                  />
                </div>

                <div className="space-y-3 pt-2 text-xs">
                  {quadFactors.map((factor, idx) => (
                    <div key={idx} className="p-3.5 rounded-[14px] border border-[#eef0ea] bg-white shadow-2xs relative group/qf">
                      <div className="flex justify-between items-start gap-2 font-mono font-semibold text-[#121410]">
                        <InlineEditableText
                          as="span"
                          value={factor.title}
                          onSave={async (val) => {
                            const next = [...quadFactors];
                            next[idx] = { ...factor, title: val };
                            await persistSectionsPatch({ quadFactors: next });
                          }}
                        />
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[#4d6a10] font-bold">
                            <InlineEditableText
                              as="span"
                              value={factor.weight}
                              onSave={async (val) => {
                                const next = [...quadFactors];
                                next[idx] = { ...factor, weight: val };
                                await persistSectionsPatch({ quadFactors: next });
                              }}
                            />
                          </span>
                          {isEditMode && quadFactors.length > 1 && (
                            <button
                              type="button"
                              disabled={saving}
                              onClick={async () => {
                                const next = quadFactors.filter((_, i) => i !== idx);
                                await persistSectionsPatch({ quadFactors: next });
                              }}
                              title="Delete factor"
                              className="p-1 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white cursor-pointer"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="text-[11px] text-[#121410]/65 mt-1">
                        <InlineEditableText
                          as="p"
                          multiline
                          value={factor.desc}
                          onSave={async (val) => {
                            const next = [...quadFactors];
                            next[idx] = { ...factor, desc: val };
                            await persistSectionsPatch({ quadFactors: next });
                          }}
                        />
                      </div>
                    </div>
                  ))}

                  {isEditMode && (
                    addingFactor ? (
                      <div className="p-3.5 rounded-[14px] border border-[#4d6a10] bg-white space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="text"
                            value={factorDraft.title}
                            onChange={(e) => setFactorDraft({ ...factorDraft, title: e.target.value })}
                            placeholder="e.g. 5. Security & Compliance"
                            className={inputCls}
                            autoFocus
                          />
                          <input
                            type="text"
                            value={factorDraft.weight}
                            onChange={(e) => setFactorDraft({ ...factorDraft, weight: e.target.value })}
                            placeholder="e.g. 10% Weight"
                            className={inputCls}
                          />
                        </div>
                        <textarea
                          rows={2}
                          value={factorDraft.desc}
                          onChange={(e) => setFactorDraft({ ...factorDraft, desc: e.target.value })}
                          placeholder="Describe scoring criteria..."
                          className={inputCls}
                        />
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={saving || !factorDraft.title.trim()}
                            onClick={async () => {
                              const next = [
                                ...quadFactors,
                                {
                                  title: factorDraft.title.trim(),
                                  weight: factorDraft.weight.trim() || '10% Weight',
                                  desc: factorDraft.desc.trim(),
                                },
                              ];
                              await persistSectionsPatch({ quadFactors: next });
                              setFactorDraft({ title: '', weight: '', desc: '' });
                              setAddingFactor(false);
                            }}
                            className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#4d6a10] text-white font-mono text-[10px] font-bold cursor-pointer"
                          >
                            <Check className="w-3 h-3" /> Save Factor
                          </button>
                          <button
                            type="button"
                            onClick={() => setAddingFactor(false)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#fafcf7] border border-[#4d6a10]/20 text-[#121410]/70 font-mono text-[10px] cursor-pointer"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setFactorDraft({ title: '', weight: '', desc: '' });
                          setAddingFactor(true);
                        }}
                        className="w-full py-2 rounded-[14px] border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/45 hover:bg-[#e7efcf] text-[#4d6a10] font-mono text-[11px] font-bold inline-flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Scoring Factor</span>
                      </button>
                    )
                  )}
                </div>
              </div>
            </TiltedCard>
          </div>

          {/* Interactive MoSCoW Simulator (7 cols) */}
          <div className="lg:col-span-7 p-6 sm:p-7 rounded-[22px] border border-[#eef0ea] bg-[#fafcf7] shadow-xs space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold block">
                  Interactive Practice
                </span>
                <h3 className="font-display font-bold text-xl text-[#121410]">
                  <InlineEditableText
                    as="span"
                    value={moscowTitle}
                    onSave={(val) => persistSectionsPatch({ moscowTitle: val })}
                  />
                </h3>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-xs font-mono text-[#4d6a10] bg-[#e7efcf] border border-[#4d6a10]/20 px-3 py-1 rounded-full font-semibold">
                  Live Framework
                </span>
                {isEditMode && (
                  <button
                    type="button"
                    onClick={() => {
                      setNewMoscowForm({ title: '', tag: '', subtitle: '', itemsText: '' });
                      setShowAddMoscowModal(true);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3.5 py-1.5 rounded-full bg-[#4d6a10] text-white hover:bg-[#3f590d] transition-colors cursor-pointer shadow-xs"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                )}
              </div>
            </div>
            <div className="text-xs sm:text-sm text-[#121410]/70 leading-relaxed">
              <InlineEditableText
                as="p"
                multiline
                value={moscowDesc}
                onSave={(val) => persistSectionsPatch({ moscowDesc: val })}
              />
            </div>

            {/* CircularGallery of the MoSCoW Cards */}
            <div className="relative w-full h-[460px] sm:h-[520px] pt-1">
              <CircularGallery
                key={`${JSON.stringify(moscowCards)}-${isEditMode ? 'edit' : 'view'}`}
                items={moscowGalleryItems}
                bend={0}
                textColor="#121410"
                borderRadius={0.05}
                scrollEase={0.05}
                gap={0.16}
                wave={0}
                fadeEdges={0.1}
                autoScroll={isEditMode ? 0 : 1.1}
                itemSize={1.05}
                itemAspect={760 / 860}
                shadow={0.22}
                showTitles={true}
                openOnClick={false}
                onItemClick={(_, idx) => {
                  const normalized = idx % moscowGalleryItems.length;
                  if (isEditMode && normalized === moscowCards.length) {
                    setNewMoscowForm({ title: '', tag: '', subtitle: '', itemsText: '' });
                    setShowAddMoscowModal(true);
                  } else if (normalized < moscowCards.length) {
                    setMoscowModalIdx(normalized);
                  }
                }}
              />
            </div>

            {/* Quick-Open MoSCoW Pills + Add Card */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              {moscowCards.map((card, idx) => (
                <button
                  key={`${card.title}-${idx}`}
                  type="button"
                  onClick={() => setMoscowModalIdx(idx)}
                  className="inline-flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded-full border border-[#4d6a10]/25 bg-white text-[#121410]/85 hover:bg-[#4d6a10] hover:text-white hover:border-[#4d6a10] transition-colors cursor-pointer shadow-2xs"
                >
                  <span>{String(idx + 1).padStart(2, '0')}</span>
                  <span>&middot;</span>
                  <span>{card.title}</span>
                  <span className="opacity-70">({card.items.length})</span>
                </button>
              ))}
              {isEditMode && (
                <button
                  type="button"
                  onClick={() => {
                    setNewMoscowForm({ title: '', tag: '', subtitle: '', itemsText: '' });
                    setShowAddMoscowModal(true);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3.5 py-1.5 rounded-full border border-dashed border-[#4d6a10]/60 bg-[#e7efcf]/70 text-[#4d6a10] hover:bg-[#e7efcf] transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Card</span>
                </button>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* ========================================================
          4. 9-POINT PHASE POP-UP DETAIL MODAL
      ======================================================== */}
      <ProductThinkingModal
        stage={activeModalStage}
        onClose={() => setActiveModalStageId(null)}
        onSelectNext={handleNextStage}
        onSelectPrev={handlePrevStage}
        onSaveStage={handleSaveStage}
      />

      {/* MoSCoW Card Detail Pop-Up Modal (WITH ON-PAGE EDIT & DELETE) */}
      {activeMoscowCard && moscowModalIdx !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#121410]/55 backdrop-blur-sm overflow-hidden"
          role="dialog"
          aria-modal="true"
          onClick={() => setMoscowModalIdx(null)}
        >
          <div
            data-lenis-prevent
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[24px] border border-[#4d6a10]/30 bg-white shadow-2xl p-6 sm:p-8 space-y-5 text-[#121410]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#4d6a10]/15">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span
                    className="text-[11px] font-mono uppercase tracking-wider px-2.5 py-0.5 rounded-full font-bold border"
                    style={{
                      backgroundColor: activeMoscowCard.pillBg,
                      color: activeMoscowCard.pillText,
                      borderColor: activeMoscowCard.borderTint,
                    }}
                  >
                    <InlineEditableText
                      as="span"
                      value={activeMoscowCard.tag}
                      onSave={async (val) => {
                        const next = [...moscowCards];
                        next[moscowModalIdx] = { ...activeMoscowCard, tag: val.toUpperCase() };
                        await persistSectionsPatch({ moscowCards: next });
                      }}
                    />
                  </span>
                  <span className="text-[11px] font-mono text-[#121410]/55">
                    {String(moscowModalIdx + 1).padStart(2, '0')} / {String(moscowCards.length).padStart(2, '0')}
                  </span>
                  {isEditMode && (
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#4d6a10] text-white font-bold">
                      Inline Edit
                    </span>
                  )}
                </div>
                <h3 className="font-display font-extrabold text-xl sm:text-2xl text-[#121410] leading-tight">
                  <InlineEditableText
                    as="span"
                    value={activeMoscowCard.title}
                    onSave={async (val) => {
                      const next = [...moscowCards];
                      next[moscowModalIdx] = { ...activeMoscowCard, title: val };
                      await persistSectionsPatch({ moscowCards: next });
                    }}
                  />
                </h3>
                <div className="text-xs sm:text-sm text-[#121410]/70 mt-1">
                  <InlineEditableText
                    as="p"
                    multiline
                    value={activeMoscowCard.subtitle}
                    onSave={async (val) => {
                      const next = [...moscowCards];
                      next[moscowModalIdx] = { ...activeMoscowCard, subtitle: val };
                      await persistSectionsPatch({ moscowCards: next });
                    }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isEditMode && moscowCards.length > 1 && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={async () => {
                      const ok = window.confirm(`Delete the "${activeMoscowCard.title}" MoSCoW card?`);
                      if (!ok) return;
                      const next = moscowCards.filter((_, i) => i !== moscowModalIdx);
                      await persistSectionsPatch({ moscowCards: next });
                      setMoscowModalIdx(null);
                    }}
                    title="Delete this card"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-mono text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Card</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setMoscowModalIdx(null)}
                  aria-label="Close MoSCoW card details"
                  className="p-2 rounded-full border border-[#4d6a10]/20 bg-[#fafcf7] text-[#121410]/75 hover:bg-[#4d6a10] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-5 rounded-[16px] bg-[#fafcf7] border border-[#4d6a10]/20 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#4d6a10]">
                  Backlog Scope Items ({activeMoscowCard.items.length})
                </span>
                {isEditMode && !addingMoscowItemInModal && (
                  <button
                    type="button"
                    onClick={() => {
                      setMoscowItemDraft('');
                      setAddingMoscowItemInModal(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/60 text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Item</span>
                  </button>
                )}
              </div>

              <ul className="space-y-2.5 text-sm text-[#121410]/90 font-medium">
                {activeMoscowCard.items.map((item, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-[#4d6a10] shrink-0 mt-0.5" />
                      <InlineEditableText
                        as="span"
                        multiline
                        value={item}
                        onSave={async (val) => {
                          const next = [...moscowCards];
                          const nextItems = [...activeMoscowCard.items];
                          nextItems[idx] = val;
                          next[moscowModalIdx] = { ...activeMoscowCard, items: nextItems };
                          await persistSectionsPatch({ moscowCards: next });
                        }}
                      />
                    </div>
                    {isEditMode && (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={async () => {
                          const next = [...moscowCards];
                          next[moscowModalIdx] = {
                            ...activeMoscowCard,
                            items: activeMoscowCard.items.filter((_, i) => i !== idx),
                          };
                          await persistSectionsPatch({ moscowCards: next });
                        }}
                        className="p-1 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shrink-0 cursor-pointer"
                        title="Delete item"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {isEditMode && addingMoscowItemInModal && (
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={moscowItemDraft}
                    onChange={(e) => setMoscowItemDraft(e.target.value)}
                    placeholder="Enter new backlog scope item..."
                    className={inputCls}
                    autoFocus
                  />
                  <button
                    type="button"
                    disabled={saving || !moscowItemDraft.trim()}
                    onClick={async () => {
                      const next = [...moscowCards];
                      next[moscowModalIdx] = {
                        ...activeMoscowCard,
                        items: [...activeMoscowCard.items, moscowItemDraft.trim()],
                      };
                      await persistSectionsPatch({ moscowCards: next });
                      setMoscowItemDraft('');
                      setAddingMoscowItemInModal(false);
                    }}
                    className="p-1.5 rounded-lg bg-[#4d6a10] text-white cursor-pointer"
                    title="Save"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingMoscowItemInModal(false)}
                    className="p-1.5 rounded-lg bg-white border border-[#4d6a10]/20 text-[#121410]/70 cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-[#4d6a10]/15 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setMoscowModalIdx((moscowModalIdx - 1 + moscowCards.length) % moscowCards.length)}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-3.5 py-2 rounded-full border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] hover:border-[#4d6a10] hover:text-[#4d6a10] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>
              <span className="text-[11px] font-mono text-[#121410]/55">MoSCoW Framework</span>
              <button
                type="button"
                onClick={() => setMoscowModalIdx((moscowModalIdx + 1) % moscowCards.length)}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-3.5 py-2 rounded-full border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] hover:border-[#4d6a10] hover:text-[#4d6a10] transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New MoSCoW Card Modal */}
      {isEditMode && showAddMoscowModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#121410]/55 backdrop-blur-sm overflow-hidden"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowAddMoscowModal(false)}
        >
          <div
            data-lenis-prevent
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[24px] border border-[#4d6a10]/30 bg-white shadow-2xl p-6 sm:p-7 space-y-4 text-[#121410]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#4d6a10]/15">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold block">
                  MoSCoW Backlog Categorization
                </span>
                <h3 className="font-display font-extrabold text-lg text-[#121410]">
                  Add New MoSCoW Card
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAddMoscowModal(false)}
                className="p-1.5 rounded-full border border-[#4d6a10]/20 bg-[#fafcf7] text-[#121410]/70 hover:bg-[#4d6a10] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                  Card Title *
                </label>
                <input
                  type="text"
                  value={newMoscowForm.title}
                  onChange={(e) => setNewMoscowForm({ ...newMoscowForm, title: e.target.value })}
                  placeholder="e.g. Fast Follow (P1.5)"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                  Tag Badge
                </label>
                <input
                  type="text"
                  value={newMoscowForm.tag}
                  onChange={(e) => setNewMoscowForm({ ...newMoscowForm, tag: e.target.value })}
                  placeholder="e.g. NEXT WAVE"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={newMoscowForm.subtitle}
                onChange={(e) => setNewMoscowForm({ ...newMoscowForm, subtitle: e.target.value })}
                placeholder="e.g. Scheduled immediately post-launch:"
                className={inputCls}
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                Scope Items (one per line) *
              </label>
              <textarea
                rows={4}
                value={newMoscowForm.itemsText}
                onChange={(e) => setNewMoscowForm({ ...newMoscowForm, itemsText: e.target.value })}
                placeholder="Enter each item on a new line..."
                className={inputCls}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#4d6a10]/15">
              <button
                type="button"
                onClick={() => setShowAddMoscowModal(false)}
                className="px-4 py-2 rounded-full border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] font-mono text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || !newMoscowForm.title.trim()}
                onClick={async () => {
                  const items = newMoscowForm.itemsText
                    .split('\n')
                    .map((s) => s.trim())
                    .filter(Boolean);
                  const newCard: MoscowCardData = {
                    title: newMoscowForm.title.trim(),
                    tag: (newMoscowForm.tag.trim() || 'PRIORITY').toUpperCase(),
                    subtitle: newMoscowForm.subtitle.trim() || 'Prioritized release scope:',
                    accent: '#4d6a10',
                    pillBg: '#e7efcf',
                    pillText: '#4d6a10',
                    borderTint: 'rgba(77, 106, 16, 0.28)',
                    items: items.length > 0 ? items : ['Key prioritized scope item.'],
                  };
                  await persistSectionsPatch({ moscowCards: [...moscowCards, newCard] });
                  setShowAddMoscowModal(false);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4d6a10] text-white font-mono text-xs font-bold hover:bg-[#3f590d] disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{saving ? 'Adding...' : 'Add MoSCoW Card'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
