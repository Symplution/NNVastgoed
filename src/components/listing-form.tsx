'use client';

import { useActionState } from 'react';
import { saveListing } from '@/app/beheer/actions';
import { COMMERCIAL_TYPES, ENERGY_LABELS, HOME_TYPES, PROVINCES, STATUSES, type Listing, type Office } from '@/lib/types';
import { provinceName } from '@/lib/regions';
import { STATUS_LABEL, TYPE_LABEL } from '@/lib/format';
import { PhotoEditor } from './photo-editor';

export function ListingForm({ listing, offices, officeId, canPickOffice }: { listing?: Listing; offices: Office[]; officeId: string | null; canPickOffice: boolean }) {
  const [state, action, pending] = useActionState(saveListing.bind(null, listing?.id ?? null), undefined);
  const l = listing;
  const num = (name: string, label: string, value: number | null | undefined, extra: Record<string, unknown> = {}) => (
    <div><label htmlFor={name} className="label">{label}</label><input id={name} name={name} type="number" defaultValue={value ?? ''} className="field" {...extra} /></div>
  );
  const txt = (name: string, label: string, value: string | null | undefined, extra: Record<string, unknown> = {}) => (
    <div><label htmlFor={name} className="label">{label}</label><input id={name} name={name} defaultValue={value ?? ''} className="field" {...extra} /></div>
  );
  return (
    <form action={action} className="space-y-8">
      {state?.errors && <div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-900"><p className="font-semibold">Controleer het formulier:</p><ul className="mt-1 list-disc pl-5">{state.errors.map((e) => <li key={e}>{e}</li>)}</ul></div>}

      <fieldset className="card grid gap-4 p-6 sm:grid-cols-3">
        <legend className="sr-only">Status</legend>
        <div>
          <label htmlFor="offer" className="label">Aanbod</label>
          <select id="offer" name="offer" defaultValue={l?.offer ?? 'koop'} className="field"><option value="koop">Te koop</option><option value="huur">Te huur (prijs per maand)</option></select>
          <label className="mt-2 flex items-center gap-2 text-sm"><input type="checkbox" name="new_build" defaultChecked={l?.newBuild} /> Nieuwbouw</label>
        </div>
        <div>
          <label htmlFor="status" className="label">Status</label>
          <select id="status" name="status" defaultValue={l?.status ?? 'concept'} className="field">{STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}</select>
          <p className="mt-1 text-xs text-muted">Een concept is niet zichtbaar op de site.</p>
        </div>
        {!l && canPickOffice && (
          <div><label htmlFor="office_id" className="label">Kantoor</label><select id="office_id" name="office_id" required className="field"><option value="">Kies…</option>{offices.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
        )}
      </fieldset>

      <fieldset className="card grid gap-4 p-6 sm:grid-cols-6">
        <legend className="mb-2 px-1 text-lg font-bold">Adres</legend>
        <div className="sm:col-span-3">{txt('street', 'Straat', l?.street, { required: true, maxLength: 120 })}</div>
        <div className="sm:col-span-1">{txt('house_number', 'Nummer', l?.houseNumber, { required: true, maxLength: 12 })}</div>
        <div className="sm:col-span-2">{txt('house_suffix', 'Toevoeging', l?.houseSuffix, { maxLength: 12 })}</div>
        <div className="sm:col-span-2">{txt('postcode', 'Postcode', l?.postcode, { required: true, maxLength: 7, placeholder: '9711 AB' })}</div>
        <div className="sm:col-span-2">{txt('city', 'Plaats', l?.city, { required: true, maxLength: 80 })}</div>
        <div className="sm:col-span-2"><label htmlFor="province" className="label">Provincie</label><select id="province" name="province" defaultValue={l?.province ?? ''} required className="field"><option value="">Kies…</option>{PROVINCES.map((p) => <option key={p} value={p}>{provinceName(p)}</option>)}</select></div>
        <div className="sm:col-span-3">{txt('neighbourhood', 'Wijk of buurt', l?.neighbourhood, { maxLength: 80 })}</div>
        <div className="sm:col-span-1">{num('lat', 'Breedtegraad', l?.lat, { step: 'any' })}</div>
        <div className="sm:col-span-2">{num('lng', 'Lengtegraad', l?.lng, { step: 'any' })}</div>
      </fieldset>

      <fieldset className="card grid gap-4 p-6 sm:grid-cols-4">
        <legend className="mb-2 px-1 text-lg font-bold">Prijs en afmetingen</legend>
        {num('asking_price', 'Vraagprijs of huur per maand (€)', l?.askingPrice, { required: true, min: 0, step: 50 })}
        <div><label htmlFor="price_type" className="label">Kosten (alleen bij koop)</label><select id="price_type" name="price_type" defaultValue={l?.priceType === 'v.o.n.' ? 'v.o.n.' : 'k.k.'} className="field"><option value="k.k.">Kosten koper</option><option value="v.o.n.">Vrij op naam</option></select></div>
        {num('living_area', 'Woonoppervlakte (m²)', l?.livingArea, { required: true, min: 1 })}
        {num('plot_area', 'Perceel (m²)', l?.plotArea, { min: 0 })}
        {num('rooms', 'Kamers', l?.rooms, { required: true, min: 0 })}
        {num('bedrooms', 'Slaapkamers', l?.bedrooms ?? 0, { min: 0 })}
        {num('bathrooms', 'Badkamers', l?.bathrooms ?? 1, { min: 0 })}
        {num('build_year', 'Bouwjaar', l?.buildYear, { min: 1200, max: 2100 })}
        <div><label htmlFor="property_type" className="label">Soort woning</label><select id="property_type" name="property_type" defaultValue={l?.propertyType ?? ''} required className="field"><option value="">Kies…</option><optgroup label="Woningen">{HOME_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}</optgroup><optgroup label="Bedrijfsruimte">{COMMERCIAL_TYPES.map((t) => <option key={t} value={t}>{TYPE_LABEL[t]}</option>)}</optgroup><option value="overig">Overig</option></select></div>
        <div><label htmlFor="energy_label" className="label">Energielabel</label><select id="energy_label" name="energy_label" defaultValue={l?.energyLabel ?? ''} className="field"><option value="">Onbekend</option>{ENERGY_LABELS.map((e) => <option key={e} value={e}>{e}</option>)}</select></div>
      </fieldset>

      <fieldset className="card space-y-4 p-6">
        <legend className="mb-2 px-1 text-lg font-bold">Omschrijving</legend>
        <div><label htmlFor="description" className="label">Tekst</label><textarea id="description" name="description" rows={9} defaultValue={l?.description} maxLength={20000} className="field" /></div>
        <div><label htmlFor="features" className="label">Kenmerken (één per regel)</label><textarea id="features" name="features" rows={4} defaultValue={l?.features.join('\n')} placeholder={'Garage\nZonnepanelen\nTuin op het zuiden'} className="field" /></div>
      </fieldset>

      <fieldset className="card p-6">
        <legend className="mb-3 px-1 text-lg font-bold">Foto’s</legend>
        <PhotoEditor officeId={l?.officeId ?? officeId} initial={l?.photos ?? []} />
        {!l && canPickOffice && <p className="mt-2 text-xs text-muted">Uploaden werkt naar de map van je eigen kantoor. Als beheerder plak je een https-adres, of maak je de woning eerst aan en voeg je daarna foto’s toe.</p>}
      </fieldset>

      <div className="flex gap-3"><button disabled={pending} className="btn-primary">{pending ? 'Opslaan…' : 'Opslaan'}</button><a href="/beheer/woningen" className="btn-ghost">Annuleren</a></div>
    </form>
  );
}
