import React, { useEffect, useMemo, useState } from 'react';
import {
  Award, GraduationCap, Calendar, ExternalLink, ShieldCheck, Hash, X, ChevronLeft, ChevronRight,
  Plus, Pencil, Trash2
} from 'lucide-react';
import { Certification } from '../types';
import FlexCarousel, { FlexCarouselItem } from '../components/flex-carousel/FlexCarousel';
import { InlineEditableText, useAdminEdit } from '../context/AdminEditContext';
import {
  adminCreateCertification,
  adminDeleteCertification,
  adminUpdateCertification,
  adminUpdateProfile,
} from '../services/api';

interface EducationSectionProps {
  certifications: Certification[];
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
  maxLines: number
): string[] {
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

function renderCredentialCardImage(cert: Certification, index: number): string {
  const width = 760;
  const height = 920;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  const isCert = cert.category === 'Certification';
  const isExec = cert.category === 'Executive Education';

  // Light botanical Petalyx surface
  const bg = ctx.createLinearGradient(0, 0, width, height);
  bg.addColorStop(0, '#ffffff');
  bg.addColorStop(0.65, '#fafcf7');
  bg.addColorStop(1, isExec ? '#e9f2d2' : isCert ? '#eef5df' : '#f1f6e4');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, width, height);

  // Subtle architectural grid
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.055)';
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

  // Decorative verified seal rings in bottom-right
  ctx.save();
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.08)';
  ctx.lineWidth = 2;
  [110, 165, 220].forEach((r) => {
    ctx.beginPath();
    ctx.arc(width - 60, height - 110, r, 0, Math.PI * 2);
    ctx.stroke();
  });
  ctx.restore();

  // Top olive/lime accent bar
  const bar = ctx.createLinearGradient(0, 0, width, 0);
  bar.addColorStop(0, '#4d6a10');
  bar.addColorStop(1, '#b4cd52');
  ctx.fillStyle = bar;
  ctx.fillRect(0, 0, width, 16);

  // Index pill
  const numStr = String(index + 1).padStart(2, '0');
  ctx.fillStyle = '#e7efcf';
  ctx.beginPath();
  ctx.roundRect(52, 56, 92, 58, 18);
  ctx.fill();
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.28)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.fillStyle = '#4d6a10';
  ctx.font = '800 28px "JetBrains Mono", ui-monospace, monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(numStr, 98, 86);

  // Category pill on top-right
  const catLabel = (cert.category || 'Credential').toUpperCase();
  ctx.font = '700 18px "JetBrains Mono", ui-monospace, monospace';
  const catW = Math.min(360, ctx.measureText(catLabel).width + 48);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.roundRect(width - 52 - catW, 62, catW, 46, 23);
  ctx.fill();
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.28)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = '#4d6a10';
  ctx.fillText(catLabel, width - 52 - catW / 2, 86);

  // Institution / Issuer kicker
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = '#4d6a10';
  ctx.font = '700 22px "JetBrains Mono", ui-monospace, monospace';
  const issuerLines = wrapLines(ctx, cert.issuer.toUpperCase(), width - 104, 2);
  let y = 196;
  for (const line of issuerLines) {
    ctx.fillText(line, 52, y);
    y += 32;
  }

  // Olive rule
  y += 8;
  ctx.fillStyle = '#6f9a0c';
  ctx.beginPath();
  ctx.roundRect(52, y, 88, 7, 4);
  ctx.fill();
  y += 66;

  // Main Credential / Degree Title
  ctx.fillStyle = '#121410';
  ctx.font = '800 46px "Inter Tight", system-ui, sans-serif';
  const titleLines = wrapLines(ctx, cert.title, width - 104, 4);
  for (const line of titleLines) {
    ctx.fillText(line, 52, y);
    y += 58;
  }

  // Metadata Box near bottom
  const boxY = height - 245;
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.beginPath();
  ctx.roundRect(52, boxY, width - 104, 128, 20);
  ctx.fill();
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.22)';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.font = '700 18px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillStyle = 'rgba(18, 20, 16, 0.5)';
  ctx.fillText('ISSUED / COMPLETED', 80, boxY + 46);
  ctx.fillStyle = '#121410';
  ctx.font = '700 26px "Inter Tight", system-ui, sans-serif';
  ctx.fillText(cert.issue_date || 'Verified', 80, boxY + 90);

  ctx.textAlign = 'right';
  ctx.font = '700 18px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillStyle = 'rgba(18, 20, 16, 0.5)';
  ctx.fillText('STATUS', width - 80, boxY + 46);
  ctx.fillStyle = '#4d6a10';
  ctx.font = '700 24px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillText('VERIFIED', width - 80, boxY + 90);

  // Footer
  ctx.textAlign = 'left';
  ctx.strokeStyle = 'rgba(77, 106, 16, 0.16)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(52, height - 78);
  ctx.lineTo(width - 52, height - 78);
  ctx.stroke();

  ctx.font = '700 17px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillStyle = 'rgba(18, 20, 16, 0.52)';
  ctx.fillText('ACADEMIC & PROFESSIONAL CREDENTIAL', 52, height - 40);
  ctx.textAlign = 'right';
  ctx.fillStyle = '#4d6a10';
  ctx.fillText(cert.credential_url ? 'LINK VERIFIED' : 'OFFICIAL RECORD', width - 52, height - 40);

  return canvas.toDataURL('image/png');
}

