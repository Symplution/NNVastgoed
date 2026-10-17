import { describe, expect, it } from 'vitest';
import { DEMO_LISTINGS, DEMO_OFFICES } from '../src/lib/demo-data';
import { filtersToParams, matches, modeFromParams, parseFilters, priceStepsFor } from '../src/lib/search';
import { marketStats } from '../src/lib/market';
import { buildContacts } from '../src/lib/staff-data';
import { formatPrice } from '../src/lib/format';
import { newMatches } from '../src/lib/alert-match';
import { validateListing } from '../src/lib/listing-input';
import { parseJsonFeed } from '../src/lib/feeds/parse';

const run = (qs: string, mode: Parameters<typeof parseFilters>[1]) => DEMO_LISTINGS.filter((l) => matches(l, parseFilters(new URLSearchParams(qs), mode)));

describe('kopen, huren, nieuwbouw en bedrijfsruimte', () => {
  it('kopen toont alleen koopwoningen, huren alleen huurwoningen', () => {
    expect(run('', 'koop').every((l) => l.offer === 'koop' && l.category === 'woning')).toBe(true);
    const huur = run('', 'huur');
    expect(huur.length).toBeGreaterThan(3);
    expect(huur.every((l) => l.offer === 'huur' && l.category === 'woning' && l.priceType === 'p.m.')).toBe(true);
  });
  it('nieuwbouw is nieuwbouw, met koop of huur te kiezen', () => {
    const all = run('', 'nieuwbouw');
    expect(all.length).toBeGreaterThan(2);
    expect(all.every((l) => l.newBuild)).toBe(true);
    expect(run('aanbod=huur', 'nieuwbouw').every((l) => l.offer === 'huur')).toBe(true);
    expect(run('aanbod=koop', 'nieuwbouw').every((l) => l.offer === 'koop')).toBe(true);
  });
  it('bedrijfsruimte heeft alleen bedrijfsruimte en geen woningen', () => {
    const b = run('', 'bedrijfsruimte');
    expect(b.length).toBeGreaterThan(3);
    expect(b.every((l) => l.category === 'bedrijfsruimte' && ['kantoorruimte', 'bedrijfshal', 'winkelruimte', 'horecapand'].includes(l.propertyType))).toBe(true);
    expect(run('', 'koop').some((l) => l.category === 'bedrijfsruimte')).toBe(false);
  });
  it('een huurprijs filtert op huur per maand', () => {
    const r = run('tot=1250', 'huur');
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((l) => l.askingPrice <= 1250)).toBe(true);
    expect(priceStepsFor({ mode: 'huur' })[0]).toBeLessThan(1000);
    expect(priceStepsFor({ mode: 'koop' })[0]).toBeGreaterThan(10_000);
    expect(priceStepsFor({ mode: 'bedrijfsruimte', offer: 'huur' })[0]).toBeLessThan(1000);
  });
  it('de aanbodkeuze telt alleen bij nieuwbouw en bedrijfsruimte', () => {
    expect(parseFilters(new URLSearchParams('aanbod=huur'), 'koop').offer).toBeUndefined();
    expect(parseFilters(new URLSearchParams('aanbod=huur'), 'bedrijfsruimte').offer).toBe('huur');
  });
  it('een opgeslagen zoekopdracht onthoudt de soort', () => {
    const f = parseFilters(new URLSearchParams('tot=1500'), 'huur');
    const qs = filtersToParams(f).toString();
    expect(qs).toContain('soort=huur');
    expect(modeFromParams(new URLSearchParams(qs))).toBe('huur');
    expect(modeFromParams(new URLSearchParams('tot=300000'))).toBe('koop');
    const huur = DEMO_LISTINGS.find((l) => l.offer === 'huur')!;
    expect(newMatches([huur], qs, '2000-01-01T00:00:00Z')).toHaveLength(huur.askingPrice <= 1500 ? 1 : 0);
    expect(newMatches([huur], 'tot=5000', '2000-01-01T00:00:00Z')).toHaveLength(0);   // koopzoekopdracht
  });
  it('de prijs toont per maand bij huur', () => {
    expect(formatPrice({ askingPrice: 1195, priceType: 'p.m.' })).toBe('€ 1.195 p.m.');
  });
  it('de demo heeft NVM-kantoren en kantoren zonder', () => {
    expect(DEMO_OFFICES.some((o) => o.nvmMember)).toBe(true);
    expect(DEMO_OFFICES.some((o) => !o.nvmMember)).toBe(true);
  });
});

describe('woningmarkt', () => {
  it('telt het aanbod en rekent gemiddelden per provincie', () => {
    const m = marketStats(DEMO_LISTINGS);
    expect(m.koop).toBeGreaterThan(20);
    expect(m.huur).toBeGreaterThan(3);
    expect(m.nieuwbouw).toBeGreaterThan(2);
    expect(m.avgRent).toBeGreaterThan(500);
    expect(m.provinces.map((p) => p.province)).toEqual(['groningen', 'friesland', 'drenthe']);
    expect(m.provinces.every((p) => p.avgPrice! > 100_000 && p.avgPerM2! > 1000)).toBe(true);
  });
  it('telt verkochte en conceptwoningen niet mee', () => {
    const one = { ...DEMO_LISTINGS[0], status: 'verkocht' as const };
    expect(marketStats([one]).koop).toBe(0);
    expect(marketStats([]).provinces[0].avgPrice).toBeNull();
  });
});

