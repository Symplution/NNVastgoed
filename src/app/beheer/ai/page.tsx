import type { Metadata } from 'next';
import { Sparkles } from 'lucide-react';

export const metadata: Metadata = { title: 'AI-departments' };

const PLANNED = [
  ['Woningteksten', 'Schrijft een omschrijving uit kenmerken en foto’s in de stijl van je kantoor.'],
  ['Leadopvolging', 'Stelt een antwoord voor op elk contactverzoek en herinnert je aan opvolging.'],
  ['Marketing en social', 'Plant berichten voor nieuw aanbod en stelt advertenties voor.'],
  ['Kantoorassistent', 'Beantwoordt vragen over je aanbod en je leads, alleen-lezen.'],
];

export default function AiPage() {
  return (
    <div>
      <h1 className="flex items-center gap-2 text-2xl font-extrabold tracking-tight"><Sparkles className="text-accent" aria-hidden /> AI-departments</h1>
      <p className="mt-2 max-w-2xl text-muted">Komt later. Elk department krijgt een manager en specialisten die voorstellen doen; jij als makelaar keurt goed. Alles wat betaald is gaat via dezelfde usage gate als de mail (<code>usage_events</code>, soort <code>ai</code>), zodat kosten per kantoor in de hand blijven.</p>
      <ul className="mt-6 grid gap-4 sm:grid-cols-2">{PLANNED.map(([t, d]) => <li key={t} className="card p-5"><p className="font-bold">{t}</p><p className="mt-1 text-sm text-muted">{d}</p><span className="pill mt-3 bg-sand text-muted">Binnenkort</span></li>)}</ul>
    </div>
  );
}
