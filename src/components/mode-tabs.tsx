import Link from 'next/link';
import { MODE_INFO, MODES, type Mode } from '@/lib/search';

/** Schakelaar tussen kopen, huren, nieuwbouw en bedrijfsruimte op de zoekpagina's. */
export function ModeTabs({ active }: { active?: Mode }) {
  return (
    <nav aria-label="Soort aanbod" className="flex flex-wrap gap-2">
      {MODES.map((m) => (
        <Link key={m} href={MODE_INFO[m].path} aria-current={m === active ? 'page' : undefined}
          className={`focus-ring rounded-full px-4 py-1.5 text-sm font-semibold transition ${m === active ? 'bg-brand text-white' : 'border border-line bg-white text-ink hover:bg-brand-soft hover:text-brand'}`}>
          {MODE_INFO[m].label}
        </Link>
      ))}
    </nav>
  );
}
