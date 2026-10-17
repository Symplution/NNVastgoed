import type { Metadata } from 'next';
import { ChevronDown, List, Map as MapIcon, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';
import { Filters } from '@/components/filters';
import { ListingsMapLazy } from '@/components/map-loader';
import { ListingCard } from '@/components/listing-card';
import { ModeTabs } from '@/components/mode-tabs';
import { Pagination } from '@/components/pagination';
import { SaveSearchForm } from '@/components/save-search-form';
import { searchListings } from '@/lib/data';
import { describeFilters, filtersToParams, MODE_INFO, PAGE_SIZE, parseFilters, type Mode } from '@/lib/search';
import { formatEuro, TYPE_LABEL } from '@/lib/format';
import { provinceName } from '@/lib/regions';

export type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export async function searchMetadata(mode: Mode, searchParams: SearchParams): Promise<Metadata> {
  const f = parseFilters(await searchParams, mode);
  const title = `${MODE_INFO[mode].title} · ${describeFilters({ ...f, minRooms: undefined }, formatEuro, provinceName, (t) => TYPE_LABEL[t])}`;
  // Gefilterde en doorgebladerde varianten zijn geen eigen pagina's voor zoekmachines.
  const plain = !f.q && !f.minPrice && !f.maxPrice && !f.types.length && !f.offer && f.page === 1;
  return { title, description: MODE_INFO[mode].lead, robots: plain ? undefined : { index: false, follow: true }, alternates: { canonical: MODE_INFO[mode].path } };
}

/** De zoekpagina voor kopen, huren, nieuwbouw en bedrijfsruimte: dezelfde opzet, een andere selectie. */
export async function SearchPage({ mode, searchParams }: { mode: Mode; searchParams: SearchParams }) {
  const sp = await searchParams;
  const f = parseFilters(sp, mode);
  const kaart = sp.weergave === 'kaart';
  // Op de kaart staan alle resultaten; in de lijst een pagina tegelijk.
  const { items, total } = kaart ? { items: [], total: 0 } : await searchListings(f);
  const qs = filtersToParams({ ...f, page: 1, sort: 'nieuw' }).toString();
  const info = MODE_INFO[mode];
  const here = (view: 'lijst' | 'kaart') => { const u = filtersToParams({ ...f, page: 1 }); if (view === 'kaart') u.set('weergave', 'kaart'); const t = u.toString(); return t ? `${info.path}?${t}` : info.path; };
  const toggle = (on: boolean) => `focus-ring inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition ${on ? 'bg-white text-brand shadow' : 'text-muted hover:text-ink'}`;
  return (
    <div className="container-x py-8">
      <ModeTabs active={mode} />
      <h1 className="mt-5 text-3xl font-extrabold tracking-tight">{info.title}</h1>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <p className="text-muted" aria-live="polite">{kaart ? 'Alles op de kaart' : `${total} ${total === 1 ? 'resultaat' : 'resultaten'}`} · {describeFilters(f, formatEuro, provinceName, (t) => TYPE_LABEL[t])}</p>
        <nav aria-label="Weergave" className="inline-flex gap-1 rounded-xl bg-sand p-1">
          <Link href={here('lijst')} aria-current={!kaart ? 'page' : undefined} className={toggle(!kaart)}><List size={16} aria-hidden /> Lijst</Link>
          <Link href={here('kaart')} aria-current={kaart ? 'page' : undefined} className={toggle(kaart)}><MapIcon size={16} aria-hidden /> Kaart</Link>
        </nav>
      </div>
      {kaart ? (
        // Op de kaart krijgt de kaart de volle breedte; de filters klappen open boven de kaart.
        <div className="mt-6 space-y-4">
          <details className="card group">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-3.5 text-sm font-bold [&::-webkit-details-marker]:hidden">
              <span className="inline-flex items-center gap-2"><SlidersHorizontal size={16} aria-hidden /> Filters en zoekopdracht opslaan</span>
              <ChevronDown size={16} aria-hidden className="text-muted transition-transform group-open:rotate-180" />
            </summary>
            <div className="grid gap-6 border-t border-line p-5 md:grid-cols-[minmax(0,22rem)_minmax(0,22rem)]">
              <Filters f={f} view="kaart" />
              <div><SaveSearchForm qs={qs} /></div>
            </div>
          </details>
          <ListingsMapLazy soort={mode} qs={filtersToParams({ ...f, page: 1, sort: 'nieuw' }).toString()} />
        </div>
      ) : (
        <div className="mt-8 grid gap-8 lg:grid-cols-[19rem_1fr]">
          <aside className="space-y-4">
            <details className="card p-5 lg:!block" open>
              <summary className="cursor-pointer text-sm font-bold lg:hidden">Filters</summary>
              <div className="mt-4 lg:mt-0"><Filters f={f} /></div>
            </details>
            <SaveSearchForm qs={qs} />
          </aside>
          <section aria-label="Zoekresultaten" className="min-w-0">
            {items.length ? (
              <>
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">{items.map((l, i) => <ListingCard key={l.id} l={l} priority={i < 3} />)}</div>
                <Pagination filters={f} total={total} base={info.path} />
                <p className="mt-6 text-center text-xs text-muted">{(f.page - 1) * PAGE_SIZE + 1}–{(f.page - 1) * PAGE_SIZE + items.length} van {total}</p>
              </>
            ) : (
              <div className="rounded-2xl bg-sand p-10 text-center">
                <h2 className="text-lg font-bold">Niets gevonden</h2>
                <p className="mt-1 text-muted">Pas je filters aan, of laat je mailen zodra er iets past.</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
