'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/koop', label: 'Kopen' },
  { href: '/huur', label: 'Huren' },
  { href: '/nieuwbouw', label: 'Nieuwbouw' },
] as const;

/** Kopen, huren of nieuwbouw: de keuze bovenin. Verkopen is er bewust niet bij. */
export function ModeNav() {
  const path = usePathname();
  return (
    <nav aria-label="Soort aanbod" className="flex items-center gap-0.5">
      {ITEMS.map((i) => {
        const on = path === i.href || path.startsWith(`${i.href}/`);
        return (
          <Link key={i.href} href={i.href} aria-current={on ? 'page' : undefined}
            className={`focus-ring rounded-md px-3 py-1.5 text-sm font-semibold transition ${on ? 'bg-brand text-white' : 'text-ink hover:bg-brand-soft hover:text-brand'}`}>{i.label}</Link>
        );
      })}
    </nav>
  );
}
