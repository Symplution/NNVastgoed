import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { dayKey, formatTime } from '@/lib/format';
import { addDays, WEEKDAYS } from '@/lib/viewings';
import type { ViewingRow } from '@/lib/staff-data';

const FROM = 7, TO = 21, H = 56;   // uren zichtbaar, hoogte van een uur in pixels
const TONE: Record<string, string> = {
  bevestigd: 'border-brand bg-brand-soft text-brand-dark', afgerond: 'border-line bg-sand text-muted', niet_verschenen: 'border-amber-400 bg-amber-50 text-amber-900', geannuleerd: 'border-red-300 bg-red-50 text-red-800 line-through',
};

/** Minuten sinds middernacht op de Nederlandse klok. */
function minutes(iso: string): number {
  const p = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Amsterdam', hourCycle: 'h23', hour: '2-digit', minute: '2-digit' }).formatToParts(new Date(iso)).filter((x) => x.type !== 'literal').map((x) => [x.type, Number(x.value)]));
  return p.hour * 60 + p.minute;
}

/** Weekoverzicht van de bezichtigingen, van maandag tot zondag. */
export function ViewingsAgenda({ viewings, week, base }: { viewings: ViewingRow[]; week: string; base: string }) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(week, i));
  const today = dayKey(new Date().toISOString());
  const hours = Array.from({ length: TO - FROM }, (_, i) => FROM + i);
  const nav = (w: string, label: string, icon?: 'l' | 'r') => (
    <Link href={`${base}?weergave=agenda&week=${w}`} className="btn-ghost !py-1.5">{icon === 'l' && <ChevronLeft size={16} aria-hidden />}{label}{icon === 'r' && <ChevronRight size={16} aria-hidden />}</Link>
  );
  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        {nav(addDays(week, -7), 'Vorige', 'l')}{nav(today, 'Vandaag')}{nav(addDays(week, 7), 'Volgende', 'r')}
        <p className="ml-2 text-sm font-semibold">Week van {new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${week}T12:00:00Z`))}</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-line">
        <div className="grid min-w-[44rem]" style={{ gridTemplateColumns: '3rem repeat(7, minmax(0, 1fr))' }}>
          <div />
          {days.map((d, i) => (
            <div key={d} className={`border-l border-line px-2 py-2 text-center text-xs ${d === today ? 'bg-accent-soft font-bold text-accent-dark' : 'bg-sand text-muted'}`}>
              <span className="block font-semibold uppercase">{WEEKDAYS[i].slice(0, 2)}</span><span className="block text-sm">{Number(d.slice(8))}</span>
            </div>
          ))}
          <div className="relative" style={{ height: (TO - FROM) * H }}>
            {hours.map((h) => <span key={h} className="absolute right-1.5 -translate-y-2 text-[11px] text-muted" style={{ top: (h - FROM) * H }}>{String(h).padStart(2, '0')}:00</span>)}
          </div>
          {days.map((d) => (
            <div key={d} className="relative border-l border-line" style={{ height: (TO - FROM) * H }}>
              {hours.map((h) => <div key={h} className="absolute inset-x-0 border-t border-line/70" style={{ top: (h - FROM) * H }} />)}
              {viewings.filter((v) => dayKey(v.startsAt) === d).map((v) => {
                const top = Math.max(0, (minutes(v.startsAt) - FROM * 60) / 60 * H);
                const height = Math.max(30, ((minutes(v.endsAt) - minutes(v.startsAt)) / 60) * H - 2);
                return (
                  <div key={v.id} title={`${v.name} · ${v.email}${v.phone ? ` · ${v.phone}` : ''}`} className={`absolute inset-x-0.5 overflow-hidden rounded-md border-l-4 px-1.5 py-1 text-[11px] leading-tight ${TONE[v.status] ?? TONE.bevestigd}`} style={{ top, height }}>
                    <span className="block font-bold">{formatTime(v.startsAt)} {v.name}</span>
                    <span className="block truncate">{v.listing}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
