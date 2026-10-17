import { describe, expect, it } from 'vitest';
import { addDays, buildIcs, demoSlots, groupSlotsByDay, weekStart, zonedToUtc } from '../src/lib/viewings';

describe('Nederlandse klok', () => {
  it('rekent zomertijd (UTC+2) en wintertijd (UTC+1) goed om', () => {
    expect(zonedToUtc('2026-07-15T09:00')!.toISOString()).toBe('2026-07-15T07:00:00.000Z');
    expect(zonedToUtc('2026-01-15T09:00')!.toISOString()).toBe('2026-01-15T08:00:00.000Z');
  });
  it('houdt rekening met het omzetten van de klok', () => {
    expect(zonedToUtc('2026-03-29T01:30')!.toISOString()).toBe('2026-03-29T00:30:00.000Z');   // nog wintertijd
    expect(zonedToUtc('2026-03-29T04:00')!.toISOString()).toBe('2026-03-29T02:00:00.000Z');   // al zomertijd
    expect(zonedToUtc('2026-10-25T01:30')!.toISOString()).toBe('2026-10-24T23:30:00.000Z');   // nog zomertijd
    expect(zonedToUtc('2026-10-25T04:00')!.toISOString()).toBe('2026-10-25T03:00:00.000Z');   // wintertijd
  });
  it('weigert onzin', () => {
    expect(zonedToUtc('morgen')).toBeNull();
    expect(zonedToUtc('')).toBeNull();
  });
});

describe('weken', () => {
  it('begint de week op maandag', () => {
    expect(weekStart('2026-10-21')).toBe('2026-10-19');   // woensdag
    expect(weekStart('2026-10-19')).toBe('2026-10-19');   // maandag
    expect(weekStart('2026-10-25')).toBe('2026-10-19');   // zondag
  });
  it('telt dagen op over een maandgrens', () => {
    expect(addDays('2026-10-30', 3)).toBe('2026-11-02');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });
});

describe('momenten per dag', () => {
  it('groepeert op de Nederlandse dag, niet op UTC', () => {
    const s = (iso: string) => ({ start: iso, end: iso });
    const days = groupSlotsByDay([s('2026-10-20T22:30:00Z'), s('2026-10-20T07:00:00Z'), s('2026-10-21T07:30:00Z')]);
    expect(days.map((d) => d.day)).toEqual(['2026-10-20', '2026-10-21']);   // 22:30 UTC is al 00:30 op 21 oktober
    expect(days[0].slots).toHaveLength(1);
    expect(days[1].slots).toHaveLength(2);
    expect(days[0].slots[0].start).toBe('2026-10-20T07:00:00Z');
  });
  it('de demomomenten zijn werkdagen, om het half uur, in de toekomst', () => {
    const now = new Date('2026-10-17T10:00:00Z');   // zaterdag
    const slots = demoSlots(now);
    expect(slots.length).toBeGreaterThan(50);
    expect(slots.every((s) => new Date(s.start) > now)).toBe(true);
    expect(slots.every((s) => new Date(s.end).getTime() - new Date(s.start).getTime() === 30 * 60_000)).toBe(true);
    const dow = new Set(slots.map((s) => new Date(s.start).toLocaleDateString('en-GB', { weekday: 'short', timeZone: 'Europe/Amsterdam' })));
    expect(dow.has('Sat') || dow.has('Sun')).toBe(false);
  });
});

describe('agenda-bestand', () => {
  const ics = buildIcs({ uid: 'abc', start: '2026-10-20T07:00:00Z', end: '2026-10-20T07:30:00Z', summary: 'Bezichtiging Hoofdstraat 1, Uithuizen', description: 'Regel een; regel twee, met komma', location: 'Hoofdstraat 1, Uithuizen', url: 'https://nnv.nl/bezichtiging/abc' }, new Date('2026-10-17T12:00:00Z'));
  it('is een geldig bestand met CRLF en tijden in UTC', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('DTSTART:20261020T070000Z');
    expect(ics).toContain('DTEND:20261020T073000Z');
    expect(ics).toContain('DTSTAMP:20261017T120000Z');
    expect(ics).toContain('UID:abc@nnvastgoed');
    expect(ics).toContain('STATUS:CONFIRMED');
    expect(ics.split('\r\n').every((l) => l.length <= 75)).toBe(true);
  });
  it('escapet komma, puntkomma en nieuwe regels', () => {
    expect(ics).toContain('DESCRIPTION:Regel een\; regel twee\\, met komma');
    expect(buildIcs({ uid: 'x', start: '2026-10-20T07:00:00Z', end: '2026-10-20T08:00:00Z', summary: 'a\nb' })).toContain('SUMMARY:a\\nb');
  });
  it('een geannuleerde bezichtiging krijgt de status CANCELLED', () => {
    expect(buildIcs({ uid: 'x', start: '2026-10-20T07:00:00Z', end: '2026-10-20T08:00:00Z', summary: 's', cancelled: true })).toContain('STATUS:CANCELLED');
  });
  it('vouwt lange regels', () => {
    const long = buildIcs({ uid: 'x', start: '2026-10-20T07:00:00Z', end: '2026-10-20T08:00:00Z', summary: 'a'.repeat(200) });
    expect(long).toContain('\r\n ');
    expect(long.split('\r\n').every((l) => l.length <= 75)).toBe(true);
  });
});
