import React, { useState, useEffect } from 'react';
import { Menu, X, Shield } from 'lucide-react';
import { ThemeToggle } from './ThemeToggle';

interface NavbarProps {
  onOpenAdmin: () => void;
  isAdminLoggedIn: boolean;
}

const NAV_LINKS = [
  { label: 'Home', href: '#home' },
  { label: 'About', href: '#about' },
  { label: 'Experience', href: '#experience' },
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'Product Thinking', href: '#product-thinking' },
  { label: 'Capabilities', href: '#capabilities' },
  { label: 'Skills & Tools', href: '#skills' },
  { label: 'Certifications', href: '#certifications' },
  { label: 'Contact', href: '#contact' }
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenAdmin, isAdminLoggedIn }) => {
  const [activeSection, setActiveSection] = useState<string>('home');
  const [isOverLightSection, setIsOverLightSection] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);

  useEffect(() => {
    const LIGHT_SECTION_IDS = new Set([
      'home',
      'overview',
      'record',
      'about',
      'experience',
      'portfolio',
      'case-studies',
      'product-thinking',
      'capabilities',
      'skills',
      'certifications',
      'contact',
    ]);

    const handleScroll = () => {
      setScrolled(window.scrollY > 20);

      // 1. Update active nav link highlight
      const navSections = NAV_LINKS.map(link => link.href.substring(1));
      const scrollPosition = window.scrollY + 120;

      for (let i = navSections.length - 1; i >= 0; i--) {
        const el = document.getElementById(navSections[i]);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveSection(navSections[i]);
          break;
        }
      }

      // 2. Detect the exact section currently behind the navbar (including sections not in NAV_LINKS like #record & #case-studies)
      const probeY = 36; // vertical center of the fixed header
      const allSections = document.querySelectorAll<HTMLElement>('main > section[id]');
      let matchedLight = false;

      for (let i = 0; i < allSections.length; i++) {
        const rect = allSections[i].getBoundingClientRect();
        if (rect.top <= probeY && rect.bottom > probeY) {
          matchedLight = LIGHT_SECTION_IDS.has(allSections[i].id);
          break;
        }
      }

      setIsOverLightSection(matchedLight);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  const isLight = isOverLightSection;

  return (
    <header className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
      scrolled
        ? (isLight
            ? 'bg-transparent backdrop-blur-[6px] border-b border-black/10 shadow-xs'
            : 'bg-[#0A0E17]/85 backdrop-blur-md border-b border-[#1E293B] shadow-lg')
        : 'bg-transparent border-b border-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-18 gap-2">
          
          {/* Logo / Monogram */}
          <a href="#home" className="flex items-center gap-2.5 shrink-0 group">
            <span className={`w-8 h-8 rounded-lg font-mono font-bold text-xs flex items-center justify-center tracking-tighter group-hover:scale-105 transition-all shadow-xs ${
              isLight
                ? 'bg-black text-white'
                : 'bg-accent text-[#0A0E17] shadow-glow-gold'
            }`}>
              SB
            </span>
            <span className={`font-display font-bold text-sm sm:text-base tracking-tight transition-colors truncate ${
              isLight
                ? 'text-black group-hover:text-black/70'
                : 'text-fg group-hover:text-accent'
            }`}>
              SNVS
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center space-x-0.5 2xl:space-x-1 text-xs font-medium shrink-0" aria-label="Main Navigation">
            {NAV_LINKS.map((link) => {
              const isActive = activeSection === link.href.substring(1);
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className={`px-2.5 py-1.5 rounded-lg transition-all whitespace-nowrap font-medium ${
                    isActive
                      ? (isLight
                          ? 'text-black font-bold bg-black/10 border border-black/20 shadow-xs'
                          : 'text-accent font-semibold bg-accent/15 border border-accent/30 shadow-xs')
                      : (isLight
                          ? 'text-black/85 hover:text-black hover:bg-black/5 font-semibold'
                          : 'text-muted hover:text-fg hover:bg-white/5')
                  }`}
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            <ThemeToggle isLight={isLight} />
            <button
              onClick={onOpenAdmin}
              className={`text-xs font-mono px-2.5 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 whitespace-nowrap ${
                isLight
                  ? 'border-black/30 text-black hover:border-black hover:bg-black/5 font-semibold'
                  : (isAdminLoggedIn
                      ? 'border-accent text-accent bg-accent/10 shadow-xs'
                      : 'border-line text-muted hover:text-fg hover:border-accent/60')
              }`}
              title={isAdminLoggedIn ? "Open Admin Control Center" : "Admin Login"}
            >
              <Shield className={`w-3.5 h-3.5 ${isLight ? 'text-black' : 'text-accent'}`} />
              <span>{isAdminLoggedIn ? 'Dashboard' : 'Admin'}</span>
            </button>
            <a
              href="#contact"
              className={`text-xs font-bold px-4 py-2 rounded-lg transition-all whitespace-nowrap ${
                isLight
                  ? 'bg-black text-white hover:bg-black/80 shadow-xs'
                  : 'bg-accent hover:bg-accent-hover text-[#0A0E17] shadow-glow-gold'
              }`}
            >
              Let's Connect
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 xl:hidden shrink-0">
            <ThemeToggle isLight={isLight} />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className={`p-2 rounded-lg focus:outline-none transition-colors ${
                isLight ? 'text-black hover:bg-black/5' : 'text-muted hover:text-fg hover:bg-white/5'
              }`}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? (
                <X className={`w-6 h-6 ${isLight ? 'text-black' : 'text-accent'}`} />
              ) : (
                <Menu className={`w-6 h-6 ${isLight ? 'text-black' : 'text-fg'}`} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className={`xl:hidden border-b px-4 pt-3 pb-6 space-y-1.5 shadow-2xl backdrop-blur-xl ${
          isLight
            ? 'bg-white/95 border-black/10 text-black'
            : 'bg-[#111827] border-line text-fg'
        }`}>
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-semibold transition-colors ${
                isLight
                  ? 'text-black hover:bg-black/5'
                  : 'text-fg hover:bg-white/5 hover:text-accent'
              }`}
            >
              {link.label}
            </a>
          ))}
          <div className="pt-4 border-t border-black/10 flex items-center justify-between">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className={`text-xs font-mono px-3 py-2 rounded-lg border flex items-center gap-1.5 ${
                isLight
                  ? 'border-black/20 text-black font-semibold'
                  : 'border-line text-muted'
              }`}
            >
              <Shield className={`w-3.5 h-3.5 ${isLight ? 'text-black' : 'text-accent'}`} />
              <span>{isAdminLoggedIn ? 'Admin Dashboard' : 'Admin Login'}</span>
            </button>
            <a
              href="#contact"
              onClick={() => setMobileMenuOpen(false)}
              className={`text-xs font-bold px-4 py-2 rounded-lg ${
                isLight ? 'bg-black text-white' : 'bg-accent text-[#0A0E17]'
              }`}
            >
              Let's Connect
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
