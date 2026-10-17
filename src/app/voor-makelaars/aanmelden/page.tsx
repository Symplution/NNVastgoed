import type { Metadata } from 'next';
import Link from 'next/link';
import { CheckCircle2, ClipboardList, LogIn, Network, PartyPopper, UserCheck } from 'lucide-react';
import { BrokerRequestForm } from '@/components/broker-request-form';

export const metadata: Metadata = { title: 'Makelaar aanmelden', description: 'Meld je kantoor aan bij NNvastgoed, het woningportaal voor Groningen, Friesland en Drenthe. In vier stappen staat je aanbod online.' };

const STEPS = [
  { Icon: ClipboardList, t: 'Meld je kantoor aan', d: 'Vul hieronder de gegevens van je kantoor in. Dat kost je een paar minuten en je hebt er geen account voor nodig.' },
  { Icon: UserCheck, t: 'Wij nemen contact op', d: 'Binnen twee werkdagen controleren we je kantoor en maken we je account aan. Je krijgt een uitnodiging per mail.' },
  { Icon: LogIn, t: 'Log in en stel je kantoor in', d: 'Je logt in met een authenticator-app, vult het kantoorprofiel aan en stelt in wanneer zoekers bezichtigingen kunnen plannen.' },
  { Icon: Network, t: 'Zet je aanbod online', d: 'Voer woningen zelf in, of koppel je kantoorsoftware zodat je aanbod automatisch binnenkomt en bijgewerkt blijft.' },
];
const FAQ = [
  ['Wat kost het?', 'Tijdens de opstart is aansluiten gratis. Eventuele tarieven bespreken we vooraf; je krijgt nooit een verrassing.'],
  ['Voor wie is het?', 'Voor makelaarskantoren met woningen, nieuwbouw, huur of bedrijfsruimte in Groningen, Friesland en Drenthe. Wel of niet NVM maakt niet uit; NVM-kantoren krijgen wel een eigen label.'],
  ['Moet ik mijn software koppelen?', 'Nee. Je kunt woningen ook zelf invoeren. Een koppeling is handig bij veel aanbod: je ziet na elke aanroep wat is verwerkt en wat is afgewezen.'],
  ['Wat gebeurt er met de leads?', 'Elk contactverzoek en elke bezichtiging komt in je beheer en in je inbox, met de woning erbij. Gesprekken met zoekers lopen via het berichtenoverzicht.'],
  ['Is het veilig?', 'Je logt altijd in met een tweede stap. Medewerkers zien alleen de gegevens van het eigen kantoor, en een medewerker met alleen leesrechten kan niets wijzigen.'],
];

export default function Aanmelden() {
  return (
    <div>
      <section className="bg-brand-soft">
        <div className="container-x py-14">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent">Voor makelaars in het noorden</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-extrabold tracking-tight">Meld je kantoor aan bij NNvastgoed</h1>
          <p className="mt-4 max-w-2xl text-lg text-muted">Laat je aanbod zien aan iedereen die in Groningen, Friesland en Drenthe zoekt. In vier stappen sta je online.</p>
          <div className="mt-7 flex flex-wrap gap-3"><a href="#formulier" className="btn-accent">Nu aanmelden</a><Link href="/login" className="btn-ghost bg-white"><LogIn size={16} aria-hidden /> Al aangesloten? Inloggen</Link></div>
        </div>
      </section>

      <section className="container-x py-14" aria-labelledby="stappen">
        <h2 id="stappen" className="text-2xl font-extrabold tracking-tight">Zo werkt aanmelden</h2>
        <ol className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ Icon, t, d }, i) => (
            <li key={t} className="card relative p-6">
              <span className="absolute -top-3 left-5 inline-flex h-7 w-7 items-center justify-center rounded-full bg-accent text-sm font-extrabold text-white">{i + 1}</span>
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand"><Icon size={22} aria-hidden /></span>
              <h3 className="mt-4 font-bold">{t}</h3><p className="mt-1.5 text-sm text-muted">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-x grid gap-12 pb-16 lg:grid-cols-[1fr_1.1fr]" aria-labelledby="formulier">
        <div>
          <h2 id="formulier" className="text-2xl font-extrabold tracking-tight">Aanmelden</h2>
          <p className="mt-2 text-muted">Na je aanmelding nemen we contact met je op om je kantoor aan te sluiten.</p>
          <ul className="mt-6 space-y-3 text-sm">
            {['Gratis tijdens de opstart', 'Leads direct in je beheer en inbox', 'Zoekers plannen zelf een bezichtiging', 'Koppeling met je kantoorsoftware mogelijk', 'Alleen aanbod in Groningen, Friesland en Drenthe'].map((x) => <li key={x} className="flex gap-2"><CheckCircle2 size={18} className="shrink-0 text-green-600" aria-hidden />{x}</li>)}
          </ul>
          <div className="mt-8 rounded-2xl bg-sand p-5 text-sm"><p className="flex items-center gap-2 font-bold"><PartyPopper size={17} aria-hidden /> Al aangesloten?</p><p className="mt-1 text-muted">Log in met je account en authenticator-app om je woningen, bezichtigingen en leads te beheren.</p><Link href="/login" className="btn-primary mt-3">Inloggen voor makelaars</Link></div>
        </div>
        <div className="card p-6 sm:p-8"><BrokerRequestForm /></div>
      </section>

      <section className="container-x pb-16" aria-labelledby="faq">
        <h2 id="faq" className="text-2xl font-extrabold tracking-tight">Veelgestelde vragen</h2>
        <div className="mt-5 max-w-3xl divide-y divide-line rounded-2xl border border-line">
          {FAQ.map(([q, a]) => <details key={q} className="group px-5 py-4"><summary className="focus-ring cursor-pointer list-none font-semibold marker:hidden">{q}</summary><p className="mt-2 text-sm text-muted">{a}</p></details>)}
        </div>
        <p className="mt-6 text-sm text-muted">Techniek en koppelen? Lees <Link href="/voor-makelaars" className="font-semibold text-brand underline">hoe de koppeling werkt</Link>.</p>
      </section>
    </div>
  );
}
