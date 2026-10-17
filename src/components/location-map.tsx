'use client';

import 'leaflet/dist/leaflet.css';
import { ExternalLink } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { ATTRIBUTION, TILES } from './listings-map';
import { pinIcon } from './leaflet-pin';
import type { MapMarker } from '@/lib/data';

/** De exacte plek van één woning op de kaart, met een link om er naartoe te rijden. */
export function LocationMap({ marker, addressLine }: { marker: MapMarker; addressLine: string }) {
  const el = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let map: import('leaflet').Map | null = null;
    let dead = false;
    let watch: ResizeObserver | null = null;
    (async () => {
      const L = (await import('leaflet')).default;
      if (dead || !el.current) return;
      map = L.map(el.current, { center: [marker.lat, marker.lng], zoom: 16, minZoom: 7, maxZoom: 19, scrollWheelZoom: false });
      L.tileLayer(TILES, { minZoom: 7, maxZoom: 19, attribution: ATTRIBUTION }).addTo(map);
      L.marker([marker.lat, marker.lng], { icon: pinIcon(L, marker), keyboard: false, interactive: false }).addTo(map);
      // Het tabblad staat eerst verborgen; zodra de kaart zichtbaar wordt moet hij zijn formaat opnieuw bepalen.
      watch = new ResizeObserver(() => map?.invalidateSize());
      watch.observe(el.current);
    })();
    return () => { dead = true; watch?.disconnect(); map?.remove(); };
  }, [marker]);
  const dest = `${marker.lat},${marker.lng}`;
  return (
    <div className="space-y-3">
      <div ref={el} className="h-80 w-full overflow-hidden rounded-2xl border border-line bg-sand" role="img" aria-label={`Kaart met de locatie van ${addressLine}`} />
      <p className="text-sm"><span className="font-semibold">{addressLine}</span> · {marker.place}</p>
      <a href={`https://www.google.com/maps/dir/?api=1&destination=${dest}`} target="_blank" rel="noopener noreferrer" className="btn-ghost"><ExternalLink size={15} aria-hidden /> Route plannen</a>
    </div>
  );
}