describe('contacten', () => {
  const lead = { id: 'a', listingId: 'l', listing: 'Straat 1, Plaats', name: 'Anna', email: 'Anna@X.nl', phone: null, message: 'Hoi', kind: 'info', status: 'nieuw', createdAt: '2026-10-01T10:00:00Z', office: '' };
  const viewing = { id: 'v', listingId: 'l', listingSlug: 's', listing: 'Straat 1', city: 'Plaats', name: 'Anna de Vries', email: 'anna@x.nl', phone: '06 1', note: null, startsAt: '2026-10-05T09:00:00Z', endsAt: '2026-10-05T09:30:00Z', status: 'bevestigd', source: 'site', byAccount: true, cancelledBy: null };
  const thread = { id: 't', listingSlug: 's', address: 'Straat 1', city: 'Plaats', name: 'Anna de Vries', email: 'anna@x.nl', phone: '06 1', last: 'Tot dan', lastAt: '2026-10-06T10:00:00Z', lastFrom: 'zoeker' as const, unread: 0, office: '' };
  it('voegt dezelfde persoon uit formulier, bezichtiging en gesprek samen, ook bij hoofdletters', () => {
    const c = buildContacts({ leads: [lead], viewings: [viewing], threads: [thread] });
    expect(c).toHaveLength(1);
    expect(c[0]).toMatchObject({ email: 'anna@x.nl', name: 'Anna de Vries', phone: '06 1', hasAccount: true, leads: 1, viewings: 1, conversations: 1 });
    expect(c[0].events.map((e) => e.kind)).toEqual(['bericht', 'bezichtiging', 'lead']);   // nieuwste eerst
  });
  it('houdt verschillende mensen uit elkaar en sorteert op laatste activiteit', () => {
    const c = buildContacts({ leads: [lead, { ...lead, id: 'b', email: 'piet@x.nl', name: 'Piet', createdAt: '2026-10-09T10:00:00Z' }], viewings: [], threads: [] });
    expect(c.map((x) => x.name)).toEqual(['Piet', 'Anna']);
  });
});

describe('woning invoeren: huur en bedrijfsruimte', () => {
  const form = (o: Record<string, string>) => { const f = new FormData(); Object.entries(o).forEach(([k, v]) => f.set(k, v)); return f; };
  const base = { status: 'beschikbaar', street: 'Dorpsstraat', house_number: '5', postcode: '8601 AA', city: 'Sneek', province: 'friesland', asking_price: '1200', living_area: '90', rooms: '4', property_type: 'tussenwoning' };
  it('huur wordt per maand en bedrijfsruimte volgt uit de soort', () => {
    const huur = validateListing(form({ ...base, offer: 'huur', price_type: 'k.k.' }));
    expect(huur.ok && huur.value).toMatchObject({ offer: 'huur', price_type: 'p.m.', category: 'woning' });
    const kantoor = validateListing(form({ ...base, property_type: 'kantoorruimte', rooms: '0', new_build: 'on' }));
    expect(kantoor.ok && kantoor.value).toMatchObject({ category: 'bedrijfsruimte', new_build: true, offer: 'koop', price_type: 'k.k.' });
  });
  it('een huur boven € 100.000 per maand is een tikfout', () => {
    const r = validateListing(form({ ...base, offer: 'huur', asking_price: '250000' }));
    expect(r.ok).toBe(false);
  });
});

describe('koppeling: huur, nieuwbouw en bedrijfsruimte', () => {
  const rec = { id: 'H1', straat: 'Hoofdstraat', huisnummer: '1', postcode: '9981 AB', plaats: 'Uithuizen', vraagprijs: 950, woonoppervlakte: 70, kamers: 3, type: 'appartement', aanbod: 'te huur', nieuwbouw: 'ja' };
  it('huur wordt per maand, nieuwbouw wordt herkend', () => {
    const r = parseJsonFeed([rec], 'c');
    expect(r.rejected).toEqual([]);
    expect(r.items[0]).toMatchObject({ offer: 'huur', price_type: 'p.m.', new_build: true, category: 'woning' });
  });
  it('een bedrijfsruimte met een alias wordt herkend', () => {
    const r = parseJsonFeed([{ ...rec, id: 'B1', type: 'Kantoorpand', kamers: 0, aanbod: 'koop', vraagprijs: 450000, nieuwbouw: false }], 'c');
    expect(r.items[0]).toMatchObject({ category: 'bedrijfsruimte', property_type: 'kantoorruimte', offer: 'koop', new_build: false, price_type: 'k.k.' });
  });
  it('weigert een onbekend aanbod en een huurprijs die een koopprijs lijkt', () => {
    const r = parseJsonFeed([{ ...rec, aanbod: 'verhuur-op-termijn' }, { ...rec, id: 'H2', vraagprijs: 450000 }], 'c');
    expect(r.items).toHaveLength(0);
    expect(r.rejected.map((x) => x.reason)).toEqual([expect.stringContaining('Onbekend aanbod'), expect.stringContaining('per maand')]);
  });
});
