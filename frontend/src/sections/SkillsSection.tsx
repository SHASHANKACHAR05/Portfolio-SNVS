import React, { useEffect, useMemo, useState } from 'react';
import {
  Code2, Cloud, BarChart2, Building2, Layers, Wrench, X, ChevronLeft, ChevronRight,
  Plus, Pencil, Check, Star, Trash2
} from 'lucide-react';
import { Skill } from '../types';
import BounceCards, { BounceCardImage } from '../components/bounce-cards/BounceCards';
import { InlineEditableText, useAdminEdit } from '../context/AdminEditContext';
import {
  adminCreateSkill,
  adminDeleteSkill,
  adminUpdateProfile,
  adminUpdateSkill,
} from '../services/api';

interface SkillsSectionProps {
  skills: Skill[];
}

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

function renderSkillCategoryCard(category: string, items: Skill[], index: number): string {
  const size = 640;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  // Clean light Petalyx card surface
  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(0.6, '#fafcf7');
  bg.addColorStop(1, '#eaf3d6');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Subtle architectural grid
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.06)';
  ctx.lineWidth = 1;
  for (let x = 40; x < size; x += 52) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
    ctx.stroke();
  }
  for (let y = 40; y < size; y += 52) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
    ctx.stroke();
  }

  // Top accent bar
  const bar = ctx.createLinearGradient(0, 0, size, 0);
  bar.addColorStop(0, '#4d6a10');
  bar.addColorStop(1, '#b4cd52');
  ctx.fillStyle = bar;
  ctx.fillRect(0, 0, size, 14);

  // Number badge
  const numStr = String(index + 1).padStart(2, '0');
  ctx.fillStyle = '#e7efcf';
  ctx.beginPath();
  ctx.roundRect(40, 44, 82, 52, 16);
  ctx.fill();
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.28)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#4d6a10';
  ctx.font = '800 26px "JetBrains Mono", ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(numStr, 81, 71);

  // Count pill
  const countLabel = `${items.length} TOOLS`;
  ctx.font = '700 18px "JetBrains Mono", ui-monospace, monospace';
  const pillW = ctx.measureText(countLabel).width + 38;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.beginPath();
  ctx.roundRect(size - 40 - pillW, 48, pillW, 44, 22);
  ctx.fill();
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.24)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#4d6a10';
  ctx.fillText(countLabel, size - 40 - pillW / 2, 71);

  // Category title
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#121410';
  ctx.font = '800 40px "Inter Tight", system-ui, sans-serif';
  const titleLines = wrapLines(ctx, category, size - 80, 2);
  let y = 166;
  for (const line of titleLines) {
    ctx.fillText(line, 40, y);
    y += 48;
  }

  // Olive rule
  ctx.fillStyle = '#6f9a0c';
  ctx.beginPath();
  ctx.roundRect(40, y - 14, 72, 7, 4);
  ctx.fill();
  y += 26;

  // Skill preview pills (wrapped into rows)
  ctx.font = '600 22px "JetBrains Mono", ui-monospace, monospace';
  let curX = 40;
  let curY = y;
  const maxX = size - 40;
  const pillH = 44;
  const gapX = 12;
  const gapY = 14;
  let shownCount = 0;

  for (const skill of items) {
    const label = skill.name;
    const textW = ctx.measureText(label).width;
    const w = Math.min(maxX - 40, textW + (skill.is_key_skill ? 52 : 34));
    if (curX + w > maxX) {
      curX = 40;
      curY += pillH + gapY;
    }
    if (curY + pillH > size - 90) break;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.roundRect(curX, curY, w, pillH, 22);
    ctx.fill();
    ctx.strokeStyle = skill.is_key_skill ? 'rgba(77, 106, 16, 0.38)' : 'rgba(77, 106, 16, 0.2)';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#121410';
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    ctx.fillText(label, curX + 18, curY + pillH / 2 + 1, w - 34);

    if (skill.is_key_skill) {
      ctx.fillStyle = '#6f9a0c';
      ctx.beginPath();
      ctx.arc(curX + w - 18, curY + pillH / 2, 5.5, 0, Math.PI * 2);
      ctx.fill();
    }

    curX += w + gapX;
    shownCount += 1;
  }

  const remaining = items.length - shownCount;
  if (remaining > 0) {
    const moreLabel = `+${remaining} more`;
    ctx.font = '700 20px "JetBrains Mono", ui-monospace, monospace';
    const mw = ctx.measureText(moreLabel).width + 32;
    if (curX + mw <= maxX && curY + pillH <= size - 90) {
      ctx.fillStyle = '#e7efcf';
      ctx.beginPath();
      ctx.roundRect(curX, curY, mw, pillH, 22);
      ctx.fill();
      ctx.fillStyle = '#4d6a10';
      ctx.textBaseline = 'middle';
      ctx.fillText(moreLabel, curX + 16, curY + pillH / 2 + 1);
    }
  }

  // Footer
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.16)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(40, size - 64);
  ctx.lineTo(size - 40, size - 64);
  ctx.stroke();

  ctx.textBaseline = 'alphabetic';
  ctx.font = '700 17px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillStyle = 'rgba(18, 20, 16, 0.52)';
  ctx.textAlign = 'left';
  ctx.fillText('TOOLS ECOSYSTEM', 40, size - 30);
  ctx.fillStyle = '#4d6a10';
  ctx.textAlign = 'right';
  ctx.fillText('CLICK TO VIEW ALL', size - 40, size - 30);

  return canvas.toDataURL('image/png');
}

