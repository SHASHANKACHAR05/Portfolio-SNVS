import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Target, Cpu, Users2, Sparkles, Quote, Building2, Award, Layers,
  Plus, Pencil, Trash2, Check, X
} from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Profile } from '../types';
import { InlineEditableText, useAdminEdit } from '../context/AdminEditContext';
import { adminUpdateProfile } from '../services/api';

gsap.registerPlugin(ScrollTrigger);

interface AboutSectionProps {
  profile: Profile | null;
}

type PillarIconKey = 'target' | 'cpu' | 'users' | 'sparkles' | 'award' | 'layers';

interface AboutPillar {
  title: string;
  desc: string;
  stat: string;
  iconKey?: PillarIconKey;
}

interface AboutOrg {
  name: string;
  subtitle: string;
}

interface AboutContent {
  badgeText: string;
  headingPrefix: string;
  headingAccent: string;
  paragraphs: string[];
  orgBandTitle: string;
  orgBand: AboutOrg[];
  dimensionsTitle: string;
  pillars: AboutPillar[];
  highlightTitle: string;
  highlightSubtitle: string;
  highlightBadge: string;
}

const DEFAULT_ABOUT_CONTENT: AboutContent = {
  badgeText: 'Executive Profile & Leadership Journey',
  headingPrefix: 'Product leadership forged at',
  headingAccent: 'national enterprise scale.',
  paragraphs: [
    "Over the past decade, I have focused on building resilient technology foundations for institutions that serve millions. My career spans the end-to-end product lifecycle of nationwide higher education ERP deployments, directing mission-critical digital operations for India's national film corporation, and architecting multi-campus cloud infrastructure.",
    "At **Samarth eGov (Ministry of Education / Delhi University)**, I experienced rapid career progression—earning 4 promotions in under 4 years from Rollout Support Executive to Senior Analyst. In this role, I served as Product Owner for 10+ core modules across 1,200+ universities, authored 30 module manuals, and engineered high-concurrency CUET admissions for five premier central universities simultaneously.",
    "As **Head of IT at NFDC India (Mumbai)**, I led the digital preservation of 2M+ historic cinematic documents, consolidated 13+ fragmented agency websites into a singular modern portal, implemented NIC eOffice across regional offices, and spearheaded technology command centers for Asia’s oldest film festival (IFFI 2023 & 2024).",
    "Today, as **Senior Manager, Technology at Group of Institutions (Bengaluru)**, I lead system architecture and cloud ERP modernization across multi-board school campuses (CBSE, ICSE, Cambridge IGCSE), leveraging GCP-native services, strict cybersecurity benchmarks, and data privacy governance."
  ],
  orgBandTitle: 'Key Organizations & National Mandates',
  orgBand: [
    { name: 'Samarth eGov', subtitle: 'Ministry of Education & DU' },
    { name: 'NFDC India', subtitle: 'Ministry of Information & Broadcasting' },
    { name: 'IFFI Goa', subtitle: "Asia's Premier Film Festival" },
    { name: 'Group of Institutions', subtitle: 'Multi-Board K-12 Campuses' }
  ],
  dimensionsTitle: 'Key Leadership Dimensions',
  pillars: [
    {
      title: 'Product Strategy & Lifecycle Ownership',
      desc: 'Defining vision, sprint backlogs, user acceptance criteria, and roadmaps that align cross-functional engineers with organizational objectives.',
      iconKey: 'target',
      stat: '10+ Modules'
    },
    {
      title: 'National & Enterprise ERP Scale',
      desc: 'Proven execution across 1,200+ institutions and 45+ enterprise modules covering admissions, academics, HR, and digital governance.',
      iconKey: 'cpu',
      stat: '1,200+ Institutions'
    },
    {
      title: 'Executive & Vendor Governance',
      desc: 'Bridge between senior ministry leadership, university registrars, external solution vendors, and technical engineering pods.',
      iconKey: 'users',
      stat: '150+ Central Univs'
    },
    {
      title: 'Cloud & AI-Enabled Architecture',
      desc: 'Driving migrations from on-prem to GCP-native infrastructure, implementing DPDP compliance, and pragmatically evaluating AI tools.',
      iconKey: 'sparkles',
      stat: 'Multi-Campus Cloud'
    }
  ],
  highlightTitle: 'Project Management Professional',
  highlightSubtitle: 'PMI Certified · Agile / Scrum Certified',
  highlightBadge: 'Global Standard'
};

