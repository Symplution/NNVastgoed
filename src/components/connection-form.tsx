'use client';

import { Network, Plug } from 'lucide-react';
import { useActionState, useState } from 'react';
import { createConnection } from '@/app/beheer/actions';
import type { Office } from '@/lib/types';
import { SecretPanel } from './secret-panel';
import { Select } from './select';

const CHOICES = [
  { id: 'realworks', title: 'Realworks', text: 'Voor kantoren die met Realworks werken.', Icon: Plug },
  { id: 'ander', title: 'Een ander systeem', text: 'Skarabee, TiaraWeb, een ICT-partner of een eigen systeem.', Icon: Network },
] as const;

/** Een koppeling maken in één stap: kies je systeem, druk op de knop en stuur de instructie door. */
export function ConnectionForm({ offices, pickOffice, defaultOfficeId, baseUrl }: { offices: Office[]; pickOffice: boolean; defaultOfficeId: string | null; baseUrl: string }) {
  const [state, action, pending] = useActionState(createConnection, undefined);
  const [software, setSoftware] = useState<'realworks' | 'ander'>('realworks');
  const [shown, setShown] = useState(true);
  return (
    <div className="card p-6">
      <h2 className="text-lg font-bold">Koppel je kantoorsoftware</h2>
      {state?.secret && shown ? (
        <SecretPanel secret={state.secret} baseUrl={baseUrl} onClose={() => setShown(false)} />
      ) : (
        <form action={action} className="mt-4 space-y-5" onSubmit={() => setShown(true)}>
          <fieldset>
            <legend className="label">Met welk systeem werk je?</legend>
            <div className="mt-1 grid gap-3 sm:grid-cols-2">
              {CHOICES.map(({ id, title, text, Icon }) => (
                <label key={id} className={`flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition ${software === id ? 'border-accent bg-accent-soft/50' : 'border-line hover:border-brand/40'}`}>
                  <input type="radio" name="software" value={id} checked={software === id} onChange={() => setSoftware(id)} className="sr-only" />
                  <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${software === id ? 'bg-accent text-white' : 'bg-brand-soft text-brand'}`}><Icon size={18} aria-hidden /></span>
                  <span><span className="block font-bold">{title}</span><span className="block text-sm text-muted">{text}</span></span>
                </label>
              ))}
            </div>
          </fieldset>

          {software === 'ander' && (
            <div className="grid gap-4 sm:grid-cols-[1fr_9rem]">
              <div><label htmlFor="c-name" className="label">Naam van het systeem</label><input id="c-name" name="name" required minLength={2} maxLength={80} placeholder="Bijvoorbeeld Skarabee" className="field" /></div>
              <div><label htmlFor="c-kind" className="label">Formaat</label><Select id="c-kind" name="kind" defaultValue="json" options={[{ value: 'json', label: 'JSON' }, { value: 'xml', label: 'XML' }]} /></div>
            </div>
          )}
          {pickOffice && (
            <div><label htmlFor="c-office" className="label">Voor welk kantoor?</label><Select id="c-office" name="office_id" required defaultValue={defaultOfficeId ?? ''} options={[{ value: '', label: 'Kies een kantoor…' }, ...offices.map((o) => ({ value: o.id, label: o.name }))]} /></div>
          )}

          <div className="rounded-xl bg-brand-soft p-4 text-sm text-brand-dark">
            <p className="font-semibold">Zo werkt het</p>
            <ol className="mt-1 list-decimal space-y-0.5 pl-5"><li>Je drukt op de knop en krijgt een adres en een geheime sleutel.</li><li>Je stuurt de kant-en-klare instructie door naar {software === 'realworks' ? 'Realworks of je ICT-partner' : 'je leverancier of ICT-partner'}.</li><li>Zodra zij versturen, staat de koppeling hieronder op Verbonden.</li></ol>
            {software === 'realworks' && <p className="mt-2 text-xs text-brand-dark/80">NNvastgoed heeft nog geen rechtstreekse Realworks-koppeling zonder tussenkomst: Realworks of je ICT-partner stelt de koppeling in met de gegevens die je hier krijgt.</p>}
          </div>

          {state?.errors && <p role="alert" className="text-sm text-red-700">{state.errors.join(' ')}</p>}
          <button disabled={pending} className="btn-accent !px-6 !py-3 text-base">{pending ? 'Bezig…' : software === 'realworks' ? 'Koppeling voor Realworks maken' : 'Koppeling maken'}</button>
        </form>
      )}
    </div>
  );
}
