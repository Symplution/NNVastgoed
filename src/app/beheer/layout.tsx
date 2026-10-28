import type { Metadata } from 'next';
import { BeheerNav, type NavItem } from '@/components/beheer-nav';
import { isManager, requireStaff } from '@/lib/auth';
import { logout } from '@/app/login/actions';
import { staffUnread } from '@/lib/staff-data';

export const metadata: Metadata = { title: { default: 'Beheer', template: '%s · Beheer' }, robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function BeheerLayout({ children }: { children: React.ReactNode }) {
  const staff = await requireStaff();
  const unread = await staffUnread();
  const items: NavItem[] = [
    { href: '/beheer', label: 'Overzicht', icon: 'overzicht' },
    { href: '/beheer/woningen', label: 'Woningen', icon: 'woningen' },
    { href: '/beheer/bezichtigingen', label: 'Bezichtigingen', icon: 'bezichtigingen' },
    { href: '/beheer/berichten', label: 'Berichten', icon: 'berichten', badge: unread },
    { href: '/beheer/leads', label: 'Leads', icon: 'leads' },
    { href: '/beheer/contacten', label: 'Contacten', icon: 'contacten' },
    { href: '/beheer/koppelingen', label: 'Koppelingen', icon: 'koppelingen' },
    { href: '/beheer/kantoor', label: 'Mijn kantoor', icon: 'kantoor' },
    ...(isManager(staff.role) ? [{ href: '/beheer/aanmeldingen', label: 'Aanmeldingen', icon: 'aanmeldingen' } as NavItem, { href: '/beheer/kantoren', label: 'Alle kantoren', icon: 'kantoren' } as NavItem] : []),
    { href: '/beheer/ai', label: 'AI-departments', icon: 'ai' },
  ];
  const roleLabel = ({ owner: 'Eigenaar', admin: 'Beheerder', agent: 'Makelaar', readonly: 'Alleen lezen', seeker: 'Zoeker' } as Record<string, string>)[staff.role];
  return (
    <div className="container-x grid gap-6 py-6 lg:grid-cols-[14rem_1fr]">
      <aside>
        <BeheerNav items={items} />
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
