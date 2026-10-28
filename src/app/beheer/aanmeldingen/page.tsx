import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { isManager, requireStaff } from '@/lib/auth';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { brokerRequests, myOffices } from '@/lib/staff-data';
import { slugify } from '@/lib/format';
import { provinceName } from '@/lib/regions';
import { isProvince } from '@/lib/regions';
import { createOfficeFromRequest, setBrokerRequestStatus } from '../actions';

export const metadata: Metadata = { title: 'Aanmeldingen van makelaars' };
const STATUS: Record<string, string> = { nieuw: 'Nieuw', in_behandeling: 'In behandeling', aangesloten: 'Aangesloten', afgewezen: 'Afgewezen' };
const TONE: Record<string, string> = { nieuw: 'bg-accent-soft text-accent-dark', in_behandeling: 'bg-brand-soft text-brand', aangesloten: 'bg-green-100 text-green-800', afgewezen: 'bg-sand text-muted' };

export default async function Aanmeldingen() {
  const staff = await requireStaff();
  if (!isManager(staff.role)) redirect('/beheer');
  const [rows, offices] = await Promise.all([brokerRequests(), myOffices()]);
  const bySlug = new Map(offices.map((o) => [o.slug, o]));
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Aanmeldingen van makelaars</h1>
        <p className="mt-1 text-sm text-muted">Kantoren die zich via <code>/voor-makelaars/aanmelden</code> hebben aangemeld. Met één klik maak je van een aanvraag het kantoor aan. Daarna nodig je het account van het kantoor uit onder Alle kantoren (één account per kantoor).</p>
      </div>
      {rows.length === 0 ? <p className="rounded-2xl bg-sand p-8 text-center text-muted">Er zijn nog geen aanmeldingen.</p> : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{r.officeName} {r.nvm && <span className="pill ml-1 bg-brand-soft text-brand">NVM</span>}</p>
                  <p className="text-sm text-muted">{r.city}, {isProvince(r.province) ? provinceName(r.province) : r.province}{r.kvk ? ` · KvK ${r.kvk}` : ''}{r.software ? ` · ${r.software}` : ''}{r.listingCount != null ? ` · ${r.listingCount} woningen` : ''}</p>
                </div>
                <span className={`pill ${TONE[r.status] ?? ''}`}>{STATUS[r.status] ?? r.status}</span>
              </div>
              <p className="mt-3 text-sm"><strong>{r.contactName}</strong> · <a className="text-brand underline" href={`mailto:${r.email}`}>{r.email}</a>{r.phone ? ` · ${r.phone}` : ''}</p>
              {r.message && <p className="mt-2 whitespace-pre-line rounded-lg bg-sand p-3 text-sm">{r.message}</p>}
              {(() => {
                const office = bySlug.get(slugify(r.officeName));
                if (office) return <p className="mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-green-50 p-3 text-sm font-semibold text-green-800"><Building2 size={16} aria-hidden /> Het kantoor staat al aangemaakt. <Link href="/beheer/kantoren" className="underline">Bekijk bij Alle kantoren</Link> · <Link href="/beheer/kantoren" className="underline">Account uitnodigen</Link></p>;
                if (r.status === 'afgewezen') return null;
                return <form action={createOfficeFromRequest} className="mt-3"><input type="hidden" name="id" value={r.id} /><button className="btn-accent !py-2 text-sm"><Building2 size={15} aria-hidden /> Kantoor aanmaken en goedkeuren</button></form>;
              })()}
              <form action={setBrokerRequestStatus} className="mt-3 flex flex-wrap items-center gap-2">
                <input type="hidden" name="id" value={r.id} />
                <span className="text-xs text-muted">{new Date(r.createdAt).toLocaleString('nl-NL', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'Europe/Amsterdam' })}</span>
                <span className="grow" />
                {Object.entries(STATUS).filter(([k]) => k !== r.status).map(([k, label]) => <button key={k} name="status" value={k} className="btn-ghost !px-3 !py-1.5 text-xs">{label}</button>)}
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
