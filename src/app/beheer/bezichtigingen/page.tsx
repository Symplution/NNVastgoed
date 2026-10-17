import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarDays, List, Mail, Phone, Settings2 } from 'lucide-react';
import { AddViewingForm } from '@/components/add-viewing-form';
import { ViewingsAgenda } from '@/components/viewings-agenda';
import { canWrite, requireStaff } from '@/lib/auth';
import { dayKey, formatDay, formatTime } from '@/lib/format';
import { myListings, officeViewings } from '@/lib/staff-data';
import { addDays, weekStart, zonedToUtc } from '@/lib/viewings';
import { setViewingStatus } from '../actions';
import { Select } from '@/components/select';

export const metadata: Metadata = { title: 'Bezichtigingen' };

const TONE: Record<string, string> = { bevestigd: 'bg-green-100 text-green-900', afgerond: 'bg-sand text-muted', niet_verschenen: 'bg-amber-100 text-amber-900', geannuleerd: 'bg-red-100 text-red-900' };
const LABEL: Record<string, string> = { bevestigd: 'Bevestigd', afgerond: 'Afgerond', niet_verschenen: 'Niet verschenen', geannuleerd: 'Geannuleerd' };

export default async function Bezichtigingen({ searchParams }: { searchParams: Promise<{ weergave?: string; week?: string; toon?: string }> }) {
  const staff = await requireStaff();
  const sp = await searchParams;
  const agenda = sp.weergave === 'agenda';
  const today = dayKey(new Date().toISOString());
  const week = weekStart(/^\d{4}-\d{2}-\d{2}$/.test(sp.week ?? '') ? sp.week! : today);
  const listings = (await myListings()).filter((l) => ['beschikbaar', 'onder_bod', 'onder_voorbehoud'].includes(l.status)).map((l) => ({ id: l.id, label: `${l.street} ${l.houseNumber}, ${l.city}` }));

  // Lijst: vanaf vandaag (of alles met ?toon=alles). Agenda: de gekozen week.
  const from = agenda ? zonedToUtc(`${week}T00:00`)! : sp.toon === 'alles' ? undefined : zonedToUtc(`${today}T00:00`)!;
  const to = agenda ? zonedToUtc(`${addDays(week, 7)}T00:00`)! : undefined;
  const viewings = await officeViewings(from?.toISOString(), to?.toISOString());
  const base = '/beheer/bezichtigingen';
  const write = canWrite(staff);

  const days = new Map<string, typeof viewings>();
  for (const v of viewings) { const k = dayKey(v.startsAt); days.set(k, [...(days.get(k) ?? []), v]); }
  const tab = (on: boolean) => `btn !py-1.5 ${on ? 'bg-brand text-white' : 'border border-line bg-white hover:bg-sand'}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">Bezichtigingen</h1>
        <div className="flex flex-wrap gap-2">
          <Link href={base} className={tab(!agenda)}><List size={15} aria-hidden /> Lijst</Link>
          <Link href={`${base}?weergave=agenda`} className={tab(agenda)}><CalendarDays size={15} aria-hidden /> Agenda</Link>
          <Link href={`${base}/beschikbaarheid`} className="btn-ghost !py-1.5"><Settings2 size={15} aria-hidden /> Beschikbaarheid</Link>
        </div>
      </div>
      <p className="text-sm text-muted">Bezoekers plannen zelf een moment dat jij hebt vrijgemaakt onder <Link href={`${base}/beschikbaarheid`} className="underline">Beschikbaarheid</Link>. Het staat meteen in dit overzicht, met hun gegevens erbij.</p>

      {agenda ? <ViewingsAgenda viewings={viewings} week={week} base={base} /> : (
        <section aria-label="Bezichtigingen per dag" className="space-y-6">
          {viewings.length === 0 && <p className="rounded-xl bg-sand p-8 text-center text-sm text-muted">Geen bezichtigingen gepland.</p>}
          {[...days.entries()].map(([day, list]) => (
            <div key={day}>
              <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">{formatDay(list[0].startsAt)}{day === today && <span className="pill ml-2 bg-accent-soft text-accent-dark">Vandaag</span>}</h2>
              <ul className="space-y-3">
                {list.map((v) => (
                  <li key={v.id} className="card flex flex-wrap items-start justify-between gap-4 p-4">
                    <div className="min-w-0">
                      <p className="font-bold"><span className="text-brand">{formatTime(v.startsAt)}–{formatTime(v.endsAt)}</span> · <Link href={`/woning/${v.listingSlug}`} className="hover:underline" target="_blank">{v.listing}, {v.city}</Link></p>
                      <p className="mt-1 text-sm"><span className="font-semibold">{v.name}</span>
                        <span className="pill ml-2 bg-sand text-muted">{v.source === 'makelaar' ? 'Door makelaar' : v.byAccount ? 'Via account' : 'Via de site'}</span></p>
                      <p className="mt-1 flex flex-wrap gap-x-4 text-sm"><a href={`mailto:${v.email}`} className="inline-flex items-center gap-1.5 text-brand hover:underline"><Mail size={14} aria-hidden /> {v.email}</a>{v.phone && <a href={`tel:${v.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 text-brand hover:underline"><Phone size={14} aria-hidden /> {v.phone}</a>}</p>
                      {v.note && <p className="mt-1 text-sm text-muted">“{v.note}”</p>}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`pill ${TONE[v.status]}`}>{LABEL[v.status]}{v.status === 'geannuleerd' && v.cancelledBy ? ` (${v.cancelledBy})` : ''}</span>
                      {write && v.status === 'bevestigd' && (
                        <form action={setViewingStatus} className="flex items-center gap-1"><input type="hidden" name="id" value={v.id} />
                          <label htmlFor={`st-${v.id}`} className="sr-only">Status wijzigen</label>
                          <Select id={`st-${v.id}`} name="status" compact defaultValue="bevestigd" className="min-w-[10rem]" options={[{ value: 'bevestigd', label: 'Bevestigd' }, { value: 'afgerond', label: 'Afgerond' }, { value: 'niet_verschenen', label: 'Niet verschenen' }, { value: 'geannuleerd', label: 'Annuleren' }]} />
                          <button className="btn-ghost !py-1.5 text-xs">Opslaan</button></form>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <p className="text-sm"><Link href={sp.toon === 'alles' ? base : `${base}?toon=alles`} className="text-muted underline">{sp.toon === 'alles' ? 'Alleen vanaf vandaag' : 'Ook eerdere bezichtigingen tonen'}</Link></p>
        </section>
      )}
      {write && <AddViewingForm listings={listings} />}
    </div>
  );
}
