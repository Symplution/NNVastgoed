import type { Province } from './types';

export const PROVINCE_INFO: Record<Province, { name: string; tagline: string; intro: string; towns: string[]; hue: string }> = {
  groningen: {
    name: 'Groningen',
    tagline: 'Van levendige stad tot weidse Ommelanden',
    intro: 'De stad Groningen is jong, bruisend en groeit hard. Daarbuiten wacht ruimte: terpdorpen, Hogeland aan de Waddenzee en de Veenkoloniën. Wonen in de provincie Groningen betekent veel woning voor je geld en altijd een horizon.',
    towns: ['Groningen', 'Haren', 'Hoogezand', 'Veendam', 'Winschoten', 'Delfzijl', 'Stadskanaal', 'Leek', 'Appingedam', 'Uithuizen', 'Bedum', 'Zuidhorn', 'Winsum', 'Ten Boer', 'Slochteren', 'Oldambt'],
    hue: '#0e4a6e',
  },
  friesland: {
    name: 'Friesland',
    tagline: 'Water, dorpen en elf steden',
    intro: 'Friesland: meren, de Waddenzee en de Elfsteden. Van een statig pand in Leeuwarden tot een woonboerderij bij de Friese meren of een huis op de dijk bij Harlingen. Rust, ruimte en een eigen taal en cultuur.',
    towns: ['Leeuwarden', 'Sneek', 'Heerenveen', 'Drachten', 'Harlingen', 'Franeker', 'Dokkum', 'Joure', 'Bolsward', 'Lemmer', 'Workum', 'Stavoren', 'Hindeloopen', 'Sloten', 'Terschelling', 'Ameland', 'Vlieland', 'Schiermonnikoog', 'Wolvega', 'Oosterwolde'],
    hue: '#2f6b4f',
  },
  drenthe: {
    name: 'Drenthe',
    tagline: 'Bos, heide en hunebedden',
    intro: 'Drenthe is de groenste provincie van het noorden: bossen, heide, es- en brinkdorpen en het Nationaal Park Drentsche Aa. Veel vrijstaande woningen, veel ruimte en een korte rit naar de stad.',
    towns: ['Assen', 'Emmen', 'Hoogeveen', 'Meppel', 'Coevorden', 'Roden', 'Beilen', 'Zuidlaren', 'Borger', 'Dalen', 'Diever', 'Westerbork', 'Gieten', 'Norg', 'Vries', 'Zuidwolde', 'De Wijk', 'Odoorn'],
    hue: '#8a5a2b',
  },
};

export const provinceName = (p: Province) => PROVINCE_INFO[p].name;
export const isProvince = (v: unknown): v is Province => v === 'groningen' || v === 'friesland' || v === 'drenthe';

const ALL_TOWNS = new Map<string, Province>();
for (const [p, info] of Object.entries(PROVINCE_INFO) as [Province, (typeof PROVINCE_INFO)[Province]][])
  for (const t of info.towns) ALL_TOWNS.set(t.toLowerCase(), p);

/** Provincie uit wat de koppeling meestuurt (naam, afkorting of anders de plaatsnaam). Onbekend → undefined. */
export function resolveProvince(input?: string | null, city?: string | null): Province | undefined {
  const v = (input ?? '').trim().toLowerCase();
  if (isProvince(v)) return v;
  if (v === 'fryslân' || v === 'fryslan' || v === 'fr') return 'friesland';
  if (v === 'gr') return 'groningen';
  if (v === 'dr') return 'drenthe';
  return city ? ALL_TOWNS.get(city.trim().toLowerCase()) : undefined;
}
