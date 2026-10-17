'use client';

import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import type { Photo } from '@/lib/types';

export function Gallery({ photos, title }: { photos: Photo[]; title: string }) {
  const [i, setI] = useState(0);
  const [open, setOpen] = useState(false);
  const n = photos.length;
  const go = useCallback((d: number) => setI((x) => (x + d + n) % n), [n]);
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); if (e.key === 'ArrowRight') go(1); if (e.key === 'ArrowLeft') go(-1); };
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, [open, go]);
  if (!n) return <div className="flex aspect-[16/10] items-center justify-center rounded-2xl bg-sand text-muted">Geen foto’s beschikbaar</div>;
  const cur = photos[i];
  return (
    <div>
      <div className="relative overflow-hidden rounded-2xl bg-sand">
        <button type="button" onClick={() => setOpen(true)} className="focus-ring block w-full" aria-label={`Foto ${i + 1} van ${n} groter bekijken`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cur.url} alt={cur.alt ?? `${title}, foto ${i + 1}`} className="aspect-[16/10] w-full object-cover" />
        </button>
        {n > 1 && (
          <>
            <button type="button" onClick={() => go(-1)} aria-label="Vorige foto" className="focus-ring absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"><ChevronLeft size={20} aria-hidden /></button>
            <button type="button" onClick={() => go(1)} aria-label="Volgende foto" className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow hover:bg-white"><ChevronRight size={20} aria-hidden /></button>
            <span className="absolute bottom-3 right-3 rounded-full bg-ink/75 px-3 py-1 text-xs font-semibold text-white">{i + 1} / {n}</span>
          </>
        )}
      </div>
      {n > 1 && (
        <ul className="mt-3 flex gap-2 overflow-x-auto pb-1" aria-label="Foto’s">
          {photos.map((p, k) => (
            <li key={p.url} className="shrink-0">
              <button type="button" onClick={() => setI(k)} aria-label={`Toon foto ${k + 1}`} aria-current={k === i} className={`focus-ring block overflow-hidden rounded-lg border-2 ${k === i ? 'border-brand' : 'border-transparent opacity-80 hover:opacity-100'}`}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt="" loading="lazy" className="h-16 w-24 object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && (
        <div role="dialog" aria-modal="true" aria-label={`Foto’s van ${title}`} className="fixed inset-0 z-50 flex items-center justify-center bg-ink/95 p-4" onClick={() => setOpen(false)}>
          <button type="button" onClick={() => setOpen(false)} aria-label="Sluiten" className="focus-ring absolute right-4 top-4 rounded-full bg-white/15 p-2 text-white hover:bg-white/25"><X size={22} aria-hidden /></button>
          {n > 1 && <button type="button" onClick={(e) => { e.stopPropagation(); go(-1); }} aria-label="Vorige foto" className="focus-ring absolute left-4 rounded-full bg-white/15 p-3 text-white hover:bg-white/25"><ChevronLeft size={24} aria-hidden /></button>}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cur.url} alt={cur.alt ?? `${title}, foto ${i + 1}`} className="max-h-full max-w-full rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
          {n > 1 && <button type="button" onClick={(e) => { e.stopPropagation(); go(1); }} aria-label="Volgende foto" className="focus-ring absolute right-4 rounded-full bg-white/15 p-3 text-white hover:bg-white/25"><ChevronRight size={24} aria-hidden /></button>}
        </div>
      )}
    </div>
  );
}
