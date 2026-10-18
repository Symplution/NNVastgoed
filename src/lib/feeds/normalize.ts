import { createHash } from 'node:crypto';
import { ENERGY_LABELS, PROPERTY_TYPES, categoryOfType } from '../types';
import { normalizePostcode, slugify } from '../format';
import { resolveProvince } from '../regions';
import type { IngestItem, Parsed } from './types';

// `scope` (het id van de koppeling) maakt de korte code in het webadres van een woning uniek.
// Het NNV-formaat: Nederlandse veldnamen, zodat elke makelaarssoftware of ICT-partner het kan sturen.
// Zie README ("Koppelingen") voor het volledige voorbeeld.
type Raw = Record<string, unknown>;

const TYPE_ALIAS: Record<string, string> = {
  flat: 'appartement', bovenwoning: 'appartement', benedenwoning: 'appartement', maisonnette: 'appartement', portiekwoning: 'appartement', penthouse: 'appartement', galerijflat: 'appartement',
  '2-onder-1-kap': 'twee-onder-een-kap', 'twee onder een kap': 'twee-onder-een-kap', geschakeld: 'twee-onder-een-kap', 'vrijstaande woning': 'vrijstaand', villa: 'vrijstaand',
  boerderij: 'woonboerderij', 'woon-boerderij': 'woonboerderij', rijtjeshuis: 'tussenwoning', 'rijwoning': 'tussenwoning', hoekhuis: 'hoekwoning', 'eindwoning': 'hoekwoning', grachtenpand: 'herenhuis',
  grond: 'bouwgrond', kavel: 'bouwgrond', woonschip: 'woonboot',
  kantoor: 'kantoorruimte', kantoorpand: 'kantoorruimte', bedrijfsruimte: 'bedrijfshal', bedrijfspand: 'bedrijfshal', hal: 'bedrijfshal', winkel: 'winkelruimte', winkelpand: 'winkelruimte', horeca: 'horecapand', restaurant: 'horecapand', cafe: 'horecapand',
  recreatie: 'recreatiewoning', vakantiewoning: 'recreatiewoning', vakantiehuis: 'recreatiewoning', recreatiebungalow: 'vakantiebungalow', bungalowpark: 'vakantiebungalow', caravan: 'stacaravan', 'chalet park': 'chalet',
};
const STATUS_ALIAS: Record<string, string> = {
  beschikbaar: 'beschikbaar', 'te koop': 'beschikbaar', 'onder bod': 'onder_bod', onder_bod: 'onder_bod', 'onder voorbehoud': 'onder_voorbehoud', onder_voorbehoud: 'onder_voorbehoud',
  'verkocht onder voorbehoud': 'onder_voorbehoud', verkocht: 'verkocht', ingetrokken: 'ingetrokken', concept: 'concept',
};

const str = (v: unknown, max = 200): string | undefined => {
  if (v === null || v === undefined) return undefined;
  const s = String(v).trim();
  return s ? s.slice(0, max) : undefined;
};
const num = (v: unknown): number | undefined => {
  if (v === null || v === undefined || v === '') return undefined;
  if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
  let s = String(v).trim().replace(/[€\s]/g, '').replace(/,-$/, '');
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');             // 1.250,50
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');           // 250.000
  const n = Number(s);
  return s !== '' && Number.isFinite(n) ? n : undefined;
};
const stripHtml = (s: string) => s.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>/gi, '\n\n').replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\n{3,}/g, '\n\n').trim();

export class RecordError extends Error {}

