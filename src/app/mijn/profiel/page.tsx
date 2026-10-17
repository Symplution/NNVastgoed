import type { Metadata } from 'next';
import { requireSeeker } from '@/lib/seeker';
import { seekerLogout } from '@/app/inloggen/actions';
import { saveProfile } from '../actions';

export const metadata: Metadata = { title: 'Profiel' };

export default async function Profiel() {
  const me = await requireSeeker('/mijn/profiel');
  return (
    <div className="max-w-lg space-y-8">
      <form action={saveProfile} className="card space-y-4 p-6">
        <div><label htmlFor="p-name" className="label">Naam</label><input id="p-name" name="name" defaultValue={me.name} required minLength={2} maxLength={120} className="field" /></div>
        <div><label htmlFor="p-phone" className="label">Telefoon (voor bezichtigingen)</label><input id="p-phone" name="phone" type="tel" defaultValue={me.phone ?? ''} maxLength={40} className="field" /></div>
        <div><label className="label">E-mailadres</label><p className="text-sm">{me.email}</p></div>
        <button className="btn-primary">Opslaan</button>
      </form>
      <form action={seekerLogout}><button className="btn-ghost">Uitloggen</button></form>
      <p className="text-xs text-muted">Wil je je account en alle gegevens laten verwijderen? Mail ons via de gegevens in de <a href="/privacy" className="underline">privacyverklaring</a>.</p>
    </div>
  );
}
