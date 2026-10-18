import type { ListingStatus, PropertyType, Listing } from './types';

export const OFFER_LABEL = { koop: 'Te koop', huur: 'Te huur' } as const;
const eur = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
export const formatEuro = (n: number) => eur.format(n).replace(/\s/g, ' ');
export const formatPrice = (l: Pick<Listing, 'askingPrice' | 'priceType'>) => `${formatEuro(l.askingPrice)} ${l.priceType}`;
export const PRICE_TYPE_LABEL: Record<string, string> = { 'k.k.': 'Kosten koper', 'v.o.n.': 'Vrij op naam', 'p.m.': 'Per maand' };
export const formatNumber = (n: number) => new Intl.NumberFormat('nl-NL').format(n);
export const formatDate = (iso: string) => new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

export const STATUS_LABEL: Record<ListingStatus, string> = {
  concept: 'Concept', beschikbaar: 'Beschikbaar', onder_bod: 'Onder bod', onder_voorbehoud: 'Verkocht onder voorbehoud', verkocht: 'Verkocht', ingetrokken: 'Ingetrokken',
};
export const TYPE_LABEL: Record<PropertyType, string> = {
  appartement: 'Appartement', tussenwoning: 'Tussenwoning', hoekwoning: 'Hoekwoning', 'twee-onder-een-kap': 'Twee-onder-een-kap', vrijstaand: 'Vrijstaande woning',
  woonboerderij: 'Woonboerderij', bungalow: 'Bungalow', herenhuis: 'Herenhuis', woonboot: 'Woonboot', bouwgrond: 'Bouwgrond', overig: 'Overig',
  kantoorruimte: 'Kantoorruimte', bedrijfshal: 'Bedrijfshal', winkelruimte: 'Winkelruimte', horecapand: 'Horecapand',
  recreatiewoning: 'Recreatiewoning', vakantiebungalow: 'Vakantiebungalow', chalet: 'Chalet', stacaravan: 'Stacaravan',
};

export const address = (l: Pick<Listing, 'street' | 'houseNumber' | 'houseSuffix'>) => `${l.street} ${l.houseNumber}${l.houseSuffix ? (/^\d/.test(l.houseSuffix) ? `-${l.houseSuffix}` : l.houseSuffix) : ''}`;
export const normalizePostcode = (p: string) => { const m = p.replace(/\s/g, '').match(/^([1-9]\d{3})([A-Za-z]{2})$/); return m ? `${m[1]} ${m[2].toUpperCase()}` : p.trim(); };

export function slugify(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}

export const formatDateTime = (iso: string) => new Intl.DateTimeFormat('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' }).format(new Date(iso));
export const formatTime = (iso: string) => new Intl.DateTimeFormat('nl-NL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Amsterdam' }).format(new Date(iso));
export const formatDay = (iso: string) => new Intl.DateTimeFormat('nl-NL', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'Europe/Amsterdam' }).format(new Date(iso));
/** Datum zoals de Nederlandse klok die toont, als JJJJ-MM-DD (voor groeperen per dag). */
export const dayKey = (iso: string) => new Intl.DateTimeFormat('sv-SE', { timeZone: 'Europe/Amsterdam' }).format(new Date(iso));
