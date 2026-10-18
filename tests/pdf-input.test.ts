import { describe, expect, it } from 'vitest';
import { validateListing } from '../src/lib/listing-input';

const form = (extra: Record<string, string>) => {
  const f = new FormData();
  Object.entries({ street: 'Hoofdstraat', house_number: '1', postcode: '9711 AA', city: 'Groningen', province: 'groningen', asking_price: '250000', price_type: 'k.k.', living_area: '100', rooms: '4', property_type: 'tussenwoning', ...extra }).forEach(([k, v]) => f.set(k, v));
  return f;
};

describe('video bij een woning', () => {
  it('is optioneel', () => { const r = validateListing(form({})); expect(r.ok && r.value.video_url).toBe(null); });
  it('accepteert een https-adres naar een mp4, webm of mov', () => {
    for (const u of ['https://x.supabase.co/storage/v1/object/public/listing-videos/a/b.mp4', 'https://x.nl/v.webm?token=1', 'https://x.nl/v.MOV']) { const r = validateListing(form({ video_url: u })); expect(r.ok && r.value.video_url).toBe(u); }
  });
  it('weigert andere adressen en bestanden', () => {
    for (const u of ['http://x.nl/v.mp4', 'https://x.nl/pagina', 'javascript:alert(1)', 'https://x.nl/v.exe']) expect(validateListing(form({ video_url: u })).ok).toBe(false);
  });
});
