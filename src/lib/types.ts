export const PROVINCES = ['groningen', 'friesland', 'drenthe'] as const;
export type Province = (typeof PROVINCES)[number];

export const STATUSES = ['concept', 'beschikbaar', 'onder_bod', 'onder_voorbehoud', 'verkocht', 'ingetrokken'] as const;
export type ListingStatus = (typeof STATUSES)[number];
export const PUBLIC_STATUSES: ListingStatus[] = ['beschikbaar', 'onder_bod', 'onder_voorbehoud', 'verkocht'];

export const PROPERTY_TYPES = ['appartement', 'tussenwoning', 'hoekwoning', 'twee-onder-een-kap', 'vrijstaand', 'woonboerderij', 'bungalow', 'herenhuis', 'woonboot', 'bouwgrond', 'overig'] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

export const ENERGY_LABELS = ['A++++', 'A+++', 'A++', 'A+', 'A', 'B', 'C', 'D', 'E', 'F', 'G'] as const;
export type EnergyLabel = (typeof ENERGY_LABELS)[number];

export interface Photo { url: string; alt?: string }

export interface Office {
  id: string; slug: string; name: string; city: string; province: Province;
  street?: string | null; postcode?: string | null; phone?: string | null; email: string; website?: string | null; description: string;
}

export interface Listing {
  id: string; officeId: string; slug: string; externalId?: string | null; source: 'handmatig' | 'koppeling';
  status: ListingStatus;
  street: string; houseNumber: string; houseSuffix?: string | null; postcode: string; city: string; province: Province; neighbourhood?: string | null;
  lat?: number | null; lng?: number | null;
  askingPrice: number; priceType: 'k.k.' | 'v.o.n.';
  livingArea: number; plotArea?: number | null; rooms: number; bedrooms: number; bathrooms: number; buildYear?: number | null;
  propertyType: PropertyType; energyLabel?: EnergyLabel | null;
  description: string; features: string[]; photos: Photo[];
  publishedAt?: string | null; updatedAt: string;
}

export type Role = 'owner' | 'admin' | 'agent' | 'readonly';
