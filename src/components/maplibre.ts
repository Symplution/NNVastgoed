import 'maplibre-gl/dist/maplibre-gl.css';
import type { Map as MlMap, MapOptions } from 'maplibre-gl';
import { loadMapStyle, MAX_ZOOM, MIN_ZOOM, NOORD_VIEW } from '@/lib/map-style';

export type Ml = typeof import('maplibre-gl');

/** Maakt de kaart: vloeiend schuiven en zoomen, heel Europa zichtbaar, in Nederland tot op de straat. Gooit een fout als de browser geen WebGL heeft. */
export async function createMap(container: HTMLElement, opts: { center?: [number, number]; zoom?: number; cooperative?: boolean; controls?: boolean } = {}): Promise<{ map: MlMap; ml: Ml }> {
  const ml = (await import('maplibre-gl')) as Ml;
  const style = await loadMapStyle();
  const options: MapOptions = {
    container, style, center: opts.center ?? NOORD_VIEW.center, zoom: opts.zoom ?? NOORD_VIEW.zoom, minZoom: MIN_ZOOM, maxZoom: MAX_ZOOM,
    attributionControl: { compact: true }, dragRotate: false, pitchWithRotate: false, cooperativeGestures: opts.cooperative ?? false, fadeDuration: 150,
  };
  const map = new ml.Map(options);
  map.touchZoomRotate.disableRotation();
  if (opts.controls !== false) {
    map.addControl(new ml.NavigationControl({ showCompass: false, visualizePitch: false }), 'bottom-right');
    map.addControl(new ml.ScaleControl({ unit: 'metric', maxWidth: 90 }), 'bottom-left');
  }
  return { map, ml };
}
