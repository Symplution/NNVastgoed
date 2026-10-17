import type { Province } from './types';

// Populaire plaatsen per provincie, steden eerst. Een link zoekt op de plaatsnaam (/koop?q=…).
export const POPULAR_PLACES: Record<Province, { cities: string[]; villages: string[] }> = {
  groningen: {
    cities: ['Groningen', 'Haren', 'Hoogezand', 'Veendam', 'Winschoten', 'Delfzijl', 'Stadskanaal', 'Leek'],
    villages: ['Appingedam', 'Uithuizen', 'Bedum', 'Zuidhorn', 'Winsum', 'Slochteren', 'Loppersum', 'Ter Apel', 'Pieterburen', 'Zoutkamp'],
  },
  friesland: {
    cities: ['Leeuwarden', 'Sneek', 'Heerenveen', 'Drachten', 'Harlingen', 'Franeker', 'Dokkum', 'Bolsward'],
    villages: ['Joure', 'Lemmer', 'Workum', 'Hindeloopen', 'Stavoren', 'Wolvega', 'Oosterwolde', 'Terschelling', 'Ameland', 'Schiermonnikoog'],
  },
  drenthe: {
    cities: ['Assen', 'Emmen', 'Hoogeveen', 'Meppel', 'Coevorden', 'Roden', 'Beilen'],
    villages: ['Zuidlaren', 'Borger', 'Dalen', 'Diever', 'Westerbork', 'Gieten', 'Norg', 'Vries', 'Zuidwolde', 'Odoorn'],
  },
};

export const placeHref = (place: string) => `/koop?q=${encodeURIComponent(place)}`;
