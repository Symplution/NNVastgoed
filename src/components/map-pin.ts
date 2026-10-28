import type { MapMarker } from '@/lib/data';
import { shortPrice } from '@/lib/map';

const SVG_NS = 'http://www.w3.org/2000/svg';

function houseIcon(): SVGElement {
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('viewBox', '0 0 24 24'); svg.setAttribute('fill', 'none'); svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2.4'); svg.setAttribute('stroke-linecap', 'round'); svg.setAttribute('stroke-linejoin', 'round'); svg.setAttribute('aria-hidden', 'true');
  for (const d of ['M3 11.5 12 4l9 7.5', 'M5.5 10v9.5h13V10', 'M10 19.5v-5h4v5']) { const p = document.createElementNS(SVG_NS, 'path'); p.setAttribute('d', d); svg.appendChild(p); }
  return svg;
}

/** Het huisje met de prijs op de kaart. Gebouwd met DOM-knopen; de prijs komt als tekst binnen, nooit als HTML. */
export function pinElement(m: MapMarker): HTMLElement {
  const root = document.createElement('div');
  root.className = `nnv-pin nnv-pin--${m.offer}`;
  root.setAttribute('role', 'button'); root.tabIndex = 0;
  root.setAttribute('aria-label', `${m.address}, ${m.price}`); root.title = `${m.address}, ${m.price}`;
  const body = document.createElement('div'); body.className = 'nnv-pin__body';
  const label = document.createElement('span'); label.textContent = shortPrice(m);
  body.append(houseIcon(), label);
  const tip = document.createElement('div'); tip.className = 'nnv-pin__tip';
  root.append(body, tip);
  return root;
}

/** De kaart bij een woning: een foto, de prijs en een link. */
export function popupContent(m: MapMarker): HTMLElement {
  const root = document.createElement('div');
  if (m.photo && /^(https:\/\/|\/api\/foto\/)/.test(m.photo)) {
    const img = document.createElement('img'); img.src = m.photo; img.alt = ''; img.loading = 'lazy';
    img.style.cssText = 'display:block;width:100%;height:120px;object-fit:cover';
    root.appendChild(img);
  }
  const body = document.createElement('div'); body.style.cssText = 'padding:12px 14px 14px;font:14px/1.35 -apple-system,BlinkMacSystemFont,Inter,system-ui,sans-serif;color:#14212b';
  const price = document.createElement('div'); price.textContent = m.price; price.style.cssText = 'font-size:17px;font-weight:800;color:#1f4d3f';
  const addr = document.createElement('div'); addr.textContent = m.address; addr.style.cssText = 'font-weight:700;margin-top:2px';
  const place = document.createElement('div'); place.textContent = m.place; place.style.cssText = 'color:#5d6b76;font-size:13px';
  const line = document.createElement('div'); line.textContent = m.line; line.style.cssText = 'margin-top:4px;font-size:13px';
  const link = document.createElement('a'); link.href = `/woning/${encodeURIComponent(m.slug)}`; link.textContent = 'Bekijk de woning →';
  link.style.cssText = 'display:inline-block;margin-top:10px;background:#1f4d3f;color:#fff;border-radius:8px;padding:7px 12px;font-weight:700;font-size:13px;text-decoration:none';
  body.append(price, addr, place, line, link);
  root.appendChild(body);
  return root;
}
