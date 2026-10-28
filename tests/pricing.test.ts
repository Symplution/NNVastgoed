import { describe, expect, it } from 'vitest';
import { LISTING_FEE, TOPPER_FEE, euro } from '../src/lib/pricing';

describe('tarieven voor makelaars', () => {
  it('registreren is gratis, een woning plaatsen kost 200 en de topper van de maand 75 extra', () => {
    expect(LISTING_FEE.amount).toBe(200);
    expect(TOPPER_FEE.amount).toBe(75);
  });
  it('schrijft bedragen in het Nederlands', () => { expect(euro(1750)).toMatch(/^€ 1\.750$/); });
});
