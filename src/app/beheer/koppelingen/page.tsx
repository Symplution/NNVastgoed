import type { Metadata } from 'next';
import { canWrite, isManager, requireStaff } from '@/lib/auth';
import { ConnectionForm } from '@/components/connection-form';
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
  return (
    <div className="space-y-8">
      <div><h1 className="text-2xl font-extrabold tracking-tight">Koppelingen</h1><p className="mt-1 max-w-2xl text-sm text-muted">Laat je kantoorsoftware (of je ICT-partner) je aanbod automatisch naar NNvastgoed sturen. Elke koppeling heeft een eigen adres en een geheime sleutel.</p></div>
      {write && <ConnectionForm offices={offices} pickOffice={isManager(staff.role)} baseUrl={siteUrl()} />}
      <section aria-labelledby="actief">
        <h2 id="actief" className="text-lg font-bold">Je koppelingen</h2>
        {connections.length ? (
          <ul className="mt-3 space-y-3">{connections.map((c) => (
            <li key={c.id} className="card flex flex-wrap items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="font-bold">{c.name} <span className={`pill ml-2 ${c.active ? 'bg-green-100 text-green-900' : 'bg-sand text-muted'}`}>{c.active ? 'Actief' : 'Gepauzeerd'}</span> <span className="pill bg-brand-soft text-brand">{c.kind.toUpperCase()}</span></p>
                <p className="mt-1 break-all text-xs text-muted">{siteUrl()}/api/feeds/{c.id} · sleutel eindigt op …{c.hint}</p>
                <p className="mt-1 text-xs text-muted">{c.lastRunAt ? `Laatste aanroep ${formatDate(c.lastRunAt)}: ${c.lastUpserted} van ${c.lastReceived} verwerkt (${c.lastStatus})` : 'Nog nooit gebruikt'}</p>
              </div>
              {write && (
                <div className="flex gap-2">
                  <form action={toggleConnection}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="active" value={c.active ? '0' : '1'} /><button className="btn-ghost !py-1.5">{c.active ? 'Pauzeren' : 'Activeren'}</button></form>
                  <form action={deleteConnection}><input type="hidden" name="id" value={c.id} /><button className="btn-ghost !py-1.5 !text-red-700">Verwijderen</button></form>
                </div>
              )}
            </li>))}</ul>
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
