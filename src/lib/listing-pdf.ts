import { isIP } from 'node:net';
import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFImage, type PDFPage } from 'pdf-lib';
import sharp from 'sharp';
import { exampleSvg } from './example-photo';
import { OFFER_LABEL, STATUS_LABEL, TYPE_LABEL, address, formatDate, formatNumber, formatPrice } from './format';
import { provinceName } from './regions';
import type { Listing, Office } from './types';

// Intern pdf-overzicht van een woning voor makelaars: logo's, foto's, kenmerken, de volledige tekst en de contactgegevens.
// Bewust met pdf-lib: geen browser nodig, dus het werkt ook in een Vercel-functie.

const A4 = { w: 595.28, h: 841.89 };
const M = 40;                       // marge
const BOTTOM = 92;                  // onder deze hoogte komt de voettekst
const C = { brand: rgb(0.055, 0.29, 0.431), accent: rgb(0.91, 0.455, 0.12), ink: rgb(0.1, 0.13, 0.16), muted: rgb(0.38, 0.43, 0.47), line: rgb(0.89, 0.91, 0.93), sand: rgb(0.965, 0.945, 0.917), white: rgb(1, 1, 1), soft: rgb(0.86, 0.92, 0.96) };

/** Alleen tekens die de standaardlettertypen (WinAnsi) kennen; de rest wordt een vraagteken, zodat een pdf nooit stukgaat op een vreemd teken. */
export const safeText = (s: string) => s.normalize('NFC').replace(/\t/g, ' ').replace(/[^\x20-\x7E\xA0-\xFF€‘’“”–—•…\n]/g, '?');

/** Alleen https, en geen adressen binnen een netwerk (localhost, privé-adressen): de server haalt hiermee foto's op. */
export function isFetchableUrl(raw: string): boolean {
  let u: URL;
  try { u = new URL(raw); } catch { return false; }
  if (u.protocol !== 'https:') return false;
  const h = u.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (h === 'localhost' || h.endsWith('.localhost') || h.endsWith('.local') || h.endsWith('.internal')) return false;
  if (isIP(h)) return false;
  return true;
}

async function fetchBytes(url: string, max = 10 * 1024 * 1024): Promise<Buffer | null> {
  if (!isFetchableUrl(url)) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000), redirect: 'error' });
    if (!res.ok || !(res.headers.get('content-type') ?? '').startsWith('image/')) return null;
    const len = Number(res.headers.get('content-length') ?? 0);
    if (len > max) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return buf.length > max ? null : buf;
  } catch { return null; }
}

/** Een foto als jpeg op de gevraagde maat (uitgesneden, nooit uitgerekt). De voorbeeldfoto's van de site komen rechtstreeks uit de code. */
export async function loadPhoto(url: string, w: number, h: number): Promise<Buffer | null> {
  try {
    const example = url.match(/^\/api\/foto\/([a-z0-9-]{1,90})$/);
    const src = example ? Buffer.from(exampleSvg(example[1])) : await fetchBytes(url);
    if (!src) return null;
    return await sharp(src, { density: example ? 144 : 72 }).rotate().resize(w, h, { fit: 'cover' }).jpeg({ quality: 82 }).toBuffer();
  } catch { return null; }
}
async function loadLogo(url: string): Promise<Buffer | null> {
  const src = await fetchBytes(url, 4 * 1024 * 1024);
  if (!src) return null;
  try { return await sharp(src).resize(520, 170, { fit: 'inside', withoutEnlargement: true }).png().toBuffer(); } catch { return null; }
}

const rrectPath = (w: number, h: number, r: number) => `M${r},0 H${w - r} Q${w},0 ${w},${r} V${h - r} Q${w},${h} ${w - r},${h} H${r} Q0,${h} 0,${h - r} V${r} Q0,0 ${r},0 Z`;

class Doc {
  pdf!: PDFDocument; reg!: PDFFont; bold!: PDFFont;
  pages: PDFPage[] = []; page!: PDFPage; y = 0;
  headline = '';

  static async create(headline: string) {
    const d = new Doc();
    d.pdf = await PDFDocument.create(); d.reg = await d.pdf.embedFont(StandardFonts.Helvetica); d.bold = await d.pdf.embedFont(StandardFonts.HelveticaBold);
    d.headline = headline;
    return d;
  }
  newPage(running = true) {
    this.page = this.pdf.addPage([A4.w, A4.h]); this.pages.push(this.page); this.y = A4.h - M;
    if (running) {
      this.nnvLogo(M, A4.h - 30, 0.7);
      this.page.drawText(safeText(this.headline), { x: A4.w - M - this.reg.widthOfTextAtSize(safeText(this.headline), 8.5), y: A4.h - 44, size: 8.5, font: this.reg, color: C.muted });
      this.page.drawLine({ start: { x: M, y: A4.h - 56 }, end: { x: A4.w - M, y: A4.h - 56 }, thickness: 0.6, color: C.line });
      this.y = A4.h - 78;
    }
  }
  ensure(h: number) { if (this.y - h < BOTTOM) this.newPage(); }

