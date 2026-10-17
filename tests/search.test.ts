import { describe, expect, it } from 'vitest';
import { DEMO_LISTINGS } from '../src/lib/demo-data';
import { filtersToParams, matches, parseFilters, sortListings, cleanQuery } from '../src/lib/search';
import { resolveProvince } from '../src/lib/regions';
import { monthlyPayment } from '../src/lib/mortgage';
import { address, formatEuro, normalizePostcode, slugify } from '../src/lib/format';

const q = (s: string) => parseFilters(new URLSearchParams(s));
const run = (s: string) => DEMO_LISTINGS.filter((l) => matches(l, q(s)));

describe('zoeken', () => {
  it('toont alleen woningen in het noorden, nooit concepten of ingetrokken', () => {
    expect(DEMO_LISTINGS.every((l) => ['groningen', 'friesland', 'drenthe'].includes(l.province))).toBe(true);
    expect(run('').every((l) => ['beschikbaar', 'onder_bod', 'onder_voorbehoud'].includes(l.status))).toBe(true);
  });
  it('filtert op provincie, prijs en kamers', () => {
    const r = run('provincie=friesland&tot=300000&kamers=4');
    expect(r.length).toBeGreaterThan(0);
    expect(r.every((l) => l.province === 'friesland' && l.askingPrice <= 300000 && l.rooms >= 4)).toBe(true);
  });
  it('zoekt op plaats en op postcode', () => {
    expect(run('q=sneek').every((l) => l.city === 'Sneek')).toBe(true);
    expect(run('q=9711').every((l) => l.postcode.startsWith('9711'))).toBe(true);
  });
  it('energielabel is "minimaal"', () => {
    expect(run('label=B').every((l) => ['A++', 'A+', 'A', 'B', 'A+++', 'A++++'].includes(l.energyLabel!))).toBe(true);
  });
  it('verkochte woningen alleen op verzoek', () => {
    expect(run('').some((l) => l.status === 'verkocht')).toBe(false);
    expect(run('verkocht=1').some((l) => l.status === 'verkocht')).toBe(true);
  });
  it('onzin in de adresbalk wordt genegeerd', () => {
    const f = q('provincie=utrecht&van=abc&tot=-5&sorteer=hack&pagina=0&type=x&label=Z');
    expect(f).toMatchObject({ province: undefined, minPrice: undefined, maxPrice: undefined, sort: 'nieuw', page: 1, types: [], energy: undefined });
  });
  it('maakt een zoekterm veilig voor de database', () => {
    expect(cleanQuery('a,b)(c%')).toBe('a b c');
  });
  it('sorteert', () => {
    const p = sortListings(DEMO_LISTINGS, 'prijs-op').map((l) => l.askingPrice);
    expect(p).toEqual([...p].sort((a, b) => a - b));
  });
  it('maakt van filters weer een query en terug', () => {
    const f = q('provincie=drenthe&tot=400000&type=vrijstaand&type=bungalow&sorteer=prijs-af&pagina=2');
    expect(q(filtersToParams(f).toString())).toEqual(f);
  });
});

describe('regio', () => {
  it('herkent provincie uit naam of plaats, en weigert de rest', () => {
    expect(resolveProvince('Fryslân')).toBe('friesland');
    expect(resolveProvince('', 'Emmen')).toBe('drenthe');
    expect(resolveProvince('', 'Amsterdam')).toBeUndefined();
    expect(resolveProvince('Noord-Holland', 'Amsterdam')).toBeUndefined();
  });
});

describe('opmaak en rekenen', () => {
  it('formatteert', () => {
    expect(formatEuro(325000)).toBe('€ 325.000');
    expect(normalizePostcode('9711ab')).toBe('9711 AB');
    expect(address({ street: 'Hoofdstraat', houseNumber: '12', houseSuffix: 'A' })).toBe('Hoofdstraat 12A');
    expect(address({ street: 'Hoofdstraat', houseNumber: '12', houseSuffix: '2' })).toBe('Hoofdstraat 12-2');
    expect(slugify('Nieuwe Ebbingestraat 34 Groningen')).toBe('nieuwe-ebbingestraat-34-groningen');
  });
  it('annuïteit klopt', () => {
    expect(Math.round(monthlyPayment(300000, 4, 30))).toBe(1432);
    expect(monthlyPayment(120000, 0, 10)).toBe(1000);
    expect(monthlyPayment(0, 4, 30)).toBe(0);
  });
  it('demo-slugs zijn uniek', () => {
    expect(new Set(DEMO_LISTINGS.map((l) => l.slug)).size).toBe(DEMO_LISTINGS.length);
  });
});
