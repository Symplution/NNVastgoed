import { hasSupabase, isDemo } from './env';
import { createAnonClient } from './supabase/anon';
import { DEMO_LISTINGS, DEMO_OFFICES } from './demo-data';
import { matches, PAGE_SIZE, sortListings, type Mode, type SearchFilters } from './search';
import { ENERGY_LABELS, PROVINCES, PUBLIC_STATUSES, type Listing, type Office, type Province } from './types';

// Openbare gegevens. Met Supabase via de anonieme rol (row level security bepaalt wat zichtbaar is),
// in demomodus uit voorbeeldgegevens, en anders leeg (nooit afhankelijk van demo; CLAUDE.md regel 10).
type Row = Record<string, any>;

export const mapListing = (r: Row): Listing => ({
  id: r.id, officeId: r.office_id, slug: r.slug, externalId: r.external_id, source: r.source, status: r.status,
  offer: r.offer ?? 'koop', category: r.category ?? 'woning', newBuild: Boolean(r.new_build),
  street: r.street, houseNumber: r.house_number, houseSuffix: r.house_suffix, postcode: r.postcode, city: r.city, province: r.province, neighbourhood: r.neighbourhood,
  lat: r.lat, lng: r.lng, askingPrice: r.asking_price, priceType: r.price_type, livingArea: r.living_area, plotArea: r.plot_area,
  rooms: r.rooms, bedrooms: r.bedrooms, bathrooms: r.bathrooms, buildYear: r.build_year, propertyType: r.property_type, energyLabel: r.energy_label,
  description: r.description ?? '', features: r.features ?? [], photos: r.photos ?? [], publishedAt: r.published_at, updatedAt: r.updated_at,
});
export const mapOffice = (r: Row): Office => ({
  id: r.id, slug: r.slug, name: r.name, city: r.city, province: r.province, street: r.street, postcode: r.postcode, phone: r.phone, email: r.email, website: r.website, description: r.description ?? '', nvmMember: Boolean(r.nvm_member),
});

const demoVisible = () => DEMO_LISTINGS.filter((l) => PUBLIC_STATUSES.includes(l.status));

/** Zelfde filters als `matches`, nu als databasequery. */
export function applyFilters(q: any, f: SearchFilters) {
  q = q.in('status', f.hideSold ? PUBLIC_STATUSES.filter((s) => s !== 'verkocht') : PUBLIC_STATUSES);
  switch (f.mode) {
    case 'koop': q = q.eq('offer', 'koop').eq('category', 'woning'); break;
    case 'huur': q = q.eq('offer', 'huur').eq('category', 'woning'); break;
    case 'nieuwbouw': q = q.eq('new_build', true).eq('category', 'woning'); if (f.offer) q = q.eq('offer', f.offer); break;
    case 'bedrijfsruimte': q = q.eq('category', 'bedrijfsruimte'); if (f.offer) q = q.eq('offer', f.offer); break;
  }
  if (f.province) q = q.eq('province', f.province);
  if (f.minPrice !== undefined) q = q.gte('asking_price', f.minPrice);
  if (f.maxPrice !== undefined) q = q.lte('asking_price', f.maxPrice);
  if (f.minArea !== undefined) q = q.gte('living_area', f.minArea);
  if (f.minRooms !== undefined) q = q.gte('rooms', f.minRooms);
  if (f.minBedrooms !== undefined) q = q.gte('bedrooms', f.minBedrooms);
  if (f.types.length) q = q.in('property_type', f.types);
  if (f.energy) q = q.in('energy_label', ENERGY_LABELS.slice(0, ENERGY_LABELS.indexOf(f.energy) + 1));
  if (f.q) {
    const t = f.q.replace(/\s/g, '');
    q = q.or(`city.ilike.%${f.q}%,street.ilike.%${f.q}%,neighbourhood.ilike.%${f.q}%,postcode.ilike.${t}%`);
  }
  return q;
}

const ORDER: Record<SearchFilters['sort'], [string, boolean]> = {
  nieuw: ['published_at', false], 'prijs-op': ['asking_price', true], 'prijs-af': ['asking_price', false], oppervlakte: ['living_area', false],
};

export async function searchListings(f: SearchFilters): Promise<{ items: Listing[]; total: number }> {
  if (isDemo()) {
    const all = sortListings(demoVisible().filter((l) => matches(l, f)), f.sort);
    return { items: all.slice((f.page - 1) * PAGE_SIZE, f.page * PAGE_SIZE), total: all.length };
  }
  if (!hasSupabase()) return { items: [], total: 0 };
  const [col, asc] = ORDER[f.sort];
  const { data, count } = await applyFilters(createAnonClient().from('listings').select('*', { count: 'exact' }), f)
    .order(col, { ascending: asc, nullsFirst: false }).order('id').range((f.page - 1) * PAGE_SIZE, f.page * PAGE_SIZE - 1);
  return { items: (data ?? []).map(mapListing), total: count ?? 0 };
}

export async function getListing(slug: string): Promise<Listing | null> {
  if (isDemo()) return demoVisible().find((l) => l.slug === slug) ?? null;
  if (!hasSupabase()) return null;
  const { data } = await createAnonClient().from('listings').select('*').eq('slug', slug).maybeSingle();
  return data ? mapListing(data) : null;
}

