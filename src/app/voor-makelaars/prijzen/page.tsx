import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { CUSTOM_CAMPAIGNS, OBJECT_TYPES, OFFICE_PRICES, PRICE_GROUPS, euro } from '@/lib/pricing';

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
      <p className="mt-3 max-w-2xl text-lg text-muted">Aansluiten is gratis. Hieronder zie je wat extra zichtbaarheid kost. Alle bedragen zijn exclusief btw en gelden per objectplaatsing.</p>

      <section className="mt-12" aria-labelledby="object">
        <h2 id="object" className="text-2xl font-extrabold tracking-tight">Object</h2>
        <p className="mt-1 text-sm text-muted">Voor bedrijfsruimte, agrarisch aanbod en verzamelgebouwen.</p>
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
          {CUSTOM_CAMPAIGNS.map((c) => <div key={c.name} className="card p-6"><p className="font-bold">{c.name}</p><p className="mt-2 text-sm text-muted">Vanaf</p><p className="text-3xl font-extrabold tabular-nums text-brand">{euro(c.from)}</p></div>)}
        </div>
        <p className="mt-4 max-w-2xl text-sm text-muted">De prijs van een campagne op maat hangt af van je aanvraag. Neem contact op voor een voorstel; dit product bestel je niet zelf.</p>
      </section>

      <div className="mt-14 flex flex-col items-start gap-4 rounded-3xl bg-brand-soft p-8 sm:flex-row sm:items-center sm:justify-between">
        <div><h2 className="text-xl font-extrabold">Klaar om aan te sluiten?</h2><p className="mt-1 text-muted">Meld je kantoor aan, wij nemen binnen twee werkdagen contact op.</p></div>
        <div className="flex flex-wrap gap-3"><Link href="/voor-makelaars/aanmelden" className="btn-primary">Aanmelden</Link><Link href="/contact" className="btn-ghost bg-white">Vraag een voorstel</Link></div>
      </div>
      <p className="mt-8 text-xs text-muted">Onder voorbehoud van type- en drukfouten. Alle prijzen zijn exclusief btw en gelden per objectplaatsing.</p>
    </div>
  );
}
