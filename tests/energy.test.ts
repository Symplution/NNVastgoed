import { describe, expect, it } from 'vitest';
import { ENERGY_COLOR, ENERGY_EXPLAIN, colorFor, letterOf } from '../src/lib/energy';
import { ENERGY_LABELS } from '../src/lib/types';

describe('energielabels', () => {
  it('elk label heeft een kleur', () => { for (const l of ENERGY_LABELS) expect(ENERGY_COLOR[l], l).toBeTruthy(); });
  it('A is groen, D geel en G rood', () => {
    expect(colorFor('A').bg).toMatch(/^#[34]/);
    expect(colorFor('D').bg).toBe('#f6f158');
    expect(colorFor('G').bg).toBe('#cd3b2d');
    expect(colorFor('onbekend').bg).toMatch(/^#/);
  });
  it('de plussen horen bij A en elke letter heeft uitleg', () => {
    expect(letterOf('A+++')).toBe('A');
    expect(letterOf('C')).toBe('C');
    expect(ENERGY_EXPLAIN.map((e) => e.letter)).toEqual(['A', 'B', 'C', 'D', 'E', 'F', 'G']);
  });
});
