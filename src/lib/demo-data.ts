import { slugify } from './format';
import type { Listing, Office, Province, PropertyType, EnergyLabel, ListingStatus } from './types';

// Voorbeeldgegevens voor de demomodus (DEMO_MODE=1, alleen buiten productie). Alle kantoren en woningen zijn verzonnen.
export const DEMO_OFFICES: Office[] = [
  { id: 'o1', slug: 'martinihof-makelaars', name: 'Martinihof Makelaars', city: 'Groningen', province: 'groningen', street: 'Oude Ebbingestraat 12', postcode: '9712 HA', phone: '050 123 45 67', email: 'info@martinihof.example', website: 'https://martinihof.example', description: 'Al veertig jaar dé makelaar voor de stad Groningen en de Ommelanden. Van studio tot herenhuis.' },
  { id: 'o2', slug: 'hogeland-wonen', name: 'Hogeland Wonen', city: 'Uithuizen', province: 'groningen', street: 'Hoofdstraat 8', postcode: '9981 AA', phone: '0595 12 34 56', email: 'contact@hogelandwonen.example', website: 'https://hogelandwonen.example', description: 'Specialist in woonboerderijen, terpwoningen en dorpshuizen aan de Waddenkust.' },
  { id: 'o3', slug: 'elfsteden-makelaardij', name: 'Elfsteden Makelaardij', city: 'Leeuwarden', province: 'friesland', street: 'Nieuwestad 41', postcode: '8911 CJ', phone: '058 123 45 67', email: 'info@elfstedenmakelaardij.example', website: 'https://elfstedenmakelaardij.example', description: 'Makelaar in Leeuwarden en omstreken, met een eigen vestiging aan de Friese meren.' },
  { id: 'o4', slug: 'meerwaarde-friesland', name: 'Meerwaarde Friesland', city: 'Sneek', province: 'friesland', street: 'Marktstraat 3', postcode: '8601 CV', phone: '0515 12 34 56', email: 'sneek@meerwaarde.example', website: 'https://meerwaarde.example', description: 'Woningen, woonboten en recreatiewoningen rond Sneek, Joure en Heerenveen.' },
  { id: 'o5', slug: 'brink-en-es-makelaars', name: 'Brink & Es Makelaars', city: 'Assen', province: 'drenthe', street: 'Brinkstraat 20', postcode: '9401 HT', phone: '0592 12 34 56', email: 'info@brinkenes.example', website: 'https://brinkenes.example', description: 'Persoonlijke makelaardij in midden-Drenthe: Assen, Roden, Zuidlaren en de Drentsche Aa.' },
  { id: 'o6', slug: 'veenhuizen-vastgoed', name: 'Veenhuizen Vastgoed', city: 'Emmen', province: 'drenthe', street: 'Marktplein 5', postcode: '7811 AB', phone: '0591 12 34 56', email: 'info@veenhuizenvastgoed.example', website: 'https://veenhuizenvastgoed.example', description: 'Woningen in Zuidoost-Drenthe: Emmen, Coevorden, Hoogeveen en de Veenkoloniën.' },
];

type Row = [office: string, street: string, nr: string, postcode: string, city: string, province: Province, wijk: string, price: number, area: number, plot: number | null, rooms: number, bed: number, year: number, type: PropertyType, label: EnergyLabel, status: ListingStatus, days: number, lat: number, lng: number, headline: string];

