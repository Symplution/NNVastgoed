import type { StyleSpecification } from 'maplibre-gl';

/**
 * De kaart: vector-tegels van OpenFreeMap (gratis, zonder sleutel, ook voor commercieel gebruik) met heel Europa, zodat je tot ver
 * buiten Nederland kunt schuiven en in Nederland tot op de straat kunt inzoomen. Is die dienst niet bereikbaar, dan valt de kaart
 * terug op de achtergrondkaart van het Kadaster (PDOK), die alleen Nederland dekt.
 */
export const WORLD_STYLE_URL = 'https://tiles.openfreemap.org/styles/liberty';
export const PDOK_TILES = 'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/standaard/EPSG:3857/{z}/{x}/{y}.png';

export function pdokStyle(): StyleSpecification {
  return {
    version: 8,
    sources: { pdok: { type: 'raster', tiles: [PDOK_TILES], tileSize: 256, maxzoom: 19, attribution: 'Kaartgegevens © <a href="https://www.kadaster.nl" target="_blank" rel="noopener noreferrer">Kadaster</a>' } },
    layers: [{ id: 'achtergrond', type: 'background', paint: { 'background-color': '#ece8dc' } }, { id: 'pdok', type: 'raster', source: 'pdok' }],
  };
}

/** Haalt de wereldkaart-stijl op; lukt dat niet binnen de tijd, dan de Kadasterkaart. */
export async function loadMapStyle(doFetch: typeof fetch = fetch, timeoutMs = 6000): Promise<StyleSpecification> {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), timeoutMs);
  try {
    const res = await doFetch(WORLD_STYLE_URL, { signal: ctl.signal });
    if (!res.ok) return pdokStyle();
    const style = (await res.json()) as StyleSpecification;
    return style && Array.isArray(style.layers) && style.layers.length > 0 ? style : pdokStyle();
  } catch { return pdokStyle(); } finally { clearTimeout(timer); }
}

/** Het noorden van Nederland, voor de beginweergave. */
export const NOORD_VIEW = { center: [6.2, 53.1] as [number, number], zoom: 7.6 };
export const MIN_ZOOM = 3.5;   // heel Europa in beeld
export const MAX_ZOOM = 20;    // tot op de straat
