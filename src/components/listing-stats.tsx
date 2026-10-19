import Link from 'next/link';
import { Eye, FileDown, Heart, LayoutGrid, MessageSquare, CalendarCheck } from 'lucide-react';
import { STAT_PERIODS, type StatDay, type StatPeriod, type StatTotals } from '@/lib/staff-data';

const nl = (n: number) => n.toLocaleString('nl-NL');
const shortDate = (iso: string) => new Date(`${iso}T12:00:00Z`).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short', timeZone: 'Europe/Amsterdam' });

/** Staafdiagram per dag, zonder bibliotheek. De tekst eronder en de titels per staaf zijn er voor wie het diagram niet kan zien. */
function Bars({ days, pick, label, color }: { days: StatDay[]; pick: (d: StatDay) => number; label: string; color: string }) {
  const max = Math.max(1, ...days.map(pick));
  const w = 600, h = 140, gap = days.length > 60 ? 0 : 2, bw = Math.max(1, (w - gap * (days.length - 1)) / Math.max(1, days.length));
  const total = days.reduce((s, d) => s + pick(d), 0);
  return (
    <figure className="min-w-0">
      <figcaption className="flex items-baseline justify-between gap-3 text-sm"><span className="font-semibold">{label} per dag</span><span className="text-muted">hoogste dag: {nl(max === 1 && total === 0 ? 0 : max)}</span></figcaption>
      <svg viewBox={`0 0 ${w} ${h + 18}`} role="img" aria-label={`${label} per dag, in totaal ${nl(total)}`} className="mt-2 w-full">
        <line x1="0" x2={w} y1={h} y2={h} className="stroke-line" />
        {days.map((d, i) => {
          const v = pick(d), bh = v === 0 ? 0 : Math.max(2, (v / max) * (h - 6));
          return <rect key={d.day} x={i * (bw + gap)} y={h - bh} width={bw} height={bh} rx={bw > 4 ? 2 : 0} className={color}><title>{`${shortDate(d.day)}: ${nl(v)}`}</title></rect>;
        })}
        <text x="0" y={h + 14} className="fill-muted text-[11px]">{days[0] ? shortDate(days[0].day) : ''}</text>
        <text x={w} y={h + 14} textAnchor="end" className="fill-muted text-[11px]">{days.length ? shortDate(days[days.length - 1].day) : ''}</text>
      </svg>
    </figure>
  );
}

export function ListingStats({ listingId, period, totals, days, leads, viewings }: { listingId: string; period: StatPeriod; totals: StatTotals; days: StatDay[]; leads: number; viewings: number }) {
  const rate = totals.impressions > 0 ? Math.round((totals.views / totals.impressions) * 100) : null;
  const empty = totals.impressions + totals.views + totals.saves + totals.brochures + leads + viewings === 0;
  const tiles = [
    { Icon: LayoutGrid, label: 'Getoond', value: totals.impressions, hint: 'in de zoekresultaten' },
    { Icon: Eye, label: 'Bekeken', value: totals.views, hint: 'woningpagina geopend' },
    { Icon: Heart, label: 'Bewaard', value: totals.saves, hint: 'als favoriet' },
    { Icon: MessageSquare, label: 'Berichten', value: leads, hint: 'contactverzoeken' },
    { Icon: CalendarCheck, label: 'Bezichtigingen', value: viewings, hint: 'ingepland' },
    { Icon: FileDown, label: 'Brochure', value: totals.brochures, hint: 'gedownload' },
  ];
  return (
    <section aria-labelledby="statistieken" className="card mb-8 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 id="statistieken" className="text-xl font-extrabold tracking-tight">Statistieken</h2>
          <p className="text-sm text-muted">Zo vaak is deze woning getoond, bekeken en bewaard.</p>
        </div>
        <nav aria-label="Periode" className="inline-flex rounded-xl border border-line bg-white p-1">
          {(Object.keys(STAT_PERIODS) as StatPeriod[]).map((p) => (
            <Link key={p} href={`/beheer/woningen/${listingId}?periode=${p}#statistieken`} scroll={false} aria-current={p === period ? 'true' : undefined} className={`focus-ring rounded-lg px-3 py-1.5 text-sm font-semibold ${p === period ? 'bg-brand text-white' : 'text-muted hover:bg-brand-soft hover:text-brand'}`}>{STAT_PERIODS[p].label}</Link>
          ))}
        </nav>
      </div>

      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {tiles.map(({ Icon, label, value, hint }) => (
          <li key={label} className="rounded-xl bg-sand p-4">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted"><Icon size={14} aria-hidden /> {label}</p>
            <p className="mt-1 text-3xl font-extrabold tabular-nums tracking-tight">{nl(value)}</p>
            <p className="text-xs text-muted">{hint}</p>
          </li>
        ))}
      </ul>
      {rate !== null && <p className="mt-4 text-sm text-muted">Van elke 100 keer dat de woning werd getoond, is hij <strong className="text-ink">{rate}×</strong> geopend.</p>}

      {empty ? (
        <p className="mt-5 rounded-xl bg-brand-soft p-4 text-sm text-brand-dark">Nog geen cijfers in deze periode. Zodra bezoekers de woning zien, verschijnen ze hier. De cijfers van vandaag staan er direct.</p>
      ) : (
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <Bars days={days} pick={(d) => d.impressions} label="Getoond" color="fill-brand/80" />
          <Bars days={days} pick={(d) => d.views} label="Bekeken" color="fill-accent" />
        </div>
      )}
      <p className="mt-5 text-xs text-muted">Getoond en bekeken tellen één keer per bezoeker per sessie; zoekmachines en je eigen voorbeeldweergave tellen niet mee. Bewaard telt het aantal keer dat een zoeker het hartje aanzette. Berichten en bezichtigingen komen uit je beheer.</p>
    </section>
  );
}
