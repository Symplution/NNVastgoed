import Link from 'next/link';
import { ArrowRight, BarChart3, BellRing, Briefcase, Building2, CalendarCheck, KeyRound, MapPin, Network, Palmtree, ShieldCheck } from 'lucide-react';
import { latestListings, provinceCounts, topperListings } from '@/lib/data';
import { ARTICLES } from '@/lib/articles';
import { ArticleTile } from '@/components/article-tile';
import { POPULAR_PLACES, placeHref } from '@/lib/places';
import { PROVINCES } from '@/lib/types';
import { PROVINCE_INFO } from '@/lib/regions';
import { ProvinceFlag } from '@/components/province-flag';
import { HeroWizard } from '@/components/hero-wizard';
import { formatPrice } from '@/lib/format';
import { ListingCard } from '@/components/listing-card';

export const revalidate = 300;

export default async function Home() {
  const [counts, latest, recreation, toppers] = await Promise.all([provinceCounts(), latestListings(4), latestListings(4, undefined, 'recreatie'), topperListings(4)]);
  const arches = (toppers.length >= 3 ? toppers : [...toppers, ...latest.filter((l) => !toppers.some((t) => t.id === l.id))]).filter((l) => l.photos[0]).slice(0, 3);
  return (
    <>
      <section className="relative overflow-hidden bg-cream">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-brand-soft" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 left-[-6rem] h-[22rem] w-[22rem] rounded-full bg-accent-soft/70" />
        <div className="container-x relative grid items-center gap-10 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-brand shadow-sm"><span aria-hidden className="h-2 w-2 rounded-full bg-accent" /> Groningen · Friesland · Drenthe</p>
            <h1 className="mt-4 text-5xl font-bold leading-[1.05] sm:text-6xl">Vind de plek die bij jou past in het <span className="italic text-accent">noorden</span></h1>
            <p className="mt-4 max-w-xl text-lg text-muted">Stel in wat je zoekt en zie meteen wat er is. Rechtstreeks van makelaars in het noorden.</p>
            <HeroWizard />
          </div>
          <div className="hidden lg:block" aria-label="Uitgelichte woningen">
            <ul className="grid grid-cols-3 items-end gap-4">
              {arches.map((l, i) => (
                <li key={l.id} className={i === 1 ? 'mb-10' : i === 2 ? 'mb-24' : ''}>
                  <Link href={`/woning/${l.slug}`} className={`focus-ring group relative block overflow-hidden rounded-t-[999px] rounded-b-3xl bg-sand shadow-card ${i === 1 ? 'h-[26rem]' : i === 2 ? 'h-[18rem]' : 'h-[22rem]'}`} aria-label={`${l.street} ${l.houseNumber}, ${l.city}`}>
                    {l.photos[0] && /* eslint-disable-next-line @next/next/no-img-element */ <img src={l.photos[0].url} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
                    <span className="absolute inset-x-2 bottom-2 rounded-2xl bg-white/95 px-3 py-2 text-xs shadow"><strong className="block text-sm text-brand">{formatPrice(l)}</strong><span className="text-muted">{l.city}</span></span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="container-x relative z-10 mt-4" aria-label="Snel naar">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {[
            { href: '/bedrijfsruimte', Icon: Building2, t: 'Zoek een bedrijfsruimte', d: 'Kantoor, hal, winkel of horeca' },
            { href: '/makelaars?nvm=1', Icon: ShieldCheck, t: 'Zoek een NVM-makelaar', d: 'Aangesloten kantoren in het noorden' },
            { href: '/huur', Icon: KeyRound, t: 'Zoek een huurwoning', d: 'Met de huur per maand' },
            { href: '/recreatie', Icon: Palmtree, t: 'Zoek een recreatiewoning', d: 'Chalet, bungalow of vakantiehuis' },
            { href: '/woningmarkt', Icon: BarChart3, t: 'Alles over de woningmarkt', d: 'Prijzen, kosten en tips' },
          ].map(({ href, Icon, t, d }) => (
            <li key={href}>
              <Link href={href} className="card focus-ring flex h-full flex-col items-center gap-3 px-4 py-6 text-center lg:px-2 transition hover:-translate-y-0.5 hover:shadow-lg">
                <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-dark"><Icon size={24} aria-hidden /></span>
                <span><span className="block whitespace-nowrap text-base font-bold leading-snug lg:text-[13px]">{t}</span><span className="mt-1 block text-sm text-muted">{d}</span></span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="container-x mt-8 grid gap-4 sm:grid-cols-3" aria-label="Kies een provincie">
        {PROVINCES.map((p) => (
          <Link key={p} href={`/${p}`} className="card focus-ring group relative overflow-hidden p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
            <ProvinceFlag province={p} className="absolute -right-6 -top-6 h-28 w-28 rounded-full" />
            <MapPin size={20} aria-hidden style={{ color: PROVINCE_INFO[p].hue }} />
            <h2 className="mt-3 text-xl font-extrabold">{PROVINCE_INFO[p].name}</h2>
            <p className="mt-1 text-sm text-muted">{PROVINCE_INFO[p].tagline}</p>
            <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand">{counts[p]} woningen <ArrowRight size={15} aria-hidden className="transition group-hover:translate-x-1" /></p>
          </Link>
        ))}
      </section>

      {toppers.length > 0 && (
        <section className="container-x mt-16" aria-labelledby="topper">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="topper" className="text-2xl font-extrabold tracking-tight">Topper van de maand</h2>
              <p className="mt-1 text-muted">Woningen die makelaars deze maand extra uitlichten.</p>
            </div>
            <Link href="/koop" className="shrink-0 text-sm font-semibold text-brand hover:underline">Alle woningen →</Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{toppers.map((l) => <ListingCard key={l.id} l={l} />)}</div>
        </section>
      )}

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

      {recreation.length > 0 && (
        <section className="container-x mt-16" aria-labelledby="recreatie">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 id="recreatie" className="text-2xl font-extrabold tracking-tight">Recreatiewoningen</h2>
              <p className="mt-1 text-muted">Een chalet aan de Waddenzee, een bungalow bij de Friese meren of een vakantiehuis in de Drentse bossen.</p>
            </div>
            <Link href="/recreatie" className="shrink-0 text-sm font-semibold text-brand hover:underline">Alle recreatiewoningen →</Link>
          </div>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{recreation.map((l) => <ListingCard key={l.id} l={l} />)}</div>
        </section>
      )}

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
          <div key={t} className="mx-auto flex max-w-sm flex-col items-center text-center"><span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-soft text-brand"><Icon size={24} aria-hidden /></span><h3 className="mt-4 font-bold">{t}</h3><p className="mt-1.5 text-sm text-muted">{d}</p></div>
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
