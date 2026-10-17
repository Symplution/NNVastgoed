import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // Waddenblauw als hoofdkleur, zonsondergang-oranje als accent, zand en klei voor warmte.
        brand: { DEFAULT: '#0e4a6e', dark: '#0a3550', soft: '#e6f0f6' },
        accent: { DEFAULT: '#e8741f', dark: '#c85f12', soft: '#fdf0e4' },
        ink: '#14212b',
        muted: '#5d6b76',
        line: '#dde4e9',
        sand: '#f7f4ee',
      },
      fontFamily: { sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Text', 'Inter', 'system-ui', 'sans-serif'] },
      boxShadow: { card: '0 1px 2px rgba(20,33,43,0.05), 0 8px 24px -12px rgba(20,33,43,0.14)' },
    },
  },
  plugins: [],
};

export default config;
