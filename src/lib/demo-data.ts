import { slugify } from './format';
import type { Listing, Office, Province, PropertyType, EnergyLabel, ListingStatus } from './types';

// Voorbeeldgegevens voor de demomodus (DEMO_MODE=1, alleen buiten productie). Alle kantoren en woningen zijn verzonnen.
export const DEMO_OFFICES: Office[] = [
  { id: 'o1', slug: 'martinihof-makelaars', name: 'Martinihof Makelaars', city: 'Groningen', province: 'groningen', street: 'Oude Ebbingestraat 12', postcode: '9712 HA', phone: '050 123 45 67', email: 'info@martinihof.example', website: 'https://martinihof.example', description: 'Al veertig jaar dé makelaar voor de stad Groningen en de Ommelanden. Van studio tot herenhuis.', nvmMember: true },
  { id: 'o2', slug: 'hogeland-wonen', name: 'Hogeland Wonen', city: 'Uithuizen', province: 'groningen', street: 'Hoofdstraat 8', postcode: '9981 AA', phone: '0595 12 34 56', email: 'contact@hogelandwonen.example', website: 'https://hogelandwonen.example', description: 'Specialist in woonboerderijen, terpwoningen en dorpshuizen aan de Waddenkust.', nvmMember: false },
  { id: 'o3', slug: 'elfsteden-makelaardij', name: 'Elfsteden Makelaardij', city: 'Leeuwarden', province: 'friesland', street: 'Nieuwestad 41', postcode: '8911 CJ', phone: '058 123 45 67', email: 'info@elfstedenmakelaardij.example', website: 'https://elfstedenmakelaardij.example', description: 'Makelaar in Leeuwarden en omstreken, met een eigen vestiging aan de Friese meren.', nvmMember: true },
  { id: 'o4', slug: 'meerwaarde-friesland', name: 'Meerwaarde Friesland', city: 'Sneek', province: 'friesland', street: 'Marktstraat 3', postcode: '8601 CV', phone: '0515 12 34 56', email: 'sneek@meerwaarde.example', website: 'https://meerwaarde.example', description: 'Woningen, woonboten en recreatiewoningen rond Sneek, Joure en Heerenveen.', nvmMember: false },
  { id: 'o5', slug: 'brink-en-es-makelaars', name: 'Brink & Es Makelaars', city: 'Assen', province: 'drenthe', street: 'Brinkstraat 20', postcode: '9401 HT', phone: '0592 12 34 56', email: 'info@brinkenes.example', website: 'https://brinkenes.example', description: 'Persoonlijke makelaardij in midden-Drenthe: Assen, Roden, Zuidlaren en de Drentsche Aa.', nvmMember: true },
  { id: 'o6', slug: 'veenhuizen-vastgoed', name: 'Veenhuizen Vastgoed', city: 'Emmen', province: 'drenthe', street: 'Marktplein 5', postcode: '7811 AB', phone: '0591 12 34 56', email: 'info@veenhuizenvastgoed.example', website: 'https://veenhuizenvastgoed.example', description: 'Woningen in Zuidoost-Drenthe: Emmen, Coevorden, Hoogeveen en de Veenkoloniën.', nvmMember: false },
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

const ROOMS = ['voorkant', 'tuin', 'woonkamer', 'keuken', 'slaapkamer', 'badkamer'];
/** Voorbeeldfoto's: een woning krijgt zes ruimtes, bedrijfsruimte een voorkant, het terrein en de werkruimte. */
export const photosFor = (address: string, commercial: boolean) =>
  (commercial ? [1, 2, 7] : [1, 2, 3, 4, 5, 6]).map((n) => ({ url: `/api/foto/${slugify(address)}-${n}`, alt: `${address}, ${n === 7 ? 'werkruimte' : ROOMS[n - 1]}` }));

const stock = (type: PropertyType) => ['appartement', 'woonboot'].includes(type) ? ['Lift of vaste ligplaats', 'Berging', 'Dubbele beglazing'] : ['Tuin', 'Berging', 'Dubbele beglazing', 'Zonnepanelen'];
const NOW = new Date('2026-10-01T09:00:00Z').getTime();

const BASE_LISTINGS: Listing[] = ROWS.map(([office, street, nr, postcode, city, province, wijk, price, area, plot, rooms, bed, year, type, label, status, days, lat, lng, headline], i) => ({
  id: `l${i + 1}`, officeId: office, slug: slugify(`${street} ${nr} ${city}`), externalId: null, source: 'handmatig', status, offer: 'koop', category: 'woning', newBuild: false,
  street, houseNumber: nr, postcode, city, province, neighbourhood: wijk, lat, lng,
  askingPrice: price, priceType: 'k.k.', livingArea: area, plotArea: plot, rooms, bedrooms: bed, bathrooms: bed > 3 ? 2 : 1, buildYear: year,
  propertyType: type, energyLabel: label,
  description: `${headline}.\n\nDit is een voorbeeldwoning uit de demo van NNvastgoed. In ${wijk}, ${city}, vind je deze ${type.replace(/-/g, ' ')} uit ${year} met ${area} m² woonoppervlak, ${rooms} kamers en ${bed} slaapkamers.\n\nDe indeling is praktisch en de ligging is ideaal: voorzieningen, openbaar vervoer en uitvalswegen liggen binnen handbereik. Neem contact op met ${DEMO_OFFICES.find((o) => o.id === office)!.name} voor een bezichtiging.`,
  features: stock(type), photos: photosFor(`${street} ${nr} ${city}`, false),
  publishedAt: new Date(NOW - days * 86_400_000).toISOString(), updatedAt: new Date(NOW - days * 86_400_000).toISOString(),
}));

// Huur, nieuwbouw en bedrijfsruimte: [kantoor, straat, nr, postcode, plaats, provincie, wijk, prijs (huur per maand), m², kamers, slaapkamers, jaar, type, label, aanbod, nieuwbouw, dagen geleden, lat, lng, kop]
type Extra = [string, string, string, string, string, Province, string, number, number, number, number, number, PropertyType, EnergyLabel, 'koop' | 'huur', boolean, number, number, number, string];
const EXTRA: Extra[] = [
  ['o1', 'Oosterstraat', '88', '9711 NV', 'Groningen', 'groningen', 'Binnenstad', 1195, 62, 3, 2, 1998, 'appartement', 'B', 'huur', false, 3, 53.2178, 6.5719, 'Lichte tweekamerwoning bij de Grote Markt'],
  ['o1', 'Paterswoldseweg', '45', '9727 BA', 'Groningen', 'groningen', 'Helpman', 1650, 110, 5, 3, 1965, 'tussenwoning', 'C', 'huur', false, 8, 53.1998, 6.5392, 'Gezinswoning met tuin in Helpman'],
  ['o3', 'Gedempte Zuiderdiep', '9', '8911 AA', 'Leeuwarden', 'friesland', 'Binnenstad', 975, 55, 2, 1, 1932, 'appartement', 'D', 'huur', false, 5, 53.1996, 5.7872, 'Sfeervol bovenhuis in het centrum van Leeuwarden'],
  ['o4', 'Havenstraat', '14', '8501 AB', 'Joure', 'friesland', 'Centrum', 1350, 95, 4, 3, 2012, 'hoekwoning', 'A', 'huur', false, 11, 52.9661, 5.7942, 'Moderne hoekwoning bij het water'],
  ['o5', 'Torenlaan', '3', '9401 BX', 'Assen', 'drenthe', 'Centrum', 1095, 70, 3, 2, 2005, 'appartement', 'B', 'huur', false, 2, 52.9964, 6.5628, 'Appartement met lift en parkeerplaats'],
  ['o6', 'Marktstraat', '31', '7811 CL', 'Emmen', 'drenthe', 'Centrum', 895, 85, 4, 2, 1985, 'tussenwoning', 'C', 'huur', false, 16, 52.7788, 6.8921, 'Betaalbare gezinswoning dicht bij het centrum'],
  ['o1', 'Meerstad-Zuid', 'Kavel 12', '9746 TA', 'Groningen', 'groningen', 'Meerstad', 449000, 128, 5, 3, 2027, 'vrijstaand', 'A++++', 'koop', true, 6, 53.2088, 6.6811, 'Nieuwbouw aan het Woldmeer, energieneutraal en aardgasvrij'],
  ['o1', 'Meerstad-Zuid', 'Kavel 14', '9746 TB', 'Groningen', 'groningen', 'Meerstad', 389000, 112, 4, 3, 2027, 'twee-onder-een-kap', 'A++++', 'koop', true, 6, 53.2091, 6.6820, 'Twee-onder-een-kapwoning in nieuwbouwwijk Meerstad'],
  ['o3', 'Zuiderburen', '5', '8921 AD', 'Leeuwarden', 'friesland', 'Zuiderburen', 329000, 105, 4, 3, 2026, 'hoekwoning', 'A+++', 'koop', true, 9, 53.1856, 5.8014, 'Nieuwbouw in Leeuwarden met zonnepanelen en warmtepomp'],
  ['o5', 'Kloosterveen', 'Fase 4 nr 6', '9406 AA', 'Assen', 'drenthe', 'Kloosterveen', 299000, 110, 4, 3, 2026, 'tussenwoning', 'A++', 'koop', true, 4, 52.9811, 6.5433, 'Nieuwbouwwoning in Kloosterveen, oplevering voorjaar 2027'],
  ['o6', 'Nieuw-Weerdinge', '8', '7826 AB', 'Emmen', 'drenthe', 'Nieuw-Weerdinge', 1250, 100, 4, 3, 2026, 'tussenwoning', 'A+++', 'huur', true, 12, 52.8325, 7.0021, 'Nieuwbouw huurwoning, direct beschikbaar'],
  ['o1', 'Eemskade', '2', '9713 BA', 'Groningen', 'groningen', 'Oosterpoort', 2400, 180, 0, 0, 1998, 'kantoorruimte', 'B', 'huur', false, 7, 53.2128, 6.5804, 'Representatieve kantoorruimte nabij het station'],
  ['o4', 'Industrieweg', '41', '8601 WK', 'Sneek', 'friesland', 'Bedrijventerrein', 185000, 450, 0, 0, 2004, 'bedrijfshal', 'C', 'koop', false, 14, 53.0409, 5.6771, 'Bedrijfshal met kantoorgedeelte en ruime opslag'],
  ['o2', 'Hoofdstraat', '70', '9981 AD', 'Uithuizen', 'groningen', 'Centrum', 850, 75, 0, 0, 1950, 'winkelruimte', 'D', 'huur', false, 20, 53.4059, 6.6648, 'Winkelruimte op een A1-locatie in het dorp'],
  ['o6', 'Weiersstraat', '6', '7741 AB', 'Coevorden', 'drenthe', 'Binnenstad', 3200, 220, 0, 0, 1980, 'horecapand', 'C', 'huur', false, 10, 52.6611, 6.7399, 'Horecapand met terras bij de vesting'],
  ['o5', 'Marsdijk', '12', '9403 AB', 'Assen', 'drenthe', 'Bedrijventerrein', 1950, 140, 0, 0, 2008, 'kantoorruimte', 'A', 'huur', false, 3, 52.9877, 6.5591, 'Moderne kantoorruimte met eigen parkeerplaatsen'],
];

const EXTRA_LISTINGS: Listing[] = EXTRA.map(([office, street, nr, postcode, city, province, wijk, price, area, rooms, bed, year, type, label, offer, newBuild, days, lat, lng, headline], i) => {
  const commercial = ['kantoorruimte', 'bedrijfshal', 'winkelruimte', 'horecapand'].includes(type);
  const name = DEMO_OFFICES.find((o) => o.id === office)!.name;
  return {
    id: `x${i + 1}`, officeId: office, slug: slugify(`${street} ${nr} ${city}`), externalId: null, source: 'handmatig', status: 'beschikbaar',
    offer, category: commercial ? 'bedrijfsruimte' : 'woning', newBuild,
    street, houseNumber: nr, postcode, city, province, neighbourhood: wijk, lat, lng,
    askingPrice: price, priceType: offer === 'huur' ? 'p.m.' : newBuild ? 'v.o.n.' : 'k.k.', livingArea: area, plotArea: null, rooms, bedrooms: bed, bathrooms: bed > 2 ? 2 : 1, buildYear: year,
    propertyType: type, energyLabel: label,
    description: `${headline}.\n\nDit is een voorbeeld uit de demo van NNvastgoed. ${commercial ? 'Het pand' : 'De woning'} ligt in ${wijk}, ${city} en heeft ${area} m²${rooms ? ` met ${rooms} kamers` : ''}. Neem contact op met ${name} voor een bezichtiging.`,
    features: commercial ? ['Parkeren op eigen terrein', 'Glasvezel', 'Toegankelijk voor mindervaliden'] : stock(type),
    photos: photosFor(`${street} ${nr} ${city}`, commercial),
    publishedAt: new Date(NOW - days * 86_400_000).toISOString(), updatedAt: new Date(NOW - days * 86_400_000).toISOString(),
  };
});

export const DEMO_LISTINGS: Listing[] = [...BASE_LISTINGS, ...EXTRA_LISTINGS];
