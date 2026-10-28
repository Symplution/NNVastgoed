'use client';

import Link from 'next/link';
import { ArrowRight, Search } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { PROVINCES, type PropertyType } from '@/lib/types';
import { PROVINCE_INFO } from '@/lib/regions';
import { MODE_INFO, PRICE_STEPS } from '@/lib/search';

const MODES = [{ id: 'koop', label: 'Kopen' }, { id: 'huur', label: 'Huren' }, { id: 'nieuwbouw', label: 'Nieuwbouw' }, { id: 'recreatie', label: 'Recreatie' }] as const;
type ModeId = (typeof MODES)[number]['id'];
const KINDS: { id: string; label: string; types: PropertyType[] }[] = [
  { id: 'appartement', label: 'Appartement', types: ['appartement'] },
  { id: 'rijwoning', label: 'Rijwoning', types: ['tussenwoning', 'hoekwoning'] },
  { id: 'twee', label: 'Twee-onder-een-kap', types: ['twee-onder-een-kap'] },
  { id: 'vrijstaand', label: 'Vrijstaand', types: ['vrijstaand'] },
  { id: 'boerderij', label: 'Woonboerderij', types: ['woonboerderij'] },
];

const chip = (on: boolean) => `focus-ring rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${on ? 'border-brand bg-brand text-white' : 'border-line bg-white text-ink hover:border-brand/50 hover:bg-brand-soft'}`;

/** "Vind je plek": stel in wat je zoekt en zie meteen hoeveel woningen er passen. */
export function HeroWizard() {
  const [mode, setMode] = useState<ModeId>('koop');
  const [province, setProvince] = useState('');
  const [kinds, setKinds] = useState<string[]>([]);
  const [step, setStep] = useState<number>(PRICE_STEPS.koop.length);   // laatste stap = geen maximum
  const [q, setQ] = useState('');
  const [count, setCount] = useState<number | null>(null);
  const steps = mode === 'huur' ? PRICE_STEPS.huur : PRICE_STEPS.koop;
  const max = step >= steps.length ? undefined : steps[step];

  const params = useMemo(() => {
    const p = new URLSearchParams();
    if (province) p.set('provincie', province);
    if (max) p.set('tot', String(max));
    if (q.trim()) p.set('q', q.trim());
    for (const k of kinds) for (const t of KINDS.find((x) => x.id === k)?.types ?? []) p.append('type', t);
    return p;
  }, [province, max, q, kinds]);
  const href = `${MODE_INFO[mode].path}${params.toString() ? `?${params}` : ''}`;

  useEffect(() => {
    const ctl = new AbortController();
    const t = setTimeout(() => {
      const p = new URLSearchParams(params); p.set('soort', mode);
      fetch(`/api/aantal?${p}`, { signal: ctl.signal }).then((r) => (r.ok ? r.json() : null)).then((d) => setCount(typeof d?.total === 'number' ? d.total : null)).catch(() => undefined);
    }, 250);
    return () => { clearTimeout(t); ctl.abort(); };
  }, [params, mode]);

  const changeMode = (m: ModeId) => { setMode(m); setStep((m === 'huur' ? PRICE_STEPS.huur : PRICE_STEPS.koop).length); };
  const toggle = (id: string) => setKinds((k) => (k.includes(id) ? k.filter((x) => x !== id) : [...k, id]));
  const money = (n: number) => `€ ${n.toLocaleString('nl-NL')}${mode === 'huur' ? ' p.m.' : ''}`;

  return (
    <form action={MODE_INFO[mode].path} method="get" role="search" aria-label="Vind je plek" className="mt-6 rounded-[2rem] border border-line bg-white p-5 shadow-card sm:p-6" onSubmit={(e) => { e.preventDefault(); window.location.href = href; }}>
      <fieldset>
        <legend className="label">Wat zoek je?</legend>
        <div className="flex flex-wrap gap-2">{MODES.map((m) => <button key={m.id} type="button" aria-pressed={mode === m.id} onClick={() => changeMode(m.id)} className={chip(mode === m.id)}>{m.label}</button>)}</div>
      </fieldset>

      <fieldset className="mt-4">
        <legend className="label">Waar?</legend>
        <div className="flex flex-wrap gap-2">
          <button type="button" aria-pressed={province === ''} onClick={() => setProvince('')} className={chip(province === '')}>Het hele noorden</button>
          {PROVINCES.map((p) => (
            <button key={p} type="button" aria-pressed={province === p} onClick={() => setProvince(p)} className={`${chip(province === p)} inline-flex items-center gap-2`}>
              <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: province === p ? '#fff' : PROVINCE_INFO[p].hue }} />{PROVINCE_INFO[p].name}
            </button>
          ))}
        </div>
      </fieldset>

      {mode !== 'recreatie' && (
        <fieldset className="mt-4">
          <legend className="label">Hoe wil je wonen? <span className="font-normal normal-case text-muted">(meerdere mogelijk)</span></legend>
          <div className="flex flex-wrap gap-2">{KINDS.map((k) => <button key={k.id} type="button" aria-pressed={kinds.includes(k.id)} onClick={() => toggle(k.id)} className={chip(kinds.includes(k.id))}>{k.label}</button>)}</div>
        </fieldset>
      )}

      <div className="mt-4">
        <label htmlFor="w-budget" className="label flex justify-between"><span>{mode === 'huur' ? 'Maximale huur' : 'Maximale prijs'}</span><span className="text-sm font-bold normal-case tracking-normal text-brand">{max ? money(max) : 'Geen maximum'}</span></label>
        <input id="w-budget" type="range" min={0} max={steps.length} step={1} value={step} onChange={(e) => setStep(Number(e.target.value))} className="h-2 w-full cursor-pointer accent-[#1f4d3f]" aria-valuetext={max ? money(max) : 'Geen maximum'} />
        <div className="mt-1 flex justify-between text-xs text-muted"><span>{money(steps[0])}</span><span>Geen maximum</span></div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="relative"><label htmlFor="w-q" className="sr-only">Plaats, postcode of straat</label><Search size={16} aria-hidden className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" /><input id="w-q" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Of zoek op plaats of postcode" autoComplete="off" className="field !rounded-full !bg-sand !pl-10 !border-0" /></div>
        <Link href={href} className="btn-accent !px-7 !py-3 text-base" aria-live="polite">{count === null ? 'Toon woningen' : count === 0 ? 'Geen woningen, pas je keuzes aan' : `Toon ${count} ${count === 1 ? 'woning' : 'woningen'}`} <ArrowRight size={18} aria-hidden /></Link>
      </div>
    </form>
  );
}
