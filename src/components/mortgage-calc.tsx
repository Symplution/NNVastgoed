'use client';

import { useState } from 'react';
import { formatEuro } from '@/lib/format';
import { monthlyPayment, transferTax } from '@/lib/mortgage';
import { Select } from './select';

/** Indicatief; geen hypotheekadvies. */
export function MortgageCalc({ price, vonOrKk }: { price: number; vonOrKk: 'k.k.' | 'v.o.n.' }) {
  const [own, setOwn] = useState(0);
  const [rate, setRate] = useState(4);
  const [years, setYears] = useState(30);
  const costs = vonOrKk === 'k.k.' ? transferTax(price) + Math.round(price * 0.01) : 0;   // overdrachtsbelasting + schatting notaris/taxatie
  const loan = Math.max(0, price + costs - own);
  const pm = monthlyPayment(loan, rate, years);
  const num = 'field';
  return (
    <section aria-labelledby="hyp" className="card p-6">
      <h2 id="hyp" className="text-lg font-bold">Wat kost dit per maand?</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <div><label htmlFor="eigen" className="label">Eigen geld (€)</label><input id="eigen" type="number" min={0} step={5000} value={own} onChange={(e) => setOwn(Math.max(0, Number(e.target.value) || 0))} className={num} /></div>
        <div><label htmlFor="rente" className="label">Rente (%)</label><input id="rente" type="number" min={0} max={15} step={0.1} value={rate} onChange={(e) => setRate(Math.min(15, Math.max(0, Number(e.target.value) || 0)))} className={num} /></div>
        <div><label htmlFor="jaren" className="label">Looptijd (jaar)</label><Select id="jaren" value={String(years)} onChange={(v) => setYears(Number(v))} options={[10, 15, 20, 25, 30].map((y) => ({ value: String(y), label: `${y} jaar` }))} /></div>
      </div>
      <p className="mt-5 text-3xl font-extrabold text-brand" aria-live="polite">{formatEuro(Math.round(pm))} <span className="text-base font-medium text-muted">per maand bruto</span></p>
      <p className="mt-2 text-sm text-muted">Lening {formatEuro(loan)}, annuïteit{costs ? `, inclusief ${formatEuro(costs)} geschatte kosten koper (2% overdrachtsbelasting en 1% notaris en taxatie)` : ''}. Dit is een indicatie en geen hypotheekadvies; vraag je hypotheekadviseur om een persoonlijke berekening.</p>
    </section>
  );
}
