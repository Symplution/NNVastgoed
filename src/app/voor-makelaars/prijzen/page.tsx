import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Eye, Gift, Home, Receipt, Sparkles } from 'lucide-react';
import { BESPOKE, CUSTOM_CAMPAIGNS, LISTING_FEE, OBJECT_TYPES, OFFICE_PRICES, PRICE_GROUPS, PROMO_FEE, REGISTRATION, euro } from '@/lib/pricing';

// Bewust niet in de sitemap, de footer of de zoekresultaten: alleen bereikbaar via "Bekijk prijzen" bij de makelaarspagina.
export const metadata: Metadata = { title: 'Prijzen voor makelaars', description: 'Registreren is gratis. Een woning plaatsen kost € 250 en promoten in het aanbod van de maand € 50 (excl. btw).', robots: { index: false, follow: false } };

const th = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted';
const td = 'px-4 py-3 text-sm';

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
            <Link href="/voor-makelaars/aanmelden" className="btn-primary mt-auto self-start pt-0 !mt-8">Gratis registreren <ArrowRight size={16} aria-hidden /></Link>
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

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_auto] lg:items-center card p-7" aria-labelledby="maatwerk">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-accent">Website en CRM</p>
            <h2 id="maatwerk" className="text-2xl font-extrabold tracking-tight">{BESPOKE.name}</h2>
            <ul className="mt-3 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">{BESPOKE.includes.map((x) => <li key={x} className="flex gap-2"><Check size={16} className="mt-0.5 shrink-0 text-green-600" aria-hidden />{x}</li>)}</ul>
          </div>
          <div className="text-left lg:text-right">
            <p className="text-sm text-muted">vanaf</p>
            <p className="text-4xl font-extrabold tabular-nums text-brand">{euro(BESPOKE.from)}</p>
            <p className="text-xs text-muted">eenmalig, excl. btw</p>
            <Link href="/contact" className="btn-accent mt-3">Vraag een voorstel</Link>
          </div>
        </section>

        <details className="group mt-12 rounded-2xl border border-line">
          <summary className="focus-ring flex cursor-pointer list-none items-center justify-between rounded-2xl px-6 py-4 font-bold marker:hidden">Overige opties voor bedrijfsruimte en kantoren<span aria-hidden className="text-muted transition group-open:rotate-180">⌄</span></summary>
          <div className="space-y-8 px-6 pb-6">
            <div className="overflow-x-auto rounded-2xl border border-line bg-white">
              <table className="w-full min-w-[44rem] border-collapse">
                <thead><tr className="border-b border-line bg-sand/60"><th className={th}>Product</th><th className={th}>Looptijd</th>{OBJECT_TYPES.map((t) => <th key={t} className={`${th} text-right`}>{t}</th>)}</tr></thead>
                {PRICE_GROUPS.map((g) => (
                  <tbody key={g.title} className="border-b border-line last:border-0">
                    <tr><th colSpan={2 + OBJECT_TYPES.length} className="bg-brand-soft/50 px-4 py-2 text-left text-xs font-bold uppercase tracking-wider text-brand">{g.title}</th></tr>
                    {g.rows.map((r) => (
                      <tr key={`${r.name}${r.period}`} className="border-t border-line/70">
                        <td className={td}><span className="font-semibold">{r.name}</span>{r.note && <span className="block text-xs text-muted">{r.note}</span>}</td>
                        <td className={`${td} text-muted`}>{r.period}</td>
                        {r.prices.map((p, i) => <td key={i} className={`${td} text-right tabular-nums`}>{p === null ? <span className="text-muted" aria-label="niet beschikbaar">–</span> : <span className="font-semibold">{euro(p)}</span>}</td>)}
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-line bg-white">
              <table className="w-full min-w-[28rem] border-collapse">
                <thead><tr className="border-b border-line bg-sand/60"><th className={th}>Kantoor</th><th className={th}>Looptijd</th><th className={`${th} text-right`}>Prijs</th></tr></thead>
                <tbody>{OFFICE_PRICES.map((r) => <tr key={r.name} className="border-t border-line/70 first:border-0"><td className={td}><span className="font-semibold">{r.name}</span><span className="block text-xs text-muted">{r.note}</span></td><td className={`${td} text-muted`}>{r.period}</td><td className={`${td} text-right font-semibold tabular-nums`}>{euro(r.price)}</td></tr>)}</tbody>
              </table>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">{CUSTOM_CAMPAIGNS.map((c) => <div key={c.name} className="card p-5"><p className="font-bold">{c.name}</p><p className="mt-1 text-sm text-muted">Vanaf, excl. btw</p><p className="text-2xl font-extrabold tabular-nums text-brand">{euro(c.from)}</p></div>)}</div>
          </div>
        </details>

        <div className="mt-12 flex flex-col items-start gap-4 rounded-3xl bg-gradient-to-br from-brand-dark to-brand p-8 text-white sm:flex-row sm:items-center sm:justify-between">
          <div><h2 className="text-2xl font-extrabold">Klaar om te beginnen?</h2><p className="mt-1 text-white/85">Registreren is gratis. Wij nemen binnen twee werkdagen contact met je op.</p></div>
          <div className="flex flex-wrap gap-3"><Link href="/voor-makelaars/aanmelden" className="btn-accent">Gratis registreren</Link><Link href="/contact" className="btn-ghost !border-white/40 !bg-transparent !text-white hover:!bg-white/10">Vraag een voorstel</Link></div>
        </div>
        <p className="mt-8 text-xs text-muted">Onder voorbehoud van type- en drukfouten. Alle prijzen zijn exclusief btw. Woning plaatsen is een eenmalig bedrag per woning; de promotie in het aanbod van de maand geldt per woning.</p>
      </div>
    </div>
  );
}
