import Link from 'next/link';
import { Inbox, Network, Home } from 'lucide-react';
import { requireStaff } from '@/lib/auth';
import { myConnections, myLeads, myListings } from '@/lib/staff-data';
import { formatDate, STATUS_LABEL } from '@/lib/format';

export default async function Overzicht() {
  const staff = await requireStaff();
  const [listings, leads, connections] = await Promise.all([myListings(), myLeads(), myConnections()]);
  const online = listings.filter((l) => ['beschikbaar', 'onder_bod', 'onder_voorbehoud'].includes(l.status)).length;
  const newLeads = leads.filter((l) => l.status === 'nieuw');
  const stat = 'card p-5';
  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-extrabold tracking-tight">Welkom, {staff.name}</h1>
        {!staff.officeId && !['owner', 'admin'].includes(staff.role) && <p role="status" className="mt-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Je account is nog niet aan een kantoor gekoppeld. Vraag de eigenaar van NNvastgoed om dat te doen; tot die tijd zie je hier niets.</p>}</div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/beheer/woningen" className={stat}><Home className="text-brand" size={20} aria-hidden /><p className="mt-2 text-3xl font-extrabold">{online}</p><p className="text-sm text-muted">woningen online · {listings.length} totaal</p></Link>
        <Link href="/beheer/leads" className={stat}><Inbox className="text-accent" size={20} aria-hidden /><p className="mt-2 text-3xl font-extrabold">{newLeads.length}</p><p className="text-sm text-muted">nieuwe leads</p></Link>
        <Link href="/beheer/koppelingen" className={stat}><Network className="text-brand" size={20} aria-hidden /><p className="mt-2 text-3xl font-extrabold">{connections.filter((c) => c.active).length}</p><p className="text-sm text-muted">actieve koppelingen</p></Link>
      </div>
      <section aria-labelledby="laatste"><h2 id="laatste" className="text-lg font-bold">Laatste leads</h2>
        {leads.length ? <ul className="mt-3 divide-y divide-line rounded-xl border border-line">{leads.slice(0, 5).map((l) => (
          <li key={l.id} className="flex items-center justify-between gap-4 px-4 py-3 text-sm"><div><p className="font-semibold">{l.name} <span className="font-normal text-muted">· {l.listing}</span></p><p className="text-xs text-muted">{formatDate(l.createdAt)}</p></div><span className={`pill ${l.status === 'nieuw' ? 'bg-accent-soft text-accent-dark' : 'bg-sand text-muted'}`}>{l.status}</span></li>))}</ul>
          : <p className="mt-3 rounded-xl bg-sand p-6 text-center text-sm text-muted">Nog geen leads.</p>}
      </section>
      <section aria-labelledby="status"><h2 id="status" className="text-lg font-bold">Woningen per status</h2>
        <ul className="mt-3 flex flex-wrap gap-2">{Object.entries(listings.reduce<Record<string, number>>((m, l) => ({ ...m, [l.status]: (m[l.status] ?? 0) + 1 }), {})).map(([s, n]) => <li key={s} className="pill bg-brand-soft text-brand">{STATUS_LABEL[s as keyof typeof STATUS_LABEL]}: {n}</li>)}</ul>
      </section>
    </div>
  );
}
