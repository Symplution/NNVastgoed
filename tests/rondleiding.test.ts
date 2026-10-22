import { describe, expect, it } from 'vitest';
import { EMPTY_STATE, TOURS, TOUR_IDS, currentStep, isComplete, markVisited, parseState } from '../src/lib/rondleiding';

describe('rondleiding', () => {
  it('heeft voor klant en makelaar unieke stappen met een pagina en een te markeren onderdeel', () => {
    for (const id of TOUR_IDS) {
      const steps = TOURS[id].steps;
      expect(new Set(steps.map((s) => s.id)).size).toBe(steps.length);
      for (const s of steps) { expect(s.href.startsWith('/')).toBe(true); expect(s.target.length).toBeGreaterThan(3); expect(s.title && s.text).toBeTruthy(); }
    }
    expect(TOURS.klant.steps.length).toBeGreaterThanOrEqual(10);
    expect(TOURS.makelaar.steps.map((s) => s.href)).toEqual(expect.arrayContaining(['/beheer', '/beheer/woningen', '/beheer/bezichtigingen', '/beheer/berichten', '/beheer/leads', '/beheer/contacten', '/beheer/koppelingen', '/beheer/kantoor']));
  });
  it('de stap van de pagina waar je naartoe gaat is af, maar pas nadat de rondleiding is gestart', () => {
    expect(markVisited(EMPTY_STATE, '/koop').done.klant).toEqual([]);
    const started = { ...EMPTY_STATE, started: { klant: true, makelaar: false } };
    expect(markVisited(started, '/koop').done.klant).toEqual(['kopen']);
    expect(markVisited(started, '/woning/abc-123').done.klant).toEqual(['woning']);
    expect(markVisited(started, '/koop').done.makelaar).toEqual([]);
  });
  it('de volgende stap is de eerste die nog niet af is, en klaar is klaar', () => {
    let s = { ...EMPTY_STATE, started: { klant: true, makelaar: false } };
    expect(currentStep(s, 'klant')?.id).toBe('kopen');
    for (const step of TOURS.klant.steps) s = { ...s, done: { ...s.done, klant: [...s.done.klant, step.id] } };
    expect(isComplete(s, 'klant')).toBe(true);
    expect(currentStep(s, 'klant')).toBeNull();
    expect(isComplete(s, 'makelaar')).toBe(false);
  });
  it('bewaarde gegevens die niet kloppen worden genegeerd', () => {
    expect(parseState('kapot{')).toEqual(EMPTY_STATE);
    expect(parseState(JSON.stringify({ tab: 'makelaar', started: { klant: true }, done: { klant: ['kopen', 'bestaat-niet'] } })).done.klant).toEqual(['kopen']);
    expect(parseState(null)).toEqual(EMPTY_STATE);
  });
});
