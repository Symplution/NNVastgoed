import type { Metadata } from 'next';
import { canWrite, isManager, requireStaff } from '@/lib/auth';
import Link from 'next/link';
import { AutoRefresh } from '@/components/auto-refresh';
import { ConnectionForm } from '@/components/connection-form';
import { CopyButton } from '@/components/copy-button';
import { RotateKey } from '@/components/rotate-key';
import { partnerInstructions } from '@/lib/feeds/instructions';
import { myConnections, myOffices, recentRuns } from '@/lib/staff-data';
import { siteUrl } from '@/lib/env';
import { formatDate } from '@/lib/format';
import { deleteConnection, toggleConnection } from '../actions';

export const metadata: Metadata = { title: 'Koppelingen' };

export default async function Koppelingen() {
  const staff = await requireStaff();
  const [connections, runs, offices] = await Promise.all([myConnections(), recentRuns(), myOffices()]);
  const write = canWrite(staff);
  const name = new Map(connections.map((c) => [c.id, c.name]));
  const officeName = new Map(offices.map((o) => [o.id, o.name]));
  const myOffice = staff.officeId;
  const waiting = connections.some((c) => c.active && !c.lastRunAt);
  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-extrabold tracking-tight">Koppelingen</h1><p className="mt-1 max-w-2xl text-sm text-muted">Laat Realworks (of een ander systeem of je ICT-partner) je aanbod automatisch naar NNvastgoed sturen. Jij maakt de koppeling, zij stellen hem in.</p></div>
      {waiting && <AutoRefresh seconds={15} />}
      {write && (myOffice || isManager(staff.role) ? (
        <ConnectionForm offices={offices} pickOffice={isManager(staff.role)} defaultOfficeId={myOffice ?? offices[0]?.id ?? null} baseUrl={siteUrl()} />
      ) : null)}
      {write && !myOffice && !isManager(staff.role) && <p className="rounded-xl bg-sand p-6 text-sm text-muted">Je account is nog niet gekoppeld aan een kantoor. Dat kan de eigenaar voor je doen onder Beheer → Gebruikers.</p>}
      {write && !myOffice && isManager(staff.role) && <p className="rounded-xl bg-accent-soft p-4 text-sm text-accent-dark">Je account hoort nog niet bij een kantoor. <Link href="/beheer/kantoor" className="font-semibold underline">Maak je kantoor aan of kies er een</Link>, dan staat het hierboven al ingevuld.</p>}
      <section aria-labelledby="actief">
        <h2 id="actief" className="text-lg font-bold">Je koppelingen</h2>
        {connections.length ? (
          <ul className="mt-3 space-y-3">{connections.map((c) => {
            const connected = Boolean(c.lastRunAt);
            return (
            <li key={c.id} className="card p-4">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-bold">{c.name} <span className={`pill ml-2 ${!c.active ? 'bg-sand text-muted' : connected ? 'bg-green-100 text-green-900' : 'bg-amber-100 text-amber-900'}`}>{!c.active ? 'Gepauzeerd' : connected ? 'Verbonden' : 'Wacht op eerste aanroep'}</span> <span className="pill bg-brand-soft text-brand">{c.kind.toUpperCase()}</span></p>
                  {isManager(staff.role) && <p className="mt-0.5 text-xs text-muted">{officeName.get(c.officeId)}</p>}
                  <p className="mt-1 break-all text-xs text-muted">{siteUrl()}/api/feeds/{c.id} · sleutel eindigt op …{c.hint}</p>
                  <p className="mt-1 text-xs text-muted">{connected ? `Laatste aanroep ${formatDate(c.lastRunAt!)}: ${c.lastUpserted} van ${c.lastReceived} verwerkt (${c.lastStatus})` : 'Nog nooit gebruikt. Stuur de instructie naar je ICT-partner.'}</p>
                </div>
                {write && (
                  <div className="flex flex-wrap items-start gap-2">
                    <CopyButton text={partnerInstructions({ baseUrl: siteUrl(), id: c.id, kind: c.kind === 'xml' ? 'xml' : 'json', officeName: officeName.get(c.officeId) ?? 'ons kantoor', software: c.name })} label="Kopieer instructie" />
                    <RotateKey id={c.id} baseUrl={siteUrl()} />
                    <form action={toggleConnection}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="active" value={c.active ? '0' : '1'} /><button className="btn-ghost !py-1.5">{c.active ? 'Pauzeren' : 'Activeren'}</button></form>
                    <form action={deleteConnection}><input type="hidden" name="id" value={c.id} /><button className="btn-ghost !py-1.5 !text-red-700">Verwijderen</button></form>
                  </div>
                )}
              </div>
            </li>); })}</ul>
        ) : <p className="mt-3 rounded-xl bg-sand p-8 text-center text-sm text-muted">Nog geen koppelingen.</p>}
      </section>
      {runs.length > 0 && (
        <section aria-labelledby="runs">
          <h2 id="runs" className="text-lg font-bold">Laatste aanroepen</h2>
          <ul className="mt-3 divide-y divide-line rounded-xl border border-line text-sm">{runs.map((r) => (
            <li key={r.id} className="px-4 py-3">
              <p><span className="font-semibold">{name.get(r.connectionId) ?? 'Koppeling'}</span> · {formatDate(r.at)} · {r.upserted} verwerkt{r.rejected ? `, ${r.rejected} afgewezen` : ''}</p>
              {r.errors.length > 0 && <ul className="mt-1 list-disc pl-5 text-xs text-red-800">{r.errors.slice(0, 5).map((e, i) => <li key={i}>{e.external_id ? `${e.external_id}: ` : `Regel ${e.index + 1}: `}{e.reason}</li>)}</ul>}
            </li>))}</ul>
        </section>
      )}
    </div>
  );
}
