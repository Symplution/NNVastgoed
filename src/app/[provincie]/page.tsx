import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Filters } from '@/components/filters';
import { ListingCard } from '@/components/listing-card';
import { Pagination } from '@/components/pagination';
import { SaveSearchForm } from '@/components/save-search-form';
import { searchListings } from '@/lib/data';
import { filtersToParams, parseFilters } from '@/lib/search';
import { isProvince, PROVINCE_INFO } from '@/lib/regions';
import { PROVINCES } from '@/lib/types';

export const dynamicParams = false;
export const generateStaticParams = () => PROVINCES.map((provincie) => ({ provincie }));

type Props = { params: Promise<{ provincie: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { provincie } = await params;
  if (!isProvince(provincie)) return {};
  const info = PROVINCE_INFO[provincie];
  return { title: `Koopwoningen ${info.name}`, description: `${info.tagline}. Bekijk alle koopwoningen in ${info.name} van makelaars uit de regio.`, alternates: { canonical: `/${provincie}` } };
}

export default async function Regio({ params, searchParams }: Props) {
  const { provincie } = await params;
  if (!isProvince(provincie)) notFound();
  const info = PROVINCE_INFO[provincie];
  const f = { ...parseFilters(await searchParams), province: provincie };
  const { items, total } = await searchListings(f);
  const qs = filtersToParams({ ...f, page: 1, sort: 'nieuw' }).toString();
  return (
    <>
      <section className="text-white" style={{ background: `linear-gradient(135deg, ${info.hue}, #14212b)` }}>
        <div className="container-x py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-white/70">Koopwoningen</p>
          <h1 className="mt-2 text-4xl font-extrabold tracking-tight">{info.name}</h1>
          <p className="mt-3 max-w-2xl text-white/85">{info.intro}</p>
          <p className="mt-5 flex flex-wrap gap-2" aria-label="Populaire plaatsen">
            {info.towns.slice(0, 8).map((t) => <Link key={t} href={`/koop?provincie=${provincie}&q=${encodeURIComponent(t)}`} className="focus-ring rounded-full bg-white/15 px-3 py-1 text-sm font-medium hover:bg-white/25">{t}</Link>)}
          </p>
        </div>
      </section>
      <div className="container-x grid gap-8 py-8 lg:grid-cols-[19rem_1fr]">
        <aside className="space-y-4">
          <div className="card p-5"><Filters f={f} action={`/${provincie}`} lockProvince /></div>
          <SaveSearchForm qs={qs} />
        </aside>
        <section aria-label="Zoekresultaten">
          <p className="mb-4 text-muted" aria-live="polite">{total} {total === 1 ? 'woning' : 'woningen'} in {info.name}</p>
          {items.length ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{items.map((l, i) => <ListingCard key={l.id} l={l} priority={i < 3} />)}</div>
              <Pagination filters={f} total={total} base={`/${provincie}`} />
            </>
          ) : <div className="rounded-2xl bg-sand p-10 text-center text-muted">Geen woningen gevonden. Pas je filters aan.</div>}
        </section>
      </div>
    </>
  );
}
