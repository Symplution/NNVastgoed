import { ENERGY_LABELS, PROPERTY_TYPES, PUBLIC_STATUSES, type EnergyLabel, type Listing, type Offer, type Province, type PropertyType } from './types';
import { isProvince } from './regions';

export const PAGE_SIZE = 12;

/** Waar je naar zoekt. Elke soort heeft een eigen pagina; wat daar getoond wordt staat in `modeBase`. */
export const MODES = ['koop', 'huur', 'nieuwbouw', 'bedrijfsruimte', 'recreatie'] as const;
export type Mode = (typeof MODES)[number];
export const MODE_INFO: Record<Mode, { label: string; path: string; title: string; lead: string }> = {
  koop: { label: 'Kopen', path: '/koop', title: 'Koopwoningen in het noorden', lead: 'Alle koopwoningen van makelaars in Groningen, Friesland en Drenthe.' },
  huur: { label: 'Huren', path: '/huur', title: 'Huurwoningen in het noorden', lead: 'Huurwoningen in Groningen, Friesland en Drenthe, met de huurprijs per maand.' },
  nieuwbouw: { label: 'Nieuwbouw', path: '/nieuwbouw', title: 'Nieuwbouwwoningen in het noorden', lead: 'Nieuwbouwprojecten en -woningen om te kopen of te huren.' },
  recreatie: { label: 'Recreatie', path: '/recreatie', title: 'Recreatiewoningen in het noorden', lead: 'Vakantiehuizen, chalets, bungalows en stacaravans aan de Waddenzee, bij de Friese meren en in de Drentse bossen.' },
  bedrijfsruimte: { label: 'Bedrijfsruimte', path: '/bedrijfsruimte', title: 'Bedrijfsruimte in het noorden', lead: 'Kantoren, bedrijfshallen, winkels en horeca om te koop of te huur.' },
};
export const isMode = (v: unknown): v is Mode => (MODES as readonly string[]).includes(v as string);

/** Prijsstappen in het filter: koop in euro's, huur per maand. */
export const PRICE_STEPS = {
  koop: [100_000, 150_000, 200_000, 250_000, 300_000, 400_000, 500_000, 750_000, 1_000_000],
  huur: [500, 750, 1000, 1250, 1500, 2000, 2500, 3000, 4000],
} as const;
export const priceStepsFor = (f: Pick<SearchFilters, 'mode' | 'offer'>) => (f.mode === 'huur' || f.offer === 'huur' ? PRICE_STEPS.huur : PRICE_STEPS.koop);
export const SORTS = ['nieuw', 'prijs-op', 'prijs-af', 'oppervlakte'] as const;
export type Sort = (typeof SORTS)[number];
export const SORT_LABEL: Record<Sort, string> = { nieuw: 'Nieuwste eerst', 'prijs-op': 'Prijs laag naar hoog', 'prijs-af': 'Prijs hoog naar laag', oppervlakte: 'Grootste woonoppervlak' };

export interface SearchFilters {
  mode: Mode;
  /** Alleen voor nieuwbouw, bedrijfsruimte en recreatie: koop of huur kiezen. Bij koop en huur volgt het uit de pagina. */
  offer?: Offer;
  q?: string;
  province?: Province;
  minPrice?: number; maxPrice?: number;
  minArea?: number; minRooms?: number; minBedrooms?: number;
  types: PropertyType[];
  energy?: EnergyLabel;          // minimaal dit label
  hideSold: boolean;
  sort: Sort;
  page: number;
}

type Params = Record<string, string | string[] | undefined> | URLSearchParams;
const get = (p: Params, k: string): string | undefined => {
  const v = p instanceof URLSearchParams ? p.get(k) ?? undefined : p[k];
  return (Array.isArray(v) ? v[0] : v)?.trim() || undefined;
};
const all = (p: Params, k: string): string[] => {
  if (p instanceof URLSearchParams) return p.getAll(k);
  const v = p[k];
  return v === undefined ? [] : Array.isArray(v) ? v : [v];
};
const int = (v: string | undefined, min = 0, max = 100_000_000): number | undefined => {
  if (!v) return undefined;
  const n = Number(v.replace(/[.\s]/g, ''));
  return Number.isFinite(n) && n >= min && n <= max ? Math.floor(n) : undefined;
};

/** Zoekterm: alleen letters, cijfers, spatie en koppelteken, zodat hij veilig in een query past. */
export const cleanQuery = (q?: string) => q?.normalize('NFC').replace(/[^\p{L}\p{N} \-]/gu, ' ').replace(/\s+/g, ' ').trim().slice(0, 60) || undefined;

/** De soort zoeken uit een opgeslagen zoekopdracht (`soort=huur`); zonder is het koop. */
export const modeFromParams = (p: Params): Mode => { const m = get(p, 'soort'); return isMode(m) ? m : 'koop'; };

export function parseFilters(p: Params, mode: Mode = 'koop'): SearchFilters {
  const prov = get(p, 'provincie');
  const energy = get(p, 'label');
  const aanbod = get(p, 'aanbod');
  return {
    mode,
    offer: (mode === 'nieuwbouw' || mode === 'bedrijfsruimte' || mode === 'recreatie') && (aanbod === 'koop' || aanbod === 'huur') ? aanbod : undefined,
    q: cleanQuery(get(p, 'q')),
    province: isProvince(prov) ? prov : undefined,
    minPrice: int(get(p, 'van')), maxPrice: int(get(p, 'tot')),
    minArea: int(get(p, 'm2'), 0, 100_000), minRooms: int(get(p, 'kamers'), 0, 50), minBedrooms: int(get(p, 'slaapkamers'), 0, 50),
    types: all(p, 'type').filter((t): t is PropertyType => (PROPERTY_TYPES as readonly string[]).includes(t)),
    energy: energy && (ENERGY_LABELS as readonly string[]).includes(energy) ? (energy as EnergyLabel) : undefined,
    hideSold: get(p, 'verkocht') !== '1',
    sort: (SORTS as readonly string[]).includes(get(p, 'sorteer') ?? '') ? (get(p, 'sorteer') as Sort) : 'nieuw',
    page: Math.max(1, int(get(p, 'pagina'), 1, 10_000) ?? 1),
  };
}

