'use client';

import Link from 'next/link';
import { Info, X } from 'lucide-react';
import { useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ENERGY_EXPLAIN, colorFor, letterOf } from '@/lib/energy';

/** Het energielabel als gekleurde pijl, zoals op een echt label: A groen, D geel, G rood. */
export function EnergyBadge({ label, size = 'md', className = '' }: { label: string; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const c = colorFor(label);
  const s = size === 'sm' ? 'h-5 pl-1.5 pr-3.5 text-[11px]' : size === 'lg' ? 'h-9 pl-3.5 pr-7 text-lg' : 'h-7 pl-2.5 pr-5 text-sm';
  return (
    <span role="img" aria-label={`Energielabel ${label}`} title={`Energielabel ${label}`}
      className={`inline-flex items-center font-extrabold leading-none ${s} ${className}`}
      style={{ background: c.bg, color: c.fg, clipPath: 'polygon(0 0, calc(100% - 0.6em) 0, 100% 50%, calc(100% - 0.6em) 100%, 0 100%)' }}>{label}</span>
  );
}

/** Het uitlegscherm: wat betekent elk label. Het label van de woning is gemarkeerd. */
function EnergyDialog({ label, onClose }: { label: string; onClose: () => void }) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', key); };
  }, [onClose]);
  const mine = letterOf(label);
  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-6" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl">
        <div className="flex items-start justify-between gap-4 px-6 pb-3 pt-6">
          <h2 id={titleId} className="text-2xl font-extrabold tracking-tight">Wat zegt een energielabel?</h2>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="Sluiten" className="focus-ring rounded-full p-1.5 text-muted hover:bg-sand"><X size={22} aria-hidden /></button>
        </div>
        <div className="overflow-y-auto px-6 pb-6">
          <p className="text-[15px] leading-relaxed text-ink/90">Een energielabel laat zien hoe energiezuinig een woning is. Dat lijkt een klein detail, maar het maakt een groot verschil in comfort en kosten. Bij verkoop en verhuur hoort een geldig energielabel.</p>
          <p className="mt-2"><Link href="/artikelen/energielabel-uitleg" onClick={onClose} className="text-[15px] font-semibold text-brand hover:underline">Lees meer over energielabels</Link></p>
          {label && <p className="mt-4 flex items-center gap-3 rounded-xl bg-brand-soft px-4 py-3 text-sm">Deze woning heeft <EnergyBadge label={label} /></p>}
          <ul className="mt-2">
            {ENERGY_EXPLAIN.map((e) => (
              <li key={e.letter} className={`border-t border-line py-4 ${mine === e.letter ? '-mx-3 rounded-xl bg-accent-soft/40 px-3' : ''}`}>
                <div className="flex items-center gap-4"><EnergyBadge label={e.letter} size="lg" /><h3 className="text-lg font-bold">{e.title}{mine === e.letter && <span className="ml-2 rounded-full bg-accent px-2 py-0.5 align-middle text-xs font-bold text-white">deze woning</span>}</h3></div>
                <p className="mt-2 text-[15px] leading-relaxed text-ink/90">{e.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

/** Het label met een klikbare (i) erachter die de uitleg opent. */
export function EnergyLabelWithInfo({ label, size = 'md' }: { label: string; size?: 'sm' | 'md' | 'lg' }) {
  const [open, setOpen] = useState(false);
  return (
    <span className="inline-flex items-center gap-2">
      <EnergyBadge label={label} size={size} />
      <button type="button" onClick={() => setOpen(true)} aria-label="Wat zegt een energielabel?" className="focus-ring inline-flex rounded-full text-brand hover:text-brand-dark"><Info size={size === 'sm' ? 16 : 22} aria-hidden /></button>
      {open && createPortal(<EnergyDialog label={label} onClose={() => setOpen(false)} />, document.body)}
    </span>
  );
}
