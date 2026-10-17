'use client';

import { useActionState, useRef, useEffect } from 'react';
import { addViewing } from '@/app/beheer/actions';

export function AddViewingForm({ listings }: { listings: { id: string; label: string }[] }) {
  const [state, action, pending] = useActionState(addViewing, undefined);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);
  return (
    <form ref={ref} action={action} className="card grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className="sm:col-span-2 lg:col-span-3"><p className="font-bold">Bezichtiging zelf inplannen</p><p className="text-sm text-muted">Bijvoorbeeld na een telefoontje. De bezoeker krijgt een bevestiging per mail.</p></div>
      <div className="sm:col-span-2"><label htmlFor="a-listing" className="label">Woning</label><select id="a-listing" name="listing_id" required className="field"><option value="">Kies…</option>{listings.map((l) => <option key={l.id} value={l.id}>{l.label}</option>)}</select></div>
      <div><label htmlFor="a-start" className="label">Datum en tijd</label><input id="a-start" name="start" type="datetime-local" required className="field" /></div>
      <div><label htmlFor="a-min" className="label">Duur (minuten)</label><input id="a-min" name="minutes" type="number" min={10} max={180} defaultValue={30} className="field" /></div>
      <div><label htmlFor="a-name" className="label">Naam</label><input id="a-name" name="name" required maxLength={120} className="field" /></div>
      <div><label htmlFor="a-email" className="label">E-mailadres</label><input id="a-email" name="email" type="email" required className="field" /></div>
      <div><label htmlFor="a-phone" className="label">Telefoon</label><input id="a-phone" name="phone" type="tel" maxLength={40} className="field" /></div>
      <div className="sm:col-span-2"><label htmlFor="a-note" className="label">Opmerking</label><input id="a-note" name="note" maxLength={1000} className="field" /></div>
      <div className="flex items-end"><button disabled={pending} className="btn-primary w-full">{pending ? 'Inplannen…' : 'Inplannen'}</button></div>
      {state?.errors && <ul role="alert" className="list-disc pl-5 text-sm text-red-700 sm:col-span-2 lg:col-span-3">{state.errors.map((e) => <li key={e}>{e}</li>)}</ul>}
      {state?.ok && <p role="status" className="text-sm font-semibold text-green-800 sm:col-span-2 lg:col-span-3">{state.ok}</p>}
    </form>
  );
}