const ICON_OPTIONS: { key: PillarIconKey; label: string }[] = [
  { key: 'target', label: 'Target' },
  { key: 'cpu', label: 'Systems / CPU' },
  { key: 'users', label: 'Leadership / Users' },
  { key: 'sparkles', label: 'AI / Innovation' },
  { key: 'award', label: 'Award / Quality' },
  { key: 'layers', label: 'Architecture / Layers' },
];

function renderPillarIcon(key?: PillarIconKey) {
  switch (key) {
    case 'cpu':
      return <Cpu className="w-5 h-5 text-[#4d6a10]" />;
    case 'users':
      return <Users2 className="w-5 h-5 text-[#4d6a10]" />;
    case 'sparkles':
      return <Sparkles className="w-5 h-5 text-[#4d6a10]" />;
    case 'award':
      return <Award className="w-5 h-5 text-[#4d6a10]" />;
    case 'layers':
      return <Layers className="w-5 h-5 text-[#4d6a10]" />;
    case 'target':
    default:
      return <Target className="w-5 h-5 text-[#4d6a10]" />;
  }
}

/** Renders **bold** inline segments cleanly */
function renderRichParagraph(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, idx) => {
    if (part.startsWith('**') && part.endsWith('**') && part.length > 4) {
      return (
        <strong key={idx} className="text-[#121410] font-semibold">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={idx}>{part}</React.Fragment>;
  });
}

function parseAboutContent(raw?: string | null): AboutContent {
  if (!raw) return DEFAULT_ABOUT_CONTENT;
  try {
    const parsed = JSON.parse(raw);
    return {
      badgeText: typeof parsed.badgeText === 'string' ? parsed.badgeText : DEFAULT_ABOUT_CONTENT.badgeText,
      headingPrefix: typeof parsed.headingPrefix === 'string' ? parsed.headingPrefix : DEFAULT_ABOUT_CONTENT.headingPrefix,
      headingAccent: typeof parsed.headingAccent === 'string' ? parsed.headingAccent : DEFAULT_ABOUT_CONTENT.headingAccent,
      paragraphs: Array.isArray(parsed.paragraphs) && parsed.paragraphs.length > 0 ? parsed.paragraphs : DEFAULT_ABOUT_CONTENT.paragraphs,
      orgBandTitle: typeof parsed.orgBandTitle === 'string' ? parsed.orgBandTitle : DEFAULT_ABOUT_CONTENT.orgBandTitle,
      orgBand: Array.isArray(parsed.orgBand) && parsed.orgBand.length > 0 ? parsed.orgBand : DEFAULT_ABOUT_CONTENT.orgBand,
      dimensionsTitle: typeof parsed.dimensionsTitle === 'string' ? parsed.dimensionsTitle : DEFAULT_ABOUT_CONTENT.dimensionsTitle,
      pillars: Array.isArray(parsed.pillars) && parsed.pillars.length > 0 ? parsed.pillars : DEFAULT_ABOUT_CONTENT.pillars,
      highlightTitle: typeof parsed.highlightTitle === 'string' ? parsed.highlightTitle : DEFAULT_ABOUT_CONTENT.highlightTitle,
      highlightSubtitle: typeof parsed.highlightSubtitle === 'string' ? parsed.highlightSubtitle : DEFAULT_ABOUT_CONTENT.highlightSubtitle,
      highlightBadge: typeof parsed.highlightBadge === 'string' ? parsed.highlightBadge : DEFAULT_ABOUT_CONTENT.highlightBadge,
    };
  } catch {
    return DEFAULT_ABOUT_CONTENT;
  }
}

const TREE = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093215_95f11900-c4a0-49ad-bb2d-bb927dd594ee.png';
const CLOUD_B = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093215_0f37c0c3-f82c-485b-87dd-5a35b75a8782.png';

const inputCls =
  'w-full px-3 py-1.5 rounded-xl border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] text-xs focus:outline-none focus:border-[#4d6a10] focus:bg-white transition-colors';

