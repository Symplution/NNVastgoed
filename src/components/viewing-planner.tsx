'use client';

import { useActionState, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { CalendarCheck, CalendarPlus, CheckCircle2, Phone } from 'lucide-react';
import { bookViewing, getMyContact, getViewingSlots } from '@/app/actions';
import { formatDateTime, formatTime } from '@/lib/format';
import { groupSlotsByDay, type Slot } from '@/lib/viewings';

/** Zelf een bezichtiging inplannen: kies een dag en een moment dat de makelaar heeft vrijgemaakt. Meteen bevestigd. */
export function ViewingPlanner({ listingId, officeName, officePhone }: { listingId: string; officeName: string; officePhone?: string | null }) {
  const [slots, setSlots] = useState<Slot[] | null>(null);
  const [loadError, setLoadError] = useState('');
  const [day, setDay] = useState('');
  const [picked, setPicked] = useState<Slot | null>(null);
  const [me, setMe] = useState<{ name: string; email: string; phone: string } | null>(null);
  const [state, action, pending] = useActionState(bookViewing, undefined);

  useEffect(() => {
    let alive = true;
    getViewingSlots(listingId).then((r) => { if (alive) { setSlots(r.slots); setLoadError(r.error ?? ''); } }).catch(() => alive && setLoadError('De momenten konden niet worden opgehaald.'));
    getMyContact().then((c) => alive && setMe(c)).catch(() => undefined);
    return () => { alive = false; };
  }, [listingId, state?.ok]);

  const days = useMemo(() => groupSlotsByDay(slots ?? []), [slots]);
  const current = days.find((d) => d.day === day) ?? days[0];
  const phone = officePhone ? <a href={`tel:${officePhone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 font-semibold text-brand hover:underline"><Phone size={14} aria-hidden /> {officePhone}</a> : null;

  if (state?.ok) {
    return (
      <div role="status" className="space-y-4 rounded-2xl bg-green-50 p-6 text-green-900">
        <p className="flex items-center gap-2 text-lg font-bold"><CheckCircle2 aria-hidden /> {state.label}</p>
        <p className="text-sm">We hebben een bevestiging gemaakt voor je en {officeName}. Je kunt de bezichtiging toevoegen aan je agenda en haar via de link in de mail annuleren.</p>
        {state.token && state.token !== 'demo' && (
          <div className="flex flex-wrap gap-3">
            <a href={`/api/bezichtiging/${state.token}/ics`} className="btn-primary"><CalendarPlus size={16} aria-hidden /> Toevoegen aan agenda</a>
            <Link href={`/bezichtiging/${state.token}`} className="btn-ghost">Bekijken of annuleren</Link>
          </div>
        )}
      </div>
    );
  }
  if (slots === null && !loadError) return <p className="text-muted">Momenten laden…</p>;
  if (loadError) return <p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-800">{loadError}</p>;
  if (!slots?.length) {
    return (
      <div className="rounded-2xl bg-sand p-6">
        <p className="font-semibold">Er zijn nu geen momenten online om te plannen.</p>
        <p className="mt-1 text-sm text-muted">Stuur de makelaar een bericht, dan stemmen jullie samen een moment af.{phone && <> Bellen mag ook: {phone}.</>}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="flex items-center gap-2 text-lg font-bold"><CalendarCheck size={20} className="text-accent" aria-hidden /> Kies een dag</h3>
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-2" aria-label="Dagen met vrije momenten">
          {days.map((d) => {
            const on = d.day === current?.day;
            const [wd, ...rest] = d.label.split(' ');
            return (
              <li key={d.day} className="shrink-0">
                <button type="button" onClick={() => { setDay(d.day); setPicked(null); }} aria-pressed={on}
                  className={`focus-ring w-24 rounded-xl border px-2 py-2.5 text-center transition ${on ? 'border-brand bg-brand text-white' : 'border-line bg-white hover:border-brand'}`}>
                  <span className="block text-xs font-semibold uppercase tracking-wide opacity-80">{wd.slice(0, 2)}</span>
                  <span className="block text-sm font-bold">{rest.join(' ')}</span>
                  <span className={`block text-[11px] ${on ? 'text-white/80' : 'text-muted'}`}>{d.slots.length} vrij</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      {current && (
        <div>
          <h3 className="text-lg font-bold">Kies een tijd <span className="text-sm font-normal text-muted">· {current.label}</span></h3>
          <ul className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-5">
            {current.slots.map((s) => (
              <li key={s.start}>
                <button type="button" onClick={() => setPicked(s)} aria-pressed={picked?.start === s.start}
                  className={`focus-ring w-full rounded-lg border px-2 py-2 text-sm font-semibold transition ${picked?.start === s.start ? 'border-accent bg-accent text-white' : 'border-line bg-white hover:border-accent'}`}>{formatTime(s.start)}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {picked && (
        <form action={action} className="card space-y-4 p-5">
          <input type="hidden" name="listingId" value={listingId} />
          <input type="hidden" name="start" value={picked.start} />
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
          <p className="font-semibold">{formatDateTime(picked.start)} <span className="font-normal text-muted">· ongeveer {Math.round((new Date(picked.end).getTime() - new Date(picked.start).getTime()) / 60000)} minuten</span></p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label htmlFor="v-name" className="label">Naam</label><input id="v-name" name="name" required minLength={2} maxLength={120} defaultValue={me?.name} key={`n-${me?.name}`} autoComplete="name" className="field" /></div>
            <div><label htmlFor="v-email" className="label">E-mailadres</label><input id="v-email" name="email" type="email" required defaultValue={me?.email} key={`e-${me?.email}`} autoComplete="email" className="field" /></div>
            <div><label htmlFor="v-phone" className="label">Telefoon (optioneel)</label><input id="v-phone" name="phone" type="tel" maxLength={40} defaultValue={me?.phone} key={`p-${me?.phone}`} autoComplete="tel" className="field" /></div>
            <div><label htmlFor="v-note" className="label">Opmerking (optioneel)</label><input id="v-note" name="note" maxLength={1000} placeholder="Bijv. met zijn tweeën" className="field" /></div>
          </div>
          <label className="flex items-start gap-2 text-xs text-muted"><input type="checkbox" name="consent" required className="mt-0.5" /><span>Ik ga akkoord met de <a href="/privacy" className="underline">privacyverklaring</a>. Mijn gegevens gaan naar {officeName}.</span></label>
          {state?.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}
          <button disabled={pending} className="btn-accent w-full sm:w-auto">{pending ? 'Inplannen…' : 'Bezichtiging bevestigen'}</button>
          {!me && <p className="text-xs text-muted">Met een <Link href="/inloggen?nieuw=1" className="underline">account</Link> zie je je bezichtigingen later terug in Mijn NNV.</p>}
        </form>
      )}
    </div>
  );
}
