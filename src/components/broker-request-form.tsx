'use client';

import { useActionState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { submitBrokerRequest } from '@/app/actions';
import { Select } from './select';

export function BrokerRequestForm() {
  const [state, action, pending] = useActionState(submitBrokerRequest, undefined);
  if (state?.ok) return <div role="status" className="flex gap-3 rounded-2xl bg-green-50 p-6 text-green-900"><CheckCircle2 className="shrink-0" size={22} aria-hidden /><p>{state.message}</p></div>;
  return (
    <form action={action} className="space-y-4">
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2"><label htmlFor="b-office" className="label">Naam van je kantoor</label><input id="b-office" name="office_name" required minLength={2} maxLength={120} autoComplete="organization" className="field" /></div>
        <div><label htmlFor="b-city" className="label">Plaats</label><input id="b-city" name="city" required minLength={2} maxLength={80} autoComplete="address-level2" className="field" /></div>
        <div>
          <label htmlFor="b-prov" className="label">Provincie</label>
          <Select id="b-prov" name="province" required placeholder="Kies een provincie" options={[{ value: 'groningen', label: 'Groningen' }, { value: 'friesland', label: 'Friesland' }, { value: 'drenthe', label: 'Drenthe' }]} />
        </div>
        <div><label htmlFor="b-kvk" className="label">KvK-nummer (optioneel)</label><input id="b-kvk" name="kvk" inputMode="numeric" pattern="[0-9 ]{8,10}" maxLength={10} className="field" /></div>
        <div><label htmlFor="b-count" className="label">Aantal woningen in je aanbod (optioneel)</label><input id="b-count" name="listing_count" type="number" min={0} max={100000} className="field" /></div>
        <div><label htmlFor="b-soft" className="label">Kantoorsoftware (optioneel)</label><input id="b-soft" name="software" maxLength={80} placeholder="Bijvoorbeeld Realworks, Skarabee of Eigen" className="field" /></div>
        <label className="flex items-center gap-2 self-end pb-3 text-sm"><input type="checkbox" name="nvm" /> Ons kantoor is aangesloten bij de NVM</label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="b-name" className="label">Je naam</label><input id="b-name" name="contact_name" required minLength={2} maxLength={120} autoComplete="name" className="field" /></div>
        <div><label htmlFor="b-email" className="label">Zakelijk e-mailadres</label><input id="b-email" name="email" type="email" required autoComplete="email" className="field" /></div>
        <div className="sm:col-span-2"><label htmlFor="b-phone" className="label">Telefoon (optioneel)</label><input id="b-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" className="field sm:max-w-xs" /></div>
        <div className="sm:col-span-2"><label htmlFor="b-msg" className="label">Opmerking of vraag (optioneel)</label><textarea id="b-msg" name="message" rows={3} maxLength={2000} className="field" /></div>
      </div>
      <label className="flex items-start gap-2 text-sm text-muted"><input type="checkbox" name="consent" required className="mt-0.5" /><span>Ik ga akkoord met de <a href="/privacy" className="underline">privacyverklaring</a>. Mijn gegevens worden gebruikt om mijn aanmelding te behandelen.</span></label>
      {state?.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}
      <button disabled={pending} className="btn-accent">{pending ? 'Versturen…' : 'Meld mijn kantoor aan'}</button>
    </form>
  );
}
