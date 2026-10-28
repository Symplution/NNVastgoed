import Link from 'next/link';

/** Woordmerk: een woning in een vergrootglas, met de naam ernaast. */
export function Logo({ light = false }: { light?: boolean }) {
  return (
    <Link href="/" className="focus-ring inline-flex items-center gap-2.5 rounded-md" aria-label="NNvastgoed, naar de voorpagina">
      <svg width="36" height="36" viewBox="0 0 34 34" aria-hidden="true">
        <rect width="34" height="34" rx="9" fill={light ? '#ffffff' : '#0e4a6e'} />
        <path d="M22.6 22.6 28.8 28.8" fill="none" stroke="#e8741f" strokeWidth="3.8" strokeLinecap="round" />
        <circle cx="14.8" cy="14.8" r="10.2" fill={light ? '#e6f0f6' : 'rgba(255,255,255,0.14)'} stroke={light ? '#0e4a6e' : '#ffffff'} strokeWidth="2.5" />
        <path d="M9 15.4 14.8 10.2l5.8 5.2" fill="none" stroke="#e8741f" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10.8 14.8v5.9h8v-5.9" fill="none" stroke={light ? '#0e4a6e' : '#ffffff'} strokeWidth="1.9" strokeLinejoin="round" />
        <rect x="13.8" y="17.2" width="2" height="3.5" rx="0.6" fill="#e8741f" />
      </svg>
      <span className="leading-none">
        <span className={`block text-xl font-extrabold tracking-tight ${light ? 'text-white' : 'text-brand'}`}>NNVastgoed</span>
      </span>
    </Link>
  );
}