function renderAddCredentialCardArtwork(): string {
  const width = 620;
  const height = 800;
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
  ctx.arc(width / 2, height / 2 - 48, 64, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 10;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(width / 2 - 26, height / 2 - 48);
  ctx.lineTo(width / 2 + 26, height / 2 - 48);
  ctx.moveTo(width / 2, height / 2 - 74);
  ctx.lineTo(width / 2, height / 2 - 22);
  ctx.stroke();

  ctx.fillStyle = '#121410';
  ctx.font = '800 40px "Inter Tight", system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Add Card', width / 2, height / 2 + 72);

  ctx.fillStyle = 'rgba(77, 106, 16, 0.85)';
  ctx.font = '600 20px "JetBrains Mono", ui-monospace, monospace';
  ctx.fillText('CLICK TO ADD DEGREE OR CERT', width / 2, height / 2 + 118);

  return canvas.toDataURL('image/png');
}

const inputCls =
  'w-full px-3 py-2 rounded-xl border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] text-xs focus:outline-none focus:border-[#4d6a10] focus:bg-white transition-colors';

export const EducationSection: React.FC<EducationSectionProps> = ({ certifications }) => {
  const { isEditMode, token, data, onRefreshData } = useAdminEdit();
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [modalIndex, setModalIndex] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);

  // Add New Credential / Degree Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCertForm, setNewCertForm] = useState({
    title: '',
    issuer: '',
    issue_date: '',
    expiry_date: '',
    credential_id: '',
    credential_url: '',
    category: 'Certification',
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

  const sectionBadge: string = parsedSections?.educationBadge || 'Academic & Professional Credentials';
  const sectionTitlePrefix: string = parsedSections?.educationTitlePrefix || 'Education &';
  const sectionTitleAccent: string = parsedSections?.educationTitleAccent || 'Certifications.';
  const sectionSubtitle: string =
    parsedSections?.educationSubtitle ||
    'Verified qualifications from premier global institutions spanning product leadership, project management, data science, physics, and computer science.';

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

  const persistCertUpdate = async (cert: Certification, patch: Partial<Certification>) => {
    if (!token) return;
    setSaving(true);
    try {
      await adminUpdateCertification(
        cert.id,
        {
          title: cert.title,
          issuer: cert.issuer,
          issue_date: cert.issue_date,
          expiry_date: cert.expiry_date ?? null,
          credential_id: cert.credential_id ?? null,
          credential_url: cert.credential_url ?? null,
          category: cert.category,
          order_index: cert.order_index,
          ...patch,
        },
        token
      );
      onRefreshData();
    } finally {
      setSaving(false);
    }
  };

  const handleCreateCert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newCertForm.title.trim() || !newCertForm.issuer.trim()) return;
    setSaving(true);
    try {
      await adminCreateCertification(
        {
          title: newCertForm.title.trim(),
          issuer: newCertForm.issuer.trim(),
          issue_date: newCertForm.issue_date.trim() || String(new Date().getFullYear()),
          expiry_date: newCertForm.expiry_date.trim() || null,
          credential_id: newCertForm.credential_id.trim() || null,
          credential_url: newCertForm.credential_url.trim() || null,
          category: newCertForm.category || 'Certification',
          order_index: certifications.length + 1,
        },
        token
      );
      onRefreshData();
      setNewCertForm({
        title: '',
        issuer: '',
        issue_date: '',
        expiry_date: '',
        credential_id: '',
        credential_url: '',
        category: 'Certification',
      });
      setShowAddModal(false);
    } finally {
      setSaving(false);
    }
  };

  // Memoize high-DPI credential slide artwork; append blank "+ Add Card" in Edit Mode
  const carouselItems = useMemo<FlexCarouselItem[]>(() => {
    if (typeof document === 'undefined') return [];
    const base: FlexCarouselItem[] = certifications.map((cert, i) => ({
      id: cert.id,
      src: renderCredentialCardImage(cert, i),
      alt: `${cert.title} — ${cert.issuer} (${cert.issue_date})`,
      title: cert.title,
      subtitle: `${cert.issuer} · ${cert.issue_date}`,
    }));
    if (isEditMode) {
      base.push({
        id: 'add-card',
        src: renderAddCredentialCardArtwork(),
        alt: 'Add new degree or certification card',
        title: 'Add New Credential',
        subtitle: 'Click to add degree or certification',
      });
    }
    return base;
  }, [certifications, isEditMode]);

  // Keyboard navigation & Escape close for modal (skip when typing)
  useEffect(() => {
    if (modalIndex === null || certifications.length === 0) return;
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA';
      if (isTyping) return;
      if (e.key === 'Escape') {
        setModalIndex(null);
      } else if (e.key === 'ArrowRight') {
        setModalIndex((prev) => {
          const next = ((prev ?? 0) + 1) % certifications.length;
          setActiveIndex(next);
          return next;
        });
      } else if (e.key === 'ArrowLeft') {
        setModalIndex((prev) => {
          const next = ((prev ?? 0) - 1 + certifications.length) % certifications.length;
          setActiveIndex(next);
          return next;
        });
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [modalIndex, certifications.length]);

  const safeActiveIndex = Math.min(activeIndex, Math.max(0, carouselItems.length - 1));
  const modalCert = modalIndex !== null ? certifications[modalIndex] || null : null;

  return (
    <section
      id="certifications"
      className="petalyx-scope relative py-20 md:py-24 border-b border-[#eef0ea] bg-[#fafcf7] overflow-x-clip"
      style={{ color: 'var(--ink)' }}
    >
      {/* Subtle Petalyx Grid Pattern Field */}
      <div className="absolute inset-0 petalyx-sq-field pointer-events-none opacity-50 z-0" />

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
        <div className="mb-4 flex flex-col items-center text-center gap-2">
          <div className="inline-flex items-center gap-2 petalyx-pill mb-1">
            <Award className="w-3.5 h-3.5 text-[#4d6a10]" />
            <InlineEditableText
              as="span"
              value={sectionBadge}
              onSave={(val) => persistSectionsPatch({ educationBadge: val })}
            />
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-[#121410] tracking-tight leading-[1.15]">
            <InlineEditableText
              as="span"
              value={sectionTitlePrefix}
              onSave={(val) => persistSectionsPatch({ educationTitlePrefix: val })}
            />{' '}
            <span className="text-[#4d6a10] italic">
              <InlineEditableText
                as="span"
                value={sectionTitleAccent}
                onSave={(val) => persistSectionsPatch({ educationTitleAccent: val })}
              />
            </span>
          </h2>
          <div className="text-xs sm:text-sm text-[#121410]/70 max-w-2xl leading-relaxed">
            <InlineEditableText
              as="p"
              multiline
              value={sectionSubtitle}
              onSave={(val) => persistSectionsPatch({ educationSubtitle: val })}
            />
          </div>
          <span className="text-xs font-mono text-[#121410]/70 bg-white/90 border border-[#4d6a10]/20 px-3.5 py-1.5 rounded-full">
            Click the center credential card to open full details
          </span>
        </div>
      </div>

      {/* Full-Bleed Liquid S-Curve FlexCarousel Stage */}
      {carouselItems.length > 0 && (
        <div className="relative z-10 w-full" style={{ height: '560px' }}>
          <FlexCarousel
            key={`${certifications.map((c) => `${c.id}:${c.title}:${c.issuer}:${c.issue_date}:${c.category}`).join('|')}-${isEditMode ? 'edit' : 'view'}`}
            items={carouselItems}
            activeIndex={safeActiveIndex}
            onChange={(idx) => setActiveIndex(idx)}
            onSelect={(idx) => {
              if (isEditMode && idx === certifications.length) {
                setShowAddModal(true);
              } else {
                setModalIndex(idx);
              }
            }}
            preset="liquid"
            intro="rise"
            fit="natural"
            cardHeight={0.5}
            gap={12}
            radius={0}
            lensWidth={0.74}
            lensHeight={1.18}
            tilt={62}
            roundness={1}
            bend={0.34}
            reach={0.38}
            curl="twist"
            dispersion={0.45}
            liquid={0}
            followCursor={false}
            squeeze={0.2}
            focusOnClick={false}
            autoplay={!isEditMode}
            interval={4}
            captions={true}
            captureWheel={true}
          />
        </div>
      )}

      {/* Compact Quick-Open Credential Pills */}
      {(certifications.length > 0 || isEditMode) && (
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 mt-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {certifications.map((cert, idx) => {
              const isActive = idx === safeActiveIndex;
              return (
                <button
                  key={cert.id}
                  type="button"
                  onClick={() => {
                    setActiveIndex(idx);
                    setModalIndex(idx);
                  }}
                  className={`text-xs font-mono px-3 py-1.5 rounded-full border transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#4d6a10] text-white border-[#4d6a10] font-bold shadow-xs'
                      : 'bg-white/90 text-[#121410]/85 border-[#4d6a10]/25 hover:border-[#4d6a10] hover:text-[#4d6a10]'
                  }`}
                >
                  {String(idx + 1).padStart(2, '0')} &middot; {cert.title.length > 26 ? `${cert.title.slice(0, 26)}…` : cert.title}
                </button>
              );
            })}
            {isEditMode && (
              <button
                type="button"
                onClick={() => setShowAddModal(true)}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-bold px-3.5 py-1.5 rounded-full border border-dashed border-[#4d6a10]/60 bg-[#e7efcf]/70 text-[#4d6a10] hover:bg-[#e7efcf] transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Card</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Credential Detail Pop-Up Modal (WITH ON-PAGE EDIT & DELETE) */}
      {modalCert && modalIndex !== null && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#121410]/55 backdrop-blur-sm overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="credential-modal-title"
          onClick={() => setModalIndex(null)}
        >
          <div
            data-lenis-prevent
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-[24px] border border-[#4d6a10]/30 bg-white shadow-2xl p-6 sm:p-8 space-y-5 text-[#121410]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#4d6a10]/15">
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                <span className="p-2.5 rounded-xl bg-[#e7efcf] border border-[#4d6a10]/25 text-[#4d6a10] shrink-0 mt-0.5">
                  {modalCert.category === 'Certification' ? (
                    <Award className="w-5 h-5" />
                  ) : (
                    <GraduationCap className="w-5 h-5" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[#e7efcf] text-[#4d6a10] border border-[#4d6a10]/20 uppercase font-bold">
                      <InlineEditableText
                        as="span"
                        value={modalCert.category}
                        onSave={(val) => persistCertUpdate(modalCert, { category: val })}
                      />
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#4d6a10] font-semibold">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Verified Credential
                    </span>
                    <span className="text-[11px] font-mono text-[#121410]/55">
                      {String(modalIndex + 1).padStart(2, '0')} / {String(certifications.length).padStart(2, '0')}
                    </span>
                    {isEditMode && (
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-[#4d6a10] text-white font-bold">
                        Inline Edit
                      </span>
                    )}
                  </div>
                  <h3
                    id="credential-modal-title"
                    className="font-display font-extrabold text-xl sm:text-2xl text-[#121410] leading-snug"
                  >
                    <InlineEditableText
                      as="span"
                      value={modalCert.title}
                      onSave={(val) => persistCertUpdate(modalCert, { title: val })}
                    />
                  </h3>
                  <div className="text-sm font-medium text-[#121410]/75 mt-1">
                    <InlineEditableText
                      as="span"
                      value={modalCert.issuer}
                      onSave={(val) => persistCertUpdate(modalCert, { issuer: val })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {isEditMode && (
                  <button
                    type="button"
                    disabled={saving}
                    onClick={async () => {
                      if (!token) return;
                      const ok = window.confirm(`Delete "${modalCert.title}"?`);
                      if (!ok) return;
                      setSaving(true);
                      try {
                        await adminDeleteCertification(modalCert.id, token);
                        setModalIndex(null);
                        onRefreshData();
                      } finally {
                        setSaving(false);
                      }
                    }}
                    title="Delete this credential card"
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white font-mono text-[11px] font-bold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Card</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setModalIndex(null)}
                  aria-label="Close credential details"
                  className="p-2 rounded-full border border-[#4d6a10]/20 bg-[#fafcf7] text-[#121410]/75 hover:bg-[#4d6a10] hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Metadata Strip */}
            <div className="grid sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-[14px] bg-[#fafcf7] border border-[#4d6a10]/20 flex items-center gap-2.5">
                <Calendar className="w-4 h-4 text-[#4d6a10] shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#121410]/55 block">
                    Issued / Year
                  </span>
                  <span className="font-semibold text-[#121410]">
                    <InlineEditableText
                      as="span"
                      value={modalCert.issue_date}
                      onSave={(val) => persistCertUpdate(modalCert, { issue_date: val })}
                    />
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-[14px] bg-[#fafcf7] border border-[#4d6a10]/20 flex items-center gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#4d6a10] shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#121410]/55 block">
                    Status / Expiry
                  </span>
                  <span className="font-semibold text-[#4d6a10]">
                    {isEditMode ? (
                      <InlineEditableText
                        as="span"
                        value={modalCert.expiry_date || 'Active · Verified'}
                        onSave={(val) =>
                          persistCertUpdate(modalCert, {
                            expiry_date: val.toLowerCase().includes('active') ? undefined : val,
                          })
                        }
                      />
                    ) : modalCert.expiry_date ? (
                      `Valid until ${modalCert.expiry_date}`
                    ) : (
                      'Active · Verified'
                    )}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-[14px] bg-[#fafcf7] border border-[#4d6a10]/20 flex items-center gap-2.5">
                <Hash className="w-4 h-4 text-[#4d6a10] shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#121410]/55 block">
                    Credential Ref
                  </span>
                  <span className="font-mono font-semibold text-[#121410] block">
                    <InlineEditableText
                      as="span"
                      value={modalCert.credential_id || `CRED-${String(modalIndex + 1).padStart(2, '0')}`}
                      onSave={(val) => persistCertUpdate(modalCert, { credential_id: val })}
                    />
                  </span>
                </div>
              </div>
            </div>

            {isEditMode && (
              <div className="p-3.5 rounded-[14px] bg-[#fafcf7] border border-[#4d6a10]/20 text-xs">
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold block mb-1">
                  Verification URL (Optional)
                </span>
                <InlineEditableText
                  as="span"
                  value={modalCert.credential_url || 'https://'}
                  onSave={(val) =>
                    persistCertUpdate(modalCert, {
                      credential_url: val === 'https://' ? undefined : val,
                    })
                  }
                />
              </div>
            )}

            {/* Footer Actions + Prev/Next */}
            <div className="pt-3 border-t border-[#4d6a10]/15 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => {
                  const prev = (modalIndex - 1 + certifications.length) % certifications.length;
                  setActiveIndex(prev);
                  setModalIndex(prev);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-mono font-semibold px-3.5 py-2 rounded-full border border-[#4d6a10]/25 bg-[#fafcf7] text-[#121410] hover:border-[#4d6a10] hover:text-[#4d6a10] transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              {modalCert.credential_url ? (
                <a
                  href={modalCert.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="petalyx-btn !py-2 !px-4 !text-xs"
                >
                  <span>Verify Credential</span>
                  <ExternalLink className="w-3.5 h-3.5 text-white" />
                </a>
              ) : (
                <span className="text-[11px] font-mono text-[#121410]/55">
                  Official Academic Record
                </span>
              )}

              <button
                type="button"
                onClick={() => {
                  const next = (modalIndex + 1) % certifications.length;
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

      {/* Add New Credential / Degree Modal */}
      {isEditMode && showAddModal && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-6 bg-[#121410]/55 backdrop-blur-sm overflow-hidden"
          role="dialog"
          aria-modal="true"
          onClick={() => setShowAddModal(false)}
        >
          <div
            data-lenis-prevent
            className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-[24px] border border-[#4d6a10]/30 bg-white shadow-2xl p-6 sm:p-7 space-y-5 text-[#121410]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#4d6a10]/15">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold block">
                  Education &amp; Certifications
                </span>
                <h3 className="font-display font-extrabold text-lg text-[#121410]">
                  Add New Credential / Degree Card
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

            <form onSubmit={handleCreateCert} className="space-y-3.5">
              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                  Degree / Certification Title *
                </label>
                <input
                  type="text"
                  required
                  value={newCertForm.title}
                  onChange={(e) => setNewCertForm({ ...newCertForm, title: e.target.value })}
                  placeholder="e.g. Executive Program in AI Product Leadership"
                  className={inputCls}
                  autoFocus
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                    Issuer / Institution *
                  </label>
                  <input
                    type="text"
                    required
                    value={newCertForm.issuer}
                    onChange={(e) => setNewCertForm({ ...newCertForm, issuer: e.target.value })}
                    placeholder="e.g. IIM Bangalore / PMI"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                    Category
                  </label>
                  <select
                    value={newCertForm.category}
                    onChange={(e) => setNewCertForm({ ...newCertForm, category: e.target.value })}
                    className={inputCls}
                  >
                    <option value="Certification">Certification</option>
                    <option value="Education">Education</option>
                    <option value="Executive Program">Executive Program</option>
                  </select>
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                    Issued / Completed Year
                  </label>
                  <input
                    type="text"
                    value={newCertForm.issue_date}
                    onChange={(e) => setNewCertForm({ ...newCertForm, issue_date: e.target.value })}
                    placeholder="e.g. 2025 or 2020 – 2022"
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                    Credential Ref ID (Optional)
                  </label>
                  <input
                    type="text"
                    value={newCertForm.credential_id}
                    onChange={(e) => setNewCertForm({ ...newCertForm, credential_id: e.target.value })}
                    placeholder="e.g. PMI-123456"
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase tracking-wider text-[#4d6a10] font-bold mb-1">
                  Verification Link URL (Optional)
                </label>
                <input
                  type="url"
                  value={newCertForm.credential_url}
                  onChange={(e) => setNewCertForm({ ...newCertForm, credential_url: e.target.value })}
                  placeholder="https://..."
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
                  disabled={saving || !newCertForm.title.trim() || !newCertForm.issuer.trim()}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#4d6a10] text-white font-mono text-xs font-bold hover:bg-[#3f590d] disabled:opacity-50 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>{saving ? 'Adding...' : 'Add Credential Card'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
};
