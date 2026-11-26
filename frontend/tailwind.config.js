/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        bg: '#0A0E17',
        surface: '#111827',
        fg: '#F8FAFC',
        muted: '#94A3B8',
        line: '#1E293B',
        accent: {
          DEFAULT: '#D4AF37',
          hover: '#E5C358',
          light: '#252014',
          dark: '#D4AF37',
        },
        ink: '#F8FAFC',
        warm: '#D4AF37',
        secondary: '#161F30',
        chip: '#182234',
        dark: {
          bg: '#0A0E17',
          surface: '#111827',
          fg: '#F8FAFC',
          muted: '#94A3B8',
          line: '#1E293B',
          accent: '#D4AF37',
          chip: '#182234',
          warm: '#D4AF37'
        }
      },
      fontFamily: {
        sans: ['"Inter Tight"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        display: ['"Inter Tight"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
        mono: ['"Inter Tight"', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'glow-gold': '0 0 25px -5px rgba(212, 175, 55, 0.25)',
        'glow-card': '0 0 40px -10px rgba(14, 165, 233, 0.12)',
        'glow-subtle': '0 4px 20px -2px rgba(0, 0, 0, 0.5)',
      }
    },
  },
  plugins: [],
}
