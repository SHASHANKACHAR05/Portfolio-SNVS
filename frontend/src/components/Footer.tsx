import React from 'react';
import { ArrowUp, Linkedin, Mail, Shield } from 'lucide-react';

interface FooterProps {
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAdmin, isAdminLoggedIn }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer
      className="petalyx-scope border-t border-[#eef0ea] bg-[#fafcf7] py-12 transition-colors relative"
      style={{ color: 'var(--ink)' }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-[#eef0ea]">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-display font-bold text-lg text-[#121410]">
                N V Sai Bharath Singamsetty
              </span>
              <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-[#e7efcf] text-[#4d6a10] border border-[#4d6a10]/20 font-semibold">
                Bengaluru, India
              </span>
            </div>
            <p className="text-sm text-[#121410]/70 mt-1.5 max-w-lg">
              Product &amp; Technology Leadership. Building scalable enterprise platforms, driving digital transformation, and translating complex requirements into impactful technology solutions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://www.linkedin.com/in/snvsbharath/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2.5 rounded-xl border border-[#eef0ea] bg-white text-[#121410]/70 hover:text-[#4d6a10] hover:border-[#4d6a10]/40 hover:bg-[#e7efcf]/40 transition-all shadow-2xs"
              aria-label="LinkedIn Profile"
            >
              <Linkedin className="w-4 h-4" />
            </a>
            <a
              href="mailto:snvsbharath@rediffmail.com"
              className="p-2.5 rounded-xl border border-[#eef0ea] bg-white text-[#121410]/70 hover:text-[#4d6a10] hover:border-[#4d6a10]/40 hover:bg-[#e7efcf]/40 transition-all shadow-2xs"
              aria-label="Email N V Sai Bharath"
            >
              <Mail className="w-4 h-4" />
            </a>
            <button
              type="button"
              onClick={scrollToTop}
              className="p-2.5 rounded-xl border border-[#eef0ea] bg-white text-[#121410]/70 hover:text-[#4d6a10] hover:border-[#4d6a10]/40 hover:bg-[#e7efcf]/40 transition-all shadow-2xs"
              aria-label="Back to top"
              title="Back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono text-[#121410]/60">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span>Languages: Telugu (Native), English, Hindi</span>
            <span>Focus: Enterprise ERP &middot; Cloud Architecture &middot; Product Strategy</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={onOpenAdmin}
              className="hover:text-[#4d6a10] transition-colors flex items-center gap-1 font-semibold"
            >
              <Shield className="w-3.5 h-3.5 text-[#4d6a10]" />
              <span>{isAdminLoggedIn ? "Admin Dashboard" : "Admin Login"}</span>
            </button>
            <span>&copy; {new Date().getFullYear()} N V Sai Bharath Singamsetty</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