const ROWS: Row[] = [
  ['o1', 'Nieuwe Ebbingestraat', '34', '9712 NL', 'Groningen', 'groningen', 'Binnenstad', 349000, 96, null, 4, 2, 1932, 'tussenwoning', 'C', 'beschikbaar', 2, 53.2194, 6.5665, 'Karaktervolle tussenwoning op loopafstand van de Grote Markt'],
  ['o1', 'Hereweg', '112', '9722 AE', 'Groningen', 'groningen', 'Helpman', 595000, 185, 240, 7, 4, 1928, 'herenhuis', 'D', 'beschikbaar', 5, 53.2058, 6.5469, 'Statig herenhuis met diepe tuin in Helpman'],
  ['o1', 'Vinkenstraat', '9', '9711 AB', 'Groningen', 'groningen', 'Binnenstad', 229000, 58, null, 3, 1, 1999, 'appartement', 'B', 'onder_bod', 9, 53.2201, 6.5702, 'Licht appartement met dakterras midden in de stad'],
  ['o1', 'Meerweg', '27', '9731 BC', 'Groningen', 'groningen', 'Noorddijk', 419000, 140, 310, 5, 3, 2004, 'twee-onder-een-kap', 'A', 'beschikbaar', 12, 53.2351, 6.6001, 'Energiezuinige twee-onder-een-kapwoning aan de rand van de stad'],
  ['o1', 'Stationsweg', '3', '9641 JB', 'Veendam', 'groningen', 'Centrum', 245000, 118, 180, 5, 3, 1978, 'hoekwoning', 'C', 'beschikbaar', 20, 53.1063, 6.8788, 'Ruime hoekwoning met garage nabij het centrum van Veendam'],
  ['o2', 'Hoofdstraat', '41', '9981 AB', 'Uithuizen', 'groningen', 'Dorp', 289000, 210, 1400, 8, 4, 1892, 'woonboerderij', 'E', 'beschikbaar', 3, 53.4062, 6.6641, 'Authentieke kop-hals-rompboerderij met weids uitzicht over het Hogeland'],
  ['o2', 'Dijkweg', '2', '9976 VP', 'Roodeschool', 'groningen', 'Waddenkust', 389000, 155, 2200, 6, 3, 1910, 'vrijstaand', 'D', 'onder_voorbehoud', 25, 53.4258, 6.7692, 'Vrijstaande dijkwoning met zicht op de Waddenzee'],
  ['o2', 'Hoofdweg', '88', '9951 AE', 'Winsum', 'groningen', 'Centrum', 265000, 124, 320, 5, 3, 1965, 'bungalow', 'C', 'beschikbaar', 7, 53.3358, 6.5189, 'Gelijkvloerse bungalow met zonnepanelen en grote tuin'],
  ['o2', 'Burchtstraat', '14', '9901 EB', 'Appingedam', 'groningen', 'Centrum', 199000, 102, null, 4, 2, 1925, 'tussenwoning', 'D', 'beschikbaar', 31, 53.3197, 6.8582, 'Pand aan het Damsterdiep met de beroemde hangende keukens als buren'],
  ['o3', 'Nieuwestad', '57', '8911 CK', 'Leeuwarden', 'friesland', 'Binnenstad', 475000, 210, null, 6, 4, 1780, 'herenhuis', 'E', 'beschikbaar', 4, 53.2012, 5.7999, 'Monumentaal grachtenpand in het hart van Leeuwarden'],
  ['o3', 'Oldehoofsterkerkhof', '5', '8911 JB', 'Leeuwarden', 'friesland', 'Binnenstad', 255000, 74, null, 3, 2, 2015, 'appartement', 'A', 'beschikbaar', 6, 53.2005, 5.7938, 'Modern appartement met lift aan de Oldehove'],
  ['o3', 'Prof. Dr. J.W. de Langestraat', '19', '8921 KC', 'Leeuwarden', 'friesland', 'Bilgaard', 315000, 132, 190, 5, 3, 2002, 'hoekwoning', 'B', 'beschikbaar', 14, 53.1888, 5.8325, 'Gezinswoning in de kindvriendelijke wijk Bilgaard'],
  ['o3', 'Harlingerstraatweg', '7', '9048 AA', 'Dronrijp', 'friesland', 'Dorp', 359000, 168, 780, 6, 4, 1935, 'woonboerderij', 'D', 'onder_bod', 11, 53.2155, 5.6212, 'Ruime woning in een Friese dorpskern, direct bij het water'],
  ['o4', 'Kleine Kerkstraat', '6', '8601 EK', 'Sneek', 'friesland', 'Binnenstad', 365000, 128, 90, 5, 3, 1895, 'tussenwoning', 'D', 'beschikbaar', 1, 53.0329, 5.6573, 'Gerenoveerd stadshuis bij de Waterpoort'],
  ['o4', 'Kuilstraat', '22', '8501 AB', 'Joure', 'friesland', 'Centrum', 289000, 119, 220, 5, 3, 1992, 'twee-onder-een-kap', 'B', 'beschikbaar', 8, 52.9667, 5.7957, 'Ruime twee-onder-een-kap met aanbouw, dicht bij het Hoofdvaart'],
  ['o4', 'Zuiderhaven', '1', '8861 AA', 'Harlingen', 'friesland', 'Haven', 275000, 110, null, 4, 2, 1750, 'tussenwoning', 'E', 'beschikbaar', 18, 53.1748, 5.4217, 'Historisch havenhuis met uitzicht op de Waddenzee'],
  ['o4', 'Heerenveenseweg', '5', '8701 AA', 'Bolsward', 'friesland', 'Dorp', 520000, 198, 3200, 7, 4, 2011, 'vrijstaand', 'A', 'beschikbaar', 15, 53.0614, 5.5282, 'Luxe vrijstaande villa met vaarwater en eigen steiger'],
  ['o4', 'Lemsterhoek', '12', '8531 AA', 'Lemmer', 'friesland', 'Jachthaven', 249000, 68, null, 3, 2, 1988, 'woonboot', 'F', 'beschikbaar', 22, 52.8442, 5.7117, 'Woonboot met vaste ligplaats aan het IJsselmeer'],
  ['o5', 'Brinkstraat', '31', '9401 HV', 'Assen', 'drenthe', 'Centrum', 339000, 126, 205, 5, 3, 1996, 'hoekwoning', 'B', 'beschikbaar', 3, 52.9925, 6.5642, 'Royale hoekwoning aan de rand van het centrum van Assen'],
  ['o5', 'Kerkstraat', '4', '9301 AA', 'Roden', 'drenthe', 'Dorp', 459000, 172, 850, 6, 4, 1960, 'vrijstaand', 'C', 'beschikbaar', 10, 53.1397, 6.4208, 'Vrijstaand wonen in Roden, vlak bij de Zuidlaardermeer'],
  ['o5', 'Zuidlaarderweg', '16', '9471 AA', 'Zuidlaren', 'drenthe', 'Dorp', 635000, 215, 2400, 8, 5, 2008, 'vrijstaand', 'A+', 'onder_bod', 17, 53.0903, 6.6866, 'Landelijk wonen op 2.400 m² met uitzicht over de Drentsche Aa'],
  ['o5', 'Industrieweg', '3', '9402 AA', 'Assen', 'drenthe', 'Kloosterveen', 289000, 112, 140, 5, 3, 2016, 'tussenwoning', 'A++', 'beschikbaar', 5, 52.9805, 6.5405, 'Nieuwbouwwoning in Kloosterveen, aardgasvrij'],
  ['o5', 'Dorpsstraat', '55', '9444 AA', 'Grolloo', 'drenthe', 'Dorp', 185000, 95, 900, 4, 2, 1950, 'woonboerderij', 'G', 'beschikbaar', 40, 52.9876, 6.7163, 'Opknapper in een Drents brinkdorp met veel ruimte'],
  ['o6', 'Hoofdstraat', '18', '7811 AB', 'Emmen', 'drenthe', 'Centrum', 215000, 98, 150, 4, 2, 1982, 'tussenwoning', 'C', 'beschikbaar', 4, 52.7792, 6.8939, 'Instapklare tussenwoning nabij het centrum van Emmen'],
  ['o6', 'Weiersstraat', '21', '7741 AA', 'Coevorden', 'drenthe', 'Binnenstad', 268000, 124, 320, 5, 3, 1975, 'bungalow', 'C', 'beschikbaar', 13, 52.6615, 6.7405, 'Bungalow bij de vesting van Coevorden'],
  ['o6', 'De Stoep', '7', '7902 AA', 'Hoogeveen', 'drenthe', 'Noord', 349000, 148, 420, 6, 4, 2001, 'vrijstaand', 'B', 'beschikbaar', 6, 52.7263, 6.4764, 'Vrijstaande woning met garage en carport in Hoogeveen-Noord'],
  ['o6', 'Beilerstraat', '1', '9411 AA', 'Beilen', 'drenthe', 'Centrum', 235000, 105, 190, 4, 3, 1990, 'hoekwoning', 'B', 'verkocht', 30, 52.8619, 6.5176, 'Hoekwoning aan de rand van Beilen (verkocht)'],
  ['o6', 'Zuiderdiep', '30', '7751 AA', 'Dalen', 'drenthe', 'Dorp', 410000, 163, 1100, 6, 4, 2006, 'vrijstaand', 'A', 'beschikbaar', 9, 52.6993, 6.7733, 'Ruime vrijstaande woning met werkruimte aan huis'],
  ['o3', 'Dokkumerdiep', '8', '9101 AA', 'Dokkum', 'friesland', 'Binnenstad', 215000, 91, 60, 4, 2, 1900, 'tussenwoning', 'D', 'beschikbaar', 27, 53.3252, 6.0044, 'Charmant stadshuis binnen de bolwerken van Dokkum'],
];

