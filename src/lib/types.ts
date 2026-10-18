export const PROVINCES = ['groningen', 'friesland', 'drenthe'] as const;
export type Province = (typeof PROVINCES)[number];

export const STATUSES = ['concept', 'beschikbaar', 'onder_bod', 'onder_voorbehoud', 'verkocht', 'ingetrokken'] as const;
export type ListingStatus = (typeof STATUSES)[number];
export const PUBLIC_STATUSES: ListingStatus[] = ['beschikbaar', 'onder_bod', 'onder_voorbehoud', 'verkocht'];

export const HOME_TYPES = ['appartement', 'tussenwoning', 'hoekwoning', 'twee-onder-een-kap', 'vrijstaand', 'woonboerderij', 'bungalow', 'herenhuis', 'woonboot', 'bouwgrond'] as const;
export const COMMERCIAL_TYPES = ['kantoorruimte', 'bedrijfshal', 'winkelruimte', 'horecapand'] as const;
export const PROPERTY_TYPES = [...HOME_TYPES, ...COMMERCIAL_TYPES, 'overig'] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export type Offer = 'koop' | 'huur';
export type Category = 'woning' | 'bedrijfsruimte';
export type PriceType = 'k.k.' | 'v.o.n.' | 'p.m.';

export const ENERGY_LABELS = ['A++++', 'A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;
export type EnergyLabel = (typeof ENERGY_LABELS)[number];

export interface Photo { url: string; alt?: string }

export interface Office {
  id: string; slug: string; name: string; city: string; province: Province;
  street?: string | null; postcode?: string | null; phone?: string | null; email: string; website?: string | null; description: string;
  /** Lid van de NVM; alleen NNV-beheer zet dit aan, na controle. */
  nvmMember: boolean;
  /** Logo van het kantoor (https-adres), voor in het pdf-overzicht van een woning. */
  logoUrl?: string | null;
}

export interface Listing {
  id: string; officeId: string; slug: string; externalId?: string | null; source: 'handmatig' | 'koppeling';
  status: ListingStatus;
  offer: Offer; category: Category; newBuild: boolean;
  street: string; houseNumber: string; houseSuffix?: string | null; postcode: string; city: string; province: Province; neighbourhood?: string | null;
  lat?: number | null; lng?: number | null;
  /** Koopprijs, of bij huur de huurprijs per maand. */
  askingPrice: number; priceType: PriceType;
  livingArea: number; plotArea?: number | null; rooms: number; bedrooms: number; bathrooms: number; buildYear?: number | null;
  propertyType: PropertyType; energyLabel?: EnergyLabel | null;
  description: string; features: string[]; photos: Photo[];
  /** Eén video per woning (https-adres naar een mp4, webm of mov). */
  videoUrl?: string | null;
  publishedAt?: string | null; updatedAt: string;
}

export type Role = 'owner' | 'admin' | 'agent' | 'readonly' | 'seeker';