  /** Het woordmerk van NNvastgoed: huisje op een golf, met de naam ernaast. (x, yTop) is de linkerbovenhoek. */
  nnvLogo(x: number, yTop: number, s = 1) {
    const p = this.page;
    p.drawSvgPath(rrectPath(34, 34, 9), { x, y: yTop, scale: s, color: C.brand });
    p.drawSvgPath('M7 16.5 L17 8 L27 16.5', { x, y: yTop, scale: s, borderColor: C.accent, borderWidth: 2.6 * s, borderLineCap: 1 });
    p.drawSvgPath('M9 17 V24 H25 V17', { x, y: yTop, scale: s, borderColor: C.white, borderWidth: 2.2 * s });
    p.drawSvgPath('M5 27.5 C8 25.3 10 25.3 13 27.5 S18 29.7 21 27.5 S26 25.3 29 27.5', { x, y: yTop, scale: s, borderColor: rgb(0.61, 0.78, 0.88), borderWidth: 1.8 * s });
    p.drawText('NNvastgoed', { x: x + 44 * s, y: yTop - 18 * s, size: 17 * s, font: this.bold, color: C.brand });
    p.drawText('NOORD NEDERLAND VASTGOED', { x: x + 44 * s, y: yTop - 29 * s, size: 6.2 * s, font: this.bold, color: C.muted });
  }

  text(t: string, o: { x?: number; size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; width?: number; lead?: number } = {}) {
    const size = o.size ?? 10, font = o.font ?? this.reg, lead = o.lead ?? size * 1.45, x = o.x ?? M, width = o.width ?? A4.w - 2 * M;
    for (const line of wrap(safeText(t), font, size, width)) {
      this.ensure(lead);
      if (line) this.page.drawText(line, { x, y: this.y - size, size, font, color: o.color ?? C.ink });
      this.y -= lead;
    }
  }
  heading(t: string) { this.ensure(40); this.y -= 8; this.page.drawText(safeText(t), { x: M, y: this.y - 13, size: 13, font: this.bold, color: C.brand }); this.page.drawRectangle({ x: M, y: this.y - 20, width: 28, height: 2.2, color: C.accent }); this.y -= 34; }
}

function wrap(text: string, font: PDFFont, size: number, max: number): string[] {
  const out: string[] = [];
  for (const para of text.split('\n')) {
    if (!para.trim()) { out.push(''); continue; }
    let line = '';
    for (let word of para.split(/\s+/)) {
      while (font.widthOfTextAtSize(word, size) > max) {   // een woord dat niet past, wordt afgebroken
        let k = word.length; while (k > 1 && font.widthOfTextAtSize(word.slice(0, k), size) > max) k--;
        if (line) { out.push(line); line = ''; }
        out.push(word.slice(0, k)); word = word.slice(k);
      }
      const next = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(next, size) <= max) line = next; else { out.push(line); line = word; }
    }
    if (line) out.push(line);
  }
  return out;
}

export interface PdfInput { listing: Listing; office: Office; now?: Date }

