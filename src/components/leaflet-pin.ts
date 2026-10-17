import type * as Leaflet from 'leaflet';
import type { MapMarker } from '@/lib/data';
import { shortPrice } from '@/lib/map';

const HOUSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v9.5h13V10"/><path d="M10 19.5v-5h4v5"/></svg>';
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/** Het huisje met de prijs op de kaart. */
export function pinIcon(L: typeof Leaflet, m: MapMarker): Leaflet.DivIcon {
  return L.divIcon({
    className: `nnv-pin nnv-pin--${m.offer}`, iconSize: [0, 0], iconAnchor: [0, 0],
    html: `<div class="nnv-pin__wrap"><div class="nnv-pin__body">${HOUSE}<span>${esc(shortPrice(m))}</span></div><div class="nnv-pin__tip"></div></div>`,
  });
}

/** De kaart bij een woning: een foto, de prijs en een link. Gebouwd met DOM-knopen, nooit met losse tekst, zodat niets uitgevoerd kan worden. */
export function popupContent(m: MapMarker): HTMLElement {
  const root = document.createElement('div');
  if (m.photo && /^(https:\/\/|\/api\/foto\/)/.test(m.photo)) {
    const img = document.createElement('img'); img.src = m.photo; img.alt = ''; img.loading = 'lazy';
    img.style.cssText = 'display:block;width:100%;height:120px;object-fit:cover';
    root.appendChild(img);
  }
  const body = document.createElement('div'); body.style.cssText = 'padding:12px 14px 14px;font:14px/1.35 -apple-system,BlinkMacSystemFont,Inter,system-ui,sans-serif;color:#14212b';
  const price = document.createElement('div'); price.textContent = m.price; price.style.cssText = 'font-size:17px;font-weight:800;color:#0e4a6e';
  const addr = document.createElement('div'); addr.textContent = m.address; addr.style.cssText = 'font-weight:700;margin-top:2px';
  const place = document.createElement('div'); place.textContent = m.place; place.style.cssText = 'color:#5d6b76;font-size:13px';
  const line = document.createElement('div'); line.textContent = m.line; line.style.cssText = 'margin-top:4px;font-size:13px';
  const link = document.createElement('a'); link.href = `/woning/${encodeURIComponent(m.slug)}`; link.textContent = 'Bekijk de woning →';
  link.style.cssText = 'display:inline-block;margin-top:10px;background:#0e4a6e;color:#fff;border-radius:8px;padding:7px 12px;font-weight:700;font-size:13px;text-decoration:none';
  body.append(price, addr, place, line, link);
  root.appendChild(body);
  return root;
}
