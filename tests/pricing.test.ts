import { describe, expect, it } from 'vitest';
import { CUSTOM_CAMPAIGNS, OBJECT_TYPES, OFFICE_PRICES, PRICE_GROUPS, euro } from '../src/lib/pricing';

describe('tarieven voor makelaars', () => {
  it('heeft voor elke regel een prijs of een streepje per objecttype', () => {
    for (const r of PRICE_GROUPS.flatMap((g) => g.rows)) {
      expect(r.prices).toHaveLength(OBJECT_TYPES.length);
      for (const p of r.prices) expect(p === null || (Number.isInteger(p) && p > 0)).toBe(true);
    }
  });
  it('een jaar Premium kost meer dan Compleet, en twee provincies meer dan één', () => {
    const row = (name: string, period?: string) => PRICE_GROUPS.flatMap((g) => g.rows).find((r) => r.name === name && (!period || r.period === period))!;
    expect(row('NNV Premium').prices[0]!).toBeGreaterThan(row('NNV Compleet').prices[0]!);
    expect(row('Regio in beeld · 2 provincies').prices[0]!).toBeGreaterThan(row('Regio in beeld · 1 provincie').prices[0]!);
    expect(row('Regio in beeld · heel Noord-Nederland').prices[0]!).toBeGreaterThan(row('Regio in beeld · 2 provincies').prices[0]!);
    expect(row('Topositie', 'Maand').prices[0]!).toBeLessThan(row('Topositie', 'Week').prices[0]! * 4);   // een maand is voordeliger dan vier weken
  });
  it('heeft kantoorprijzen en campagnes met een prijs', () => {
    expect(OFFICE_PRICES.every((o) => o.price > 0)).toBe(true);
    expect(CUSTOM_CAMPAIGNS.every((c) => c.from > 0)).toBe(true);
  });
  it('schrijft bedragen in het Nederlands', () => { expect(euro(1750)).toMatch(/^€ 1\.750$/); });
});
