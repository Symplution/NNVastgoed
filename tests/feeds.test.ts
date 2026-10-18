import { describe, expect, it } from 'vitest';
import { parseJsonFeed, parseXmlFeed } from '../src/lib/feeds/parse';
import { validateLead } from '../src/lib/lead-input';
import { validateListing } from '../src/lib/listing-input';
import { evaluateGate } from '../src/lib/usage-gate';
import { newMatches } from '../src/lib/alert-match';
import { DEMO_LISTINGS } from '../src/lib/demo-data';

const good = {
  id: 'RW-1', status: 'te koop', straat: 'Hoofdstraat', huisnummer: '12', postcode: '9981ab', plaats: 'Uithuizen', vraagprijs: '€ 289.000,-', woonoppervlakte: 140,
  kamers: 5, slaapkamers: 3, type: 'Vrijstaande woning', energielabel: 'c', omschrijving: '<p>Mooi&nbsp;huis</p>', kenmerken: ['Garage'],
  fotos: [{ url: 'https://m.example/1.jpg', omschrijving: 'Voor' }, { url: 'javascript:alert(1)' }, 'http://onveilig.example/x.jpg'],
};

describe('koppeling (JSON)', () => {
  it('neemt een goede woning op en maakt hem schoon', () => {
    const r = parseJsonFeed({ woningen: [good] }, 'conn-1');
    expect(r.rejected).toEqual([]);
    const i = r.items[0];
    expect(i).toMatchObject({ external_id: 'RW-1', status: 'beschikbaar', postcode: '9981 AB', province: 'groningen', asking_price: 289000, property_type: 'vrijstaand', energy_label: 'C', description: 'Mooi huis' });
    expect(i.photos).toEqual([{ url: 'https://m.example/1.jpg', alt: 'Voor' }]);   // geen javascript: en geen http
    expect(i.slug).toMatch(/^hoofdstraat-12-uithuizen-[0-9a-f]{8}$/);
  });
  it('wijst woningen buiten het noorden af, met reden, en gaat door met de rest', () => {
    const r = parseJsonFeed([good, { ...good, id: 'X', plaats: 'Amsterdam', postcode: '1011 AB' }, { ...good, id: 'Y', vraagprijs: 'veel' }, { ...good, id: 'Z', type: 'kasteel' }], 'c');
    expect(r.items).toHaveLength(1);
    expect(r.rejected.map((x) => [x.external_id, x.reason])).toEqual([
      ['X', expect.stringContaining('Groningen, Friesland en Drenthe')], ['Y', expect.stringContaining('vraagprijs')], ['Z', expect.stringContaining('kasteel')],
    ]);
  });
  it('weigert dubbele id’s, onbekende status en kapotte invoer', () => {
    expect(parseJsonFeed([good, good], 'c').rejected[0].reason).toMatch(/twee keer/);
    expect(parseJsonFeed([{ ...good, status: 'raar' }], 'c').rejected[0].reason).toMatch(/status/);
    expect(() => parseJsonFeed({ nope: 1 }, 'c')).toThrow();
  });
  it('de slug hangt af van de koppeling, niet van toeval', () => {
    expect(parseJsonFeed([good], 'a').items[0].slug).toBe(parseJsonFeed([good], 'a').items[0].slug);
    expect(parseJsonFeed([good], 'a').items[0].slug).not.toBe(parseJsonFeed([good], 'b').items[0].slug);
  });
  it('volledig:true wordt doorgegeven, en meer dan 500 woningen niet', () => {
    expect(parseJsonFeed({ volledig: true, woningen: [good] }, 'c').full).toBe(true);
    const many = Array.from({ length: 501 }, (_, i) => ({ ...good, id: `id${i}` }));
    const r = parseJsonFeed(many, 'c');
    expect(r.items).toHaveLength(500);
    expect(r.rejected.at(-1)!.reason).toMatch(/Maximaal 500/);
  });
});

describe('koppeling (XML)', () => {
  const xml = `<woningen volledig="true"><woning><id>7</id><status>beschikbaar</status><straat>Kerkstraat</straat><huisnummer>4</huisnummer><postcode>8601 AA</postcode><plaats>Sneek</plaats>
    <vraagprijs>245000</vraagprijs><woonoppervlakte>101</woonoppervlakte><kamers>4</kamers><type>tussenwoning</type>
    <kenmerken><kenmerk>Tuin</kenmerk><kenmerk>Berging</kenmerk></kenmerken><fotos><foto url="https://m.example/a.jpg" omschrijving="Straat"/></fotos></woning></woningen>`;
  it('leest hetzelfde formaat als XML', () => {
    const r = parseXmlFeed(xml, 'c');
    expect(r.full).toBe(true);
    expect(r.rejected).toEqual([]);
    expect(r.items[0]).toMatchObject({ external_id: '7', province: 'friesland', features: ['Tuin', 'Berging'], photos: [{ url: 'https://m.example/a.jpg', alt: 'Straat' }] });
  });
  it('geeft een fout bij iets anders dan <woningen>', () => {
    expect(() => parseXmlFeed('<html/>', 'c')).toThrow();
  });
});

