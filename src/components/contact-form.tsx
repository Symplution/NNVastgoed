'use client';

import { useActionState } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { submitLead } from '@/app/actions';

export function ContactForm({ listingId, officeName }: { listingId: string; officeName: string }) {
  const [state, action, pending] = useActionState(submitLead, undefined);
  if (state?.ok) return <div role="status" className="flex gap-3 rounded-xl bg-green-50 p-4 text-sm text-green-900"><CheckCircle2 className="shrink-0" size={20} aria-hidden /><p>{state.message}</p></div>;
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="listingId" value={listingId} />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <fieldset className="grid grid-cols-2 gap-2 text-sm">
        <legend className="sr-only">Waarvoor neem je contact op?</legend>
        <label className="flex cursor-pointer items-center justify-center rounded-lg border border-line px-3 py-2 has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:font-semibold"><input type="radio" name="kind" value="bezichtiging" defaultChecked className="sr-only" /> Bezichtiging</label>
        <label className="flex cursor-pointer items-center justify-center rounded-lg border border-line px-3 py-2 has-[:checked]:border-brand has-[:checked]:bg-brand-soft has-[:checked]:font-semibold"><input type="radio" name="kind" value="info" className="sr-only" /> Vraag stellen</label>
      </fieldset>
      <div><label htmlFor="c-name" className="label">Naam</label><input id="c-name" name="name" required minLength={2} maxLength={120} autoComplete="name" className="field" /></div>
      <div><label htmlFor="c-email" className="label">E-mailadres</label><input id="c-email" name="email" type="email" required autoComplete="email" className="field" /></div>
      <div><label htmlFor="c-phone" className="label">Telefoon (optioneel)</label><input id="c-phone" name="phone" type="tel" maxLength={40} autoComplete="tel" className="field" /></div>
      <div><label htmlFor="c-msg" className="label">Bericht</label><textarea id="c-msg" name="message" required maxLength={2000} rows={4} defaultValue="Ik heb interesse in deze woning. Kunnen jullie contact met mij opnemen?" className="field" /></div>
      <label className="flex items-start gap-2 text-xs text-muted"><input type="checkbox" name="consent" required className="mt-0.5" /><span>Ik ga akkoord met de <a href="/privacy" className="underline">privacyverklaring</a>. Mijn gegevens gaan naar {officeName}.</span></label>
      {state?.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}
      <button disabled={pending} className="btn-accent w-full">{pending ? 'Versturen…' : 'Verstuur'}</button>
    </form>
  );
}
