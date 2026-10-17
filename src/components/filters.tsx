import Link from 'next/link';
import { Search } from 'lucide-react';
import { COMMERCIAL_TYPES, ENERGY_LABELS, HOME_TYPES, PROVINCES } from '@/lib/types';
import { provinceName } from '@/lib/regions';
import { MODE_INFO, priceStepsFor, SORTS, SORT_LABEL, type SearchFilters } from '@/lib/search';
import { TYPE_LABEL } from '@/lib/format';
import { Select, type Option } from './select';

const eur = (n: number) => `€ ${n.toLocaleString('nl-NL')}`;
const opts = (first: string, list: Option[]): Option[] => [{ value: '', label: first }, ...list];

/** Gewoon een GET-formulier: werkt zonder JavaScript, is deelbaar en zoekmachinevriendelijk. */
export function Filters({ f, action, lockProvince = false, view }: { f: SearchFilters; action?: string; lockProvince?: boolean; view?: 'kaart' }) {
  const target = action ?? MODE_INFO[f.mode].path;
  const PRICES = priceStepsFor(f);
  const rent = f.mode === 'huur' || f.offer === 'huur';
  const commercial = f.mode === 'bedrijfsruimte';
  const types = commercial ? COMMERCIAL_TYPES : HOME_TYPES;
  return (
    <form action={target} method="get" className="space-y-4" role="search" aria-label="Zoeken">
      <div>
        <label htmlFor="q" className="label">Plaats, postcode of straat</label>
        <input id="q" name="q" defaultValue={f.q} placeholder="Bijv. Leeuwarden of 9711" className="field" autoComplete="off" />
      </div>
      {(f.mode === 'nieuwbouw' || commercial) && (
        <div>
          <label htmlFor="aanbod" className="label">Koop of huur</label>
          <Select id="aanbod" name="aanbod" defaultValue={f.offer ?? ''} options={opts('Koop en huur', [{ value: 'koop', label: 'Te koop' }, { value: 'huur', label: 'Te huur' }])} />
        </div>
      )}
      {!lockProvince && (
        <div>
          <label htmlFor="provincie" className="label">Provincie</label>
          <Select id="provincie" name="provincie" defaultValue={f.province ?? ''} options={opts('Heel het noorden', PROVINCES.map((p) => ({ value: p, label: provinceName(p) })))} />
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label htmlFor="van" className="label">{rent ? 'Huur vanaf' : 'Prijs vanaf'}</label>
          <Select id="van" name="van" defaultValue={String(f.minPrice ?? '')} options={opts('Geen min.', PRICES.map((p) => ({ value: String(p), label: `${eur(p)}${rent ? ' p.m.' : ''}` })))} />
        </div>
        <div>
          <label htmlFor="tot" className="label">{rent ? 'Huur tot' : 'Prijs tot'}</label>
          <Select id="tot" name="tot" defaultValue={String(f.maxPrice ?? '')} options={opts('Geen max.', PRICES.map((p) => ({ value: String(p), label: `${eur(p)}${rent ? ' p.m.' : ''}` })))} />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="kamers" className="label">Kamers</label>
          <Select id="kamers" name="kamers" defaultValue={String(f.minRooms ?? '')} options={opts('Alle', [2, 3, 4, 5, 6].map((n) => ({ value: String(n), label: `${n}+` })))} />
        </div>
        <div>
          <label htmlFor="m2" className="label">{commercial ? 'Oppervlakte' : 'Woonopp.'}</label>
          <Select id="m2" name="m2" defaultValue={String(f.minArea ?? '')} options={opts('Alle', [50, 75, 100, 125, 150, 200].map((n) => ({ value: String(n), label: `${n}+ m²` })))} />
        </div>
      </div>
      <fieldset>
        <legend className="label">{commercial ? 'Soort bedrijfsruimte' : 'Soort woning'}</legend>
        <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 lg:grid-cols-1">
          {types.map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" name="type" value={t} defaultChecked={f.types.includes(t)} /> {TYPE_LABEL[t]}</label>
          ))}
        </div>
      </fieldset>
      <div>
        <label htmlFor="label" className="label">Energielabel minimaal</label>
        <Select id="label" name="label" defaultValue={f.energy ?? ''} options={opts('Alle', ENERGY_LABELS.filter((e) => ['A', 'B', 'C', 'D'].includes(e)).map((e) => ({ value: e, label: `${e} of beter` })))} />
      </div>
      <div>
        <label htmlFor="sorteer" className="label">Sorteren</label>
        <Select id="sorteer" name="sorteer" defaultValue={f.sort} options={SORTS.map((s) => ({ value: s, label: SORT_LABEL[s] }))} />
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" name="verkocht" value="1" defaultChecked={!f.hideSold} /> Toon ook verkochte woningen</label>
      {lockProvince && f.province && <input type="hidden" name="provincie" value={f.province} />}
      {view === 'kaart' && <input type="hidden" name="weergave" value="kaart" />}
      <div className="flex gap-2 pt-1">
        <button className="btn-primary flex-1"><Search size={16} aria-hidden /> Zoeken</button>
        <Link href={lockProvince && f.province ? `/${f.province}` : target} className="btn-ghost">Wissen</Link>
      </div>
    </form>
  );
}