const stock = (type: PropertyType) => ['appartement', 'woonboot'].includes(type) ? ['Lift of vaste ligplaats', 'Berging', 'Dubbele beglazing'] : ['Tuin', 'Berging', 'Dubbele beglazing', 'Zonnepanelen'];
const NOW = new Date('2026-10-01T09:00:00Z').getTime();

export const DEMO_LISTINGS: Listing[] = ROWS.map(([office, street, nr, postcode, city, province, wijk, price, area, plot, rooms, bed, year, type, label, status, days, lat, lng, headline], i) => ({
  id: `l${i + 1}`, officeId: office, slug: slugify(`${street} ${nr} ${city}`), externalId: null, source: 'handmatig', status,
  street, houseNumber: nr, postcode, city, province, neighbourhood: wijk, lat, lng,
  askingPrice: price, priceType: 'k.k.', livingArea: area, plotArea: plot, rooms, bedrooms: bed, bathrooms: bed > 3 ? 2 : 1, buildYear: year,
  propertyType: type, energyLabel: label,
  description: `${headline}.\n\nDit is een voorbeeldwoning uit de demo van NNvastgoed. In ${wijk}, ${city}, vind je deze ${type.replace(/-/g, ' ')} uit ${year} met ${area} m² woonoppervlak, ${rooms} kamers en ${bed} slaapkamers.\n\nDe indeling is praktisch en de ligging is ideaal: voorzieningen, openbaar vervoer en uitvalswegen liggen binnen handbereik. Neem contact op met ${DEMO_OFFICES.find((o) => o.id === office)!.name} voor een bezichtiging.`,
  features: stock(type), photos: Array.from({ length: 4 }, (_, k) => ({ url: `/api/foto/${slugify(`${street} ${nr} ${city}`)}-${k + 1}`, alt: `${street} ${nr} ${city}, foto ${k + 1}` })),
  publishedAt: new Date(NOW - days * 86_400_000).toISOString(), updatedAt: new Date(NOW - days * 86_400_000).toISOString(),
}));
