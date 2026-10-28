import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarCheck, Inbox, Mail, MessageSquare, Phone, UserCheck } from 'lucide-react';
import { requireStaff } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { buildContacts, myLeads, officeViewings, staffThreads } from '@/lib/staff-data';

export const metadata: Metadata = { title: 'Contacten' };

const ICON = { lead: Inbox, bezichtiging: CalendarCheck, bericht: MessageSquare } as const;

export default async function Contacten({ searchParams }: { searchParams: Promise<{ persoon?: string; q?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const [leads, viewings, threads] = await Promise.all([myLeads(), officeViewings(), staffThreads()]);
  const all = buildContacts({ leads, viewings, threads });
  const q = (sp.q ?? '').trim().toLowerCase();
  const contacts = q ? all.filter((c) => `${c.name} ${c.email} ${c.phone ?? ''}`.toLowerCase().includes(q)) : all;
  const sel = all.find((c) => c.email === (sp.persoon ?? '').toLowerCase());
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Contacten</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">Iedereen die contact zocht, op één plek: contactformulieren, bezichtigingen en gesprekken per persoon, met de contactgegevens erbij.</p>
      <form className="mt-4" role="search"><label htmlFor="q" className="sr-only">Zoek een contact</label><input id="q" name="q" defaultValue={sp.q} placeholder="Zoek op naam, e-mail of telefoon" className="field max-w-md" /></form>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <section aria-label="Contacten">
          {contacts.length ? (
            <ul className="divide-y divide-line rounded-xl border border-line">
              {contacts.map((c) => (
                <li key={c.email}>
                  <Link href={`/beheer/contacten?persoon=${encodeURIComponent(c.email)}${sp.q ? `&q=${encodeURIComponent(sp.q)}` : ''}`} aria-current={sel?.email === c.email ? 'true' : undefined} className={`block px-4 py-3 hover:bg-sand ${sel?.email === c.email ? 'bg-brand-soft' : ''}`}>
                    <p className="flex items-center gap-2 font-semibold">{c.name}{c.hasAccount && <UserCheck size={14} className="text-brand" aria-label="Heeft een account" />}</p>
                    <p className="text-xs text-muted">{c.email} · {c.leads} {c.leads === 1 ? 'vraag' : 'vragen'} · {c.viewings} bezichtiging{c.viewings === 1 ? '' : 'en'} · {c.conversations} {c.conversations === 1 ? 'gesprek' : 'gesprekken'}</p>
                  </Link>
                </li>
              ))}
            </ul>
          ) : <p className="rounded-xl bg-sand p-8 text-center text-sm text-muted">Geen contacten gevonden.</p>}
        </section>
        <section aria-label="Details">
          {sel ? (
            <div className="card p-5">
              <h2 className="text-lg font-bold">{sel.name}</h2>
              <p className="mt-1 flex flex-wrap gap-x-4 text-sm"><a href={`mailto:${sel.email}`} className="inline-flex items-center gap-1.5 text-brand hover:underline"><Mail size={14} aria-hidden /> {sel.email}</a>{sel.phone && <a href={`tel:${sel.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 text-brand hover:underline"><Phone size={14} aria-hidden /> {sel.phone}</a>}</p>
              <ol className="mt-5 space-y-4 border-l-2 border-line pl-5">
                {sel.events.map((e, i) => {
                  const Icon = ICON[e.kind];
                  return (
                    <li key={i} className="relative">
                      <span className="absolute -left-[1.85rem] top-0.5 inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft text-brand"><Icon size={13} aria-hidden /></span>
                      <p className="text-sm font-semibold">{e.href ? <Link href={e.href} className="hover:underline">{e.title}</Link> : e.title}</p>
                      <p className="text-xs text-muted">{formatDate(e.at)}</p>
                      {e.status && <p className="mt-1"><span className={`pill ${e.status === 'afgehandeld' ? 'bg-green-100 text-green-900' : e.status === 'opgepakt' ? 'bg-brand-soft text-brand' : 'bg-accent-soft text-accent-dark'}`}>{e.status === 'afgehandeld' ? 'Afgehandeld' : e.status === 'opgepakt' ? 'Opgepakt' : 'Nieuw'}</span></p>}
                      {e.detail && <p className="mt-1 line-clamp-3 text-sm text-ink/80">{e.detail}</p>}
                      {e.note && <div className="mt-2 rounded-xl bg-sand p-3 text-sm"><p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">Notitie{e.noteAt && <span className="font-normal normal-case tracking-normal"> · {formatDate(e.noteAt)}</span>}</p><p className="whitespace-pre-line">{e.note}</p></div>}
                    </li>
                  );
                })}
              </ol>
            </div>
          ) : <p className="rounded-xl bg-sand p-8 text-center text-sm text-muted">Kies links een contact om alles te zien.</p>}
        </section>
      </div>
    </div>
  );
}
