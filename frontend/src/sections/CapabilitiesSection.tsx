import React, { useEffect, useMemo, useState } from 'react';
import {
  Compass, Repeat, BarChart3, Cpu, Users, Layers, CheckCircle2, X, ChevronLeft, ChevronRight,
  Plus, Trash2, Check, Pencil
} from 'lucide-react';
import DepthCarousel, { DepthCarouselItem } from '../components/depth-carousel/DepthCarousel';
import GridScan from '../components/grid-scan/GridScan';
import { InlineEditableText, useAdminEdit } from '../context/AdminEditContext';
import { adminUpdateProfile } from '../services/api';

type CapabilityIconKey = 'compass' | 'repeat' | 'chart' | 'cpu' | 'users' | 'layers';

interface CapabilityGroup {
  id: string;
  num: string;
  domainTag: string;
  title: string;
  iconKey?: CapabilityIconKey;
  summary: string;
  accent: string;
  softBg: string;
  items: string[];
}

function renderCapIcon(key?: CapabilityIconKey) {
  switch (key) {
    case 'repeat':
      return <Repeat className="w-5 h-5 text-[#4d6a10]" />;
    case 'chart':
      return <BarChart3 className="w-5 h-5 text-[#4d6a10]" />;
    case 'cpu':
      return <Cpu className="w-5 h-5 text-[#4d6a10]" />;
    case 'users':
      return <Users className="w-5 h-5 text-[#4d6a10]" />;
    case 'layers':
      return <Layers className="w-5 h-5 text-[#4d6a10]" />;
    case 'compass':
    default:
      return <Compass className="w-5 h-5 text-[#4d6a10]" />;
  }
}

const CAPABILITY_GROUPS: CapabilityGroup[] = [
  {
    id: 'product-strategy',
    num: '01',
    domainTag: 'VISION & ROADMAP',
    title: 'Product Strategy',
    iconKey: 'compass',
    summary:
      'Translating macro institutional objectives into actionable, validated product roadmaps.',
    accent: '#4d6a10',
    softBg: '#eef5df',
    items: [
      'Product Vision & Scoping',
      'Horizon Roadmapping',
      'Product Lifecycle Management (PLM)',
      'Qualitative & Quantitative Discovery',
      'Business Model Alignment & ROI',
    ],
  },
  {
    id: 'product-execution',
    num: '02',
    domainTag: 'DELIVERY RIGOR',
    title: 'Product Execution',
    iconKey: 'repeat',
    summary:
      'Managing sprint ceremonies, backlog grooming, and user story acceptance criteria.',
    accent: '#5b7d14',
    softBg: '#eaf3d6',
    items: [
      'Agile & Scrum Delivery',
      'Sprint Planning & Retrospectives',
      'Backlog Triage & Prioritization (MoSCoW)',
      'User Story Mapping & Gherkin Scenarios',
      'Release Planning & Rollout Enablement',
    ],
  },
  {
    id: 'product-analytics',
    num: '03',
    domainTag: 'DATA & TELEMETRY',
    title: 'Product Analytics',
    iconKey: 'chart',
    summary:
      'Deriving actionable operational signals from complex enterprise data schemas.',
    accent: '#6f9a0c',
    softBg: '#edf6d8',
    items: [
      'KPI & North Star Definition',
      'Executive Dashboard Engineering',
      'Power BI, Tableau & Grafana Telemetry',
      'Cohort & Funnel Performance Analysis',
      'Predictive Data Modeling in Python',
    ],
  },
  {
    id: 'technical-pm',
    num: '04',
    domainTag: 'SYSTEMS & CLOUD',
    title: 'Technical Product Management',
    iconKey: 'cpu',
    summary:
      'Engineering fluency across distributed APIs, cloud platforms, and relational databases.',
    accent: '#3f590d',
    softBg: '#e8f1d4',
    items: [
      'Enterprise ERP Architecture',
      'RESTful API & Webhook Specifications',
      'Cloud Infrastructure (GCP, AWS, Azure)',
      'Relational Database Schemas & SQL',
      'Practical AI/ML Automation Evaluation',
    ],
  },
  {
    id: 'leadership-governance',
    num: '05',
    domainTag: 'STAKEHOLDERS & SCALE',
    title: 'Leadership & Governance',
    iconKey: 'users',
    summary:
      'Uniting disparate stakeholder groups, managing high-value vendor contracts, and driving adoption.',
    accent: '#4d6a10',
    softBg: '#e7efcf',
    items: [
      'Executive Stakeholder Alignment',
      'Vendor RFP Evaluation & SLA Governance',
      'Public Sector Institutional Procurement',
      'Organizational Change Management',
      'IT Policy & Comprehensive SOP Authoring',
    ],
  },
];

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
      if (lines.length >= maxLines - 1) break;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines.slice(0, maxLines);
}

