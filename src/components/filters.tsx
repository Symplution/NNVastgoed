import Link from 'next/link';
import { Search } from 'lucide-react';
import { COMMERCIAL_TYPES, ENERGY_LABELS, HOME_TYPES, PROVINCES } from '@/lib/types';
import { provinceName } from '@/lib/regions';
import { MODE_INFO, priceStepsFor, SORTS, SORT_LABEL, type SearchFilters } from '@/lib/search';
import { TYPE_LABEL } from '@/lib/format';

const eur = (n: number) => `€ ${n.toLocaleString('nl-NL')}`;

/** Gewoon een GET-formulier: werkt zonder JavaScript, is deelbaar en zoekmachinevriendelijk. */
export function Filters({ f, action, lockProvince = false }: { f: SearchFilters; action?: string; lockProvince?: boolean }) {
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
          <select id="aanbod" name="aanbod" defaultValue={f.offer ?? ''} className="field"><option value="">Koop en huur</option><option value="koop">Te koop</option><option value="huur">Te huur</option></select>
        </div>
      )}
      {!lockProvince && (
        <div>
          <label htmlFor="provincie" className="label">Provincie</label>
          <select id="provincie" name="provincie" defaultValue={f.province ?? ''} className="field">
            <option value="">Heel het noorden</option>
            {PROVINCES.map((p) => <option key={p} value={p}>{provinceName(p)}</option>)}
          </select>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="van" className="label">{rent ? 'Huur vanaf' : 'Prijs vanaf'}</label>
          <select id="van" name="van" defaultValue={f.minPrice ?? ''} className="field"><option value="">Geen min.</option>{PRICES.map((p) => <option key={p} value={p}>{eur(p)}{rent ? ' p.m.' : ''}</option>)}</select>
        </div>
        <div>
          <label htmlFor="tot" className="label">{rent ? 'Huur tot' : 'Prijs tot'}</label>
          <select id="tot" name="tot" defaultValue={f.maxPrice ?? ''} className="field"><option value="">Geen max.</option>{PRICES.map((p) => <option key={p} value={p}>{eur(p)}{rent ? ' p.m.' : ''}</option>)}</select>
        </div>
        <div>
          <label htmlFor="kamers" className="label">Kamers</label>
          <select id="kamers" name="kamers" defaultValue={f.minRooms ?? ''} className="field"><option value="">Alle</option>{[2, 3, 4, 5, 6].map((n) => <option key={n} value={n}>{n}+</option>)}</select>
        </div>
        <div>
          <label htmlFor="m2" className="label">{commercial ? 'Oppervlakte' : 'Woonopp.'}</label>
          <select id="m2" name="m2" defaultValue={f.minArea ?? ''} className="field"><option value="">Alle</option>{[50, 75, 100, 125, 150, 200].map((n) => <option key={n} value={n}>{n}+ m²</option>)}</select>
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
        <select id="label" name="label" defaultValue={f.energy ?? ''} className="field"><option value="">Alle</option>{ENERGY_LABELS.filter((e) => ['A', 'B', 'C', 'D'].includes(e)).map((e) => <option key={e} value={e}>{e} of beter</option>)}</select>
      </div>
      <div>
        <label htmlFor="sorteer" className="label">Sorteren</label>
        <select id="sorteer" name="sorteer" defaultValue={f.sort} className="field">{SORTS.map((s) => <option key={s} value={s}>{SORT_LABEL[s]}</option>)}</select>
      </div>
      <label className="flex cursor-pointer items-center gap-2 text-sm"><input type="checkbox" name="verkocht" value="1" defaultChecked={!f.hideSold} /> Toon ook verkochte woningen</label>
      {lockProvince && f.province && <input type="hidden" name="provincie" value={f.province} />}
      <div className="flex gap-2 pt-1">
        <button className="btn-primary flex-1"><Search size={16} aria-hidden /> Zoeken</button>
        <Link href={lockProvince && f.province ? `/${f.province}` : target} className="btn-ghost">Wissen</Link>
      </div>
    </form>
  );
}
