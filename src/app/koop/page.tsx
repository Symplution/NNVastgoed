import type { Metadata } from 'next';
import { Filters } from '@/components/filters';
import { ListingCard } from '@/components/listing-card';
import { Pagination } from '@/components/pagination';
import { SaveSearchForm } from '@/components/save-search-form';
import { searchListings } from '@/lib/data';
import { describeFilters, filtersToParams, parseFilters, PAGE_SIZE } from '@/lib/search';
import { formatEuro, TYPE_LABEL } from '@/lib/format';
import { provinceName } from '@/lib/regions';

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const f = parseFilters(await searchParams);
  const title = `Koopwoningen · ${describeFilters({ ...f, minRooms: undefined }, formatEuro, provinceName, (t) => TYPE_LABEL[t])}`;
  // Gefilterde en doorgebladerde varianten zijn geen eigen pagina's voor zoekmachines.
  const plain = !f.q && !f.minPrice && !f.maxPrice && !f.types.length && f.page === 1;
  return { title, robots: plain ? undefined : { index: false, follow: true }, alternates: { canonical: '/koop' } };
}

export default async function Koop({ searchParams }: Props) {
  const f = parseFilters(await searchParams);
  const { items, total } = await searchListings(f);
  const qs = filtersToParams({ ...f, page: 1, sort: 'nieuw' }).toString();
  return (
    <div className="container-x py-8">
      <h1 className="text-3xl font-extrabold tracking-tight">Koopwoningen in het noorden</h1>
      <p className="mt-1 text-muted" aria-live="polite">{total} {total === 1 ? 'woning' : 'woningen'} · {describeFilters(f, formatEuro, provinceName, (t) => TYPE_LABEL[t])}</p>
      <div className="mt-8 grid gap-8 lg:grid-cols-[19rem_1fr]">
        <aside className="space-y-4">
          <details className="card p-5 lg:!block" open>
            <summary className="cursor-pointer text-sm font-bold lg:hidden">Filters</summary>
            <div className="mt-4 lg:mt-0"><Filters f={f} /></div>
          </details>
          <SaveSearchForm qs={qs} />
        </aside>
        <section aria-label="Zoekresultaten">
          {items.length ? (
            <>
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{items.map((l, i) => <ListingCard key={l.id} l={l} priority={i < 3} />)}</div>
              <Pagination filters={f} total={total} />
              <p className="mt-6 text-center text-xs text-muted">{(f.page - 1) * PAGE_SIZE + 1}–{(f.page - 1) * PAGE_SIZE + items.length} van {total}</p>
            </>
          ) : (
            <div className="rounded-2xl bg-sand p-10 text-center">
              <h2 className="text-lg font-bold">Geen woningen gevonden</h2>
              <p className="mt-1 text-muted">Pas je filters aan, of laat je mailen zodra er iets past.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