export function normalizeRecord(raw: Raw, scope: string): IngestItem {
  const externalId = str(raw.id, 100);
  if (!externalId) throw new RecordError('Het veld "id" ontbreekt.');
  const street = str(raw.straat, 120), houseNumber = str(raw.huisnummer, 12);
  const city = str(raw.plaats, 80);
  if (!street || !houseNumber || !city) throw new RecordError('Straat, huisnummer en plaats zijn verplicht.');

  const postcode = normalizePostcode(str(raw.postcode, 10) ?? '');
  if (!/^[1-9]\d{3} [A-Z]{2}$/.test(postcode)) throw new RecordError('De postcode is geen geldige Nederlandse postcode.');
  const province = resolveProvince(str(raw.provincie), city);
  if (!province) throw new RecordError('NNvastgoed toont alleen woningen in Groningen, Friesland en Drenthe.');

  const price = num(raw.vraagprijs);
  if (price === undefined || price < 0 || price > 100_000_000) throw new RecordError('De vraagprijs ontbreekt of is ongeldig.');
  const area = num(raw.woonoppervlakte);
  if (area === undefined || area <= 0 || area > 10_000) throw new RecordError('De woonoppervlakte ontbreekt of is ongeldig.');
  const rooms = num(raw.kamers);
  if (rooms === undefined || rooms < 0 || rooms > 100) throw new RecordError('Het aantal kamers ontbreekt of is ongeldig.');

  const typeIn = (str(raw.type) ?? 'overig').toLowerCase();
  const propertyType = TYPE_ALIAS[typeIn] ?? typeIn;
  if (!(PROPERTY_TYPES as readonly string[]).includes(propertyType)) throw new RecordError(`Onbekend woningtype "${typeIn}".`);

  const statusIn = (str(raw.status) ?? 'beschikbaar').toLowerCase();
  const status = STATUS_ALIAS[statusIn];
  if (!status) throw new RecordError(`Onbekende status "${statusIn}".`);

  const label = str(raw.energielabel, 6)?.toUpperCase();
  const lat = num(raw.lat), lng = num(raw.lng);
  const offerIn = (str(raw.aanbod) ?? 'koop').toLowerCase();
  if (!['koop', 'huur', 'te koop', 'te huur'].includes(offerIn)) throw new RecordError(`Onbekend aanbod "${offerIn}" (koop of huur).`);
  const offer = offerIn.endsWith('huur') ? 'huur' : 'koop';
  if (offer === 'huur' && price > 100_000) throw new RecordError('De huurprijs is per maand; een bedrag boven € 100.000 klopt niet.');
  const category = categoryOfType(propertyType);
  // Bij huur is de prijs per maand; bij koop kosten koper of vrij op naam.
  const priceType = offer === 'huur' ? 'p.m.' : str(raw.prijs_type)?.toLowerCase() === 'v.o.n.' ? 'v.o.n.' : 'k.k.';
  const newBuild = raw.nieuwbouw === true || ['ja', 'true', '1'].includes(String(raw.nieuwbouw ?? '').toLowerCase());

  const photos: IngestItem['photos'] = [];
  for (const p of Array.isArray(raw.fotos) ? raw.fotos : []) {
    const o = (typeof p === 'string' ? { url: p } : p) as Raw;
    const url = str(o?.url, 1000);
    // Alleen https: geen javascript:, data: of onbeveiligde adressen.
    if (url && /^https:\/\/[^\s]+$/i.test(url) && photos.length < 40) photos.push({ url, ...(str(o.omschrijving, 160) ? { alt: str(o.omschrijving, 160) } : {}) });
  }
  const features = (Array.isArray(raw.kenmerken) ? raw.kenmerken : []).map((k) => str(k, 80)).filter((k): k is string => Boolean(k)).slice(0, 60);

  const suffix = str(raw.toevoeging, 12) ?? null;
  const hash = createHash('sha1').update(`${scope}:${externalId}`).digest('hex').slice(0, 8);
  return {
    slug: `${slugify(`${street} ${houseNumber}${suffix ?? ''} ${city}`)}-${hash}`,
    external_id: externalId,
    status: status as IngestItem['status'], offer, category, new_build: newBuild,
    street, house_number: houseNumber, house_suffix: suffix, postcode, city, province, neighbourhood: str(raw.wijk, 80) ?? null,
    lat: lat !== undefined && lat >= 50 && lat <= 54 ? lat : null,
    lng: lng !== undefined && lng >= 3 && lng <= 8 ? lng : null,
    asking_price: Math.round(price), price_type: priceType,
    living_area: Math.round(area), plot_area: num(raw.perceeloppervlakte) !== undefined ? Math.max(0, Math.round(num(raw.perceeloppervlakte)!)) : null,
    rooms: Math.round(rooms), bedrooms: Math.max(0, Math.round(num(raw.slaapkamers) ?? 0)), bathrooms: Math.max(0, Math.round(num(raw.badkamers) ?? 1)),
    build_year: (() => { const y = num(raw.bouwjaar); return y !== undefined && y >= 1200 && y <= 2100 ? Math.round(y) : null; })(),
    property_type: propertyType,
    energy_label: label && (ENERGY_LABELS as readonly string[]).includes(label) ? label : null,
    description: stripHtml(str(raw.omschrijving, 20_000) ?? ''),
    features, photos,
  };
}

export const MAX_ITEMS = 500;

/** Elke woning apart controleren: een foute woning blokkeert de rest niet. */
export function normalizeAll(records: unknown[], scope: string): Parsed {
  const items: IngestItem[] = [], rejected: Parsed['rejected'] = [];
  const seen = new Set<string>();
  records.slice(0, MAX_ITEMS).forEach((r, index) => {
    try {
      if (!r || typeof r !== 'object') throw new RecordError('Geen geldig object.');
      const item = normalizeRecord(r as Raw, scope);
      if (seen.has(item.external_id)) throw new RecordError('Dit id komt twee keer voor in dezelfde aanroep.');
      seen.add(item.external_id);
      items.push(item);
    } catch (e) {
      if (!(e instanceof RecordError)) throw e;
      rejected.push({ index, external_id: (r as Raw | null)?.id !== undefined ? String((r as Raw).id).slice(0, 100) : undefined, reason: e.message });
    }
  });
  if (records.length > MAX_ITEMS) rejected.push({ index: MAX_ITEMS, reason: `Maximaal ${MAX_ITEMS} woningen per aanroep; de rest is genegeerd.` });
  return { items, rejected };
}
