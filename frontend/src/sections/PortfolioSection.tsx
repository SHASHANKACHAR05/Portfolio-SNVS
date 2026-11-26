import React, { useState } from 'react';
import { ExternalLink, ArrowRight, CheckCircle2, ChevronDown, ChevronsUpDown, Briefcase } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Project } from '../types';
import { InlineSectionEditor } from '../context/AdminEditContext';

interface PortfolioSectionProps {
  projects: Project[];
  onOpenCaseStudy: (project: Project) => void;
}

const CLOUD_A = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093216_44218665-b15e-4566-a2d4-2676ab03609d.png';
const CLOUD_B = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20261021_093215_0f37c0c3-f82c-485b-87dd-5a35b75a8782.png';

export const PortfolioSection: React.FC<PortfolioSectionProps> = ({ projects, onOpenCaseStudy }) => {
  // All initiatives closed by default as established in requirements
  const [expandedIds, setExpandedIds] = useState<number[]>([]);

  const parseJson = (val?: string) => {
    if (!val) return [];
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const areAllExpanded = projects.length > 0 && expandedIds.length === projects.length;

  const toggleAll = () => {
    if (areAllExpanded) {
      setExpandedIds([]);
    } else {
      setExpandedIds(projects.map((p) => p.id));
    }
  };

  return (
    <section
      id="portfolio"
      className="petalyx-scope relative py-20 md:py-28 bg-white overflow-x-clip border-b border-[#eef0ea]"
      style={{
        color: 'var(--ink)'
      }}
    >
      {/* 1. Subtle Petalyx Grid Pattern Field */}
      <div className="absolute inset-0 petalyx-sq-field pointer-events-none opacity-40 z-0" />

      {/* 2. Drifting Background Clouds */}
      <div className="absolute top-1/4 -left-20 pointer-events-none z-[1] overflow-hidden opacity-30 select-none">
        <img
          src={CLOUD_A}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="animate-drift-a w-[480px] max-w-none"
        />
      </div>
      <div className="absolute bottom-10 -right-20 pointer-events-none z-[1] overflow-hidden opacity-25 select-none">
        <img
          src={CLOUD_B}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="animate-drift-b w-[520px] max-w-none"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <InlineSectionEditor section="projects" label="Projects" />
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 petalyx-pill mb-3">
              <Briefcase className="w-3.5 h-3.5 text-[#4d6a10]" />
              <span>Enterprise Initiatives & Deployments</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-extrabold text-[#121410] tracking-tight leading-[1.15]">
              Featured Product & <span className="text-[#4d6a10] italic">Systems Portfolio.</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#121410]/70 mt-2 max-w-2xl leading-relaxed">
              High-impact digital transformations spanning nationwide higher education ERP, public cultural preservation, and multi-campus cloud migration. Click any initiative dropdown to view full scope and measurable outcomes.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            <button
              onClick={toggleAll}
              className="px-3.5 py-2 rounded-full border border-[#eef0ea] bg-white hover:bg-[#e7efcf]/50 text-[#121410]/70 hover:text-[#121410] text-xs font-mono font-medium flex items-center gap-1.5 transition-colors shadow-2xs"
            >
              <ChevronsUpDown className="w-3.5 h-3.5 text-[#4d6a10]" />
              <span>{areAllExpanded ? 'Collapse All' : 'Expand All'}</span>
            </button>
            <a
              href="#case-studies"
              className="text-xs font-mono text-[#4d6a10] font-semibold flex items-center gap-1 hover:underline shrink-0"
            >
              <span>Browse Full Case Studies</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Project Cards List with Giant Petalyx Numerals */}
        <div className="space-y-4">
          {projects.map((proj, idx) => {
            const responsibilities = parseJson(proj.responsibilities_json);
            const techStack = parseJson(proj.tech_stack_json);
            const impactMetrics = parseJson(proj.impact_metrics_json);
            const isOpen = expandedIds.includes(proj.id);
            const numStr = String(idx + 1).padStart(2, '0');

            return (
              <div
                key={proj.id}
                className={`relative rounded-[22px] border transition-all duration-300 overflow-hidden ${
                  isOpen
                    ? 'border-[#4d6a10] bg-white shadow-md'
                    : 'border-[#eef0ea] bg-white/95 hover:border-[#4d6a10]/50 hover:shadow-xs'
                }`}
              >
                {/* Dropdown Header Trigger */}
                <div
                  onClick={() => toggleExpand(proj.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      toggleExpand(proj.id);
                    }
                  }}
                  className="w-full text-left p-5 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 cursor-pointer select-none transition-colors"
                >
                  <div className="flex items-start gap-4 sm:gap-6 flex-1 min-w-0">
                    {/* Giant Petalyx Numeral (01, 02, ...) */}
                    <div className="font-display font-extrabold text-3xl sm:text-4xl text-[#b4cd52] select-none shrink-0 group-hover:text-[#4d6a10] transition-colors leading-none pt-1">
                      {numStr}
                    </div>

                    <div className="space-y-2 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono uppercase tracking-wider font-bold text-[#4d6a10]">
                          {proj.category}
                        </span>
                        <span className="text-[#121410]/30 text-xs">&bull;</span>
                        <span className="text-xs font-mono text-[#121410]/60">
                          Initiative {numStr}
                        </span>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#e7efcf] border border-[#4d6a10]/20 text-[#4d6a10] font-semibold">
                          {proj.role}
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-lg sm:text-xl text-[#121410] tracking-tight hover:text-[#4d6a10] transition-colors">
                        {proj.title}
                      </h3>

                      <p className="text-xs font-mono text-[#121410]/60">
                        Client / Organization: <strong className="text-[#121410]">{proj.client_org}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Actions & Dropdown Indicator */}
                  <div className="flex items-center gap-3 shrink-0 self-start md:self-center pl-12 sm:pl-0">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenCaseStudy(proj);
                      }}
                      className="petalyx-btn !py-2 !px-3.5 !text-xs shrink-0"
                    >
                      <span>View Case Study</span>
                      <ExternalLink className="w-3.5 h-3.5 text-white" />
                    </button>

                    <div
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-mono font-medium transition-all ${
                        isOpen
                          ? 'border-[#4d6a10] text-[#4d6a10] bg-[#e7efcf]'
                          : 'border-[#eef0ea] text-[#121410]/60 bg-white hover:text-[#121410] hover:border-[#4d6a10]/40'
                      }`}
                    >
                      <span className="hidden sm:inline">
                        {isOpen ? 'Hide Details' : 'View Details'}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isOpen ? 'rotate-180 text-[#4d6a10]' : 'text-[#121410]/50'
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Dropdown Collapsible Content */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      key={`content-${proj.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ 
                        height: 'auto', 
                        opacity: 1,
                        transition: {
                          height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                          opacity: { duration: 0.25, delay: 0.08 }
                        }
                      }}
                      exit={{ 
                        height: 0, 
                        opacity: 0,
                        transition: {
                          height: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                          opacity: { duration: 0.15 }
                        }
                      }}
                      className="overflow-hidden"
                    >
                      <div className="p-5 sm:p-7 pt-2 border-t border-[#eef0ea] space-y-6 bg-[#fafcf7]/70">
                        {/* Challenge & Solution Grid */}
                        <div className="grid md:grid-cols-2 gap-4 text-xs sm:text-sm">
                          <div className="p-4 rounded-[16px] bg-white border border-[#eef0ea] space-y-2 shadow-2xs">
                            <span className="text-[11px] font-mono uppercase font-bold text-[#4d6a10] block">
                              The Business & Technology Challenge
                            </span>
                            <p className="text-[#121410]/75 leading-relaxed font-normal">
                              {proj.challenge}
                            </p>
                          </div>
                          <div className="p-4 rounded-[16px] bg-white border border-[#eef0ea] space-y-2 shadow-2xs">
                            <span className="text-[11px] font-mono uppercase font-bold text-[#4d6a10] block">
                              The Product & Engineering Solution
                            </span>
                            <p className="text-[#121410]/75 leading-relaxed font-normal">
                              {proj.solution}
                            </p>
                          </div>
                        </div>

                        {/* Role & Responsibilities */}
                        <div>
                          <div className="flex items-center gap-2 mb-2.5">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-[#121410]/60 font-bold">
                              Key Architectural & Delivery Responsibilities:
                            </span>
                          </div>
                          <ul className="grid sm:grid-cols-2 gap-2 text-xs text-[#121410]/90">
                            {responsibilities.map((resp: string, i: number) => (
                              <li key={i} className="flex items-start gap-2 bg-white p-3 rounded-[14px] border border-[#eef0ea] shadow-2xs">
                                <CheckCircle2 className="w-4 h-4 text-[#4d6a10] shrink-0 mt-0.5" />
                                <span>{resp}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Metrics Badges Grid */}
                        {impactMetrics.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[11px] font-mono uppercase tracking-wider text-[#4d6a10] font-bold block mb-2.5">
                              Verified Measurable Impact
                            </span>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {impactMetrics.map((met: any, i: number) => (
                                <div key={i} className="p-3.5 rounded-[16px] border border-[#4d6a10]/20 bg-[#e7efcf]/50 text-center">
                                  <span className="font-display font-bold text-lg sm:text-xl text-[#4d6a10] block">
                                    {met.value}
                                  </span>
                                  <span className="text-[10px] font-mono text-[#121410]/70 uppercase tracking-tight block mt-1 font-semibold">
                                    {met.label}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Tech Stack Chips & Action Link */}
                        <div className="pt-4 border-t border-[#eef0ea] flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="text-[10px] font-mono text-[#121410]/50 uppercase mr-1">Stack:</span>
                            {techStack.map((tech: string, i: number) => (
                              <span
                                key={i}
                                className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white text-[#121410]/80 border border-[#eef0ea]"
                              >
                                {tech}
                              </span>
                            ))}
                          </div>

                          <button
                            type="button"
                            onClick={() => onOpenCaseStudy(proj)}
                            className="text-xs font-mono font-semibold text-[#4d6a10] hover:underline flex items-center gap-1"
                          >
                            <span>Read In-Depth Case Study &rarr;</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
