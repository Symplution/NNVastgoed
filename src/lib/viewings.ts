import { dayKey, formatDay } from './format';

export interface Slot { start: string; end: string }
export interface SlotDay { day: string; label: string; slots: Slot[] }

/** Vrije momenten gegroepeerd per dag, op de Nederlandse klok. */
export function groupSlotsByDay(slots: Slot[]): SlotDay[] {
  const days = new Map<string, SlotDay>();
  for (const s of [...slots].sort((a, b) => a.start.localeCompare(b.start))) {
    const key = dayKey(s.start);
    if (!days.has(key)) days.set(key, { day: key, label: formatDay(s.start), slots: [] });
    days.get(key)!.slots.push(s);
  }
  return [...days.values()];
}

const TZ = 'Europe/Amsterdam';

/** Verschil tussen UTC en de Nederlandse klok op dit moment, in milliseconden (zomertijd of wintertijd). */
function offsetMs(at: Date): number {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })
    .formatToParts(at).filter((x) => x.type !== 'literal').map((x) => [x.type, Number(x.value)]));
  return Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second) - at.getTime();
}

/** "2026-10-20T09:30" (Nederlandse klok) → het echte tijdstip. Ongeldig → null. */
export function zonedToUtc(local: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})$/.exec(local.trim());
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const guess = Date.UTC(y, mo - 1, d, h, mi);
  let t = guess - offsetMs(new Date(guess));
  t = guess - offsetMs(new Date(t));   // opnieuw, voor de uren rond het omzetten van de klok
  const out = new Date(t);
  return Number.isNaN(out.getTime()) ? null : out;
}

/** Maandag van de week waarin deze dag valt, als JJJJ-MM-DD (week begint op maandag). */
export function weekStart(day: string): string {
  const [y, m, d] = day.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  const back = (dt.getUTCDay() + 6) % 7;
  dt.setUTCDate(dt.getUTCDate() - back);
  return dt.toISOString().slice(0, 10);
}
export function addDays(day: string, n: number): string {
  const [y, m, d] = day.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return dt.toISOString().slice(0, 10);
}

const icsDate = (d: Date) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
/** Regels van maximaal 75 tekens, met een spatie op de volgende regel (RFC 5545). */
const fold = (line: string): string => (line.length <= 75 ? line : line.slice(0, 75) + '\r\n' + fold(' ' + line.slice(75)));

export interface IcsInput { uid: string; start: string; end: string; summary: string; description?: string; location?: string; url?: string; cancelled?: boolean }

/** Een agenda-bestand (.ics) dat in Google Agenda, Apple Agenda en Outlook past. */
export function buildIcs(e: IcsInput, now = new Date()): string {
  const lines = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//NNvastgoed//Bezichtiging//NL', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT', `UID:${e.uid}@nnvastgoed`, `DTSTAMP:${icsDate(now)}`, `DTSTART:${icsDate(new Date(e.start))}`, `DTEND:${icsDate(new Date(e.end))}`,
    `SUMMARY:${icsText(e.summary)}`,
    ...(e.description ? [`DESCRIPTION:${icsText(e.description)}`] : []),
    ...(e.location ? [`LOCATION:${icsText(e.location)}`] : []),
    ...(e.url ? [`URL:${e.url}`] : []),
    `STATUS:${e.cancelled ? 'CANCELLED' : 'CONFIRMED'}`,
    'BEGIN:VALARM', 'ACTION:DISPLAY', 'DESCRIPTION:Bezichtiging over een uur', 'TRIGGER:-PT1H', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ];
  return lines.map(fold).join('\r\n') + '\r\n';
}

/** Voorbeeldmomenten voor de demomodus: werkdagen 09:00–12:00 en 13:00–16:00, om het half uur. */
export function demoSlots(now = new Date()): Slot[] {
  const out: Slot[] = [];
  for (let n = 1; n <= 14; n++) {
    const day = addDays(dayKey(now.toISOString()), n);
    const dow = (new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7;
    if (dow >= 5) continue;   // zaterdag en zondag overslaan
    for (const [from, to] of [[9, 12], [13, 16]] as const)
      for (let h = from * 2; h < to * 2; h++) {
        const start = zonedToUtc(`${day}T${String(Math.floor(h / 2)).padStart(2, '0')}:${h % 2 ? '30' : '00'}`);
        if (start) out.push({ start: start.toISOString(), end: new Date(start.getTime() + 30 * 60_000).toISOString() });
      }
  }
  return out;
}

export const WEEKDAYS = ['Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag', 'Zondag'] as const;
