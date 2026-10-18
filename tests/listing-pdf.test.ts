import { PDFDocument } from 'pdf-lib';
import { describe, expect, it } from 'vitest';
import { DEMO_LISTINGS, DEMO_OFFICES } from '../src/lib/demo-data';
import { buildListingPdf, isFetchableUrl, safeText } from '../src/lib/listing-pdf';

describe('pdf-overzicht van een woning', () => {
  const listing = DEMO_LISTINGS[0], office = DEMO_OFFICES.find((o) => o.id === listing.officeId)!;
  it('maakt een geldig pdf-bestand met meerdere pagina’s: logo, foto’s, tekst en contactgegevens', async () => {
    const bytes = await buildListingPdf({ listing, office, now: new Date('2026-10-18T10:00:00Z') });
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe('%PDF-');
    const doc = await PDFDocument.load(bytes);
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(2);
    expect(doc.getTitle()).toContain(listing.street);
  }, 60_000);
  it('gaat niet stuk op een lange tekst, vreemde tekens of een woning zonder foto’s', async () => {
    const odd = { ...listing, photos: [], features: [], description: `Ünïcödé 日本語 € 1.000 — “aanhalingstekens”\n\n${'woord '.repeat(900)}${'x'.repeat(300)}`, videoUrl: 'https://x.nl/v.mp4' };
    const doc = await PDFDocument.load(await buildListingPdf({ listing: odd, office: { ...office, phone: null, website: null, logoUrl: null } }));
    expect(doc.getPageCount()).toBeGreaterThanOrEqual(2);
  }, 60_000);
  it('de brochure voor bezoekers is een geldig pdf-bestand met het logo van een voorbeeldkantoor', async () => {
    const withVideo = { ...listing, videoUrl: '/voorbeeld-video.mp4' };
    const bytes = await buildListingPdf({ listing: withVideo, office: DEMO_OFFICES[0], variant: 'publiek' });
    expect(Buffer.from(bytes.slice(0, 5)).toString()).toBe('%PDF-');
    expect((await PDFDocument.load(bytes)).getTitle()).toContain('brochure');
    expect(DEMO_OFFICES[0].logoUrl).toBe('/api/logo/martinihof-makelaars');
  }, 60_000);
  it('weigert onveilige adressen bij het ophalen van foto’s', () => {
    for (const u of ['http://x.nl/a.jpg', 'https://localhost/a.jpg', 'https://127.0.0.1/a.jpg', 'https://169.254.169.254/latest', 'https://[::1]/a.jpg', 'https://db.internal/a.jpg', 'ftp://x.nl/a.jpg', 'geen url']) expect(isFetchableUrl(u)).toBe(false);
    expect(isFetchableUrl('https://abc.supabase.co/storage/v1/object/public/listing-photos/x.jpg')).toBe(true);
  });
  it('maakt van tekens zonder lettertype een vraagteken', () => { expect(safeText('€ 5 – “x” 日')).toBe('€ 5 – “x” ?'); });
});
