import type { Metadata } from 'next';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { canWrite, isManager, requireStaff } from '@/lib/auth';
import { formatDateTime } from '@/lib/format';
import { myOffices, viewingBlocks, viewingRules } from '@/lib/staff-data';
import { WEEKDAYS } from '@/lib/viewings';
import { addBlock, addRule, deleteBlock, deleteRule } from '../../actions';
import { Select } from '@/components/select';

export const metadata: Metadata = { title: 'Beschikbaarheid' };

export default async function Beschikbaarheid() {
  const staff = await requireStaff();
  const [rules, blocks, offices] = await Promise.all([viewingRules(), viewingBlocks(), myOffices()]);
  const write = canWrite(staff);
  const pick = isManager(staff.role);
  const office = (id: string) => offices.find((o) => o.id === id)?.name ?? '';
  const officeField = pick && <div><label htmlFor="o" className="label">Kantoor</label><Select id="o" name="office_id" required options={[{ value: '', label: 'Kies een kantoor…' }, ...offices.map((o) => ({ value: o.id, label: o.name }))]} /></div>;
  return (
    <div className="space-y-8">
      <div><p className="text-sm"><Link href="/beheer/bezichtigingen" className="text-muted hover:underline">← Bezichtigingen</Link></p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">Beschikbaarheid</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">Op deze dagen en tijden kunnen bezoekers zelf een bezichtiging inplannen, bij al je woningen die online staan. Het aantal makelaars bepaalt hoeveel bezichtigingen tegelijk kunnen. Je kunt altijd een moment blokkeren.</p></div>

      <section aria-labelledby="regels">
        <h2 id="regels" className="text-lg font-bold">Wekelijkse momenten</h2>
        {rules.length ? (
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
            {rules.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <span><span className="font-semibold">{WEEKDAYS[r.weekday - 1]}</span> {r.start}–{r.end} · {r.slotMinutes} minuten per bezichtiging · {r.capacity} {r.capacity === 1 ? 'makelaar' : 'makelaars'}{pick && <span className="text-muted"> · {office(r.officeId)}</span>}</span>
                {write && <form action={deleteRule}><input type="hidden" name="id" value={r.id} /><button className="btn-ghost !py-1 text-xs" aria-label="Verwijder dit moment"><Trash2 size={14} aria-hidden /></button></form>}
              </li>
            ))}
          </ul>
        ) : <p className="mt-3 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Er zijn nog geen momenten. Zolang er niets staat, kunnen bezoekers geen bezichtiging inplannen; ze sturen dan een bericht.</p>}
        {write && (
          <form action={addRule} className="card mt-4 grid gap-3 p-4 sm:grid-cols-3 lg:grid-cols-6">
            {officeField}
            <div><label htmlFor="wd" className="label">Dag</label><Select id="wd" name="weekday" defaultValue="1" options={WEEKDAYS.map((d, i) => ({ value: String(i + 1), label: d }))} /></div>
            <div><label htmlFor="st" className="label">Van</label><input id="st" name="start_time" type="time" required defaultValue="09:00" className="field" /></div>
            <div><label htmlFor="et" className="label">Tot</label><input id="et" name="end_time" type="time" required defaultValue="17:00" className="field" /></div>
            <div><label htmlFor="sm" className="label">Minuten per keer</label><input id="sm" name="slot_minutes" type="number" min={10} max={180} step={5} defaultValue={30} className="field" /></div>
            <div><label htmlFor="cp" className="label">Makelaars tegelijk</label><input id="cp" name="capacity" type="number" min={1} max={20} defaultValue={1} className="field" /></div>
            <div className="flex items-end"><button className="btn-primary w-full">Toevoegen</button></div>
          </form>
        )}
      </section>

      <section aria-labelledby="blokken">
        <h2 id="blokken" className="text-lg font-bold">Geblokkeerde momenten</h2>
        <p className="text-sm text-muted">Vakantie, een feestdag of iets anders: in deze periode is niets te boeken.</p>
        {blocks.length > 0 && (
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line">
            {blocks.map((b) => (
              <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <span>{formatDateTime(b.startsAt)} tot {formatDateTime(b.endsAt)}{b.reason && <span className="text-muted"> · {b.reason}</span>}</span>
                {write && <form action={deleteBlock}><input type="hidden" name="id" value={b.id} /><button className="btn-ghost !py-1 text-xs" aria-label="Verwijder deze blokkade"><Trash2 size={14} aria-hidden /></button></form>}
              </li>
            ))}
          </ul>
        )}
        {write && (
          <form action={addBlock} className="card mt-4 grid gap-3 p-4 sm:grid-cols-4">
            {officeField}
            <div><label htmlFor="bf" className="label">Van</label><input id="bf" name="from" type="datetime-local" required className="field" /></div>
            <div><label htmlFor="bt" className="label">Tot</label><input id="bt" name="to" type="datetime-local" required className="field" /></div>
            <div><label htmlFor="br" className="label">Reden</label><input id="br" name="reason" maxLength={200} className="field" /></div>
            <div className="flex items-end"><button className="btn-primary w-full">Blokkeren</button></div>
          </form>
        )}
      </section>
    </div>
  );
}
