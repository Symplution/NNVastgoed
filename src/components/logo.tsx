import Link from 'next/link';

/** Woordmerk: een huisje op een golf, met NNV. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="focus-ring inline-flex items-center gap-2.5 rounded-md" aria-label="NNvastgoed, naar de voorpagina">
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <rect width="34" height="34" rx="9" fill={light ? '#ffffff' : '#0e4a6e'} />
        <path d="M7 16.5 17 8l10 8.5" fill="none" stroke="#e8741f" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M9 17v7h16v-7" fill="none" stroke={light ? '#0e4a6e' : '#fff'} strokeWidth="2.2" strokeLinejoin="round" />
        <path d="M5 27.5c3-2.2 5-2.2 8 0s5 2.2 8 0 5-2.2 8 0" fill="none" stroke={light ? '#0e4a6e' : '#9cc7e0'} strokeWidth="1.8" strokeLinecap="round" />
      </svg>
      <span className="leading-none">
        <span className={`block text-lg font-extrabold tracking-tight ${light ? 'text-white' : 'text-brand'}`}>NNvastgoed</span>
        <span className={`block text-[10px] font-semibold uppercase tracking-[0.14em] ${light ? 'text-white/70' : 'text-muted'}`}>Noord Nederland Vastgoed</span>
      </span>
    </Link>
  );
}
