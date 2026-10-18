import type { ListingStatus } from '../types';

/** Eén woning zoals de database hem opneemt (kolomnamen van de tabel `listings`). */
export interface IngestItem {
  slug: string; external_id: string; status: ListingStatus;
  offer: 'koop' | 'huur'; category: 'woning' | 'bedrijfsruimte' | 'recreatie'; new_build: boolean;
  street: string; house_number: string; house_suffix: string | null; postcode: string; city: string; province: string; neighbourhood: string | null;
  lat: number | null; lng: number | null;
  asking_price: number; price_type: 'k.k.' | 'v.o.n.' | 'p.m.';
  living_area: number; plot_area: number | null; rooms: number; bedrooms: number; bathrooms: number; build_year: number | null;
  property_type: string; energy_label: string | null; description: string; features: string[]; photos: { url: string; alt?: string }[];
}
export interface Rejected { index: number; external_id?: string; reason: string }
export interface Parsed { items: IngestItem[]; rejected: Rejected[] }
