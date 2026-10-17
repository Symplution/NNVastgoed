import { describe, expect, it } from 'vitest';
import { geocodeAddress, inNoord, lookupPlace, parsePoint, suggestPlaces, zoomForType } from '../src/lib/geo';
import { boundsFor, inBounds, shortPrice, spread } from '../src/lib/map';
import { toMarker, type MapMarker } from '../src/lib/data';
import { DEMO_LISTINGS } from '../src/lib/demo-data';

const reply = (body: unknown, ok = true) => (async () => ({ ok, json: async () => body })) as unknown as typeof fetch;

describe('PDOK-locaties', () => {
  it('leest een punt: de lengtegraad staat eerst', () => {
    expect(parsePoint('POINT(6.5665 53.2194)')).toEqual({ lat: 53.2194, lng: 6.5665 });
    expect(parsePoint('POINT( 5.7 53.1 )')).toEqual({ lat: 53.1, lng: 5.7 });
    expect(parsePoint('POLYGON((1 2))')).toBeNull();
    expect(parsePoint(undefined)).toBeNull();
  });
  it('houdt alleen locaties in het noorden over', () => {
    expect(inNoord({ lat: 53.2, lng: 6.5 })).toBe(true);
    expect(inNoord({ lat: 52.37, lng: 4.9 })).toBe(false);   // Amsterdam
    expect(inNoord({ lat: 51.4, lng: 5.4 })).toBe(false);
  });
  it('zoekt een adres op uit postcode en huisnummer', async () => {
    let asked = '';
    const f = (async (url: string) => { asked = url; return { ok: true, json: async () => ({ response: { docs: [{ centroide_ll: 'POINT(6.5665 53.2194)' }] } }) }; }) as unknown as typeof fetch;
    expect(await geocodeAddress({ postcode: '9711 AB', houseNumber: '12', houseSuffix: 'A' }, f)).toEqual({ lat: 53.2194, lng: 6.5665 });
    expect(asked).toContain('q=9711AB+12+A');
    expect(decodeURIComponent(asked)).toContain('fq=type:adres');
  });
  it('geeft niets terug bij een fout, een time-out of een adres buiten het noorden', async () => {
    expect(await geocodeAddress({ postcode: '9711 AB', houseNumber: '1' }, reply({}, false))).toBeNull();
    expect(await geocodeAddress({ postcode: '9711 AB', houseNumber: '1' }, (async () => { throw new Error('netwerk'); }) as unknown as typeof fetch)).toBeNull();
    expect(await geocodeAddress({ postcode: '1011 AB', houseNumber: '1' }, reply({ response: { docs: [{ centroide_ll: 'POINT(4.9 52.37)' }] } }))).toBeNull();
    expect(await geocodeAddress({ postcode: '9711 AB', houseNumber: '1' }, reply({ response: { docs: [] } }))).toBeNull();
  });
  it('geeft zoeksuggesties en probeert het zonder provinciefilter als dat mislukt', async () => {
    const calls: string[] = [];
    const f = (async (url: string) => { calls.push(decodeURIComponent(url)); return calls.length === 1 ? { ok: false, json: async () => null } : { ok: true, json: async () => ({ response: { docs: [{ id: 'wpl-1', weergavenaam: 'Leeuwarden, Fryslân', type: 'woonplaats' }, { type: 'weg' }] } }) }; }) as unknown as typeof fetch;
    expect(await suggestPlaces('leeuw', f)).toEqual([{ id: 'wpl-1', label: 'Leeuwarden, Fryslân', type: 'woonplaats' }]);
    expect(calls[0]).toContain('provincienaam');
    expect(calls[1]).not.toContain('provincienaam');
    expect(await suggestPlaces('l', f)).toEqual([]);   // te kort
  });
  it('zoekt één plaats op en weigert vreemde sleutels', async () => {
    const ok = reply({ response: { docs: [{ weergavenaam: 'Assen', type: 'woonplaats', centroide_ll: 'POINT(6.56 52.99)' }] } });
    expect(await lookupPlace('wpl-1', ok)).toEqual({ lat: 52.99, lng: 6.56, label: 'Assen', type: 'woonplaats' });
    expect(await lookupPlace('../../etc/passwd', ok)).toBeNull();
    expect(await lookupPlace("x' or 1=1", ok)).toBeNull();
  });
  it('zoomt dichter in op een adres dan op een plaats', () => {
    expect(zoomForType('adres')).toBeGreaterThan(zoomForType('woonplaats'));
  });
});