/** Een openbare woning op id (voor mails en bevestigingen). */
export async function getListingById(id: string): Promise<Listing | null> {
  if (!/^[A-Za-z0-9-]{1,40}$/.test(id)) return null;
  if (isDemo()) return demoVisible().find((l) => l.id === id) ?? null;
  if (!hasSupabase()) return null;
  const { data } = await createAnonClient().from('listings').select('*').eq('id', id).maybeSingle();
  return data ? mapListing(data) : null;
}

export async function listingsByIds(ids: string[]): Promise<Listing[]> {
  const clean = ids.filter((i) => /^[A-Za-z0-9-]{1,40}$/.test(i)).slice(0, 50);
  if (!clean.length) return [];
  if (isDemo()) return demoVisible().filter((l) => clean.includes(l.id));
  if (!hasSupabase()) return [];
  const { data } = await createAnonClient().from('listings').select('*').in('id', clean);
  return (data ?? []).map(mapListing);
}

export async function latestListings(n: number, province?: Province, mode: Mode = 'koop'): Promise<Listing[]> {
  const f: SearchFilters = { mode, types: [], hideSold: true, sort: 'nieuw', page: 1, province };
  const r = await searchListings(f);
  return r.items.slice(0, n);
}

export async function provinceCounts(): Promise<Record<Province, number>> {
  const out = { groningen: 0, friesland: 0, drenthe: 0 } as Record<Province, number>;
  if (isDemo()) { demoVisible().filter((l) => l.status !== 'verkocht' && l.offer === 'koop' && l.category === 'woning').forEach((l) => out[l.province]++); return out; }
  if (!hasSupabase()) return out;
  const db = createAnonClient();
  await Promise.all(PROVINCES.map(async (p) => {
    const { count } = await db.from('listings').select('id', { count: 'exact', head: true }).eq('province', p).eq('offer', 'koop').eq('category', 'woning').in('status', ['beschikbaar', 'onder_bod', 'onder_voorbehoud']);
    out[p] = count ?? 0;
  }));
  return out;
}

export async function similarListings(l: Listing, n = 3): Promise<Listing[]> {
  const spread = Math.round(l.askingPrice * 0.25);
  const mode: Mode = l.category === 'bedrijfsruimte' ? 'bedrijfsruimte' : l.offer === 'huur' ? 'huur' : 'koop';
  const r = await searchListings({ mode, types: [], hideSold: true, sort: 'nieuw', page: 1, province: l.province, minPrice: l.askingPrice - spread, maxPrice: l.askingPrice + spread, offer: mode === 'bedrijfsruimte' ? l.offer : undefined });
  return r.items.filter((x) => x.id !== l.id).slice(0, n);
}

export async function listOffices(opts: { nvmOnly?: boolean } = {}): Promise<Office[]> {
  if (isDemo()) return opts.nvmOnly ? DEMO_OFFICES.filter((o) => o.nvmMember) : DEMO_OFFICES;
  if (!hasSupabase()) return [];
  let q = createAnonClient().from('offices').select('*').order('name');
  if (opts.nvmOnly) q = q.eq('nvm_member', true);
  const { data } = await q;
  return (data ?? []).map(mapOffice);
}

export async function getOffice(slugOrId: { slug?: string; id?: string }): Promise<Office | null> {
  if (isDemo()) return DEMO_OFFICES.find((o) => o.slug === slugOrId.slug || o.id === slugOrId.id) ?? null;
  if (!hasSupabase()) return null;
  const q = createAnonClient().from('offices').select('*');
  const { data } = await (slugOrId.slug ? q.eq('slug', slugOrId.slug) : q.eq('id', slugOrId.id ?? '')).maybeSingle();
  return data ? mapOffice(data) : null;
}

export async function officeListings(officeId: string): Promise<Listing[]> {
  if (isDemo()) return sortListings(demoVisible().filter((l) => l.officeId === officeId), 'nieuw');
  if (!hasSupabase()) return [];
  const { data } = await createAnonClient().from('listings').select('*').eq('office_id', officeId).in('status', PUBLIC_STATUSES).order('published_at', { ascending: false });
  return (data ?? []).map(mapListing);
}

/** Voor de sitemap: alle openbare woningen (slug + laatste wijziging). */
export async function publicSlugs(): Promise<{ slug: string; updatedAt: string }[]> {
  if (isDemo()) return demoVisible().map((l) => ({ slug: l.slug, updatedAt: l.updatedAt }));
  if (!hasSupabase()) return [];
  const { data } = await createAnonClient().from('listings').select('slug, updated_at').in('status', PUBLIC_STATUSES).order('updated_at', { ascending: false }).limit(5000);
  return (data ?? []).map((r) => ({ slug: r.slug, updatedAt: r.updated_at }));
}

/** Alle woningen die online staan, voor de cijfers op de woningmarktpagina. */
export async function allLiveListings(): Promise<Listing[]> {
  if (isDemo()) return demoVisible();
  if (!hasSupabase()) return [];
  const { data } = await createAnonClient().from('listings').select('*').in('status', ['beschikbaar', 'onder_bod', 'onder_voorbehoud']).limit(5000);
  return (data ?? []).map(mapListing);
}
