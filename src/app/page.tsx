import Link from 'next/link';
import { ArrowRight, BellRing, MapPin, Network, ShieldCheck } from 'lucide-react';
import { latestListings, provinceCounts } from '@/lib/data';
import { PROVINCES } from '@/lib/types';
import { PROVINCE_INFO } from '@/lib/regions';
import { ListingCard } from '@/components/listing-card';

export const revalidate = 300;

export default async function Home() {
  const [counts, latest] = await Promise.all([provinceCounts(), latestListings(6)]);
  const total = PROVINCES.reduce((n, p) => n + counts[p], 0);
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-dark via-brand to-[#1c6a93] text-white">
        <svg aria-hidden className="absolute inset-x-0 bottom-0 h-24 w-full text-white" viewBox="0 0 1440 96" preserveAspectRatio="none"><path fill="currentColor" d="M0 64c120-34 240-34 360 0s240 34 360 0 240-34 360 0 240 34 360 0v32H0z" /></svg>
        <div className="container-x relative pb-32 pt-16 sm:pt-24">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/75">Noord Nederlands Vastgoed</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Vind je huis in het noorden</h1>
          <p className="mt-4 max-w-xl text-lg text-white/85">Het aanbod van makelaars in Groningen, Friesland en Drenthe, op één plek. {total > 0 && <>Nu {total} woningen te koop.</>}</p>

          <form action="/koop" method="get" role="search" aria-label="Woningen zoeken" className="mt-8 grid max-w-4xl gap-3 rounded-2xl bg-white p-3 text-ink shadow-2xl sm:grid-cols-[1fr_11rem_11rem_auto]">
            <div>
              <label htmlFor="h-q" className="sr-only">Plaats, postcode of straat</label>
              <input id="h-q" name="q" placeholder="Plaats, postcode of straat" className="field !border-0 !bg-sand" autoComplete="off" />
            </div>
            <div>
              <label htmlFor="h-p" className="sr-only">Provincie</label>
              <select id="h-p" name="provincie" className="field !border-0 !bg-sand"><option value="">Heel het noorden</option>{PROVINCES.map((p) => <option key={p} value={p}>{PROVINCE_INFO[p].name}</option>)}</select>
            </div>
            <div>
              <label htmlFor="h-t" className="sr-only">Maximale prijs</label>
              <select id="h-t" name="tot" className="field !border-0 !bg-sand"><option value="">Geen maximum</option>{[200_000, 300_000, 400_000, 500_000, 750_000].map((n) => <option key={n} value={n}>Tot € {n.toLocaleString('nl-NL')}</option>)}</select>
            </div>
            <button className="btn-accent !px-6">Zoeken</button>
          </form>
        </div>
      </section>

      <section className="container-x -mt-8 grid gap-4 sm:grid-cols-3" aria-label="Kies een provincie">
        {PROVINCES.map((p) => (
          <Link key={p} href={`/${p}`} className="card focus-ring group relative overflow-hidden p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
            <span aria-hidden className="absolute -right-6 -top-6 h-28 w-28 rounded-full opacity-15" style={{ background: PROVINCE_INFO[p].hue }} />
            <MapPin size={20} aria-hidden style={{ color: PROVINCE_INFO[p].hue }} />
            <h2 className="mt-3 text-xl font-extrabold">{PROVINCE_INFO[p].name}</h2>
            <p className="mt-1 text-sm text-muted">{PROVINCE_INFO[p].tagline}</p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">{counts[p]} woningen <ArrowRight size={15} aria-hidden className="transition group-hover:translate-x-1" /></p>
          </Link>
        ))}
      </section>

      <section className="container-x mt-16" aria-labelledby="nieuw">
        <div className="flex items-end justify-between gap-4">
          <h2 id="nieuw" className="text-2xl font-extrabold tracking-tight">Nieuw in het aanbod</h2>
          <Link href="/koop" className="text-sm font-semibold text-brand hover:underline">Alle woningen →</Link>
        </div>
        {latest.length ? (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{latest.map((l, i) => <ListingCard key={l.id} l={l} priority={i < 3} />)}</div>
        ) : (
          <p className="mt-6 rounded-2xl bg-sand p-8 text-center text-muted">Er staan nog geen woningen online. Kom snel terug.</p>
        )}
      </section>

      <section className="container-x mt-20 grid gap-6 sm:grid-cols-3" aria-label="Waarom NNvastgoed">
        {[
          { Icon: MapPin, t: 'Alleen het noorden', d: 'Geen ruis uit de rest van het land. Elke woning ligt in Groningen, Friesland of Drenthe.' },
          { Icon: Network, t: 'Rechtstreeks van de makelaar', d: 'Kantoren koppelen hun eigen systeem. Wijzigingen en prijsaanpassingen staan er direct.' },
          { Icon: BellRing, t: 'Mis niets', d: 'Sla je zoekopdracht op en ontvang een mail zodra er iets nieuws binnenkomt dat past.' },
        ].map(({ Icon, t, d }) => (
          <div key={t}><span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand"><Icon size={22} aria-hidden /></span><h3 className="mt-4 font-bold">{t}</h3><p className="mt-1.5 text-sm text-muted">{d}</p></div>
        ))}
      </section>

      <section className="container-x mt-20">
        <div className="flex flex-col items-start gap-6 rounded-3xl bg-brand-soft p-8 sm:flex-row sm:items-center sm:justify-between sm:p-10">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand"><ShieldCheck size={16} aria-hidden /> Voor makelaars in het noorden</p>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight">Laat je aanbod hier zien</h2>
            <p className="mt-2 max-w-xl text-muted">Koppel je kantoorsoftware of beheer je woningen zelf. Je krijgt leads rechtstreeks in je beheer en in je inbox.</p>
          </div>
          <Link href="/voor-makelaars" className="btn-primary shrink-0">Aansluiten</Link>
        </div>
      </section>
    </>
  );
}
