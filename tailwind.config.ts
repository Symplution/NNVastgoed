import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Veengroen als hoofdkleur, Groningse baksteen als accent, crème voor warmte.
        brand: { DEFAULT: '#1f4d3f', dark: '#143428', soft: '#e4eee8' },
        accent: { DEFAULT: '#b4432c', dark: '#8f3320', soft: '#f7e4dc' },
        ink: '#1b2620',
        muted: '#5c6860',
        line: '#e0e3da',
        sand: '#f4efe4',
        cream: '#fbf8f1',
      },
      // Koppen in een zachte serif (op elk apparaat aanwezig, dus niets om te laden); de rest blijft rustig sans-serif.
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', 'system-ui', 'sans-serif'],
        display: ['"Iowan Old Style"', '"Palatino Linotype"', 'Palatino', 'Charter', 'Georgia', 'serif'],
      },
      boxShadow: { card: '0 1px 2px rgba(27,38,32,0.05), 0 12px 28px -14px rgba(27,38,32,0.18)' },
    },
  },
  plugins: [],
};

export default config;
