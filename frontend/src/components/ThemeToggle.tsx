import React, { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  isLight?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ isLight = false }) => {
  const [isDark, setIsDark] = useState<boolean>(true);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
      setIsDark(false);
      document.documentElement.classList.remove('dark');
    } else {
      // Default to dark theme
      setIsDark(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`p-2 rounded-lg transition-colors focus:outline-none ${
        isLight ? 'text-black hover:bg-black/5' : 'text-muted hover:text-fg hover:bg-white/5'
      }`}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
    >
      {isDark ? (
        <Sun className={`w-4 h-4 ${isLight ? 'text-black' : 'text-accent'}`} />
      ) : (
        <Moon className={`w-4 h-4 ${isLight ? 'text-black' : 'text-accent'}`} />
      )}
    </button>
  );
};
