import React, { useState, useEffect, useRef } from 'react';
import { ArrowDown, Download, Linkedin, Check, MapPin, ExternalLink } from 'lucide-react';
import { gsap } from 'gsap';
import { Profile } from '../types';
import { InlineEditableText, useAdminEdit } from '../context/AdminEditContext';
import { adminUpdateProfile } from '../services/api';

interface OverviewSectionProps {
  profile: Profile | null;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ profile }) => {
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const { token, onRefreshData } = useAdminEdit();

  const email = profile?.email || 'snvsbharath@rediffmail.com';
  const headline = profile?.headline || 'Building Products. Transforming Systems. Delivering Impact.';
  const summary =
    profile?.summary ||
    'Product and technology leader focused on building scalable enterprise platforms, driving digital transformation, and translating complex business requirements into impactful technology solutions.';
  const fullName = profile?.name || 'N V Sai Bharath Singamsetty';
  const location = profile?.location || 'Bengaluru, India';
  const roleTitle = profile?.title || 'Senior Manager, Technology';
  const yearsExp = profile?.years_of_experience || 10;

  const saveProfileField = async (field: string, value: string) => {
    if (!token) return;
    await adminUpdateProfile({ [field]: value }, token);
    onRefreshData();
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const focusPills = [
    'Product Management',
    'Enterprise Technology',
    'ERP Architecture',
    'Digital Transformation',
    'AI & Automation'
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.petalyx-overview-word',
        { opacity: 0, y: 14, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.65,
          stagger: 0.06,
          ease: 'power2.out',
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="overview"
      ref={containerRef}
      className="petalyx-scope relative py-20 md:py-28 bg-[#fafcf7] border-y border-[#eef0ea] overflow-x-clip"
      style={{ color: 'var(--ink)' }}
    >
      {/* Subtle Petalyx Grid Pattern Field */}
      <div className="absolute inset-0 petalyx-sq-field pointer-events-none opacity-50 z-0" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">

          {/* Left Column (7 cols): Headline, Narrative, Focus Pills & CTAs */}
          <div className="lg:col-span-7 space-y-6 p-6 sm:p-8 md:p-10 rounded-[28px] md:rounded-[32px] bg-white border border-[#eef0ea] shadow-md">
            {/* Headline (Directly editable on page in Admin Edit Mode) */}
            <InlineEditableText
              as="div"
              value={headline}
              onSave={(val) => saveProfileField('headline', val)}
              className="text-2xl sm:text-3xl font-display font-extrabold text-[#121410] tracking-tight leading-snug"
              renderView={(val) => {
                const words = val.split(' ');
                return (
                  <>
                    {words.map((word, idx) => (
                      <span
                        key={idx}
                        className={`petalyx-overview-word inline-block mr-1.5 font-extrabold ${
                          idx >= 2 && idx <= 3 ? 'text-[#4d6a10] italic' : ''
                        }`}
                      >
                        {word}
                      </span>
                    ))}
                  </>
                );
              }}
            />

            {/* Narrative Descriptions */}
            <div className="space-y-3">
              <InlineEditableText
                as="p"
                multiline
                value={summary}
                onSave={(val) => saveProfileField('summary', val)}
                className="text-base sm:text-lg text-[#121410] leading-relaxed max-w-2xl font-bold"
              />
              <p className="text-sm sm:text-base text-[#121410] leading-relaxed max-w-2xl font-semibold">
                Over {yearsExp} years of cross-functional leadership spanning nationwide higher education ERP deployments, digital heritage and festival systems for a national film corporation, and modern multi-campus cloud architecture.
              </p>
            </div>

            {/* Leadership Focus Pills */}
            <div className="pt-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-extrabold block mb-2.5">
                Core Leadership Focus
              </span>

              <div className="flex flex-wrap gap-2 text-xs">
                {focusPills.map((pill) => (
                  <span
                    key={pill}
                    className="inline-block px-3 py-1.5 rounded-full border border-[#4d6a10]/30 bg-[#e7efcf]/90 text-[#4d6a10] font-bold shadow-xs hover:bg-[#e7efcf] transition-all cursor-default"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </div>

            {/* Functional Petalyx CTAs & Email */}
            <div className="pt-4 flex flex-wrap items-center gap-3">
              <a href="#portfolio" className="petalyx-btn">
                <span>Explore My Work</span>
                <ArrowDown className="w-4 h-4 text-white" />
              </a>

              <a
                href="#case-studies"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-[22px] border border-[#eef0ea] bg-white hover:border-[#4d6a10]/40 text-[#121410] font-semibold text-xs sm:text-sm shadow-xs transition-colors"
              >
                <span>View Product Case Studies</span>
                <ExternalLink className="w-3.5 h-3.5 text-[#4d6a10]" />
              </a>

              <a
                href="/api/portfolio/resume/download"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-3 rounded-[22px] border border-[#eef0ea] text-[#121410]/70 hover:text-[#121410] hover:border-[#4d6a10]/30 font-mono text-xs transition-colors bg-[#fafcf7]"
                title="Download Executive Text Resume"
              >
                <Download className="w-3.5 h-3.5 text-[#4d6a10]" />
                <span>Download Resume</span>
              </a>

              <div className="inline-flex flex-wrap sm:flex-nowrap items-center gap-2 px-3.5 py-2 rounded-[22px] border border-[#eef0ea] bg-[#fafcf7] font-mono text-xs text-[#121410]/80 shadow-xs">
                <span className="select-all break-all sm:break-normal truncate sm:overflow-visible">{email}</span>
                <button
                  type="button"
                  onClick={copyEmail}
                  className="px-2.5 py-1 rounded-full bg-[#e7efcf] text-[#4d6a10] hover:bg-[#b4cd52] hover:text-[#121410] font-semibold shrink-0 transition-colors cursor-pointer"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#4d6a10]" /> : 'Copy'}
                </button>
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Career Snapshot Card */}
          <div className="lg:col-span-5 flex justify-center lg:justify-end">
            <div className="w-full max-w-[440px]">
              <div className="p-6 rounded-[24px] border border-[#eef0ea] bg-white shadow-md space-y-4 text-xs">
                {/* Header */}
                <div className="flex items-center justify-between pb-3.5 border-b border-[#eef0ea]">
                  <div>
                    <InlineEditableText
                      as="h3"
                      value={fullName}
                      onSave={(val) => saveProfileField('name', val)}
                      className="font-display font-bold text-base text-[#121410]"
                    />
                    <div className="flex items-center gap-1.5 text-xs font-mono text-[#121410]/60 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-[#4d6a10] shrink-0" />
                      <InlineEditableText
                        as="span"
                        value={location}
                        onSave={(val) => saveProfileField('location', val)}
                      />
                    </div>
                  </div>
                  <span className="font-mono text-[11px] px-2.5 py-1 rounded-full bg-[#e7efcf] text-[#4d6a10] font-semibold border border-[#4d6a10]/20 shrink-0">
                    {yearsExp}+ Years Record
                  </span>
                </div>

                {/* Current Role */}
                <div className="space-y-1">
                  <span className="font-mono text-[10px] uppercase text-[#4d6a10] font-bold block tracking-wider">
                    Current Role
                  </span>
                  <InlineEditableText
                    as="div"
                    value={roleTitle}
                    onSave={(val) => saveProfileField('title', val)}
                    className="font-semibold text-[#121410] text-sm"
                  />
                  <div className="text-[#121410]/60 text-[11px]">
                    Group of Institutions, Bengaluru &middot; since Aug 2025
                  </div>
                </div>

                {/* Previous Leadership */}
                <div className="pt-3 border-t border-[#eef0ea] space-y-1">
                  <span className="font-mono text-[10px] uppercase text-[#121410]/50 font-bold block tracking-wider">
                    Previous Leadership
                  </span>
                  <div className="font-semibold text-[#121410] text-sm">
                    Head of IT, National Film Development Corporation
                  </div>
                  <div className="text-[#121410]/60 text-[11px]">
                    NFDC India, Mumbai &middot; Aug 2023 to Aug 2025
                  </div>
                </div>

                {/* Connect on LinkedIn */}
                <div className="pt-3.5 border-t border-[#eef0ea]">
                  <a
                    href="https://www.linkedin.com/in/snvsbharath/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 rounded-[16px] border border-[#eef0ea] bg-[#fafcf7] text-xs font-semibold text-[#121410] hover:border-[#4d6a10] hover:text-[#4d6a10] hover:bg-[#e7efcf]/30 flex items-center justify-center gap-2 transition-all shadow-2xs"
                  >
                    <Linkedin className="w-4 h-4 text-[#4d6a10]" />
                    <span>Connect on LinkedIn</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