export const AboutSection: React.FC<AboutSectionProps> = ({ profile }) => {
  const containerRef = useRef<HTMLElement>(null);
  const treeRef = useRef<HTMLImageElement>(null);
  const { isEditMode, token, onRefreshData } = useAdminEdit();

  const philosophy =
    profile?.philosophy ||
    'I believe great products are built by understanding people, simplifying complexity, aligning technology with business objectives, and continuously improving the experience.';

  const content = useMemo(() => parseAboutContent(profile?.about_content_json), [profile?.about_content_json]);

  const [saving, setSaving] = useState(false);

  // Add Paragraph state
  const [addingParagraph, setAddingParagraph] = useState(false);
  const [newParagraphText, setNewParagraphText] = useState('');

  // Edit / Add Pillar state
  const [editingPillarIdx, setEditingPillarIdx] = useState<number | null>(null);
  const [pillarDraft, setPillarDraft] = useState<AboutPillar>({ title: '', desc: '', stat: '', iconKey: 'target' });
  const [addingPillar, setAddingPillar] = useState(false);

  // Edit / Add Org state
  const [editingOrgIdx, setEditingOrgIdx] = useState<number | null>(null);
  const [orgDraft, setOrgDraft] = useState<AboutOrg>({ name: '', subtitle: '' });
  const [addingOrg, setAddingOrg] = useState(false);

  const persistAboutContent = async (updated: AboutContent) => {
    if (!token) return;
    setSaving(true);
    try {
      await adminUpdateProfile({ about_content_json: JSON.stringify(updated) }, token);
      onRefreshData();
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      if (treeRef.current && containerRef.current) {
        gsap.fromTo(
          treeRef.current,
          { y: 110, opacity: 0.65 },
          {
            y: 0,
            opacity: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: containerRef.current,
              start: 'top 85%',
              end: 'bottom 40%',
              scrub: 1.2
            }
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const handleSaveParagraph = async (index: number, newVal: string) => {
    const trimmed = newVal.trim();
    if (!trimmed) return;
    const next = [...content.paragraphs];
    next[index] = trimmed;
    await persistAboutContent({ ...content, paragraphs: next });
  };

  const handleDeleteParagraph = async (index: number) => {
    if (content.paragraphs.length <= 1) return;
    const next = content.paragraphs.filter((_, i) => i !== index);
    await persistAboutContent({ ...content, paragraphs: next });
  };

  const handleAddParagraph = async () => {
    const trimmed = newParagraphText.trim();
    if (!trimmed) return;
    await persistAboutContent({ ...content, paragraphs: [...content.paragraphs, trimmed] });
    setNewParagraphText('');
    setAddingParagraph(false);
  };

  const handleSavePillar = async (index: number) => {
    if (!pillarDraft.title.trim() || !pillarDraft.desc.trim()) return;
    const next = [...content.pillars];
    next[index] = {
      title: pillarDraft.title.trim(),
      desc: pillarDraft.desc.trim(),
      stat: pillarDraft.stat.trim() || 'Core Area',
      iconKey: pillarDraft.iconKey || 'target',
    };
    await persistAboutContent({ ...content, pillars: next });
    setEditingPillarIdx(null);
  };

  const handleAddPillar = async () => {
    if (!pillarDraft.title.trim() || !pillarDraft.desc.trim()) return;
    const next: AboutPillar[] = [
      ...content.pillars,
      {
        title: pillarDraft.title.trim(),
        desc: pillarDraft.desc.trim(),
        stat: pillarDraft.stat.trim() || 'Core Area',
        iconKey: pillarDraft.iconKey || 'target',
      },
    ];
    await persistAboutContent({ ...content, pillars: next });
    setPillarDraft({ title: '', desc: '', stat: '', iconKey: 'target' });
    setAddingPillar(false);
  };

  const handleDeletePillar = async (index: number) => {
    if (content.pillars.length <= 1) return;
    const next = content.pillars.filter((_, i) => i !== index);
    await persistAboutContent({ ...content, pillars: next });
  };

  const handleSaveOrg = async (index: number) => {
    if (!orgDraft.name.trim()) return;
    const next = [...content.orgBand];
    next[index] = { name: orgDraft.name.trim(), subtitle: orgDraft.subtitle.trim() };
    await persistAboutContent({ ...content, orgBand: next });
    setEditingOrgIdx(null);
  };

  const handleAddOrg = async () => {
    if (!orgDraft.name.trim()) return;
    const next = [...content.orgBand, { name: orgDraft.name.trim(), subtitle: orgDraft.subtitle.trim() }];
    await persistAboutContent({ ...content, orgBand: next });
    setOrgDraft({ name: '', subtitle: '' });
    setAddingOrg(false);
  };

  const handleDeleteOrg = async (index: number) => {
    if (content.orgBand.length <= 1) return;
    const next = content.orgBand.filter((_, i) => i !== index);
    await persistAboutContent({ ...content, orgBand: next });
  };

  return (
    <section
      id="about"
      ref={containerRef}
      className="petalyx-scope relative py-20 md:py-28 bg-[#fafcf7] overflow-x-clip border-b border-[#eef0ea]"
      style={{ color: 'var(--ink)' }}
    >
      {/* 1. Subtle Petalyx Grid Pattern Field */}
      <div className="absolute inset-0 petalyx-sq-field pointer-events-none opacity-60 z-0" />

      {/* 2. Drifting Background Cloud */}
      <div className="absolute top-10 right-0 pointer-events-none z-[1] overflow-hidden opacity-30 select-none">
        <img
          src={CLOUD_B}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="animate-drift-b w-[500px] max-w-none"
        />
      </div>

      {/* 3. Rising Cherry-Blossom Tree Accent (Bottom-Right Anchor) */}
      <div className="absolute -bottom-8 right-0 md:right-4 w-[280px] sm:w-[380px] md:w-[460px] pointer-events-none z-[2] select-none">
        <img
          ref={treeRef}
          src={TREE}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="w-full h-auto object-contain object-bottom drop-shadow-sm"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 petalyx-pill mb-3">
            <Building2 className="w-3.5 h-3.5 text-[#4d6a10]" />
            <InlineEditableText
              as="span"
              value={content.badgeText}
              onSave={(val) => persistAboutContent({ ...content, badgeText: val })}
            />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-[#121410] tracking-tight max-w-3xl leading-[1.15]">
            <InlineEditableText
              as="span"
              value={content.headingPrefix}
              onSave={(val) => persistAboutContent({ ...content, headingPrefix: val })}
            />{' '}
            <span className="text-[#4d6a10] italic">
              <InlineEditableText
                as="span"
                value={content.headingAccent}
                onSave={(val) => persistAboutContent({ ...content, headingAccent: val })}
              />
            </span>
          </h2>
        </div>

        {/* 2-Column Content Grid */}
        <div className="grid lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Narrative & Philosophy (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-4 text-sm sm:text-base text-[#121410]/80 leading-relaxed font-normal">
              {content.paragraphs.map((para, idx) => (
                <div key={idx} className="relative group/para">
                  <InlineEditableText
                    as="p"
                    multiline
                    value={para}
                    onSave={(val) => handleSaveParagraph(idx, val)}
                    renderView={(val) => <>{renderRichParagraph(val)}</>}
                  />
                  {isEditMode && content.paragraphs.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteParagraph(idx)}
                      disabled={saving}
                      title="Delete paragraph"
                      className="absolute -top-2 -right-2 p-1 rounded-full bg-white border border-red-200 text-red-500 hover:bg-red-50 opacity-0 group-hover/para:opacity-100 transition-opacity shadow-xs cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}

              {/* On-Page Add Extra Paragraph Control */}
              {isEditMode && (
                <div className="pt-1">
                  {addingParagraph ? (
                    <div className="p-3.5 rounded-2xl bg-white border border-[#4d6a10]/30 shadow-xs space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold block">
                        New Paragraph (use **text** for bold highlights)
                      </span>
                      <textarea
                        rows={3}
                        value={newParagraphText}
                        onChange={(e) => setNewParagraphText(e.target.value)}
                        placeholder="Write an additional biography or leadership paragraph..."
                        className={inputCls}
                        autoFocus
                      />
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleAddParagraph}
                          disabled={saving || !newParagraphText.trim()}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#4d6a10] text-white font-mono text-[11px] font-bold hover:bg-[#3f590d] disabled:opacity-50 cursor-pointer"
                        >
                          <Check className="w-3 h-3" />
                          <span>Save Paragraph</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAddingParagraph(false);
                            setNewParagraphText('');
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#fafcf7] border border-[#4d6a10]/20 text-[#121410]/70 font-mono text-[11px] font-semibold hover:text-[#121410] cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          <span>Cancel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setAddingParagraph(true)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/45 text-[#4d6a10] font-mono text-[11px] font-bold hover:bg-[#e7efcf] transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Paragraph</span>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Career Philosophy Frosted Glass Card */}
            <div className="p-6 rounded-[22px] petalyx-glass relative space-y-3 shadow-md mt-6">
              <Quote className="w-8 h-8 text-[#4d6a10]/20 absolute top-4 right-4" />
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold block">
                Career Philosophy
              </span>
              <blockquote className="font-display font-medium text-base sm:text-lg text-[#121410] italic leading-snug">
                <InlineEditableText
                  as="span"
                  multiline
                  value={philosophy}
                  onSave={async (val) => {
                    if (!token) return;
                    await adminUpdateProfile({ philosophy: val }, token);
                    onRefreshData();
                  }}
                  renderView={(val) => <>"{val}"</>}
                />
              </blockquote>
            </div>

            {/* Frosted Organization Band Aesthetic */}
            <div className="pt-4">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[#121410]/50 font-bold block">
                  <InlineEditableText
                    as="span"
                    value={content.orgBandTitle}
                    onSave={(val) => persistAboutContent({ ...content, orgBandTitle: val })}
                  />
                </span>
                {isEditMode && !addingOrg && (
                  <button
                    type="button"
                    onClick={() => {
                      setOrgDraft({ name: '', subtitle: '' });
                      setAddingOrg(true);
                      setEditingOrgIdx(null);
                    }}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/50 text-[#4d6a10] font-mono text-[10px] font-bold hover:bg-[#e7efcf] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Org</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {content.orgBand.map((org, i) => (
                  <div
                    key={i}
                    className="relative p-3 rounded-[16px] bg-white/90 border border-[#eef0ea] shadow-2xs hover:border-[#4d6a10]/30 transition-colors group/org"
                  >
                    {isEditMode && editingOrgIdx === i ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          value={orgDraft.name}
                          onChange={(e) => setOrgDraft({ ...orgDraft, name: e.target.value })}
                          placeholder="Org Name"
                          className={inputCls}
                        />
                        <input
                          type="text"
                          value={orgDraft.subtitle}
                          onChange={(e) => setOrgDraft({ ...orgDraft, subtitle: e.target.value })}
                          placeholder="Subtitle"
                          className={inputCls}
                        />
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSaveOrg(i)}
                            disabled={saving}
                            className="p-1 rounded-lg bg-[#4d6a10] text-white cursor-pointer"
                            title="Save"
                          >
                            <Check className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingOrgIdx(null)}
                            className="p-1 rounded-lg bg-[#fafcf7] border border-[#4d6a10]/20 text-[#121410]/70 cursor-pointer"
                            title="Cancel"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="font-display font-bold text-xs text-[#121410] truncate">
                          {org.name}
                        </div>
                        <div className="text-[10px] text-[#121410]/60 truncate mt-0.5 font-mono">
                          {org.subtitle}
                        </div>
                        {isEditMode && (
                          <div className="absolute top-1.5 right-1.5 flex items-center gap-1 opacity-0 group-hover/org:opacity-100 transition-opacity">
                            <button
                              type="button"
                              onClick={() => {
                                setOrgDraft({ ...org });
                                setEditingOrgIdx(i);
                                setAddingOrg(false);
                              }}
                              className="p-1 rounded-md bg-[#e7efcf] text-[#4d6a10] cursor-pointer"
                              title="Edit organization"
                            >
                              <Pencil className="w-2.5 h-2.5" />
                            </button>
                            {content.orgBand.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeleteOrg(i)}
                                className="p-1 rounded-md bg-red-50 text-red-500 cursor-pointer"
                                title="Delete organization"
                              >
                                <Trash2 className="w-2.5 h-2.5" />
                              </button>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                ))}

                {isEditMode && addingOrg && (
                  <div className="p-3 rounded-[16px] bg-white border border-[#4d6a10]/40 shadow-xs space-y-1.5">
                    <input
                      type="text"
                      value={orgDraft.name}
                      onChange={(e) => setOrgDraft({ ...orgDraft, name: e.target.value })}
                      placeholder="Organization"
                      className={inputCls}
                      autoFocus
                    />
                    <input
                      type="text"
                      value={orgDraft.subtitle}
                      onChange={(e) => setOrgDraft({ ...orgDraft, subtitle: e.target.value })}
                      placeholder="Mandate / Role"
                      className={inputCls}
                    />
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={handleAddOrg}
                        disabled={saving || !orgDraft.name.trim()}
                        className="p-1 rounded-lg bg-[#4d6a10] text-white disabled:opacity-50 cursor-pointer"
                        title="Add"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingOrg(false)}
                        className="p-1 rounded-lg bg-[#fafcf7] border border-[#4d6a10]/20 text-[#121410]/70 cursor-pointer"
                        title="Cancel"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Key Leadership Dimensions Ticket Cards (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-mono uppercase tracking-wider text-[#4d6a10] font-bold block">
                <InlineEditableText
                  as="span"
                  value={content.dimensionsTitle}
                  onSave={(val) => persistAboutContent({ ...content, dimensionsTitle: val })}
                />
              </span>
              <span className="text-[11px] font-mono text-[#121410]/50">
                {content.pillars.length} Core {content.pillars.length === 1 ? 'Competency' : 'Competencies'}
              </span>
            </div>

            {content.pillars.map((pillar, i) => (
              <div
                key={i}
                className={`relative p-5 rounded-[20px] bg-white border shadow-xs transition-all space-y-2 group ${
                  isEditMode && editingPillarIdx === i
                    ? 'border-[#4d6a10] ring-2 ring-[#4d6a10]/15'
                    : 'border-[#eef0ea] hover:shadow-md hover:border-[#4d6a10]/40'
                }`}
              >
                {isEditMode && editingPillarIdx === i ? (
                  <div className="space-y-2.5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                          Title
                        </label>
                        <input
                          type="text"
                          value={pillarDraft.title}
                          onChange={(e) => setPillarDraft({ ...pillarDraft, title: e.target.value })}
                          className={inputCls}
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                          Badge / Stat
                        </label>
                        <input
                          type="text"
                          value={pillarDraft.stat}
                          onChange={(e) => setPillarDraft({ ...pillarDraft, stat: e.target.value })}
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                        Icon
                      </label>
                      <select
                        value={pillarDraft.iconKey || 'target'}
                        onChange={(e) => setPillarDraft({ ...pillarDraft, iconKey: e.target.value as PillarIconKey })}
                        className={inputCls}
                      >
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt.key} value={opt.key}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                        Description
                      </label>
                      <textarea
                        rows={2}
                        value={pillarDraft.desc}
                        onChange={(e) => setPillarDraft({ ...pillarDraft, desc: e.target.value })}
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleSavePillar(i)}
                        disabled={saving || !pillarDraft.title.trim() || !pillarDraft.desc.trim()}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#4d6a10] text-white font-mono text-[11px] font-bold hover:bg-[#3f590d] disabled:opacity-50 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Save Card</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingPillarIdx(null)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#fafcf7] border border-[#4d6a10]/20 text-[#121410]/70 font-mono text-[11px] font-semibold cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="p-2 rounded-xl bg-[#e7efcf] group-hover:bg-[#b4cd52]/40 transition-colors shrink-0">
                          {renderPillarIcon(pillar.iconKey)}
                        </span>
                        <h3 className="font-display font-bold text-sm text-[#121410] group-hover:text-[#4d6a10] transition-colors">
                          {pillar.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-[#e7efcf]/70 text-[#4d6a10]">
                          {pillar.stat}
                        </span>
                        {isEditMode && (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                setPillarDraft({ ...pillar });
                                setEditingPillarIdx(i);
                                setAddingPillar(false);
                              }}
                              title="Edit card"
                              className="p-1.5 rounded-full bg-[#e7efcf] text-[#4d6a10] hover:bg-[#4d6a10] hover:text-white transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                            {content.pillars.length > 1 && (
                              <button
                                type="button"
                                onClick={() => handleDeletePillar(i)}
                                disabled={saving}
                                title="Delete card"
                                className="p-1.5 rounded-full bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-[#121410]/70 leading-relaxed pl-9">
                      {pillar.desc}
                    </p>
                  </>
                )}
              </div>
            ))}

            {/* On-Page Add Extra Leadership Dimension Card */}
            {isEditMode && (
              <div>
                {addingPillar ? (
                  <div className="p-5 rounded-[20px] bg-white border border-[#4d6a10] ring-2 ring-[#4d6a10]/15 shadow-sm space-y-2.5">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold block">
                      Add New Leadership Dimension Card
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                          Title *
                        </label>
                        <input
                          type="text"
                          value={pillarDraft.title}
                          onChange={(e) => setPillarDraft({ ...pillarDraft, title: e.target.value })}
                          placeholder="e.g. Digital Transformation"
                          className={inputCls}
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                          Badge / Stat
                        </label>
                        <input
                          type="text"
                          value={pillarDraft.stat}
                          onChange={(e) => setPillarDraft({ ...pillarDraft, stat: e.target.value })}
                          placeholder="e.g. 50+ Campuses"
                          className={inputCls}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                        Icon
                      </label>
                      <select
                        value={pillarDraft.iconKey || 'target'}
                        onChange={(e) => setPillarDraft({ ...pillarDraft, iconKey: e.target.value as PillarIconKey })}
                        className={inputCls}
                      >
                        {ICON_OPTIONS.map((opt) => (
                          <option key={opt.key} value={opt.key}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                        Description *
                      </label>
                      <textarea
                        rows={2}
                        value={pillarDraft.desc}
                        onChange={(e) => setPillarDraft({ ...pillarDraft, desc: e.target.value })}
                        placeholder="Describe this leadership dimension..."
                        className={inputCls}
                      />
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleAddPillar}
                        disabled={saving || !pillarDraft.title.trim() || !pillarDraft.desc.trim()}
                        className="inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#4d6a10] text-white font-mono text-[11px] font-bold hover:bg-[#3f590d] disabled:opacity-50 cursor-pointer"
                      >
                        <Check className="w-3 h-3" />
                        <span>Add Card</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAddingPillar(false)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#fafcf7] border border-[#4d6a10]/20 text-[#121410]/70 font-mono text-[11px] font-semibold cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                        <span>Cancel</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setPillarDraft({ title: '', desc: '', stat: '', iconKey: 'target' });
                      setAddingPillar(true);
                      setEditingPillarIdx(null);
                    }}
                    className="w-full py-3 rounded-[20px] border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/40 hover:bg-[#e7efcf]/80 text-[#4d6a10] font-mono text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Leadership Dimension Card</span>
                  </button>
                )}
              </div>
            )}

            {/* Highlight Metric Ticket */}
            <div className="p-4 rounded-[20px] bg-[#e7efcf] border border-[#4d6a10]/20 flex items-center justify-between gap-4 mt-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#4d6a10] text-white flex items-center justify-center font-bold shrink-0">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm text-[#121410]">
                    <InlineEditableText
                      as="span"
                      value={content.highlightTitle}
                      onSave={(val) => persistAboutContent({ ...content, highlightTitle: val })}
                    />
                  </div>
                  <div className="text-[11px] font-mono text-[#4d6a10]">
                    <InlineEditableText
                      as="span"
                      value={content.highlightSubtitle}
                      onSave={(val) => persistAboutContent({ ...content, highlightSubtitle: val })}
                    />
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-[#4d6a10] bg-white/80 px-2.5 py-1 rounded-full border border-[#4d6a10]/20 shrink-0">
                <InlineEditableText
                  as="span"
                  value={content.highlightBadge}
                  onSave={(val) => persistAboutContent({ ...content, highlightBadge: val })}
                />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