describe('kaart', () => {
  const m = (over: Partial<MapMarker> = {}): MapMarker => ({ id: 'a', slug: 's', lat: 53.2, lng: 6.5, amount: 325000, price: '€ 325.000 k.k.', address: 'Straat 1', place: '9711 AB Groningen', line: 'x', photo: null, offer: 'koop', newBuild: false, status: 'beschikbaar', ...over });
  it('toont een korte prijs op het huisje', () => {
    expect(shortPrice(m())).toBe('€ 325k');
    expect(shortPrice(m({ amount: 1_250_000 }))).toBe('€ 1,3 mln');
    expect(shortPrice(m({ amount: 1195, offer: 'huur' }))).toBe('€ 1.195');
    expect(shortPrice(m({ amount: 5000 }))).toBe('€ 5.000');
  });
  it('maakt alleen een huisje voor een woning met een locatie', () => {
    const demo = DEMO_LISTINGS[0];
    expect(toMarker(demo)).toMatchObject({ id: demo.id, lat: demo.lat, lng: demo.lng, amount: demo.askingPrice, address: expect.stringContaining(demo.street) });
    expect(toMarker({ ...demo, lat: null, lng: null })).toBeNull();
    expect(DEMO_LISTINGS.every((l) => toMarker(l) !== null)).toBe(true);
  });
  it('bepaalt de uitsnede en wat in beeld is', () => {
    const b = boundsFor([m({ lat: 53.0, lng: 5.0 }), m({ lat: 53.4, lng: 6.9 })]);
    expect(b).toEqual({ south: 53.0, north: 53.4, west: 5.0, east: 6.9 });
    expect(inBounds(m(), b)).toBe(true);
    expect(inBounds(m({ lat: 52.0 }), b)).toBe(false);
    expect(boundsFor([]).south).toBeGreaterThan(52);
  });
  it('zet woningen op dezelfde plek een klein stukje uit elkaar', () => {
    const out = spread([m({ id: '1' }), m({ id: '2' }), m({ id: '3' })]);
    expect(out[0]).toEqual(m({ id: '1' }));
    const keys = new Set(out.map((x) => `${x.lat.toFixed(6)},${x.lng.toFixed(6)}`));
    expect(keys.size).toBe(3);
    expect(out.every((x) => Math.abs(x.lat - 53.2) < 0.001 && Math.abs(x.lng - 6.5) < 0.001)).toBe(true);
  });
});

import { loadMapStyle, MAX_ZOOM, MIN_ZOOM, pdokStyle, WORLD_STYLE_URL } from '../src/lib/map-style';

describe('kaartstijl', () => {
  const world = { version: 8, sources: {}, layers: [{ id: 'a', type: 'background' }] };
  it('gebruikt de wereldkaart als die bereikbaar is', async () => {
    let asked = '';
    const f = (async (url: string) => { asked = url; return { ok: true, json: async () => world }; }) as unknown as typeof fetch;
    expect(await loadMapStyle(f)).toEqual(world);
    expect(asked).toBe(WORLD_STYLE_URL);
  });
  it('valt terug op de Kadasterkaart bij een fout, een time-out of een lege stijl', async () => {
    expect(await loadMapStyle(reply({}, false))).toEqual(pdokStyle());
    expect(await loadMapStyle((async () => { throw new Error('netwerk'); }) as unknown as typeof fetch)).toEqual(pdokStyle());
    expect(await loadMapStyle(reply({ version: 8, layers: [] }))).toEqual(pdokStyle());
    const slow = ((_: string, init: RequestInit) => new Promise((_, reject) => { init.signal!.addEventListener('abort', () => reject(new Error('abort'))); })) as unknown as typeof fetch;
    expect(await loadMapStyle(slow, 30)).toEqual(pdokStyle());
  });
  it('laat je ver uitzoomen en dichtbij inzoomen', () => {
    expect(MIN_ZOOM).toBeLessThan(5);    // heel West-Europa in beeld: Duitsland, België
    expect(MAX_ZOOM).toBeGreaterThanOrEqual(19);   // tot op de straat
  });
});
