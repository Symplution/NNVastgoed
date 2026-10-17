'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { PROVINCES } from '@/lib/types';
import { PROVINCE_INFO } from '@/lib/regions';
import { MODE_INFO, PRICE_STEPS } from '@/lib/search';
import { Select } from './select';

const TABS = ['koop', 'huur', 'nieuwbouw'] as const;
type Tab = (typeof TABS)[number];

/** De zoekbalk op de voorpagina: kies koop, huur of nieuwbouw en zoek op plaats, postcode of straat. */
export function HeroSearch() {
  const [tab, setTab] = useState<Tab>('koop');
  const steps = tab === 'huur' ? PRICE_STEPS.huur : PRICE_STEPS.koop;
  return (
    <div className="mt-8 max-w-4xl rounded-2xl bg-white p-3 text-ink shadow-2xl">
      <div role="tablist" aria-label="Wat zoek je?" className="flex gap-1 px-1 pb-3">
        {TABS.map((t) => (
          <button key={t} type="button" role="tab" aria-selected={tab === t} onClick={() => setTab(t)}
            className={`focus-ring rounded-lg px-4 py-2 text-sm font-semibold transition ${tab === t ? 'bg-brand text-white' : 'text-muted hover:bg-brand-soft hover:text-brand'}`}>
            {t === 'koop' ? 'Koop' : t === 'huur' ? 'Huur' : 'Nieuwbouw'}
          </button>
        ))}
      </div>
      <form action={MODE_INFO[tab].path} method="get" role="search" aria-label="Zoeken" className="grid gap-3 sm:grid-cols-[1fr_11rem_11rem_auto]">
        <div>
          <label htmlFor="h-q" className="sr-only">Plaats, postcode of straat</label>
          <input id="h-q" name="q" placeholder="Zoek op plaats, buurt of postcode" className="field !border-0 !bg-sand" autoComplete="off" />
        </div>
        <div>
          <label htmlFor="h-p" className="sr-only">Provincie</label>
          <Select id="h-p" name="provincie" tone="sand" defaultValue="" options={[{ value: '', label: 'Heel het noorden' }, ...PROVINCES.map((p) => ({ value: p, label: PROVINCE_INFO[p].name }))]} aria-label="Provincie" />
        </div>
        <div>
          <label htmlFor="h-t" className="sr-only">{tab === 'huur' ? 'Maximale huur' : 'Maximale prijs'}</label>
          <Select id="h-t" name="tot" key={tab} tone="sand" defaultValue="" options={[{ value: '', label: tab === 'huur' ? 'Geen max. huur' : 'Geen max. prijs' }, ...steps.map((n) => ({ value: String(n), label: `Tot € ${n.toLocaleString('nl-NL')}${tab === 'huur' ? ' p.m.' : ''}` }))]} aria-label={tab === 'huur' ? 'Maximale huur' : 'Maximale prijs'} />
        </div>
        <button className="btn-accent !px-6"><Search size={16} aria-hidden /> Zoeken</button>
      </form>
    </div>
  );
}
