import type { Metadata } from 'next';
import Link from 'next/link';
import { CalendarPlus } from 'lucide-react';
import { requireSeeker } from '@/lib/seeker';
import { formatDateTime } from '@/lib/format';
import { myViewings } from '@/lib/seeker-data';
import { cancelViewingAction } from '../actions';

export const metadata: Metadata = { title: 'Bezichtigingen' };

const LABEL: Record<string, { t: string; c: string }> = {
  bevestigd: { t: 'Bevestigd', c: 'bg-green-100 text-green-900' }, geannuleerd: { t: 'Geannuleerd', c: 'bg-red-100 text-red-900' },
  afgerond: { t: 'Afgerond', c: 'bg-sand text-muted' }, niet_verschenen: { t: 'Niet verschenen', c: 'bg-sand text-muted' },
};

export default async function Bezichtigingen() {
  await requireSeeker('/mijn/bezichtigingen');
  const all = await myViewings();
  const now = Date.now();
  const upcoming = all.filter((v) => v.status === 'bevestigd' && new Date(v.startsAt).getTime() > now);
  const past = all.filter((v) => !upcoming.includes(v)).reverse();
  const item = (v: (typeof all)[number], canCancel: boolean) => (
    <li key={v.id} className="card flex flex-wrap items-center justify-between gap-4 p-5">
      <div>
        <p className="text-lg font-bold text-brand">{formatDateTime(v.startsAt)}</p>
        <p className="text-sm"><Link href={`/woning/${v.listing?.slug ?? ''}`} className="font-semibold hover:underline">{v.listing?.address}, {v.listing?.city}</Link></p>
        <p className="mt-1"><span className={`pill ${LABEL[v.status]?.c}`}>{LABEL[v.status]?.t ?? v.status}</span></p>
      </div>
      {canCancel && (
        <div className="flex flex-wrap gap-2">
          <a href={`/api/bezichtiging/${v.token}/ics`} className="btn-ghost"><CalendarPlus size={15} aria-hidden /> Agenda</a>
          <form action={cancelViewingAction}><input type="hidden" name="token" value={v.token} /><button className="btn-ghost !text-red-700">Annuleren</button></form>
        </div>
      )}
    </li>
  );
  return (
    <div className="space-y-8">
      <section aria-labelledby="gepland">
        <h2 id="gepland" className="text-lg font-bold">Gepland</h2>
        {upcoming.length ? <ul className="mt-3 space-y-3">{upcoming.map((v) => item(v, true))}</ul>
          : <p className="mt-3 rounded-xl bg-sand p-6 text-sm text-muted">Je hebt geen geplande bezichtigingen. Kies bij een woning het tabblad <strong>Bezichtiging plannen</strong>.</p>}
      </section>
      {past.length > 0 && <section aria-labelledby="eerder"><h2 id="eerder" className="text-lg font-bold">Eerder</h2><ul className="mt-3 space-y-3">{past.map((v) => item(v, false))}</ul></section>}
    </div>
  );
}
