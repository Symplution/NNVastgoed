'use client';

import { ExternalLink } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { MapMarker } from '@/lib/data';
import { createMap } from './maplibre';
import { pinElement } from './map-pin';

/** De exacte plek van één woning op de kaart, met een link om er naartoe te rijden. */
export function LocationMap({ marker, addressLine }: { marker: MapMarker; addressLine: string }) {
  const el = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  useEffect(() => {
    let dead = false;
    let map: import('maplibre-gl').Map | null = null;
    let watch: ResizeObserver | null = null;
    (async () => {
      if (!el.current) return;
      try {
        const made = await createMap(el.current, { center: [marker.lng, marker.lat], zoom: 16, cooperative: true });
        if (dead) { made.map.remove(); return; }
        map = made.map;
        new made.ml.Marker({ element: pinElement(marker), anchor: 'bottom' }).setLngLat([marker.lng, marker.lat]).addTo(map);
        // Het tabblad staat eerst verborgen; zodra de kaart zichtbaar wordt moet hij zijn formaat opnieuw bepalen.
        watch = new ResizeObserver(() => map?.resize());
        watch.observe(el.current);
      } catch { if (!dead) setError('Je browser kan de kaart niet tonen.'); }
    })();
    return () => { dead = true; watch?.disconnect(); map?.remove(); };
  }, [marker]);
  const dest = `${marker.lat},${marker.lng}`;
  return (
    <div className="space-y-3">
      <div ref={el} className="h-80 w-full overflow-hidden rounded-2xl border border-line bg-sand" role="img" aria-label={`Kaart met de locatie van ${addressLine}`} />
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <p className="text-sm"><span className="font-semibold">{addressLine}</span> · {marker.place}</p>
      <a href={`https://www.google.com/maps/dir/?api=1&destination=${dest}`} target="_blank" rel="noopener noreferrer" className="btn-ghost"><ExternalLink size={15} aria-hidden /> Route plannen</a>
    </div>
  );
}
