import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Eye, Gift, Home, Receipt, Sparkles } from 'lucide-react';
import { LISTING_FEE, PROMO_FEE, REGISTRATION, euro } from '@/lib/pricing';

// Bewust niet in de sitemap, de footer of de zoekresultaten: alleen bereikbaar via "Bekijk prijzen" bij de makelaarspagina.
export const metadata: Metadata = { title: 'Prijzen voor makelaars', description: 'Registreren is gratis. Een woning plaatsen kost € 250 en promoten in het aanbod van de maand € 50 (excl. btw).', robots: { index: false, follow: false } };

function Bullets({ items }: { items: string[] }) {
  return <ul className="mt-6 space-y-2.5 text-[15px]">{items.map((x) => <li key={x} className="flex gap-2.5"><Check size={18} className="mt-0.5 shrink-0 text-green-600" aria-hidden />{x}</li>)}</ul>;
}

export default function Prijzen() {
  const total = LISTING_FEE.amount + PROMO_FEE.amount;
  return (
    <div>
      <section className="bg-gradient-to-br from-brand-dark via-brand to-[#1c6a93] text-white">
        <div className="container-x py-14">
          <Link href="/voor-makelaars" className="focus-ring inline-flex items-center gap-1.5 rounded text-sm font-semibold text-white/80 hover:text-white hover:underline"><ArrowLeft size={15} aria-hidden /> Terug naar voor makelaars</Link>
          <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-white/70">Prijslijst 2026</p>
          <h1 className="mt-2 max-w-3xl text-4xl font-extrabold tracking-tight sm:text-5xl">Simpel en eerlijk: je betaalt alleen voor wat je plaatst</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/85">Geen abonnement en geen opstartkosten. Registreren is gratis, en per woning betaal je eenmalig.</p>
          <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-bold"><Receipt size={16} aria-hidden /> Alle prijzen zijn exclusief btw</p>
        </div>
      </section>

      <div className="container-x -mt-10 pb-16">
        <section aria-label="Prijzen" className="grid gap-6 lg:grid-cols-3">
          <article className="card flex flex-col p-7">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-700"><Gift size={24} aria-hidden /></span>
            <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-muted">Stap 1</p>
            <h2 className="text-2xl font-extrabold tracking-tight">{REGISTRATION.name}</h2>
            <p className="mt-4 text-5xl font-extrabold tracking-tight text-green-700">Gratis</p>
            <p className="mt-1 text-sm text-muted">{REGISTRATION.note}</p>
            <Bullets items={['Je kantoor en collega’s in het beheer', 'Je eigen kantoorprofiel met logo', 'Koppeling met je CRM, zoals Realworks', 'Leads en berichten in één overzicht']} />
            <div className="mt-auto pt-8"><Link href="/voor-makelaars/aanmelden" className="btn-primary w-full !py-3 text-base">Gratis registreren <ArrowRight size={18} aria-hidden /></Link></div>
          </article>

          <article className="card flex flex-col p-7">
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand"><Home size={24} aria-hidden /></span>
            <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-muted">Stap 2</p>
            <h2 className="text-2xl font-extrabold tracking-tight">{LISTING_FEE.name}</h2>
            <p className="mt-4 text-5xl font-extrabold tracking-tight text-brand">{euro(LISTING_FEE.amount)}</p>
            <p className="mt-1 text-sm text-muted">per woning · eenmalig · excl. btw</p>
            <Bullets items={['Foto’s, video, plattegrond en 360°-foto’s', 'Bezichtigingen laten plannen zonder bellen', 'Brochure (pdf) met je logo voor bezoekers', 'Leads direct in je beheer en inbox']} />
            <p className="mt-6 text-xs text-muted">{LISTING_FEE.note}</p>
          </article>

          <article className="relative flex flex-col rounded-2xl border-2 border-accent bg-white p-7 shadow-xl shadow-accent/10">
            <span className="absolute -top-3 left-6 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-bold uppercase tracking-wide text-white"><Sparkles size={13} aria-hidden /> Populair</span>
            <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent-dark"><Eye size={24} aria-hidden /></span>
            <p className="mt-5 text-sm font-semibold uppercase tracking-wider text-muted">Extra</p>
            <h2 className="text-2xl font-extrabold tracking-tight">Promoten in het {PROMO_FEE.name.toLowerCase()}</h2>
            <p className="mt-4 text-5xl font-extrabold tracking-tight text-accent-dark">{euro(PROMO_FEE.amount)}</p>
            <p className="mt-1 text-sm text-muted">per woning · excl. btw</p>
            <p className="mt-4 rounded-xl bg-accent-soft px-4 py-3 text-[15px] font-semibold text-accent-dark">Tot {PROMO_FEE.boost}× vaker bekeken</p>
            <Bullets items={['Uitgelicht op de homepage', 'Opvallend label op je woning', 'Meer bezichtigingen en meer leads']} />
            <p className="mt-6 text-xs text-muted">{PROMO_FEE.note}</p>
          </article>
        </section>

        <section className="mt-10 rounded-3xl bg-brand-soft p-8" aria-labelledby="voorbeeld">
          <h2 id="voorbeeld" className="text-xl font-extrabold">Een voorbeeld</h2>
          <p className="mt-1 text-muted">Je plaatst één woning en promoot hem in het aanbod van de maand.</p>
          <dl className="mt-5 max-w-md space-y-2 text-[15px]">
            <div className="flex justify-between"><dt>Registreren</dt><dd className="font-semibold text-green-700">Gratis</dd></div>
            <div className="flex justify-between"><dt>Woning plaatsen</dt><dd className="font-semibold">{euro(LISTING_FEE.amount)}</dd></div>
            <div className="flex justify-between"><dt>Aanbod van de maand</dt><dd className="font-semibold">{euro(PROMO_FEE.amount)}</dd></div>
            <div className="flex justify-between border-t border-brand/20 pt-2 text-lg font-extrabold"><dt>Totaal (excl. btw)</dt><dd className="text-brand">{euro(total)}</dd></div>
          </dl>
        </section>

        <div className="mt-12 flex flex-col items-start gap-4 rounded-3xl bg-gradient-to-br from-brand-dark to-brand p-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-2xl font-extrabold">Registreer jouw makelaardij</h2><p className="mt-1 text-white/85">Registreren is gratis. Wij nemen binnen twee werkdagen contact met je op.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/voor-makelaars/aanmelden" className="btn-accent">Gratis registreren</Link><Link href="/contact" className="btn-ghost !border-white/40 !bg-transparent !text-white hover:!bg-white/10">Vraag een voorstel</Link></div>
        </div>
        <p className="mt-8 text-xs text-muted">Onder voorbehoud van type- en drukfouten. Alle prijzen zijn exclusief btw. Woning plaatsen is een eenmalig bedrag per woning; de promotie in het aanbod van de maand geldt per woning.</p>
      </div>
    </div>
  );
}
