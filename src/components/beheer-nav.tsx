'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Building2, CalendarCheck, Contact, Home, Inbox, LayoutDashboard, MessageSquare, Network, Sparkles, Store, UserPlus } from 'lucide-react';

const ICONS = { overzicht: LayoutDashboard, woningen: Home, bezichtigingen: CalendarCheck, berichten: MessageSquare, leads: Inbox, contacten: Contact, koppelingen: Network, kantoor: Building2, aanmeldingen: UserPlus, kantoren: Store, ai: Sparkles } as const;
export interface NavItem { href: string; label: string; icon: keyof typeof ICONS; badge?: number }

/** Het menu van het beheer. De pagina waar je nu bent is gemarkeerd, zodat je altijd weet in welk onderdeel je zit. */
export function BeheerNav({ items }: { items: NavItem[] }) {
  const path = usePathname();
  // Het langste adres dat past wint, zodat /beheer (Overzicht) niet bij elke pagina oplicht.
  const current = items.filter((i) => path === i.href || path.startsWith(`${i.href}/`)).sort((a, b) => b.href.length - a.href.length)[0]?.href;
  return (
    <nav aria-label="Beheer" className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map(({ href, label, icon, badge }) => {
        const Icon = ICONS[icon];
        const on = href === current;
        return (
          <Link key={href} href={href} aria-current={on ? 'page' : undefined}
            className={`focus-ring flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm transition ${on ? 'bg-brand font-bold text-white shadow-sm' : 'font-medium hover:bg-brand-soft hover:text-brand'}`}>
            <Icon size={17} aria-hidden /> {label}
            {badge ? <span className={`rounded-full px-1.5 text-[11px] font-bold leading-5 ${on ? 'bg-white text-brand' : 'bg-accent text-white'}`}>{badge}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
