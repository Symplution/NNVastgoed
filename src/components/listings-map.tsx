'use client';

import { Loader2, MapPin, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Map as MlMap, Marker, Popup } from 'maplibre-gl';
import type { MapMarker } from '@/lib/data';
import type { Place } from '@/lib/geo';
import { boundsFor, inBounds, spread } from '@/lib/map';
import { createMap, type Ml } from './maplibre';
import { pinElement, popupContent } from './map-pin';

interface Pin { marker: Marker; popup: Popup; el: HTMLElement }

/**
 * Alle woningen van de zoekopdracht op de kaart, met een huisje en de prijs. Je kunt vrij schuiven en zoomen: over heel Europa,
 * en in Nederland tot op de straat. Zoeken op plaats, straat of postcode vliegt erheen; rechts staan de woningen die in beeld zijn.
 */
export function ListingsMap({ soort, qs }: { soort: string; qs: string }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<MlMap | null>(null);
  const lib = useRef<Ml | null>(null);
  const pins = useRef(new Map<string, Pin>());
  const dot = useRef<Marker | null>(null);
  const [ready, setReady] = useState(false);
  const [mapError, setMapError] = useState('');
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
    let watch: ResizeObserver | null = null;
    const pinMap = pins.current;
    (async () => {
      if (!el.current) return;
      try {
        const { map: m, ml } = await createMap(el.current);
        if (dead) { m.remove(); return; }
        map.current = m; lib.current = ml;
        watch = new ResizeObserver(() => m.resize());
        watch.observe(el.current);
        m.once('load', () => setReady(true));
        setReady(true);
      } catch { if (!dead) setMapError('Je browser kan de kaart niet tonen (WebGL is nodig). Gebruik de lijstweergave.'); }
    })();
    return () => { dead = true; watch?.disconnect(); pinMap.forEach((p) => p.marker.remove()); pinMap.clear(); map.current?.remove(); map.current = null; };
  }, []);

  // Huisjes plaatsen zodra de woningen en de kaart er zijn.
  useEffect(() => {
    const ml = lib.current, m = map.current;
    if (!ready || !ml || !m) return;
    pins.current.forEach((p) => p.marker.remove());
    pins.current.clear();
    for (const mk of markers) {
      const elPin = pinElement(mk);
      const popup = new ml.Popup({ offset: [0, -40], closeButton: true, maxWidth: '260px', className: 'nnv-popup' }).setDOMContent(popupContent(mk));
      popup.on('open', () => setActive(mk.id));
      popup.on('close', () => setActive((a) => (a === mk.id ? null : a)));
      const marker = new ml.Marker({ element: elPin, anchor: 'bottom' }).setLngLat([mk.lng, mk.lat]).setPopup(popup).addTo(m);
      elPin.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); marker.togglePopup(); } });
      pins.current.set(mk.id, { marker, popup, el: elPin });
    }
    if (markers.length) {
      const b = boundsFor(markers);
      m.fitBounds([[b.west, b.south], [b.east, b.north]], { padding: 56, maxZoom: 15, duration: 0 });
    }
    const upd = () => { const bb = m.getBounds(); setVisible(markers.filter((x) => inBounds(x, { south: bb.getSouth(), north: bb.getNorth(), west: bb.getWest(), east: bb.getEast() }))); };
    upd();
    m.on('moveend', upd);
    return () => { m.off('moveend', upd); };
  }, [markers, ready]);

  // Het actieve huisje licht op.
  useEffect(() => { pins.current.forEach((p, id) => p.el.classList.toggle('nnv-pin--on', id === active)); }, [active, visible]);

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
    const ml = lib.current, m = map.current;
    if (!res || !ml || !m) return;
    dot.current?.remove();
    const d = document.createElement('div'); d.className = 'nnv-search-dot';
    dot.current = new ml.Marker({ element: d }).setLngLat([res.lng, res.lat]).addTo(m);
    m.flyTo({ center: [res.lng, res.lat], zoom: res.zoom, duration: 1100, essential: true });
  }
  function select(id: string) {
    const pin = pins.current.get(id), m = map.current;
    if (!pin || !m) return;
    m.flyTo({ center: pin.marker.getLngLat(), zoom: Math.max(m.getZoom(), 16), duration: 900, essential: true });
    m.once('moveend', () => { if (!pin.popup.isOpen()) pin.marker.togglePopup(); });
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
        <div ref={el} className="h-[28rem] w-full lg:h-[40rem]" role="application" aria-label="Kaart met woningen. Schuif en zoom vrij, ook buiten Nederland." />
        <div className="absolute left-3 top-3 z-10 w-[min(22rem,calc(100%-1.5rem))]">
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
        {state.loading && <div role="status" className="absolute bottom-10 left-3 z-10 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold shadow"><Loader2 size={14} className="animate-spin" aria-hidden /> Woningen laden…</div>}
        {(state.error || mapError) && <p role="alert" className="absolute inset-x-3 bottom-10 z-10 rounded-xl bg-red-50 p-3 text-sm text-red-800 shadow">{mapError || state.error}</p>}
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
