// Locaties via de PDOK Locatieserver (Kadaster): gratis, zonder sleutel, met Nederlandse adressen.
const BASE = 'https://api.pdok.nl/bzk/locatieserver/search/v3_1';

export interface Point { lat: number; lng: number }
export interface Place { id: string; label: string; type: string }
export interface PlacePoint extends Point { label: string; type: string }

/** Het noorden van Nederland, met ruimte eromheen; alles daarbuiten is geen geldige locatie voor deze site. */
export const NOORD_BOUNDS = { south: 52.5, north: 53.7, west: 4.9, east: 7.3 } as const;
export const inNoord = (p: Point) => p.lat >= NOORD_BOUNDS.south && p.lat <= NOORD_BOUNDS.north && p.lng >= NOORD_BOUNDS.west && p.lng <= NOORD_BOUNDS.east;

/** "POINT(6.5665 53.2194)" → { lat, lng } (lengte staat in PDOK voor de breedte). */
export function parsePoint(wkt?: string | null): Point | null {
  const m = /^POINT\(\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)\s*\)$/.exec(wkt ?? '');
  if (!m) return null;
  const p = { lat: Number(m[2]), lng: Number(m[1]) };
  return Number.isFinite(p.lat) && Number.isFinite(p.lng) ? p : null;
}

type Fetch = typeof fetch;
async function getJson(url: string, doFetch: Fetch, timeoutMs: number): Promise<any | null> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await doFetch(url, { signal: ctl.signal, headers: { Accept: 'application/json' } });
    return res.ok ? await res.json() : null;
  } catch { return null; } finally { clearTimeout(timer); }
}

/** De locatie van een adres uit postcode en huisnummer (en eventuele toevoeging). */
export async function geocodeAddress(a: { postcode: string; houseNumber: string; houseSuffix?: string | null }, doFetch: Fetch = fetch, timeoutMs = 3000): Promise<Point | null> {
  const q = `${a.postcode.replace(/\s/g, '')} ${a.houseNumber}${a.houseSuffix ? ` ${a.houseSuffix}` : ''}`.trim();
  const url = `${BASE}/free?${new URLSearchParams({ q, rows: '1', fq: 'type:adres', fl: 'centroide_ll,weergavenaam' })}`;
  const doc = (await getJson(url, doFetch, timeoutMs))?.response?.docs?.[0];
  const p = parsePoint(doc?.centroide_ll);
  return p && inNoord(p) ? p : null;
}

const TYPES = 'type:(woonplaats OR weg OR adres OR postcode)';
const PROVINCES = 'provincienaam:(Groningen OR Fryslân OR Drenthe)';

/** Zoeksuggesties voor een plaats, straat of postcode in het noorden. */
export async function suggestPlaces(q: string, doFetch: Fetch = fetch, timeoutMs = 3000): Promise<Place[]> {
  const term = q.trim().slice(0, 80);
  if (term.length < 2) return [];
  const params = (withProvince: boolean) => { const p = new URLSearchParams({ q: term, rows: '7', fl: 'id,weergavenaam,type' }); p.append('fq', TYPES); if (withProvince) p.append('fq', PROVINCES); return p; };
  let json = await getJson(`${BASE}/suggest?${params(true)}`, doFetch, timeoutMs);
  if (!json) json = await getJson(`${BASE}/suggest?${params(false)}`, doFetch, timeoutMs);   // zonder provinciefilter als dat niet werkt
  return ((json?.response?.docs ?? []) as { id?: string; weergavenaam?: string; type?: string }[])
    .filter((d) => d.id && d.weergavenaam).map((d) => ({ id: String(d.id), label: String(d.weergavenaam), type: String(d.type ?? '') }));
}

export async function lookupPlace(id: string, doFetch: Fetch = fetch, timeoutMs = 3000): Promise<PlacePoint | null> {
  if (!/^[A-Za-z0-9._:-]{3,80}$/.test(id)) return null;
  const doc = (await getJson(`${BASE}/lookup?${new URLSearchParams({ id, fl: 'weergavenaam,type,centroide_ll' })}`, doFetch, timeoutMs))?.response?.docs?.[0];
  const p = parsePoint(doc?.centroide_ll);
  return p && inNoord(p) ? { ...p, label: String(doc.weergavenaam ?? ''), type: String(doc.type ?? '') } : null;
}

/** Hoe ver de kaart inzoomt: een adres dichtbij, een plaats verder weg. */
export const zoomForType = (type: string) => (type === 'adres' ? 18 : type === 'weg' || type === 'postcode' ? 16 : 13);
