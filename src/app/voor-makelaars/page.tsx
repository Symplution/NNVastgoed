import type { Metadata } from 'next';
import Link from 'next/link';
import { BellRing, CalendarCheck, Inbox, Network, Sparkles } from 'lucide-react';

export const metadata: Metadata = { title: 'Voor makelaars', description: 'Toon je woningaanbod aan woningzoekers in Groningen, Friesland en Drenthe. Koppel je kantoorsoftware of beheer je woningen zelf.' };

const EXAMPLE = `{
  "volledig": false,
  "woningen": [{
    "id": "RW-10234",
    "status": "beschikbaar",
    "aanbod": "koop",              // of "huur": dan is vraagprijs de huur per maand
    "nieuwbouw": false,
    "straat": "Hoofdstraat", "huisnummer": "12", "postcode": "9981 AB", "plaats": "Uithuizen",
    "vraagprijs": 289000, "prijs_type": "k.k.",
    "woonoppervlakte": 140, "perceeloppervlakte": 600, "kamers": 5, "slaapkamers": 3,
    "type": "vrijstaand", "bouwjaar": 1935, "energielabel": "C",
    "omschrijving": "Ruime woning aan de rand van het dorp…",
    "kenmerken": ["Garage", "Zonnepanelen"],
    "fotos": [{ "url": "https://media.jouwkantoor.nl/10234/1.jpg", "omschrijving": "Voorzijde" }]
  }]
}`;

export default function VoorMakelaars() {
  return (
    <div className="container-x py-12">
      <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Voor makelaars in het noorden</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-extrabold tracking-tight">Laat je aanbod zien aan iedereen die in het noorden zoekt</h1>
      <p className="mt-4 max-w-2xl text-lg text-muted">NNvastgoed (Noord Nederlands Vastgoed) is dé plek voor woningzoekers in Groningen, Friesland en Drenthe. Jij houdt je eigen werkwijze; wij zorgen dat je aanbod er goed uitziet en dat reacties direct bij jou aankomen.</p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        {[
          { Icon: Network, t: 'Koppel je systeem', d: 'Stuur je aanbod automatisch vanuit je kantoorsoftware of via je ICT-partner. Wijzigingen, prijsverlagingen en verkoop staan er direct.' },
          { Icon: Inbox, t: 'Leads in je beheer', d: 'Elk contactverzoek komt in je beheer én in je inbox, met de woning erbij. Je ziet wie al is opgepakt.' },
          { Icon: BellRing, t: 'Zoekers die wachten', d: 'Woningzoekers laten zich mailen bij nieuw aanbod. Jouw nieuwe woning bereikt ze op de dag zelf.' },
          { Icon: CalendarCheck, t: 'Bezichtigingen zonder bellen', d: 'Stel in wanneer je beschikbaar bent. Zoekers plannen zelf een moment, het staat meteen in je agenda en overzicht, met hun gegevens erbij.' },
          { Icon: Sparkles, t: 'Straks met AI-assistentie', d: 'Departments voor teksten, opvolging en marketing nemen je routinewerk uit handen. Jij keurt goed, zij doen het werk.' },
        ].map(({ Icon, t, d }) => (
          <div key={t} className="card flex gap-4 p-6"><span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand"><Icon size={22} aria-hidden /></span><div><h2 className="font-bold">{t}</h2><p className="mt-1 text-sm text-muted">{d}</p></div></div>
        ))}
      </div>

      <section className="mt-14" aria-labelledby="koppelen">
        <h2 id="koppelen" className="text-2xl font-extrabold tracking-tight">Zo koppel je</h2>
        <ol className="mt-4 max-w-2xl list-decimal space-y-2 pl-5 text-ink/90">
          <li>Je krijgt een account voor je kantoor en logt in met een authenticator-app.</li>
          <li>Onder <strong>Koppelingen</strong> maak je een koppeling aan. Je ziet één keer de geheime sleutel; bewaar die goed.</li>
          <li>Je systeem of ICT-partner stuurt het aanbod naar het adres van de koppeling, in JSON of XML.</li>
          <li>Je ziet na elke aanroep wat er is verwerkt en wat er is afgewezen, met de reden erbij.</li>
        </ol>
        <pre className="mt-6 overflow-x-auto rounded-xl bg-ink p-5 text-xs leading-relaxed text-white/90"><code>{`POST https://nnvastgoed.nl/api/feeds/<koppeling-id>
Authorization: Bearer <geheime sleutel>
Content-Type: application/json

${EXAMPLE}`}</code></pre>
        <p className="mt-4 max-w-2xl text-sm text-muted">Zet <code>"volledig": true</code> als je altijd je complete aanbod stuurt: woningen die je dan niet meer meestuurt gaan offline. Er geldt een maximum van 500 woningen per aanroep. Alleen aanbod in Groningen, Friesland en Drenthe wordt geaccepteerd. Naast woningen kun je ook huur, nieuwbouw en bedrijfsruimte (type kantoorruimte, bedrijfshal, winkelruimte of horecapand) sturen.</p>
      </section>

      <div className="mt-12 flex flex-wrap gap-3">
        <Link href="/login" className="btn-primary">Inloggen voor makelaars</Link>
        <Link href="/makelaars" className="btn-ghost">Bekijk aangesloten kantoren</Link>
      </div>
    </div>
  );
}
