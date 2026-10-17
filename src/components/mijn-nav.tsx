'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/mijn', label: 'Overzicht', exact: true },
  { href: '/mijn/favorieten', label: 'Favorieten' },
  { href: '/mijn/bezichtigingen', label: 'Bezichtigingen' },
  { href: '/mijn/berichten', label: 'Berichten' },
  { href: '/mijn/profiel', label: 'Profiel' },
] as const;

export function MijnNav({ unread = 0 }: { unread?: number }) {
  const path = usePathname();
  return (
    <nav aria-label="Mijn NNV" className="flex gap-1 overflow-x-auto border-b border-line">
      {ITEMS.map((i) => {
        const on = 'exact' in i ? path === i.href : path === i.href || path.startsWith(`${i.href}/`);
        return (
          <Link key={i.href} href={i.href} aria-current={on ? 'page' : undefined}
            className={`focus-ring -mb-px inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold ${on ? 'border-accent text-brand' : 'border-transparent text-muted hover:text-ink'}`}>
            {i.label}
            {i.href === '/mijn/berichten' && unread > 0 && <span className="rounded-full bg-accent px-1.5 text-[11px] font-bold leading-5 text-white">{unread}</span>}
          </Link>
        );
      })}
    </nav>
  );
}