function renderAddCardArtwork(): string {
  const size = 660;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const bg = ctx.createLinearGradient(0, 0, size, size);
  bg.addColorStop(0, '#fafcf7');
  bg.addColorStop(1, '#eef5df');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);

  // Dashed olive frame
  ctx.save();
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.55)';
  ctx.lineWidth = 6;
  ctx.setLineDash([18, 14]);
  ctx.beginPath();
  ctx.roundRect(28, 28, size - 56, size - 56, 36);
  ctx.stroke();
  ctx.restore();

  // Center circle + plus sign
  ctx.fillStyle = '#4d6a10';
  ctx.beginPath();
  ctx.arc(size / 2, size / 2 - 42, 64, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(size / 2 - 26, size / 2 - 42);
  ctx.lineTo(size / 2 + 26, size / 2 - 42);
  ctx.moveTo(size / 2, size / 2 - 68);
  ctx.lineTo(size / 2, size / 2 - 16);
  ctx.stroke();

  ctx.fillStyle = '#121410';
  ctx.font = '800 42px "Inter Tight", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Add Card', size / 2, size / 2 + 78);

  ctx.fillStyle = 'rgba(77, 106, 16, 0.85)';
  ctx.font = '600 22px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillText('CLICK TO ADD CATEGORY & TOOLS', size / 2, size / 2 + 124);

  return canvas.toDataURL('image/png');
}

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] text-xs focus:outline-none focus:border-[#4d6a10] focus:bg-white transition-colors';

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  const { isEditMode, token, data, onRefreshData } = useAdminEdit();
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Top-right "Edit" quick drawer & "+ Add Card" modal
  const [showSectionEditModal, setShowSectionEditModal] = useState(false);
  const [newCardCategory, setNewCardCategory] = useState('');
  const [newCardSkillsCsv, setNewCardSkillsCsv] = useState('');
  const [newCardIsKey, setNewCardIsKey] = useState(true);

  // Add skill inside Category Full-Stack Pop-Up Modal
  const [addingSkillInModal, setAddingSkillInModal] = useState(false);
  const [modalSkillName, setModalSkillName] = useState('');
  const [modalSkillIsKey, setModalSkillIsKey] = useState(true);

  const [viewportWidth, setViewportWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  const parsedSections = useMemo<Record<string, any>>(() => {
    const raw = data?.profile?.sections_content_json;
    if (!raw) return {};
    try {
      return JSON.parse(raw) || {};
    } catch {
      return {};
    }
  }, [data?.profile?.sections_content_json]);

  const sectionBadge: string = parsedSections?.skillsBadge || 'Tools, Ecosystems & Methodologies';
  const sectionTitlePrefix: string = parsedSections?.skillsTitlePrefix || 'Technology Stack &';
  const sectionTitleAccent: string = parsedSections?.skillsTitleAccent || 'Tools Ecosystem.';
  const sectionSubtitle: string =
    parsedSections?.skillsSubtitle ||
    'A comprehensive, battle-tested toolchain spanning cloud architecture, data visualization, programming languages, and enterprise platforms.';

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
    const onResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Group skills by category
  const categories = useMemo<[string, Skill[]][]>(() => {
    const categorized = skills.reduce((acc: Record<string, Skill[]>, s) => {
      acc[s.category] = acc[s.category] || [];
      acc[s.category].push(s);
      return acc;
    }, {});
    return Object.entries(categorized);
  }, [skills]);

  // Memoize BounceCards artwork images; append blank "+ Add Card" in Edit Mode
  const cardImages = useMemo<BounceCardImage[]>(() => {
    if (typeof document === 'undefined') return [];
    const base = categories.map(([category, items], i) => ({
      src: renderSkillCategoryCard(category, items, i),
      alt: `${category} — ${items.length} tools and technologies`,
    }));
    if (isEditMode) {
      base.push({
        src: renderAddCardArtwork(),
        alt: 'Add new skill category card',
      });
    }
    return base;
  }, [categories, isEditMode]);

  // Close modal on Escape / navigate with arrows (skip when typing)
  useEffect(() => {
    if (modalIndex === null || categories.length === 0) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';
      if (isTyping) return;
      if (e.key === 'Escape') setModalIndex(null);
      else if (e.key === 'ArrowRight') {
        setModalIndex((prev) => ((prev ?? 0) + 1) % categories.length);
      } else if (e.key === 'ArrowLeft') {
        setModalIndex((prev) => ((prev ?? 0) - 1 + categories.length) % categories.length);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalIndex, categories.length]);

  const getCategoryIcon = (cat: string) => {
    if (cat.includes('Strategy') || cat.includes('Project')) return <Layers className="w-4 h-4 text-[#4d6a10]" />;
    if (cat.includes('Data') || cat.includes('Analytics')) return <BarChart2 className="w-4 h-4 text-[#4d6a10]" />;
    if (cat.includes('Systems') || cat.includes('Architecture')) return <Cloud className="w-4 h-4 text-[#4d6a10]" />;
    if (cat.includes('Leadership')) return <Building2 className="w-4 h-4 text-[#4d6a10]" />;
    return <Code2 className="w-4 h-4 text-[#4d6a10]" />;
  };

  const handleCreateNewCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newCardCategory.trim()) return;
    const names = newCardSkillsCsv
      .split(/[\n,]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    const itemsToCreate = names.length > 0 ? names : ['Core Capability'];
    setSaving(true);
    try {
      let order = skills.length + 1;
      for (const name of itemsToCreate) {
        await adminCreateSkill(
          {
            category: newCardCategory.trim(),
            name,
            proficiency_level: 'Expert',
            is_key_skill: newCardIsKey,
            order_index: order++,
          },
          token
        );
      }
      onRefreshData();
      setNewCardCategory('');
      setNewCardSkillsCsv('');
      setShowSectionEditModal(false);
    } finally {
      setSaving(false);
    }
  };

  // Responsive BounceCards sizing
  const isSmall = viewportWidth < 640;
  const isMedium = viewportWidth < 1024;
  const cardSize = isSmall ? 210 : isMedium ? 280 : 330;
  const spread = isSmall ? 68 : isMedium ? 115 : 155;
  const pushDistance = isSmall ? 115 : isMedium ? 175 : 220;
  const containerWidth = Math.min(viewportWidth - 32, isSmall ? 380 : isMedium ? 820 : 1160);
  const containerHeight = isSmall ? 245 : isMedium ? 325 : 375;

  const activeModalCategory = modalIndex !== null ? categories[modalIndex] || null : null;

  return (
    <section
      id="skills"
      className="petalyx-scope relative py-20 md:py-24 border-b border-[#eef0ea] bg-white overflow-x-clip"
      style={{ color: 'var(--ink)' }}
    >
      {/* Subtle Petalyx Grid Pattern Field */}
      <div className="absolute inset-0 petalyx-sq-field pointer-events-none opacity-40 z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top-Right Corner Edit Button (Visible in On-Page Edit Mode) */}
        {isEditMode && (
          <div className="flex justify-end mb-2">
            <button
              type="button"
              onClick={() => setShowSectionEditModal(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#4d6a10] text-white hover:bg-[#3f590d] font-mono text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          </div>
        )}

        {/* Centered Header */}
        <div className="mb-3 flex flex-col items-center text-center gap-2.5">
          <div className="inline-flex items-center gap-2 petalyx-pill">
            <Wrench className="w-3.5 h-3.5 text-[#4d6a10]" />
            <InlineEditableText
              as="span"
              value={sectionBadge}
              onSave={(val) => persistSectionsPatch({ skillsBadge: val })}
            />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-[#121410] tracking-tight leading-[1.15]">
            <InlineEditableText
              as="span"
              value={sectionTitlePrefix}
              onSave={(val) => persistSectionsPatch({ skillsTitlePrefix: val })}
            />{' '}
            <span className="text-[#4d6a10] italic">
              <InlineEditableText
                as="span"
                value={sectionTitleAccent}
                onSave={(val) => persistSectionsPatch({ skillsTitleAccent: val })}
              />
            </span>
          </h2>
          <div className="text-xs sm:text-sm text-[#121410]/70 max-w-2xl leading-relaxed">
            <InlineEditableText
              as="p"
              multiline
              value={sectionSubtitle}
              onSave={(val) => persistSectionsPatch({ skillsSubtitle: val })}
            />
          </div>
          <span className="text-xs font-mono text-[#121410]/70 bg-[#fafcf7] border border-[#4d6a10]/20 px-3.5 py-1.5 rounded-full">
            Hover to fan cards &middot; Click any card to inspect the full stack
          </span>
        </div>

        {/* BounceCards Interactive Stack */}
        {cardImages.length > 0 && (
          <div className="flex justify-center items-center py-0">
            <BounceCards
              key={`${skills.map((s) => `${s.id}:${s.category}:${s.name}:${s.is_key_skill}`).join('|')}-${isEditMode ? 'edit' : 'view'}`}
              images={cardImages}
              containerWidth={containerWidth}
              containerHeight={containerHeight}
              cardSize={cardSize}
              spread={spread}
              rotation={10}
              arc={0}
              pushDistance={pushDistance}
              hoverScale={1.06}
              bounciness={0.6}
              animationDelay={0.35}
              animationStagger={0.06}
              borderWidth={5}
              borderColor="#ffffff"
              radius={25}
              shadow={true}
              enableHover={true}
              onCardClick={(idx) => {
                if (isEditMode && idx === categories.length) {
                  setShowSectionEditModal(true);
                } else {
                  setModalIndex(idx);
                }
              }}
            />
          </div>
        )}

        {/* Quick-Open Category Pills */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {categories.map(([category, items], idx) => (
            <button
              key={category}
              type="button"
              onClick={() => setModalIndex(idx)}
              className="inline-flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-full border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410]/85 hover:bg-[#4d6a10] hover:text-white hover:border-[#4d6a10] transition-colors cursor-pointer shadow-2xs"
            >
              <span>{String(idx + 1).padStart(2, '0')}</span>
              <span>&middot;</span>
              <span>{category}</span>
              <span className="opacity-70">({items.length})</span>
            </button>
          ))}
          {isEditMode && (
            <button
              type="button"
              onClick={() => setShowSectionEditModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3.5 py-1.5 rounded-full border border-dashed border-[#4d6a10]/60 bg-[#e7efcf]/70 text-[#4d6a10] hover:bg-[#e7efcf] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Card</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Full-Stack Pop-Up Modal (WITH ON-PAGE EDIT ACCESS) */}
      {activeModalCategory && modalIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#121410]/55 backdrop-blur-sm overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="skills-modal-title"
          onClick={() => setModalIndex(null)}
        >
          <div
            data-lenis-prevent
            className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-[24px] border border-[#4d6a10]/30 bg-white shadow-2xl p-6 sm:p-8 space-y-5 text-[#121410]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#4d6a10]/15">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <span className="p-2.5 rounded-xl bg-[#e7efcf] border border-[#4d6a10]/25 shrink-0">
                  {getCategoryIcon(activeModalCategory[0])}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold block">
                      Category {String(modalIndex + 1).padStart(2, '0')} / {String(categories.length).padStart(2, '0')}
                    </span>
                    {isEditMode && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#4d6a10] text-white font-bold">
                        Inline Edit
                      </span>
                    )}
                  </div>
                  <h3
                    id="skills-modal-title"
                    className="font-display font-extrabold text-xl sm:text-2xl text-[#121410] leading-tight"
                  >
                    <InlineEditableText
                      as="span"
                      value={activeModalCategory[0]}
                      onSave={async (newCategoryName) => {
                        if (!token || !newCategoryName.trim()) return;
                        setSaving(true);
                        try {
                          for (const s of activeModalCategory[1]) {
                            await adminUpdateSkill(
                              s.id,
                              {
                                category: newCategoryName.trim(),
                                name: s.name,
                                proficiency_level: s.proficiency_level,
                                icon_name: s.icon_name ?? null,
                                is_key_skill: s.is_key_skill,
                                order_index: s.order_index,
                              },
                              token
                            );
                          }
                          onRefreshData();
                        } finally {
                          setSaving(false);
                        }
                      }}
                    />
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isEditMode && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={async () => {
                      if (!token) return;
                      const ok = window.confirm(
                        `Delete the "${activeModalCategory[0]}" card and all ${activeModalCategory[1].length} tool(s) inside it?`
                      );
                      if (!ok) return;
                      setSaving(true);
                      try {
                        for (const s of activeModalCategory[1]) {
                          await adminDeleteSkill(s.id, token);
                        }
                        setModalIndex(null);
                        onRefreshData();
                      } finally {
                        setSaving(false);
                      }
                    }}
                    title="Delete this entire card"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-mono text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Card</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setModalIndex(null)}
                  aria-label="Close skill category details"
                  className="p-2 rounded-full border border-[#4d6a10]/20 bg-[#fafcf7] text-[#121410]/75 hover:bg-[#4d6a10] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* All Skills in Category */}
            <div className="p-4 sm:p-5 rounded-[16px] bg-[#fafcf7] border border-[#4d6a10]/20 space-y-3">
              <div className="flex items-center justify-between gap-2 text-xs font-mono flex-wrap">
                <span className="uppercase tracking-wider font-bold text-[#4d6a10]">
                  Tools &amp; Technologies ({activeModalCategory[1].length})
                </span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-[#121410]/65">
                    <span className="w-2 h-2 rounded-full bg-[#6f9a0c]" />
                    Core competency
                  </span>
                  {isEditMode && !addingSkillInModal && (
                    <button
                      type="button"
                      onClick={() => {
                        setModalSkillName('');
                        setModalSkillIsKey(true);
                        setAddingSkillInModal(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border border-dashed border-[#4d6a10]/50 bg-[#e7efcf]/70 text-[#4d6a10] text-[10px] font-bold hover:bg-[#e7efcf] cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Tool</span>
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                {activeModalCategory[1].map((skill) => (
                  <span
                    key={skill.id}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-mono shadow-2xs ${
                      skill.is_key_skill
                        ? 'border-[#4d6a10]/35 bg-[#e7efcf]/50 text-[#121410] font-semibold'
                        : 'border-[#4d6a10]/20 bg-white text-[#121410]/85'
                    }`}
                  >
                    <InlineEditableText
                      as="span"
                      value={skill.name}
                      onSave={async (val) => {
                        if (!token) return;
                        await adminUpdateSkill(
                          skill.id,
                          {
                            category: skill.category,
                            name: val,
                            proficiency_level: skill.proficiency_level,
                            icon_name: skill.icon_name ?? null,
                            is_key_skill: skill.is_key_skill,
                            order_index: skill.order_index,
                          },
                          token
                        );
                        onRefreshData();
                      }}
                    />
                    {isEditMode ? (
                      <>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={async () => {
                            if (!token) return;
                            setSaving(true);
                            try {
                              await adminUpdateSkill(
                                skill.id,
                                {
                                  category: skill.category,
                                  name: skill.name,
                                  proficiency_level: skill.proficiency_level,
                                  icon_name: skill.icon_name ?? null,
                                  is_key_skill: !skill.is_key_skill,
                                  order_index: skill.order_index,
                                },
                                token
                              );
                              onRefreshData();
                            } finally {
                              setSaving(false);
                            }
                          }}
                          title={skill.is_key_skill ? 'Unmark core competency' : 'Mark as core competency'}
                          className={`p-0.5 rounded-full transition-colors cursor-pointer ${
                            skill.is_key_skill ? 'text-[#4d6a10]' : 'text-[#121410]/35 hover:text-[#4d6a10]'
                          }`}
                        >
                          <Star className={`w-3 h-3 ${skill.is_key_skill ? 'fill-[#6f9a0c]' : ''}`} />
                        </button>
                        <button
                          type="button"
                          disabled={saving}
                          onClick={async () => {
                            if (!token) return;
                            setSaving(true);
                            try {
                              await adminDeleteSkill(skill.id, token);
                              onRefreshData();
                            } finally {
                              setSaving(false);
                            }
                          }}
                          title="Delete tool"
                          className="p-0.5 rounded-full text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      skill.is_key_skill && (
                        <span className="w-1.5 h-1.5 rounded-full bg-[#6f9a0c]" title="Core competency" />
                      )
                    )}
                  </span>
                ))}
              </div>

              {isEditMode && addingSkillInModal && (
                <div className="pt-2 border-t border-[#4d6a10]/15 flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={modalSkillName}
                    onChange={(e) => setModalSkillName(e.target.value)}
                    placeholder="Enter new tool or skill name..."
                    className="flex-1 min-w-[180px] px-3 py-1.5 rounded-xl border border-[#4d6a10] bg-white text-xs text-[#121410] focus:outline-none"
                    autoFocus
                  />
                  <label className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#121410]/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={modalSkillIsKey}
                      onChange={(e) => setModalSkillIsKey(e.target.checked)}
                      className="accent-[#4d6a10]"
                    />
                    <span>Core</span>
                  </label>
                  <button
                    type="button"
                    disabled={saving || !modalSkillName.trim()}
                    onClick={async () => {
                      if (!token || !modalSkillName.trim()) return;
                      setSaving(true);
                      try {
                        await adminCreateSkill(
                          {
                            category: activeModalCategory[0],
                            name: modalSkillName.trim(),
                            proficiency_level: 'Expert',
                            is_key_skill: modalSkillIsKey,
                            order_index: skills.length + 1,
                          },
                          token
                        );
                        onRefreshData();
                        setModalSkillName('');
                        setAddingSkillInModal(false);
                      } finally {
                        setSaving(false);
                      }
                    }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#4d6a10] text-white font-mono text-[11px] font-bold cursor-pointer"
                  >
                    <Check className="w-3 h-3" /> Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setAddingSkillInModal(false)}
                    className="p-1.5 rounded-full bg-white border border-[#4d6a10]/20 text-[#121410]/70 cursor-pointer"
                    title="Cancel"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {/* Prev / Next Navigation */}
            <div className="pt-3 border-t border-[#4d6a10]/15 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() =>
                  setModalIndex((modalIndex - 1 + categories.length) % categories.length)
                }
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-3.5 py-2 rounded-full border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] hover:border-[#4d6a10] hover:text-[#4d6a10] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="text-[11px] font-mono text-[#121410]/55">
                Technology Stack
              </span>

              <button
                type="button"
                onClick={() => setModalIndex((modalIndex + 1) % categories.length)}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-3.5 py-2 rounded-full border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] hover:border-[#4d6a10] hover:text-[#4d6a10] transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Skill Category Card & Section Heading Modal */}
      {isEditMode && showSectionEditModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#121410]/55 backdrop-blur-sm overflow-hidden"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowSectionEditModal(false)}
        >
          <div
            data-lenis-prevent
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[24px] border border-[#4d6a10]/30 bg-white shadow-2xl p-6 sm:p-7 space-y-5 text-[#121410]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#4d6a10]/15">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold block">
                  Technology Stack &amp; Tools Ecosystem
                </span>
                <h3 className="font-display font-extrabold text-lg text-[#121410]">
                  Add New Skill Card
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSectionEditModal(false)}
                className="p-1.5 rounded-full border border-[#4d6a10]/20 bg-[#fafcf7] text-[#121410]/70 hover:bg-[#4d6a10] hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateNewCard} className="space-y-3.5">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                  Category / Card Title *
                </label>
                <input
                  type="text"
                  required
                  value={newCardCategory}
                  onChange={(e) => setNewCardCategory(e.target.value)}
                  placeholder="e.g. AI & Automation Stack"
                  className={inputCls}
                  autoFocus
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                  Tools &amp; Skills (comma or new-line separated) *
                </label>
                <textarea
                  rows={4}
                  required
                  value={newCardSkillsCsv}
                  onChange={(e) => setNewCardSkillsCsv(e.target.value)}
                  placeholder="e.g. OpenAI API, LangChain, Vertex AI, Python"
                  className={inputCls}
                />
              </div>

              <label className="inline-flex items-center gap-2 text-xs font-mono text-[#121410]/80 cursor-pointer">
                <input
                  type="checkbox"
                  checked={newCardIsKey}
                  onChange={(e) => setNewCardIsKey(e.target.checked)}
                  className="accent-[#4d6a10]"
                />
                <span>Mark these tools as Core Competencies</span>
              </label>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#4d6a10]/15">
                <button
                  type="button"
                  onClick={() => setShowSectionEditModal(false)}
                  className="px-4 py-2 rounded-full border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] font-mono text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !newCardCategory.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4d6a10] text-white font-mono text-xs font-bold hover:bg-[#3f590d] disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{saving ? 'Adding...' : 'Add Card to Stack'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
