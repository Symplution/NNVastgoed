'use client';

import 'leaflet/dist/leaflet.css';
import { Loader2, MapPin, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type * as Leaflet from 'leaflet';
import type { MapMarker } from '@/lib/data';
import { NOORD_BOUNDS, type Place } from '@/lib/geo';
import { boundsFor, inBounds, spread } from '@/lib/map';
import { pinIcon, popupContent } from './leaflet-pin';

/** Kaartlaag van het Kadaster (PDOK): gratis, zonder sleutel. */
export const TILES = 'https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/standaard/EPSG:3857/{z}/{x}/{y}.png';
export const ATTRIBUTION = 'Kaartgegevens © <a href="https://www.kadaster.nl" target="_blank" rel="noopener noreferrer">Kadaster</a>';

/**
 * Alle woningen van de zoekopdracht op de kaart, met een huisje en de prijs. Zoeken op plaats, straat of postcode vliegt erheen;
 * rechts staan de woningen die nu in beeld zijn.
 */
export function ListingsMap({ soort, qs }: { soort: string; qs: string }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<Leaflet.Map | null>(null);
  const lib = useRef<typeof Leaflet | null>(null);
  const layers = useRef(new Map<string, Leaflet.Marker>());
  const dot = useRef<Leaflet.Marker | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [state, setState] = useState<{ loading: boolean; error: string; total: number; missing: number }>({ loading: true, error: '', total: 0, missing: 0 });
  const [visible, setVisible] = useState<MapMarker[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [places, setPlaces] = useState<Place[]>([]);
  const [highlight, setHighlight] = useState(-1);
  const [open, setOpen] = useState(false);

  // De woningen ophalen, bij dezelfde filters als de lijst.
  useEffect(() => {
    let alive = true;
    setState((s) => ({ ...s, loading: true, error: '' }));
    const params = new URLSearchParams(qs);
    if (!params.has('soort')) params.set('soort', soort);
    fetch(`/api/kaart?${params}`).then((r) => (r.ok ? r.json() : Promise.reject())).then((d: { markers: MapMarker[]; total: number; missing: number }) => {
      if (!alive) return;
      setMarkers(spread(d.markers));
      setState({ loading: false, error: '', total: d.total, missing: d.missing });
    }).catch(() => alive && setState({ loading: false, error: 'De woningen konden niet worden geladen.', total: 0, missing: 0 }));
    return () => { alive = false; };
  }, [qs, soort]);

  // De kaart zelf.
  useEffect(() => {
    let dead = false;
    (async () => {
      const L = (await import('leaflet')).default;
      if (dead || !el.current || map.current) return;
      lib.current = L;
      const m = L.map(el.current, { zoomControl: false, minZoom: 7, maxZoom: 19, maxBounds: [[52.2, 4.5], [54.0, 7.7]], maxBoundsViscosity: 0.8 });
      L.tileLayer(TILES, { minZoom: 7, maxZoom: 19, attribution: ATTRIBUTION }).addTo(m);
      L.control.zoom({ position: 'bottomright', zoomInTitle: 'Inzoomen', zoomOutTitle: 'Uitzoomen' }).addTo(m);
      m.fitBounds([[NOORD_BOUNDS.south + 0.25, NOORD_BOUNDS.west + 0.3], [NOORD_BOUNDS.north - 0.1, NOORD_BOUNDS.east - 0.1]]);
      map.current = m;
      new ResizeObserver(() => m.invalidateSize()).observe(el.current);
      m.on('moveend zoomend', () => setVisible((v) => v.slice()));   // de lijst rechts volgt de kaart
      setMarkers((x) => x.slice());
    })();
    return () => { dead = true; map.current?.remove(); map.current = null; layers.current.clear(); };
  }, []);

  // Huisjes plaatsen zodra de woningen en de kaart er zijn.
  useEffect(() => {
    const L = lib.current, m = map.current;
    if (!L || !m) return;
    layers.current.forEach((x) => x.remove());
    layers.current.clear();
    for (const mk of markers) {
      const pin = L.marker([mk.lat, mk.lng], { icon: pinIcon(L, mk), title: `${mk.address}, ${mk.price}`, keyboard: true, riseOnHover: true });
      pin.bindPopup(() => popupContent(mk), { className: 'nnv-popup', maxWidth: 260, autoPanPadding: [30, 60], closeButton: true });
      pin.on('popupopen', () => setActive(mk.id)).on('popupclose', () => setActive((a) => (a === mk.id ? null : a)));
      pin.addTo(m);
      layers.current.set(mk.id, pin);
    }
    if (markers.length) {
      const b = boundsFor(markers);
      m.fitBounds([[b.south, b.west], [b.north, b.east]], { padding: [48, 48], maxZoom: 15, animate: false });
    }
    const upd = () => { const bb = m.getBounds(); setVisible(markers.filter((x) => inBounds(x, { south: bb.getSouth(), north: bb.getNorth(), west: bb.getWest(), east: bb.getEast() }))); };
    upd();
    m.on('moveend', upd);
    return () => { m.off('moveend', upd); };
  }, [markers]);

  // Het actieve huisje licht op.
  useEffect(() => {
    layers.current.forEach((pin, id) => pin.getElement()?.classList.toggle('nnv-pin--on', id === active));
  }, [active, visible]);

  // Zoeken op plaats, straat of postcode.
  useEffect(() => {
    if (q.trim().length < 2) { setPlaces([]); return; }
    const t = setTimeout(() => {
      fetch(`/api/plaats?q=${encodeURIComponent(q.trim())}`).then((r) => (r.ok ? r.json() : { plaatsen: [] })).then((d: { plaatsen: Place[] }) => { setPlaces(d.plaatsen ?? []); setHighlight(-1); }).catch(() => setPlaces([]));
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  async function goTo(p: Place) {
    setOpen(false); setQ(p.label);
    const res = await fetch(`/api/plaats?id=${encodeURIComponent(p.id)}`).then((r) => (r.ok ? r.json() : null)).catch(() => null) as { lat: number; lng: number; zoom: number } | null;
    const L = lib.current, m = map.current;
    if (!res || !L || !m) return;
    dot.current?.remove();
    dot.current = L.marker([res.lat, res.lng], { icon: L.divIcon({ className: '', html: '<div class="nnv-search-dot"></div>', iconSize: [18, 18], iconAnchor: [9, 9] }), interactive: false, keyboard: false }).addTo(m);
    m.flyTo([res.lat, res.lng], res.zoom, { duration: 0.8 });
  }
  function select(id: string) {
    const pin = layers.current.get(id), m = map.current;
    if (!pin || !m) return;
    m.flyTo(pin.getLatLng(), Math.max(m.getZoom(), 15), { duration: 0.6 });
    m.once('moveend', () => pin.openPopup());
  }
  function onSearchKey(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setOpen(true); setHighlight((h) => Math.min(places.length - 1, h + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHighlight((h) => Math.max(0, h - 1)); }
    else if (e.key === 'Enter') { e.preventDefault(); const p = places[Math.max(0, highlight)]; if (p) void goTo(p); }
    else if (e.key === 'Escape') setOpen(false);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_20rem]">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-sand shadow-card">
        <div ref={el} className="h-[28rem] w-full lg:h-[40rem]" role="application" aria-label="Kaart met woningen" />
        <div className="absolute left-3 top-3 z-[500] w-[min(22rem,calc(100%-1.5rem))]">
          <div className="relative">
            <label htmlFor="kaart-zoek" className="sr-only">Zoek op plaats, straat of postcode</label>
            <Search size={16} aria-hidden className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted" />
            <input id="kaart-zoek" value={q} onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} onKeyDown={onSearchKey} autoComplete="off" role="combobox" aria-expanded={open && places.length > 0} aria-controls="kaart-plaatsen"
              placeholder="Zoek op plaats, straat of postcode" className="focus-ring w-full rounded-xl border border-line bg-white py-2.5 pl-10 pr-9 text-sm shadow-lg placeholder:text-muted/70" />
            {q && <button type="button" onClick={() => { setQ(''); setPlaces([]); dot.current?.remove(); }} aria-label="Zoekopdracht wissen" className="focus-ring absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted hover:bg-sand"><X size={15} aria-hidden /></button>}
          </div>
          {open && places.length > 0 && (
            <ul id="kaart-plaatsen" role="listbox" className="mt-1.5 max-h-64 overflow-auto rounded-xl border border-line bg-white p-1.5 shadow-lg">
              {places.map((p, i) => (
                <li key={p.id} role="option" aria-selected={i === highlight}>
                  <button type="button" onClick={() => void goTo(p)} onMouseEnter={() => setHighlight(i)} className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm ${i === highlight ? 'bg-brand-soft text-brand-dark' : ''}`}>
                    <MapPin size={15} aria-hidden className="shrink-0 text-muted" /><span className="truncate">{p.label}</span><span className="ml-auto shrink-0 text-xs text-muted">{p.type}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
        {state.loading && <div role="status" className="absolute bottom-3 left-3 z-[500] inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow"><Loader2 size={14} className="animate-spin" aria-hidden /> Woningen laden…</div>}
        {state.error && <p role="alert" className="absolute inset-x-3 bottom-3 z-[500] rounded-xl bg-red-50 p-3 text-sm text-red-800 shadow">{state.error}</p>}
      </div>

      <aside aria-label="Woningen in beeld" className="flex max-h-[40rem] flex-col rounded-2xl border border-line bg-white shadow-card">
        <div className="border-b border-line px-4 py-3">
          <p className="font-bold">{visible.length} {visible.length === 1 ? 'woning' : 'woningen'} in beeld</p>
          <p className="text-xs text-muted">{state.total} in totaal{state.missing > 0 ? ` · ${state.missing} nog zonder kaartlocatie (zie de lijst)` : ''}</p>
        </div>
        <ul className="flex-1 divide-y divide-line overflow-y-auto">
          {visible.slice(0, 60).map((m) => (
            <li key={m.id}>
              <button type="button" onClick={() => select(m.id)} onMouseEnter={() => setActive(m.id)} onMouseLeave={() => setActive(null)}
                className={`flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-brand-soft ${active === m.id ? 'bg-brand-soft' : ''}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {m.photo ? <img src={m.photo} alt="" loading="lazy" className="h-14 w-[4.5rem] shrink-0 rounded-lg object-cover" /> : <span className="h-14 w-[4.5rem] shrink-0 rounded-lg bg-sand" />}
                <span className="min-w-0"><span className="block text-sm font-extrabold text-brand">{m.price}</span><span className="block truncate text-sm font-semibold">{m.address}</span><span className="block truncate text-xs text-muted">{m.place}</span></span>
              </button>
            </li>
          ))}
          {visible.length === 0 && !state.loading && <li className="p-6 text-center text-sm text-muted">Geen woningen in dit deel van de kaart. Zoom uit of schuif de kaart.</li>}
        </ul>
      </aside>
    </div>
  );
}
