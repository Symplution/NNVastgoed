import { describe, expect, it } from 'vitest';
import { LISTING_FEE, PROMO_FEE, euro } from '../src/lib/pricing';

describe('tarieven voor makelaars', () => {
  it('registreren is gratis, een woning plaatsen kost 250 en promoten 50', () => {
    expect(LISTING_FEE.amount).toBe(250);
    expect(PROMO_FEE.amount).toBe(50);
    expect(PROMO_FEE.boost).toBe(5);
  });
  it('schrijft bedragen in het Nederlands', () => { expect(euro(1750)).toMatch(/^€ 1\.750$/); });
});
