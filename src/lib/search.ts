import { ENERGY_LABELS, PROPERTY_TYPES, PUBLIC_STATUSES, type EnergyLabel, type Listing, type Province, type PropertyType } from './types';
import { isProvince } from './regions';

export const PAGE_SIZE = 12;
export const SORTS = ['nieuw', 'prijs-op', 'prijs-af', 'oppervlakte'] as const;
export type Sort = (typeof SORTS)[number];
export const SORT_LABEL: Record<Sort, string> = { nieuw: 'Nieuwste eerst', 'prijs-op': 'Prijs laag naar hoog', 'prijs-af': 'Prijs hoog naar laag', oppervlakte: 'Grootste woonoppervlak' };

export interface SearchFilters {
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

export function parseFilters(p: Params): SearchFilters {
  const prov = get(p, 'provincie');
  const energy = get(p, 'label');
  return {
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
  if (f.q) u.set('q', f.q);
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

export function matches(l: Listing, f: SearchFilters): boolean {
  if (!PUBLIC_STATUSES.includes(l.status)) return false;
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
  return parts.join(' · ') || 'Alle woningen in het noorden';
}
