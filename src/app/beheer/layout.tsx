import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, CalendarCheck, Contact, Inbox, LayoutDashboard, MessageSquare, Network, Home, Sparkles, Users, Store } from 'lucide-react';
import { isManager, requireStaff } from '@/lib/auth';
import { logout } from '@/app/login/actions';
import { staffUnread } from '@/lib/staff-data';

export const metadata: Metadata = { title: { default: 'Beheer', template: '%s · Beheer' }, robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function BeheerLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  const unread = await staffUnread();
  const item = 'focus-ring flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium hover:bg-brand-soft hover:text-brand';
  const roleLabel = ({ owner: 'Eigenaar', admin: 'Beheerder', agent: 'Makelaar', readonly: 'Alleen lezen', seeker: 'Zoeker' } as Record<string, string>)[staff.role];
  return (
    <div className="container-x grid gap-6 py-6 lg:grid-cols-[14rem_1fr]">
      <aside>
        <nav aria-label="Beheer" className="flex gap-1 overflow-x-auto lg:flex-col">
          <Link href="/beheer" className={item}><LayoutDashboard size={17} aria-hidden /> Overzicht</Link>
          <Link href="/beheer/woningen" className={item}><Home size={17} aria-hidden /> Woningen</Link>
          <Link href="/beheer/bezichtigingen" className={item}><CalendarCheck size={17} aria-hidden /> Bezichtigingen</Link>
          <Link href="/beheer/berichten" className={item}><MessageSquare size={17} aria-hidden /> Berichten{unread > 0 && <span className="rounded-full bg-accent px-1.5 text-[11px] font-bold leading-5 text-white">{unread}</span>}</Link>
          <Link href="/beheer/leads" className={item}><Inbox size={17} aria-hidden /> Leads</Link>
          <Link href="/beheer/contacten" className={item}><Contact size={17} aria-hidden /> Contacten</Link>
          <Link href="/beheer/koppelingen" className={item}><Network size={17} aria-hidden /> Koppelingen</Link>
          <Link href="/beheer/kantoor" className={item}><Building2 size={17} aria-hidden /> Mijn kantoor</Link>
          {isManager(staff.role) && <Link href="/beheer/kantoren" className={item}><Store size={17} aria-hidden /> Alle kantoren</Link>}
          {staff.role === 'owner' && <Link href="/beheer/gebruikers" className={item}><Users size={17} aria-hidden /> Gebruikers</Link>}
          <Link href="/beheer/ai" className={item}><Sparkles size={17} aria-hidden /> AI-departments</Link>
        </nav>
        <div className="mt-6 hidden rounded-xl bg-sand p-3 text-sm lg:block">
          <p className="font-semibold">{staff.name}</p>
          <p className="text-xs text-muted">{roleLabel}</p>
          <form action={logout} className="mt-2"><button className="text-xs font-semibold text-brand hover:underline">Uitloggen</button></form>
        </div>
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
