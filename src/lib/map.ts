import type { MapMarker } from './data';

/** Korte prijs voor op de kaart: € 325k, € 1,2 mln of bij huur € 1.195. */
export function shortPrice(m: Pick<MapMarker, 'amount' | 'offer'>): string {
  if (m.offer === 'huur') return `€ ${m.amount.toLocaleString('nl-NL')}`;
  if (m.amount >= 1_000_000) return `€ ${(m.amount / 1_000_000).toLocaleString('nl-NL', { maximumFractionDigits: 1 })} mln`;
  if (m.amount >= 10_000) return `€ ${Math.round(m.amount / 1000).toLocaleString('nl-NL')}k`;
  return `€ ${m.amount.toLocaleString('nl-NL')}`;
}

export interface Bounds { south: number; north: number; west: number; east: number }
export const inBounds = (m: Pick<MapMarker, 'lat' | 'lng'>, b: Bounds) => m.lat >= b.south && m.lat <= b.north && m.lng >= b.west && m.lng <= b.east;

/** Kaartuitsnede die alle woningen toont; zonder woningen het hele noorden. */
export function boundsFor(markers: Pick<MapMarker, 'lat' | 'lng'>[]): Bounds {
  if (!markers.length) return { south: 52.55, north: 53.6, west: 5.2, east: 7.2 };
  return {
    south: Math.min(...markers.map((m) => m.lat)), north: Math.max(...markers.map((m) => m.lat)),
    west: Math.min(...markers.map((m) => m.lng)), east: Math.max(...markers.map((m) => m.lng)),
  };
}

/** Woningen op (vrijwel) dezelfde plek, bijvoorbeeld een nieuwbouwproject, krijgen een klein verschil zodat ze naast elkaar staan. */
export function spread(markers: MapMarker[]): MapMarker[] {
  const seen = new Map<string, number>();
  return markers.map((m) => {
    const key = `${m.lat.toFixed(5)},${m.lng.toFixed(5)}`;
    const n = seen.get(key) ?? 0;
    seen.set(key, n + 1);
    if (!n) return m;
    const angle = (n * 2.4) % (2 * Math.PI);
    return { ...m, lat: m.lat + Math.sin(angle) * 0.00018 * Math.ceil(n / 4), lng: m.lng + Math.cos(angle) * 0.0003 * Math.ceil(n / 4) };
  });
}
