import { ENERGY_LABELS, PROPERTY_TYPES, STATUSES, categoryOfType, type Photo } from './types';
import { normalizePostcode } from './format';
import { isProvince } from './regions';

export interface ListingInput {
  offer: 'koop' | 'huur'; category: 'woning' | 'bedrijfsruimte' | 'recreatie'; new_build: boolean;
  status: string; street: string; house_number: string; house_suffix: string | null; postcode: string; city: string; province: string; neighbourhood: string | null;
  lat: number | null; lng: number | null; asking_price: number; price_type: 'k.k.' | 'v.o.n.' | 'p.m.'; living_area: number; plot_area: number | null;
  rooms: number; bedrooms: number; bathrooms: number; build_year: number | null; property_type: string; energy_label: string | null;
  description: string; features: string[]; photos: Photo[]; video_url: string | null; floorplans: Photo[]; photos_360: Photo[];
}
export type ListingResult = { ok: true; value: ListingInput } | { ok: false; errors: string[] };

const text = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const optNum = (f: FormData, k: string) => { const v = text(f, k).replace(',', '.'); if (!v) return null; const n = Number(v); return Number.isFinite(n) ? n : NaN; };

/** Controle van het woningformulier in het beheer. De database controleert daarna nog eens (constraints + RLS). */
export function validateListing(f: FormData): ListingResult {
  const errors: string[] = [];
  const need = (cond: boolean, msg: string) => { if (!cond) errors.push(msg); };
  const status = text(f, 'status') || 'concept';
  const street = text(f, 'street'), houseNumber = text(f, 'house_number'), city = text(f, 'city');
  const postcode = normalizePostcode(text(f, 'postcode'));
  const province = text(f, 'province');
  const price = optNum(f, 'asking_price'), area = optNum(f, 'living_area'), rooms = optNum(f, 'rooms');
  const bedrooms = optNum(f, 'bedrooms') ?? 0, bathrooms = optNum(f, 'bathrooms') ?? 1;
  const plot = optNum(f, 'plot_area'), year = optNum(f, 'build_year'), lat = optNum(f, 'lat'), lng = optNum(f, 'lng');
  const type = text(f, 'property_type'), label = text(f, 'energy_label');
  const offer = text(f, 'offer') === 'huur' ? 'huur' : 'koop';
  const category = categoryOfType(type);   // volgt uit de soort
  // Bij huur is de prijs per maand; bij koop kosten koper of vrij op naam.
  const priceType = offer === 'huur' ? 'p.m.' : text(f, 'price_type') === 'v.o.n.' ? 'v.o.n.' : 'k.k.';
  const newBuild = f.get('new_build') === 'on';

  need((STATUSES as readonly string[]).includes(status), 'Kies een geldige status.');
  need(street.length > 0 && street.length <= 120, 'Vul de straat in.');
  need(/^\d+[A-Za-z0-9\-]{0,10}$/.test(houseNumber.replace(/\s/g, '')) && houseNumber.length <= 12, 'Vul een geldig huisnummer in.');
  need(/^[1-9]\d{3} [A-Z]{2}$/.test(postcode), 'Vul een geldige postcode in, bijvoorbeeld 9711 AB.');
  need(city.length > 0 && city.length <= 80, 'Vul de plaats in.');
  need(isProvince(province), 'Kies Groningen, Friesland of Drenthe. NNvastgoed toont alleen woningen in het noorden.');
  need(price !== null && Number.isInteger(price) && price >= 0 && price <= 100_000_000, offer === 'huur' ? 'Vul de huurprijs per maand in (hele euro’s).' : 'Vul een vraagprijs in (hele euro’s).');
  need(offer === 'koop' || (price !== null && price <= 100_000), 'Een huurprijs per maand van meer dan € 100.000 klopt niet.');
  need(area !== null && Number.isInteger(area) && area > 0 && area <= 10_000, 'Vul de woonoppervlakte in (hele m²).');
  need(rooms !== null && Number.isInteger(rooms) && rooms >= 0 && rooms <= 100, 'Vul het aantal kamers in (bij bedrijfsruimte 0).');
  need(Number.isInteger(bedrooms) && bedrooms >= 0 && bedrooms <= 50, 'Het aantal slaapkamers klopt niet.');
  need(Number.isInteger(bathrooms) && bathrooms >= 0 && bathrooms <= 50, 'Het aantal badkamers klopt niet.');
  need(plot === null || (Number.isInteger(plot) && plot >= 0), 'De perceeloppervlakte klopt niet.');
  need(year === null || (Number.isInteger(year) && year >= 1200 && year <= 2100), 'Het bouwjaar klopt niet.');
  need(lat === null || (lat >= 50 && lat <= 54), 'De breedtegraad ligt buiten Nederland.');
  need(lng === null || (lng >= 3 && lng <= 8), 'De lengtegraad ligt buiten Nederland.');
  need((PROPERTY_TYPES as readonly string[]).includes(type), 'Kies een soort woning.');
  need(!label || (ENERGY_LABELS as readonly string[]).includes(label), 'Kies een geldig energielabel.');

  const description = text(f, 'description');
  need(description.length <= 20_000, 'De omschrijving is te lang.');
  const features = text(f, 'features').split('\n').map((s) => s.trim()).filter(Boolean).slice(0, 60);
  need(features.every((x) => x.length <= 80), 'Een kenmerk is te lang (maximaal 80 tekens).');

  const mediaList = (field: string, label: string, max: number): Photo[] => {
    try {
      const raw = JSON.parse(text(f, field) || '[]');
      if (!Array.isArray(raw)) throw new Error();
      const list: Photo[] = raw.slice(0, max).map((p: { url?: unknown; alt?: unknown }) => ({ url: String(p?.url ?? ''), ...(p?.alt ? { alt: String(p.alt).slice(0, 160) } : {}) }));
      need(list.every((p) => /^https:\/\/\S+$/.test(p.url)), `${label} moeten een https-adres hebben.`);
      return list;
    } catch { errors.push(`De ${label.toLowerCase()} konden niet worden gelezen.`); return []; }
  };
  const photos = mediaList('photos', 'Foto’s', 40), floorplans = mediaList('floorplans', 'Plattegronden', 20), photos360 = mediaList('photos_360', '360°-foto’s', 20);

  const video = text(f, 'video_url');
  need(!video || (video.length <= 500 && /^https:\/\/\S+\.(mp4|webm|mov|m4v)(\?\S*)?$/i.test(video)), 'De video moet een https-adres zijn naar een mp4-, webm- of mov-bestand.');

  if (errors.length) return { ok: false, errors };
  return {
    ok: true,
    value: {
      offer, category, new_build: newBuild, status, street, house_number: houseNumber, house_suffix: text(f, 'house_suffix') || null, postcode, city, province, neighbourhood: text(f, 'neighbourhood') || null,
      lat, lng, asking_price: price!, price_type: priceType, living_area: area!, plot_area: plot, rooms: rooms!, bedrooms, bathrooms, build_year: year,
      property_type: type, energy_label: label || null, description, features, photos, video_url: video || null, floorplans, photos_360: photos360,
    },
  };
}