export async function buildListingPdf({ listing: l, office, now = new Date() }: PdfInput): Promise<Uint8Array> {
  const title = `${address(l)}, ${l.city}`;
  const d = await Doc.create(title);
  d.pdf.setTitle(`${title} (overzicht)`); d.pdf.setAuthor(office.name); d.pdf.setProducer('NNvastgoed'); d.pdf.setCreator('NNvastgoed'); d.pdf.setCreationDate(now);
  const embed = async (buf: Buffer | null, kind: 'jpg' | 'png'): Promise<PDFImage | null> => (buf ? (kind === 'png' ? d.pdf.embedPng(buf) : d.pdf.embedJpg(buf)).catch(() => null) : null);

  // Foto's en logo ophalen (de eerste is de hoofdfoto).
  const photos = l.photos.slice(0, 16);
  const [hero, ...rest] = await Promise.all(photos.map((p, i) => loadPhoto(p.url, i === 0 ? 1236 : 618, i === 0 ? 640 : 420)));
  const logoBuf = office.logoUrl ? await loadLogo(office.logoUrl) : null;
  const heroImg = await embed(hero ?? null, 'jpg');
  const logoImg = await embed(logoBuf, 'png');

  // ── Pagina 1: kop met beide logo's ──
  d.newPage(false);
  const p1 = d.page;
  d.nnvLogo(M, A4.h - 36, 1.1);
  if (logoImg) {
    const sc = Math.min(160 / logoImg.width, 52 / logoImg.height);
    p1.drawImage(logoImg, { x: A4.w - M - logoImg.width * sc, y: A4.h - 36 - 52 / 2 - (logoImg.height * sc) / 2 + 12, width: logoImg.width * sc, height: logoImg.height * sc });
  } else {
    const n = safeText(office.name), size = 13;
    p1.drawText(n, { x: A4.w - M - d.bold.widthOfTextAtSize(n, size), y: A4.h - 52, size, font: d.bold, color: C.brand });
  }
  p1.drawLine({ start: { x: M, y: A4.h - 84 }, end: { x: A4.w - M, y: A4.h - 84 }, thickness: 0.8, color: C.line });
  d.y = A4.h - 100;

  // Hoofdfoto
  const heroH = 250;
  if (heroImg) { p1.drawImage(heroImg, { x: M, y: d.y - heroH, width: A4.w - 2 * M, height: heroH }); }
  else { p1.drawRectangle({ x: M, y: d.y - heroH, width: A4.w - 2 * M, height: heroH, color: C.sand }); p1.drawText('Geen foto beschikbaar', { x: M + 16, y: d.y - heroH / 2, size: 11, font: d.reg, color: C.muted }); }
  d.y -= heroH + 20;

  // Titel links, contactkaart rechts
  const cardW = 190, titleW = A4.w - 2 * M - cardW - 18, top = d.y;
  const chips = [OFFER_LABEL[l.offer], ...(l.newBuild ? ['Nieuwbouw'] : []), ...(l.status !== 'beschikbaar' ? [STATUS_LABEL[l.status]] : [])];
  let cx = M;
  for (const c of chips) { const w = d.bold.widthOfTextAtSize(c, 8) + 14; p1.drawSvgPath(rrectPath(w, 16, 8), { x: cx, y: d.y, color: C.soft }); p1.drawText(c, { x: cx + 7, y: d.y - 11.5, size: 8, font: d.bold, color: C.brand }); cx += w + 6; }
  d.y -= 24;
  d.text(address(l), { size: 20, font: d.bold, color: C.ink, width: titleW, lead: 24 });
  d.text(`${l.postcode} ${l.city} · ${provinceName(l.province)}`, { size: 10.5, color: C.muted, width: titleW });
  d.y -= 6;
  d.text(formatPrice(l), { size: 19, font: d.bold, color: C.accent, width: titleW, lead: 24 });
  const titleBottom = d.y;

  // Contactkaart
  const lines: [string, boolean][] = [[office.name, true]];
  const addr = [office.street, [office.postcode, office.city].filter(Boolean).join(' ')].filter(Boolean).join(', ');
  if (addr) lines.push([addr, false]);
  if (office.phone) lines.push([`Tel. ${office.phone}`, false]);
  lines.push([office.email, false]);
  if (office.website) lines.push([office.website.replace(/^https:\/\//, ''), false]);
  const cardH = 38 + lines.reduce((n, [t, b]) => n + wrap(safeText(t), b ? d.bold : d.reg, 9, cardW - 24).length * 12.5, 0);
  const cardX = A4.w - M - cardW;
  p1.drawSvgPath(rrectPath(cardW, cardH, 10), { x: cardX, y: top, color: C.sand });
  p1.drawText('CONTACT', { x: cardX + 12, y: top - 17, size: 7.5, font: d.bold, color: C.accent });
  let cy = top - 31;
  for (const [t, b] of lines) for (const ln of wrap(safeText(t), b ? d.bold : d.reg, 9, cardW - 24)) { p1.drawText(ln, { x: cardX + 12, y: cy, size: 9, font: b ? d.bold : d.reg, color: b ? C.brand : C.ink }); cy -= 12.5; }
  d.y = Math.min(titleBottom, top - cardH) - 14;

  // ── Kenmerken ──
  const commercial = l.category === 'bedrijfsruimte';
  const facts: [string, string | null][] = [
    [commercial ? 'Oppervlakte' : 'Woonoppervlakte', `${formatNumber(l.livingArea)} m²`], ['Perceel', l.plotArea ? `${formatNumber(l.plotArea)} m²` : null],
    [commercial ? 'Soort bedrijfsruimte' : 'Soort woning', TYPE_LABEL[l.propertyType]], ['Bouwjaar', l.buildYear ? String(l.buildYear) : null],
    ['Kamers', l.rooms ? `${l.rooms}` : null], ['Slaapkamers', l.rooms ? `${l.bedrooms}` : null], ['Badkamers', l.rooms ? `${l.bathrooms}` : null],
    ['Energielabel', l.energyLabel ?? null], ['Buurt', l.neighbourhood ?? null], ['Aangeboden sinds', l.publishedAt ? formatDate(l.publishedAt) : null],
    ['Status', STATUS_LABEL[l.status]], ['Nieuwbouw', l.newBuild ? 'Ja' : null],
  ];
  const shown = facts.filter((f): f is [string, string] => Boolean(f[1]));
  const colW = (A4.w - 2 * M) / 3, rowH = 34;
  d.heading('Kenmerken');
  for (let i = 0; i < shown.length; i += 3) {
    d.ensure(rowH);
    shown.slice(i, i + 3).forEach(([k, v], j) => {
      const x = M + j * colW;
      d.page.drawText(safeText(k.toUpperCase()), { x, y: d.y - 9, size: 7, font: d.bold, color: C.muted });
      d.page.drawText(safeText(v), { x, y: d.y - 23, size: 11, font: d.bold, color: C.ink });
    });
    d.y -= rowH;
  }

  // ── Omschrijving (volledig) ──
  if (l.description.trim()) { d.heading('Omschrijving'); d.text(l.description.trim(), { size: 10, lead: 14.5 }); }

  // ── Voorzieningen ──
  if (l.features.length) {
    d.heading('Voorzieningen');
    const half = Math.ceil(l.features.length / 2), w = (A4.w - 2 * M) / 2 - 8;
    for (let i = 0; i < half; i++) {
      d.ensure(16);
      [l.features[i], l.features[i + half]].forEach((t, j) => { if (t) { d.page.drawCircle({ x: M + j * (w + 16) + 3, y: d.y - 6, size: 1.8, color: C.accent }); d.page.drawText(safeText(t).slice(0, 80), { x: M + j * (w + 16) + 12, y: d.y - 9, size: 10, font: d.reg, color: C.ink }); } });
      d.y -= 16;
    }
  }

  // ── Video ──
  if (l.videoUrl) {
    d.heading('Video');
    d.text('Bij deze woning hoort een video. Bekijk hem op de woningpagina of via dit adres:', { size: 10 });
    d.text(l.videoUrl, { size: 9, color: C.brand });
  }

  // ── Alle foto's ──
  const extra = rest;
  if (extra.length) {
    d.heading(`Foto’s (${photos.length})`);
    const w = (A4.w - 2 * M - 14) / 2, h = w * 0.68;
    for (let i = 0; i < extra.length; i += 2) {
      d.ensure(h + 12);
      for (let j = 0; j < 2 && i + j < extra.length; j++) {
        const img = await embed(extra[i + j], 'jpg');
        const x = M + j * (w + 14);
        if (img) d.page.drawImage(img, { x, y: d.y - h, width: w, height: h });
        else d.page.drawRectangle({ x, y: d.y - h, width: w, height: h, color: C.sand });
      }
      d.y -= h + 12;
    }
  }

  // ── Voettekst op elke pagina ──
  const n = d.pages.length, stamp = new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' }).format(now);
  d.pages.forEach((pg, i) => {
    pg.drawLine({ start: { x: M, y: 66 }, end: { x: A4.w - M, y: 66 }, thickness: 0.6, color: C.line });
    const contact = [office.name, office.phone, office.email].filter(Boolean).join('  ·  ');
    pg.drawText(safeText(contact), { x: M, y: 49, size: 8.5, font: d.bold, color: C.brand });
    pg.drawText(safeText([addr, office.website?.replace(/^https:\/\//, '')].filter(Boolean).join('  ·  ')), { x: M, y: 37, size: 8, font: d.reg, color: C.muted });
    pg.drawText(`Pagina ${i + 1} van ${n}`, { x: A4.w - M - d.reg.widthOfTextAtSize(`Pagina ${i + 1} van ${n}`, 8), y: 49, size: 8, font: d.reg, color: C.muted });
    const note = `Intern overzicht · ${stamp} · Niet voor publicatie`;
    pg.drawText(note, { x: A4.w - M - d.reg.widthOfTextAtSize(note, 7.5), y: 37, size: 7.5, font: d.reg, color: C.muted });
  });

  return d.pdf.save();
}
