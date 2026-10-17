'use client';

import { useActionState } from 'react';
import { createConnection } from '@/app/beheer/actions';
import type { Office } from '@/lib/types';

export function ConnectionForm({ offices, pickOffice, baseUrl }: { offices: Office[]; pickOffice: boolean; baseUrl: string }) {
  const [state, action, pending] = useActionState(createConnection, undefined);
  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold">Nieuwe koppeling</h2>
      {state?.secret ? (
        <div role="status" className="mt-4 space-y-3 text-sm">
          <p className="rounded-lg bg-amber-50 p-3 font-semibold text-amber-900">Bewaar deze sleutel nu. Je ziet hem hierna nooit meer.</p>
          <div><p className="label">Adres</p><code className="block break-all rounded bg-sand p-2">{baseUrl}/api/feeds/{state.secret.id}</code></div>
          <div><p className="label">Geheime sleutel</p><code className="block break-all rounded bg-sand p-2">{state.secret.value}</code></div>
          <p className="text-muted">Stuur je aanbod met <code>Authorization: Bearer &lt;sleutel&gt;</code>. Zie “Voor makelaars” voor het formaat.</p>
        </div>
      ) : (
        <form action={action} className="mt-4 grid gap-4 sm:grid-cols-[1fr_9rem_auto] sm:items-end">
          <div><label htmlFor="c-name" className="label">Naam (bijv. “Realworks”)</label><input id="c-name" name="name" required minLength={2} maxLength={80} className="field" /></div>
          <div><label htmlFor="c-kind" className="label">Formaat</label><select id="c-kind" name="kind" className="field"><option value="json">JSON</option><option value="xml">XML</option></select></div>
          <button disabled={pending} className="btn-primary">{pending ? 'Bezig…' : 'Aanmaken'}</button>
          {pickOffice && <div className="sm:col-span-3"><label htmlFor="c-office" className="label">Kantoor</label><select id="c-office" name="office_id" required className="field"><option value="">Kies…</option>{offices.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>}
          {state?.errors && <p role="alert" className="text-sm text-red-700 sm:col-span-3">{state.errors.join(' ')}</p>}
        </form>
      )}
    </div>
  );
}