/** Terug naar een query string; alleen wat afwijkt van de standaard. */
export function filtersToParams(f: Partial<SearchFilters>): URLSearchParams {
  const u = new URLSearchParams();
  if (f.mode && f.mode !== 'koop') u.set('soort', f.mode);   // alleen voor opgeslagen zoekopdrachten en alerts; de pagina zelf kent zijn soort
  if (f.q) u.set('q', f.q);
  if (f.offer && (f.mode === 'nieuwbouw' || f.mode === 'bedrijfsruimte' || f.mode === 'recreatie')) u.set('aanbod', f.offer);
  if (f.province) u.set('provincie', f.province);
  if (f.minPrice !== undefined) u.set('van', String(f.minPrice));
  if (f.maxPrice !== undefined) u.set('tot', String(f.maxPrice));
  if (f.minArea !== undefined) u.set('m2', String(f.minArea));
  if (f.minRooms !== undefined) u.set('kamers', String(f.minRooms));
  if (f.minBedrooms !== undefined) u.set('slaapkamers', String(f.minBedrooms));
  for (const t of f.types ?? []) u.append('type', t);
  if (f.energy) u.set('label', f.energy);
  if (f.hideSold === false) u.set('verkocht', '1');
  if (f.sort && f.sort !== 'nieuw') u.set('sorteer', f.sort);
  if (f.page && f.page > 1) u.set('pagina', String(f.page));
  return u;
}

const energyRank = (e?: EnergyLabel | null) => (e ? ENERGY_LABELS.indexOf(e) : 99);   // lager = zuiniger

/** Wat een soort zoeken inhoudt, los van de filters. */
export function matchesMode(l: Pick<Listing, 'offer' | 'category' | 'newBuild'>, f: Pick<SearchFilters, 'mode' | 'offer'>): boolean {
  switch (f.mode) {
    case 'koop': return l.offer === 'koop' && l.category === 'woning';
    case 'huur': return l.offer === 'huur' && l.category === 'woning';
    case 'nieuwbouw': return l.newBuild && l.category === 'woning' && (!f.offer || l.offer === f.offer);
    case 'bedrijfsruimte': return l.category === 'bedrijfsruimte' && (!f.offer || l.offer === f.offer);
    case 'recreatie': return l.category === 'recreatie' && (!f.offer || l.offer === f.offer);
  }
}

export function matches(l: Listing, f: SearchFilters): boolean {
  if (!PUBLIC_STATUSES.includes(l.status)) return false;
  if (!matchesMode(l, f)) return false;
  if (f.hideSold && l.status === 'verkocht') return false;
  if (f.province && l.province !== f.province) return false;
  if (f.minPrice !== undefined && l.askingPrice < f.minPrice) return false;
  if (f.maxPrice !== undefined && l.askingPrice > f.maxPrice) return false;
  if (f.minArea !== undefined && l.livingArea < f.minArea) return false;
  if (f.minRooms !== undefined && l.rooms < f.minRooms) return false;
  if (f.minBedrooms !== undefined && l.bedrooms < f.minBedrooms) return false;
  if (f.types.length && !f.types.includes(l.propertyType)) return false;
  if (f.energy && energyRank(l.energyLabel) > energyRank(f.energy)) return false;
  if (f.q) {
    const q = f.q.toLowerCase();
    const pc = l.postcode.replace(/\s/g, '').toLowerCase();
    const hay = [l.city, l.street, l.neighbourhood ?? ''].join(' ').toLowerCase();
    if (!hay.includes(q) && !pc.startsWith(q.replace(/\s/g, ''))) return false;
  }
  return true;
}

export function sortListings(items: Listing[], sort: Sort): Listing[] {
  const by: Record<Sort, (a: Listing, b: Listing) => number> = {
    nieuw: (a, b) => (b.publishedAt ?? b.updatedAt).localeCompare(a.publishedAt ?? a.updatedAt),
    'prijs-op': (a, b) => a.askingPrice - b.askingPrice,
    'prijs-af': (a, b) => b.askingPrice - a.askingPrice,
    oppervlakte: (a, b) => b.livingArea - a.livingArea,
  };
  return [...items].sort(by[sort]);
}

/** Leesbare samenvatting voor in de mail en de titel ("Friesland · tot € 300.000 · vrijstaand"). */
export function describeFilters(f: Partial<SearchFilters>, euro: (n: number) => string, provinceName: (p: Province) => string, typeLabel: (t: PropertyType) => string): string {
  const parts: string[] = [];
  if (f.q) parts.push(f.q);
  if (f.province) parts.push(provinceName(f.province));
  if (f.minPrice !== undefined && f.maxPrice !== undefined) parts.push(`${euro(f.minPrice)} tot ${euro(f.maxPrice)}`);
  else if (f.maxPrice !== undefined) parts.push(`tot ${euro(f.maxPrice)}`);
  else if (f.minPrice !== undefined) parts.push(`vanaf ${euro(f.minPrice)}`);
  if (f.minRooms !== undefined) parts.push(`${f.minRooms}+ kamers`);
  if (f.types?.length) parts.push(f.types.map(typeLabel).join(' of ').toLowerCase());
  return parts.join(' · ') || 'Alles in het noorden';
}