const form = (o: Record<string, string>) => { const f = new FormData(); Object.entries(o).forEach(([k, v]) => f.set(k, v)); return f; };

describe('contactformulier', () => {
  const ok = { listingId: 'abc-123', name: 'Anna', email: 'anna@x.nl', phone: '06 12345678', message: 'Hallo', consent: 'on' };
  it('accepteert een geldig verzoek', () => expect(validateLead(form(ok)).ok).toBe(true));
  it('eist toestemming, geldig e-mailadres en bericht', () => {
    expect(validateLead(form({ ...ok, consent: '' }))).toMatchObject({ ok: false, error: expect.stringContaining('privacy') });
    expect(validateLead(form({ ...ok, email: 'geen' }))).toMatchObject({ ok: false });
    expect(validateLead(form({ ...ok, message: '' }))).toMatchObject({ ok: false });
    expect(validateLead(form({ ...ok, listingId: "x'; drop" }))).toMatchObject({ ok: false });
  });
  it('eist naam, telefoonnummer en e-mailadres', () => {
    expect(validateLead(form({ ...ok, name: '' }))).toMatchObject({ ok: false, error: expect.stringContaining('naam') });
    expect(validateLead(form({ ...ok, phone: '' }))).toMatchObject({ ok: false, error: expect.stringContaining('telefoon') });
    expect(validateLead(form({ ...ok, phone: '12345' }))).toMatchObject({ ok: false });
    expect(validateLead(form({ ...ok, phone: 'bel maar' }))).toMatchObject({ ok: false });
    expect(validateLead(form({ ...ok, email: '' }))).toMatchObject({ ok: false });
    for (const phone of ['06 12345678', '+31 6 12345678', '(050) 123 45 67', '050-1234567']) expect(validateLead(form({ ...ok, phone })).ok).toBe(true);
  });
  it('herkent een bot aan het verborgen veld', () => expect(validateLead(form({ ...ok, website: 'http://spam' }))).toMatchObject({ ok: false, bot: true }));
});

describe('woningformulier', () => {
  const ok = { status: 'beschikbaar', street: 'Dorpsstraat', house_number: '5', postcode: '8601aa', city: 'Sneek', province: 'friesland', asking_price: '250000', living_area: '90', rooms: '4', property_type: 'tussenwoning', photos: '[{"url":"https://x.nl/a.jpg"}]', features: 'Tuin\n\nGarage' };
  it('accepteert en normaliseert', () => {
    const r = validateListing(form(ok));
    expect(r.ok && r.value).toMatchObject({ postcode: '8601 AA', features: ['Tuin', 'Garage'], bathrooms: 1, bedrooms: 0 });
  });
  it('weigert andere provincies, onzinprijzen en onveilige foto’s', () => {
    const e = (o: Record<string, string>) => { const r = validateListing(form({ ...ok, ...o })); return r.ok ? [] : r.errors.join('|'); };
    expect(e({ province: 'utrecht' })).toMatch(/Groningen, Friesland of Drenthe/);
    expect(e({ asking_price: '-1' })).toMatch(/vraagprijs/);
    expect(e({ asking_price: '1.5' })).toMatch(/vraagprijs/);
    expect(e({ photos: '[{"url":"javascript:x"}]' })).toMatch(/https/);
    expect(e({ photos: 'kapot' })).toMatch(/foto/);
  });
});

describe('usage gate', () => {
  it('stopt bij het maandbudget en de uurlimiet', () => {
    expect(evaluateGate({ monthCount: 0, hourCount: 0, monthLimit: 10, hourLimit: 5 })).toBe('ok');
    expect(evaluateGate({ monthCount: 10, hourCount: 0, monthLimit: 10, hourLimit: 5 })).toBe('maandbudget');
    expect(evaluateGate({ monthCount: 3, hourCount: 5, monthLimit: 10, hourLimit: 5 })).toBe('uurlimiet');
  });
});

describe('alerts', () => {
  it('vindt alleen nieuwe woningen die bij de zoekopdracht passen', () => {
    const since = '2026-09-25T00:00:00.000Z';
    const r = newMatches(DEMO_LISTINGS, 'provincie=friesland&tot=300000', since);
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((l) => l.province === 'friesland' && l.askingPrice <= 300000 && (l.publishedAt ?? '') > since)).toBe(true);
  });
});
