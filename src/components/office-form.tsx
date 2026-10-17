'use client';

import { useActionState } from 'react';
import { saveOffice } from '@/app/beheer/actions';
import { PROVINCES, type Office } from '@/lib/types';
import { provinceName } from '@/lib/regions';
import { Select } from './select';

export function OfficeForm({ office, canSetNvm = false }: { office?: Office; canSetNvm?: boolean }) {
  const [state, action, pending] = useActionState(saveOffice.bind(null, office?.id ?? null), undefined);
  const f = (name: string, label: string, value: string | null | undefined, extra: Record<string, unknown> = {}) => (
    <div><label htmlFor={`o-${name}`} className="label">{label}</label><input id={`o-${name}`} name={name} defaultValue={value ?? ''} className="field" {...extra} /></div>
  );
  return (
    <form action={action} className="card grid gap-4 p-6 sm:grid-cols-2">
      {f('name', 'Naam', office?.name, { required: true })}
      {f('city', 'Plaats', office?.city, { required: true })}
      <div><label htmlFor="o-province" className="label">Provincie</label><Select id="o-province" name="province" defaultValue={office?.province ?? ''} required options={[{ value: '', label: 'Kies een provincie…' }, ...PROVINCES.map((p) => ({ value: p, label: provinceName(p) }))]} /></div>
      {f('street', 'Straat en nummer', office?.street)}
      {f('postcode', 'Postcode', office?.postcode)}
      {f('phone', 'Telefoon', office?.phone, { type: 'tel' })}
      {f('email', 'E-mail (hier komen de leads binnen)', office?.email, { type: 'email', required: true })}
      {f('website', 'Website (https://…)', office?.website)}
      <div className="sm:col-span-2"><label htmlFor="o-description" className="label">Over het kantoor</label><textarea id="o-description" name="description" rows={4} maxLength={2000} defaultValue={office?.description} className="field" /></div>
      {canSetNvm && <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="nvm_member" defaultChecked={office?.nvmMember} /> Lid van de NVM (alleen aanvinken na controle van het lidmaatschap)</label>}
      {state?.errors && <ul role="alert" className="list-disc pl-5 text-sm text-red-700 sm:col-span-2">{state.errors.map((e) => <li key={e}>{e}</li>)}</ul>}
      {state?.ok && <p role="status" className="text-sm font-semibold text-green-800 sm:col-span-2">{state.ok}</p>}
      <div className="sm:col-span-2"><button disabled={pending} className="btn-primary">{pending ? 'Opslaan…' : office ? 'Opslaan' : 'Kantoor aanmaken'}</button></div>
    </form>
  );
}
