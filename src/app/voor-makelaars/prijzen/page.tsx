import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Check, Receipt } from 'lucide-react';
import { BESPOKE, CUSTOM_CAMPAIGNS, LISTING_FEE, OBJECT_TYPES, OFFICE_PRICES, PRICE_GROUPS, euro } from '@/lib/pricing';

// Bewust niet in de sitemap, de footer of de zoekresultaten: alleen bereikbaar via "Bekijk prijzen" bij de pakketten.
export const metadata: Metadata = { title: 'Prijzen voor makelaars', robots: { index: false, follow: false } };

const th = 'px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted';
const td = 'px-4 py-3 text-sm';

export default function Prijzen() {
  return (
    <div className="container-x py-12">
      <Link href="/voor-makelaars" className="focus-ring inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand hover:underline"><ArrowLeft size={15} aria-hidden /> Terug naar voor makelaars</Link>
      <p className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-accent">Tarieven 2026</p>
      <h1 className="mt-2 text-4xl font-extrabold tracking-tight">Prijzen voor makelaars</h1>
      <p className="mt-3 max-w-2xl text-lg text-muted">Aansluiten is gratis. Je betaalt eenmalig per geplaatste woning, en kiest zelf of je extra zichtbaarheid wilt.</p>
      <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent-soft px-4 py-1.5 text-sm font-bold text-accent-dark"><Receipt size={16} aria-hidden /> Alle prijzen op deze pagina zijn exclusief btw</p>

      <section className="mt-12 grid gap-6 lg:grid-cols-2" aria-label="Woning plaatsen en maatwerk">
        <div className="card flex flex-col p-7">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Per woning</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{LISTING_FEE.name}</h2>
          <p className="mt-4 text-4xl font-extrabold tabular-nums text-brand">{euro(LISTING_FEE.amount)} <span className="text-base font-semibold text-muted">eenmalig, excl. btw</span></p>
          <p className="mt-3 text-sm text-muted">{LISTING_FEE.note} Dit geldt voor koop, huur en nieuwbouw.</p>
          <ul className="mt-5 space-y-2 text-sm">{['Foto’s, kaart en volledige omschrijving', 'Bezichtigingen plannen zonder bellen', 'Leads en berichten direct in je beheer', 'Zichtbaar voor iedereen die in het noorden zoekt'].map((x) => <li key={x} className="flex gap-2"><Check size={17} className="mt-0.5 shrink-0 text-green-600" aria-hidden />{x}</li>)}</ul>
        </div>
        <div className="card flex flex-col border-2 border-accent/40 p-7">
          <p className="text-sm font-semibold uppercase tracking-wider text-accent">Website en CRM</p>
          <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{BESPOKE.name}</h2>
          <p className="mt-4 text-4xl font-extrabold tabular-nums text-brand"><span className="text-base font-semibold text-muted">vanaf</span> {euro(BESPOKE.from)} <span className="text-base font-semibold text-muted">eenmalig, excl. btw</span></p>
          <p className="mt-3 text-sm text-muted">{BESPOKE.note}</p>
          <ul className="mt-5 space-y-2 text-sm">{BESPOKE.includes.map((x) => <li key={x} className="flex gap-2"><Check size={17} className="mt-0.5 shrink-0 text-green-600" aria-hidden />{x}</li>)}</ul>
          <Link href="/contact" className="btn-accent mt-6 self-start">Vraag een voorstel</Link>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="object">
        <h2 id="object" className="text-2xl font-extrabold tracking-tight">Object</h2>
        <p className="mt-1 text-sm text-muted">Voor bedrijfsruimte, agrarisch aanbod en verzamelgebouwen. Prijzen per object, excl. btw.</p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-white">
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
      </section>

      <section className="mt-12" aria-labelledby="kantoor">
        <h2 id="kantoor" className="text-2xl font-extrabold tracking-tight">Kantoor</h2>
        <p className="mt-1 text-sm text-muted">Prijzen excl. btw.</p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[28rem] border-collapse">
            <thead><tr className="border-b border-line bg-sand/60"><th className={th}>Product</th><th className={th}>Looptijd</th><th className={`${th} text-right`}>Prijs</th></tr></thead>
            <tbody>{OFFICE_PRICES.map((r) => <tr key={r.name} className="border-t border-line/70 first:border-0"><td className={td}><span className="font-semibold">{r.name}</span><span className="block text-xs text-muted">{r.note}</span></td><td className={`${td} text-muted`}>{r.period}</td><td className={`${td} text-right font-semibold tabular-nums`}>{euro(r.price)}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className="mt-12" aria-labelledby="maat">
        <h2 id="maat" className="text-2xl font-extrabold tracking-tight">Campagne op maat</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          {CUSTOM_CAMPAIGNS.map((c) => <div key={c.name} className="card p-6"><p className="font-bold">{c.name}</p><p className="mt-2 text-sm text-muted">Vanaf, excl. btw</p><p className="text-3xl font-extrabold tabular-nums text-brand">{euro(c.from)}</p></div>)}
        </div>
        <p className="mt-4 max-w-2xl text-sm text-muted">De prijs van een campagne op maat hangt af van je aanvraag. Neem contact op voor een voorstel; dit product bestel je niet zelf.</p>
      </section>

      <div className="mt-14 flex flex-col items-start gap-4 rounded-3xl bg-brand-soft p-8 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-xl font-extrabold">Klaar om aan te sluiten?</h2><p className="mt-1 text-muted">Meld je kantoor aan, wij nemen binnen twee werkdagen contact op.</p></div>
        <div className="flex flex-wrap gap-3"><Link href="/voor-makelaars/aanmelden" className="btn-primary">Aanmelden</Link><Link href="/contact" className="btn-ghost bg-white">Vraag een voorstel</Link></div>
      </div>
      <p className="mt-8 text-xs text-muted">Onder voorbehoud van type- en drukfouten. Alle prijzen zijn exclusief btw. Objectprijzen gelden per objectplaatsing; woning plaatsen is een eenmalig bedrag per woning.</p>
    </div>
  );
}
