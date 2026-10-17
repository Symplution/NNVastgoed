// Tarieven voor makelaars (alle bedragen excl. btw, per objectplaatsing). Eén plek om ze aan te passen.
export const OBJECT_TYPES = ['Bedrijfsruimte', 'Agrarisch bedrijf', 'Agrarische grond', 'Bedrijfsverzamelgebouw'] as const;
export type ObjectType = (typeof OBJECT_TYPES)[number];

/** Prijs per objecttype, in de volgorde van OBJECT_TYPES. null = niet beschikbaar voor dat type. */
export interface PriceRow { name: string; period: string; note?: string; prices: (number | null)[] }

export const PRICE_GROUPS: { title: string; rows: PriceRow[] }[] = [
  { title: 'Publiceren en presenteren', rows: [
    { name: 'NNV Compleet', period: 'Jaar', note: 'Volledige presentatie van je object', prices: [185, 155, 140, 445] },
    { name: 'NNV Premium', period: 'Jaar', note: 'Compleet, plus extra aandacht in de zoekresultaten', prices: [290, 260, 245, null] },
  ] },
  { title: 'Losse presentatieproducten', rows: [
    { name: 'Blikvanger', period: 'Kwartaal', note: 'Opvallende plek op de homepage', prices: [120, 120, 120, null] },
  ] },
  { title: 'Promoten', rows: [
    { name: 'Topositie', period: 'Week', note: 'Bovenaan in de zoekresultaten', prices: [39, 39, 39, null] },
    { name: 'Topositie', period: 'Maand', prices: [69, 69, 69, null] },
    { name: 'Regio in beeld · 1 provincie', period: 'Maand', note: 'Zichtbaar in de provincie van je keuze', prices: [175, 175, 175, null] },
    { name: 'Regio in beeld · 2 provincies', period: 'Maand', prices: [245, 245, 245, null] },
    { name: 'Regio in beeld · heel Noord-Nederland', period: 'Maand', note: 'Groningen, Friesland en Drenthe', prices: [315, 315, 315, null] },
  ] },
];

export const OFFICE_PRICES: { name: string; period: string; note: string; price: number }[] = [
  { name: 'Podiumplaats', period: 'Maand', note: 'Je kantoor in de kijker op de makelaarspagina en homepage', price: 55 },
  { name: 'Kantoorprofiel Pro', period: 'Maand', note: 'Uitgebreid kantoorprofiel met extra gegevens en je eigen presentatie', price: 49 },
];

export const CUSTOM_CAMPAIGNS: { name: string; from: number }[] = [
  { name: 'Kantoorcampagne op maat', from: 2495 },
  { name: 'Projectcampagne op maat', from: 1750 },
];

export const euro = (n: number) => `€ ${n.toLocaleString('nl-NL')}`;
