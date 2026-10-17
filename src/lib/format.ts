import type { ListingStatus, PropertyType, Listing } from './types';

const eur = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
export const formatEuro = (n: number) => eur.format(n).replace(/\s/g, ' ');
export const formatPrice = (l: Pick<Listing, 'askingPrice' | 'priceType'>) => `${formatEuro(l.askingPrice)} ${l.priceType}`;
export const formatNumber = (n: number) => new Intl.NumberFormat('nl-NL').format(n);
export const formatDate = (iso: string) => new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

export const STATUS_LABEL: Record<ListingStatus, string> = {
  concept: 'Concept', beschikbaar: 'Beschikbaar', onder_bod: 'Onder bod', onder_voorbehoud: 'Verkocht onder voorbehoud', verkocht: 'Verkocht', ingetrokken: 'Ingetrokken',
};
export const TYPE_LABEL: Record<PropertyType, string> = {
  appartement: 'Appartement', tussenwoning: 'Tussenwoning', hoekwoning: 'Hoekwoning', 'twee-onder-een-kap': 'Twee-onder-een-kap', vrijstaand: 'Vrijstaande woning',
  woonboerderij: 'Woonboerderij', bungalow: 'Bungalow', herenhuis: 'Herenhuis', woonboot: 'Woonboot', bouwgrond: 'Bouwgrond', overig: 'Overig',
};

export const address = (l: Pick<Listing, 'street' | 'houseNumber' | 'houseSuffix'>) => `${l.street} ${l.houseNumber}${l.houseSuffix ? (/^\d/.test(l.houseSuffix) ? `-${l.houseSuffix}` : l.houseSuffix) : ''}`;
export const normalizePostcode = (p: string) => { const m = p.replace(/\s/g, '').match(/^([1-9]\d{3})([A-Za-z]{2})$/); return m ? `${m[1]} ${m[2].toUpperCase()}` : p.trim(); };

export function slugify(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80);
}
