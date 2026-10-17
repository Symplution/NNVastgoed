'use client';

import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';

const KEY = 'nnv-bewaard';
export const readSaved = (): string[] => { try { const v = JSON.parse(localStorage.getItem(KEY) ?? '[]'); return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []; } catch { return []; } };
const write = (ids: string[]) => { try { localStorage.setItem(KEY, JSON.stringify(ids.slice(-50))); } catch { /* opslag geblokkeerd: dan blijft het bij deze pagina */ } };

/** Bewaren zonder account: in de browser van de bezoeker. */
export function SaveButton({ id, label = false }: { id: string; label?: boolean }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => setSaved(readSaved().includes(id)), [id]);
  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    const next = saved ? readSaved().filter((x) => x !== id) : [...readSaved(), id];
    write(next);
    setSaved(!saved);
  }
  return (
    <button type="button" onClick={toggle} aria-pressed={saved} aria-label={saved ? 'Verwijder uit bewaard' : 'Bewaar deze woning'}
      className={`focus-ring inline-flex items-center gap-2 rounded-full ${label ? 'border border-line bg-white px-4 py-2 text-sm font-semibold hover:bg-sand' : 'h-9 w-9 justify-center bg-white/90 shadow hover:bg-white'}`}>
      <Heart size={18} aria-hidden className={saved ? 'fill-accent text-accent' : 'text-ink'} />
      {label && (saved ? 'Bewaard' : 'Bewaar')}
    </button>
  );
}