function renderCapabilitySlideImage(grp: CapabilityGroup): string {
  const width = 720;
  const height = 820;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Botanical Petalyx light card background
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(0.65, '#fafcf7');
  bg.addColorStop(1, grp.softBg);
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Architectural grid pattern
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.06)';
  ctx.lineWidth = 1;
  for (let x = 44; x < width; x += 56) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, height);
    ctx.stroke();
  }
  for (let y = 44; y < height; y += 56) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(width, y);
    ctx.stroke();
  }

  // Soft decorative concentric rings in top-right corner
  ctx.save();
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.09)';
  ctx.lineWidth = 2;
  [90, 150, 210].forEach((r) => {
    ctx.beginPath();
    ctx.arc(width - 40, 70, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();

  // Top accent bar
  const barGrad = ctx.createLinearGradient(0, 0, width, 0);
  barGrad.addColorStop(0, grp.accent);
  barGrad.addColorStop(1, '#b4cd52');
  ctx.fillStyle = barGrad;
  ctx.fillRect(0, 0, width, 14);

  // Number badge
  ctx.fillStyle = '#e7efcf';
  ctx.beginPath();
  ctx.roundRect(48, 54, 88, 56, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.28)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#4d6a10';
  ctx.font = '800 28px "JetBrains Mono", ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(grp.num, 92, 83);

  // Domain tag pill
  ctx.font = '700 18px "JetBrains Mono", ui-monospace, monospace';
  const tagW = Math.min(340, ctx.measureText(grp.domainTag).width + 44);
  ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
  ctx.beginPath();
  ctx.roundRect(width - 48 - tagW, 60, tagW, 44, 22);
  ctx.fill();
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.25)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#4d6a10';
  ctx.textAlign = 'center';
  ctx.fillText(grp.domainTag, width - 48 - tagW / 2, 83);

  // Capability Title
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#121410';
  ctx.font = '800 48px "Inter Tight", system-ui, sans-serif';
  const titleLines = wrapLines(ctx, grp.title, width - 96, 2);
  let y = 196;
  for (const line of titleLines) {
    ctx.fillText(line, 48, y);
    y += 56;
  }

  // Olive rule
  ctx.fillStyle = '#6f9a0c';
  ctx.beginPath();
  ctx.roundRect(48, y - 16, 84, 7, 4);
  ctx.fill();
  y += 28;

  // Summary
  ctx.fillStyle = 'rgba(18, 20, 16, 0.72)';
  ctx.font = '500 24px "Inter Tight", system-ui, sans-serif';
  const summaryLines = wrapLines(ctx, grp.summary, width - 96, 3);
  for (const line of summaryLines) {
    ctx.fillText(line, 48, y);
    y += 34;
  }

  y += 22;

  // Focus area preview chips (first 4 items)
  ctx.font = '600 21px "Inter Tight", system-ui, sans-serif';
  for (const item of grp.items.slice(0, 4)) {
    ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
    ctx.beginPath();
    ctx.roundRect(48, y, width - 96, 54, 14);
    ctx.fill();
    ctx.strokeStyle = 'rgba(77, 106, 16, 0.2)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Olive bullet dot
    ctx.fillStyle = '#6f9a0c';
    ctx.beginPath();
    ctx.arc(76, y + 27, 5.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#121410';
    ctx.textBaseline = 'middle';
    ctx.fillText(item, 98, y + 28, width - 166);
    y += 66;
  }

  // Footer strip
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.16)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(48, height - 74);
  ctx.lineTo(width - 48, height - 74);
  ctx.stroke();

  ctx.textBaseline = 'alphabetic';
  ctx.font = '700 17px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillStyle = 'rgba(18, 20, 16, 0.5)';
  ctx.textAlign = 'left';
  ctx.fillText('VERIFIED PM DOMAIN', 48, height - 38);
  ctx.fillStyle = '#4d6a10';
  ctx.textAlign = 'right';
  ctx.fillText(`${grp.items.length} CORE FOCUS AREAS`, width - 48, height - 38);

  return canvas.toDataURL('image/png');
}

function renderAddCapabilityCardArtwork(): string {
  const width = 640;
  const height = 740;
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
  ctx.lineWidth = 6;
  ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.roundRect(28, 28, width - 56, height - 56, 36);
  ctx.stroke();
  ctx.restore();

  ctx.fillStyle = '#4d6a10';
  ctx.beginPath();
  ctx.arc(width / 2, height / 2 - 44, 62, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(width / 2 - 26, height / 2 - 44);
  ctx.lineTo(width / 2 + 26, height / 2 - 44);
  ctx.moveTo(width / 2, height / 2 - 70);
  ctx.lineTo(width / 2, height / 2 - 18);
  ctx.stroke();

  ctx.fillStyle = '#121410';
  ctx.font = '800 40px "Inter Tight", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Add Card', width / 2, height / 2 + 72);

  ctx.fillStyle = 'rgba(77, 106, 16, 0.85)';
  ctx.font = '600 20px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillText('CLICK TO ADD CAPABILITY DOMAIN', width / 2, height / 2 + 118);

  return canvas.toDataURL('image/png');
}

const inputCls =
  'w-full px-3 py-1.5 rounded-xl border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] text-xs focus:outline-none focus:border-[#4d6a10] focus:bg-white transition-colors';

export const CapabilitiesSection: React.FC = () => {
  const { isEditMode, token, data, onRefreshData } = useAdminEdit();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Inline add focus area inside modal
  const [addingFocusItem, setAddingFocusItem] = useState(false);
  const [focusItemDraft, setFocusItemDraft] = useState('');

  // Inline add new capability domain card
  const [addingCard, setAddingCard] = useState(false);
  const [newCardDraft, setNewCardDraft] = useState({
    domainTag: '',
    title: '',
    summary: '',
    firstItem: '',
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

  const sectionBadge: string = parsedSections?.capabilitiesBadge || 'Executive Competencies';
  const sectionTitlePrefix: string = parsedSections?.capabilitiesTitlePrefix || 'Product Management';
  const sectionTitleAccent: string = parsedSections?.capabilitiesTitleAccent || 'Capabilities.';
  const sectionSubtitle: string =
    parsedSections?.capabilitiesSubtitle ||
    'A balanced synthesis of strategic vision, execution discipline, data analytics, technical depth, and executive stakeholder governance.';

  const groups: CapabilityGroup[] = useMemo(() => {
    if (Array.isArray(parsedSections?.capabilityGroups) && parsedSections.capabilityGroups.length > 0) {
      return parsedSections.capabilityGroups.map((g: CapabilityGroup, idx: number) => ({
        ...g,
        num: String(idx + 1).padStart(2, '0'),
      }));
    }
    return CAPABILITY_GROUPS;
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

  const updateGroupAt = async (idx: number, patch: Partial<CapabilityGroup>) => {
    const next = groups.map((g, i) => (i === idx ? { ...g, ...patch } : g));
    await persistSectionsPatch({ capabilityGroups: next });
  };

  // Memoize capability slide visuals; append blank "+ Add Card" in Edit Mode
  const carouselItems = useMemo<DepthCarouselItem[]>(() => {
    if (typeof document === 'undefined') return [];
    const base: DepthCarouselItem[] = groups.map((grp) => ({
      id: grp.id,
      image: renderCapabilitySlideImage(grp),
      title: grp.title,
      alt: `${grp.title} (${grp.num}) — ${grp.summary}`,
    }));
    if (isEditMode) {
      base.push({
        id: 'add-capability-card',
        image: renderAddCapabilityCardArtwork(),
        title: 'Add Card',
        alt: 'Add new capability domain card',
      });
    }
    return base;
  }, [groups, isEditMode]);

  // Close modal on Escape key (skip when typing inside an input/textarea)
  useEffect(() => {
    if (modalIndex === null) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';
      if (isTyping) return;
      if (e.key === 'Escape') setModalIndex(null);
      else if (e.key === 'ArrowRight') {
        setModalIndex((prev) => {
          const next = ((prev ?? 0) + 1) % groups.length;
          setActiveIndex(next);
          return next;
        });
      } else if (e.key === 'ArrowLeft') {
        setModalIndex((prev) => {
          const next = ((prev ?? 0) - 1 + groups.length) % groups.length;
          setActiveIndex(next);
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalIndex, groups.length]);

  const safeActiveIndex = Math.min(activeIndex, Math.max(0, groups.length - 1));
  const modalCapability = modalIndex !== null ? groups[modalIndex] || null : null;

  return (
    <section
      id="capabilities"
      className="petalyx-scope relative py-20 md:py-24 border-b border-[#eef0ea] bg-[#fafcf7] overflow-x-clip"
      style={{ color: 'var(--ink)' }}
    >
      {/* Subtle Petalyx Grid Pattern Field */}
      <div className="absolute inset-0 petalyx-sq-field pointer-events-none opacity-35 z-0" />

      {/* Interactive 3D GridScan WebGL2 Background */}
      <div className="absolute inset-0 pointer-events-none z-[1]">
        <GridScan
          lightMode={true}
          linesColor="#cbd5bc"
          scanColor="#4d6a10"
          cells={8}
          depth={3}
          scanDuration={2.4}
          scanDelay={1.6}
          clickEffect="ping"
          style={{ opacity: 0.72 }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top-Right Corner Edit Button (Visible in On-Page Edit Mode) */}
        {isEditMode && (
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={() => {
                setNewCardDraft({ domainTag: '', title: '', summary: '', firstItem: '' });
                setAddingCard(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#4d6a10] text-white hover:bg-[#3f590d] font-mono text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        )}

        {/* Centered Header */}
        <div className="mb-10 flex flex-col items-center text-center gap-3">
          <div className="inline-flex items-center gap-2 petalyx-pill">
            <Layers className="w-3.5 h-3.5 text-[#4d6a10]" />
            <InlineEditableText
              as="span"
              value={sectionBadge}
              onSave={(val) => persistSectionsPatch({ capabilitiesBadge: val })}
            />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-[#121410] tracking-tight leading-[1.15]">
            <InlineEditableText
              as="span"
              value={sectionTitlePrefix}
              onSave={(val) => persistSectionsPatch({ capabilitiesTitlePrefix: val })}
            />{' '}
            <span className="text-[#4d6a10] italic">
              <InlineEditableText
                as="span"
                value={sectionTitleAccent}
                onSave={(val) => persistSectionsPatch({ capabilitiesTitleAccent: val })}
              />
            </span>
          </h2>
          <div className="text-xs sm:text-sm text-[#121410]/70 max-w-2xl leading-relaxed">
            <InlineEditableText
              as="p"
              multiline
              value={sectionSubtitle}
              onSave={(val) => persistSectionsPatch({ capabilitiesSubtitle: val })}
            />
          </div>
          <span className="text-xs font-mono text-[#121410]/70 bg-white/90 border border-[#4d6a10]/20 px-3.5 py-1.5 rounded-full">
            Click the front card to open full details &middot; Drag, scroll, or use arrows
          </span>
        </div>

        {/* Full-Width Centered DepthCarousel */}
        <div className="max-w-5xl mx-auto relative h-[460px] sm:h-[520px] w-full">
          <DepthCarousel
            key={`${groups.map((g) => `${g.id}:${g.title}:${g.summary}:${g.items.join(',')}`).join('|')}-${isEditMode ? 'edit' : 'view'}`}
            items={carouselItems}
            activeIndex={Math.min(activeIndex, Math.max(0, carouselItems.length - 1))}
            onChange={(idx) => setActiveIndex(idx)}
            onSlideClick={(idx) => {
              if (isEditMode && idx === groups.length) {
                setNewCardDraft({ domainTag: '', title: '', summary: '', firstItem: '' });
                setAddingCard(true);
              } else {
                setModalIndex(idx);
              }
            }}
            autoplay={false}
            loop={true}
            draggable={true}
            wheel={true}
            keyboard={true}
            showControls={true}
            showIndicators={true}
            cardWidth={370}
            cardHeight={420}
            depthStep={140}
            spreadFactor={0.48}
            tiltAngle={14}
            maxBlur={3.0}
          />
        </div>

        {/* Compact Quick-Open Domain Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {groups.map((grp, idx) => {
            const isActive = idx === safeActiveIndex;
            return (
              <button
                key={grp.id}
                type="button"
                onClick={() => {
                  setActiveIndex(idx);
                  setModalIndex(idx);
                }}
                className={`text-xs font-mono px-3.5 py-1.5 rounded-full border transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-[#4d6a10] text-white border-[#4d6a10] font-bold shadow-xs'
                    : 'bg-white/90 text-[#121410]/85 border-[#4d6a10]/25 hover:border-[#4d6a10] hover:text-[#4d6a10]'
                }`}
              >
                {grp.num} &middot; {grp.title}
              </button>
            );
          })}
          {isEditMode && (
            <button
              type="button"
              onClick={() => {
                setNewCardDraft({ domainTag: '', title: '', summary: '', firstItem: '' });
                setAddingCard(true);
              }}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3.5 py-1.5 rounded-full border border-dashed border-[#4d6a10]/60 bg-[#e7efcf]/70 text-[#4d6a10] hover:bg-[#e7efcf] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Card</span>
            </button>
          )}
        </div>
      </div>

      {/* Add New Capability Card Modal */}
      {isEditMode && addingCard && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#121410]/55 backdrop-blur-sm overflow-hidden"
          role="dialog"
          aria-modal="true"
          onClick={() => setAddingCard(false)}
        >
          <div
            data-lenis-prevent
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[24px] border border-[#4d6a10]/30 bg-white shadow-2xl p-6 sm:p-7 space-y-4 text-[#121410] text-left"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#4d6a10]/15">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold block">
                  Product Management Capabilities
                </span>
                <h3 className="font-display font-extrabold text-lg text-[#121410]">
                  Add New Capability Card
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setAddingCard(false)}
                className="p-1.5 rounded-full border border-[#4d6a10]/20 bg-[#fafcf7] text-[#121410]/70 hover:bg-[#4d6a10] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                  Capability Title *
                </label>
                <input
                  type="text"
                  value={newCardDraft.title}
                  onChange={(e) => setNewCardDraft({ ...newCardDraft, title: e.target.value })}
                  placeholder="e.g. AI Product Strategy"
                  className={inputCls}
                  autoFocus
                />
              </div>
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                  Domain Tag
                </label>
                <input
                  type="text"
                  value={newCardDraft.domainTag}
                  onChange={(e) => setNewCardDraft({ ...newCardDraft, domainTag: e.target.value })}
                  placeholder="e.g. AI & AUTOMATION"
                  className={inputCls}
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                Summary *
              </label>
              <textarea
                rows={2}
                value={newCardDraft.summary}
                onChange={(e) => setNewCardDraft({ ...newCardDraft, summary: e.target.value })}
                placeholder="Short capability summary..."
                className={inputCls}
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                Key Focus Areas (comma or new-line separated)
              </label>
              <textarea
                rows={3}
                value={newCardDraft.firstItem}
                onChange={(e) => setNewCardDraft({ ...newCardDraft, firstItem: e.target.value })}
                placeholder="e.g. LLM Evaluation, Prompt Governance, Workflow Automation"
                className={inputCls}
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#4d6a10]/15">
              <button
                type="button"
                onClick={() => setAddingCard(false)}
                className="px-4 py-2 rounded-full border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] font-mono text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || !newCardDraft.title.trim() || !newCardDraft.summary.trim()}
                onClick={async () => {
                  const nextNum = String(groups.length + 1).padStart(2, '0');
                  const parsedItems = newCardDraft.firstItem
                    .split(/[\n,]+/)
                    .map((s) => s.trim())
                    .filter(Boolean);
                  const newGroup: CapabilityGroup = {
                    id: `cap-${Date.now()}`,
                    num: nextNum,
                    domainTag: (newCardDraft.domainTag.trim() || 'CORE DOMAIN').toUpperCase(),
                    title: newCardDraft.title.trim(),
                    iconKey: 'layers',
                    summary: newCardDraft.summary.trim(),
                    accent: '#4d6a10',
                    softBg: '#eef5df',
                    items: parsedItems.length > 0 ? parsedItems : ['Core Strategic Capability'],
                  };
                  const next = [...groups, newGroup];
                  await persistSectionsPatch({ capabilityGroups: next });
                  setAddingCard(false);
                  setActiveIndex(next.length - 1);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4d6a10] text-white font-mono text-xs font-bold hover:bg-[#3f590d] disabled:opacity-50 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{saving ? 'Adding...' : 'Add Capability Card'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Capability Detail Pop-Up Modal */}
      {modalCapability && modalIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#121410]/55 backdrop-blur-sm overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="capability-modal-title"
          onClick={() => setModalIndex(null)}
        >
          <div
            data-lenis-prevent
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[24px] border border-[#4d6a10]/30 bg-white shadow-2xl p-6 sm:p-8 space-y-5 text-[#121410]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#4d6a10]/15">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <span className="p-2.5 rounded-xl bg-[#e7efcf] border border-[#4d6a10]/25 shrink-0 mt-0.5">
                  {renderCapIcon(modalCapability.iconKey)}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold">
                      <InlineEditableText
                        as="span"
                        value={modalCapability.domainTag}
                        onSave={(val) => updateGroupAt(modalIndex, { domainTag: val.toUpperCase() })}
                      />
                    </span>
                    <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-[#e7efcf] text-[#4d6a10] border border-[#4d6a10]/20">
                      {modalCapability.num} / {String(groups.length).padStart(2, '0')}
                    </span>
                    {isEditMode && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#4d6a10] text-white font-bold">
                        Inline Edit
                      </span>
                    )}
                  </div>
                  <h3
                    id="capability-modal-title"
                    className="font-display font-extrabold text-xl sm:text-2xl text-[#121410] leading-tight"
                  >
                    <InlineEditableText
                      as="span"
                      value={modalCapability.title}
                      onSave={(val) => updateGroupAt(modalIndex, { title: val })}
                    />
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isEditMode && groups.length > 1 && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={async () => {
                      const ok = window.confirm(`Delete the "${modalCapability.title}" capability card?`);
                      if (!ok) return;
                      const next = groups.filter((_, i) => i !== modalIndex);
                      await persistSectionsPatch({ capabilityGroups: next });
                      setModalIndex(null);
                      setActiveIndex(0);
                    }}
                    title="Delete this capability card"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-mono text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Card</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setModalIndex(null)}
                  aria-label="Close capability details"
                  className="p-2 rounded-full border border-[#4d6a10]/20 bg-[#fafcf7] text-[#121410]/75 hover:bg-[#4d6a10] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="text-sm sm:text-base text-[#121410]/85 leading-relaxed font-medium">
              <InlineEditableText
                as="p"
                multiline
                value={modalCapability.summary}
                onSave={(val) => updateGroupAt(modalIndex, { summary: val })}
              />
            </div>

            {/* Key Focus Areas */}
            <div className="p-4 sm:p-5 rounded-[16px] bg-[#fafcf7] border border-[#4d6a10]/20 space-y-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-[#4d6a10] block">
                  Key Focus Areas
                </span>
                {isEditMode && !addingFocusItem && (
                  <button
                    type="button"
                    onClick={() => {
                      setFocusItemDraft('');
                      setAddingFocusItem(true);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/60 text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Focus Area</span>
                  </button>
                )}
              </div>
              <ul className="space-y-2.5 text-sm text-[#121410]/90 font-medium">
                {modalCapability.items.map((item, idx) => (
                  <li key={idx} className="flex items-start justify-between gap-2.5">
                    <div className="flex items-start gap-2.5 flex-1 min-w-0">
                      <CheckCircle2 className="w-4 h-4 text-[#4d6a10] shrink-0 mt-0.5" />
                      <InlineEditableText
                        as="span"
                        value={item}
                        onSave={async (val) => {
                          const nextItems = [...modalCapability.items];
                          nextItems[idx] = val;
                          await updateGroupAt(modalIndex, { items: nextItems });
                        }}
                      />
                    </div>
                    {isEditMode && (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={async () => {
                          const nextItems = modalCapability.items.filter((_, i) => i !== idx);
                          await updateGroupAt(modalIndex, { items: nextItems });
                        }}
                        className="p-1 rounded-md bg-red-50 text-red-500 hover:bg-red-500 hover:text-white shrink-0 cursor-pointer"
                        title="Delete focus area"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    )}
                  </li>
                ))}
              </ul>

              {isEditMode && addingFocusItem && (
                <div className="flex items-center gap-1.5 pt-1">
                  <input
                    type="text"
                    value={focusItemDraft}
                    onChange={(e) => setFocusItemDraft(e.target.value)}
                    placeholder="Enter new focus area..."
                    className={inputCls}
                    autoFocus
                  />
                  <button
                    type="button"
                    disabled={saving || !focusItemDraft.trim()}
                    onClick={async () => {
                      await updateGroupAt(modalIndex, {
                        items: [...modalCapability.items, focusItemDraft.trim()],
                      });
                      setFocusItemDraft('');
                      setAddingFocusItem(false);
                    }}
                    className="p-1.5 rounded-lg bg-[#4d6a10] text-white cursor-pointer"
                    title="Save"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingFocusItem(false)}
                    className="p-1.5 rounded-lg bg-white border border-[#4d6a10]/20 text-[#121410]/70 cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Footer Prev/Next Navigation */}
            <div className="pt-3 border-t border-[#4d6a10]/15 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const prev = (modalIndex - 1 + groups.length) % groups.length;
                  setActiveIndex(prev);
                  setModalIndex(prev);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-3.5 py-2 rounded-full border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] hover:border-[#4d6a10] hover:text-[#4d6a10] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="text-[11px] font-mono text-[#121410]/55">
                Verified PM Domain
              </span>

              <button
                type="button"
                onClick={() => {
                  const next = (modalIndex + 1) % groups.length;
                  setActiveIndex(next);
                  setModalIndex(next);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-3.5 py-2 rounded-full border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] hover:border-[#4d6a10] hover:text-[#4d6a10] transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
