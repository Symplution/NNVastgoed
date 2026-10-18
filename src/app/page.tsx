import Link from 'next/link';
import { ArrowRight, BarChart3, BellRing, Briefcase, Building2, CalendarCheck, KeyRound, MapPin, Network, ShieldCheck } from 'lucide-react';
import { latestListings, provinceCounts } from '@/lib/data';
import { ARTICLES } from '@/lib/articles';
import { ArticleTile } from '@/components/article-tile';
import { POPULAR_PLACES, placeHref } from '@/lib/places';
import { PROVINCES } from '@/lib/types';
import { PROVINCE_INFO } from '@/lib/regions';
import { HeroSearch } from '@/components/hero-search';
import { HeroIllustration } from '@/components/hero-illustration';
import { ListingCard } from '@/components/listing-card';

export const revalidate = 300;

export default async function Home() {
  const [counts, latest] = await Promise.all([provinceCounts(), latestListings(4)]);
  const total = PROVINCES.reduce((n, p) => n + counts[p], 0);
  return (
    <>
      <section className="relative overflow-hidden bg-gradient-to-b from-[#d9f0fb] to-[#eaf8fe] text-brand-dark">
        <HeroIllustration className="pointer-events-none absolute inset-x-0 bottom-0 hidden h-[21rem] w-full lg:block" />
        <div className="container-x relative z-10 pb-24 pt-16 sm:pt-24 lg:pb-[22rem]">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-accent-dark">Noord Nederlands Vastgoed</p>
          <h1 className="mt-3 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">Vind je huis in het noorden</h1>
          <p className="mt-4 max-w-xl text-lg text-ink/75">Het aanbod van makelaars in Groningen, Friesland en Drenthe, op één plek. {total > 0 && <>Nu {total} koopwoningen, en ook huur, nieuwbouw en bedrijfsruimte.</>}</p>

          <HeroSearch />
        </div>
      </section>

      <section className="container-x relative z-10 mt-8" aria-label="Snel naar">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: '/bedrijfsruimte', Icon: Building2, t: 'Zoek een bedrijfsruimte', d: 'Kantoor, hal, winkel of horeca' },
            { href: '/makelaars?nvm=1', Icon: ShieldCheck, t: 'Zoek een NVM-makelaar', d: 'Aangesloten kantoren in het noorden' },
            { href: '/huur', Icon: KeyRound, t: 'Zoek een huurwoning', d: 'Met de huur per maand' },
            { href: '/woningmarkt', Icon: BarChart3, t: 'Alles over de woningmarkt', d: 'Prijzen, kosten en tips' },
          ].map(({ href, Icon, t, d }) => (
            <li key={href}>
              <Link href={href} className="card focus-ring flex h-full items-center gap-4 p-4 transition hover:-translate-y-0.5 hover:shadow-lg">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-dark"><Icon size={24} aria-hidden /></span>
                <span><span className="block font-bold leading-snug">{t}</span><span className="block text-sm text-muted">{d}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-x mt-8 grid gap-4 sm:grid-cols-3" aria-label="Kies een provincie">
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
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{latest.map((l, i) => <ListingCard key={l.id} l={l} priority={i < 4} />)}</div>
        ) : (
          <p className="mt-6 rounded-2xl bg-sand p-8 text-center text-muted">Er staan nog geen woningen online. Kom snel terug.</p>
        )}
      </section>

      <section className="container-x mt-16" aria-labelledby="artikelen">
        <div className="flex items-end justify-between gap-4">
          <h2 id="artikelen" className="text-2xl font-extrabold tracking-tight">Verdiep je verder</h2>
          <Link href="/artikelen" className="text-sm font-semibold text-brand hover:underline">Meer artikelen →</Link>
        </div>
        <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{ARTICLES.slice(0, 4).map((a) => <ArticleTile key={a.slug} a={a} />)}</div>
      </section>

      <section className="container-x mt-20 grid gap-6 sm:grid-cols-3" aria-label="Waarom NNvastgoed">
        {[
          { Icon: MapPin, t: 'Alleen het noorden', d: 'Geen ruis uit de rest van het land. Elke woning ligt in Groningen, Friesland of Drenthe.' },
          { Icon: Network, t: 'Rechtstreeks van de makelaar', d: 'Kantoren koppelen hun eigen systeem. Wijzigingen en prijsaanpassingen staan er direct.' },
          { Icon: CalendarCheck, t: 'Plan je bezichtiging zelf', d: 'Kies online een moment dat de makelaar heeft vrijgemaakt. Meteen bevestigd, zonder bellen.' },
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
          <div className="flex shrink-0 flex-wrap gap-3"><Link href="/voor-makelaars/aanmelden" className="btn-primary">Aanmelden</Link><Link href="/login" className="btn-ghost bg-white">Inloggen</Link></div>
        </div>
      </section>

      <section className="container-x mt-16" aria-labelledby="plaatsen">
        <h2 id="plaatsen" className="text-2xl font-extrabold tracking-tight">Populaire plaatsen</h2>
        <p className="mt-1 text-muted">Steden en dorpen in Groningen, Friesland en Drenthe.</p>
        <div className="mt-6 grid gap-8 sm:grid-cols-3">
          {PROVINCES.map((p) => (
            <div key={p}>
              <h3 className="border-b border-line pb-2 text-sm font-bold uppercase tracking-wider" style={{ color: PROVINCE_INFO[p].hue }}>{PROVINCE_INFO[p].name}</h3>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[15px]">
                {[...POPULAR_PLACES[p].cities, ...POPULAR_PLACES[p].villages].map((t) => <li key={t}><Link href={placeHref(t)} className="focus-ring rounded text-brand hover:underline">{t}</Link></li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
