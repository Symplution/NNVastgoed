'use client';

import { Heart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { myFavoriteIds, toggleFavorite } from '@/app/mijn/actions';
import { useAuthUser } from '@/lib/use-auth-user';

const KEY = 'nnv-bewaard';
export const readSaved = (): string[] => { try { const v = JSON.parse(localStorage.getItem(KEY) ?? '[]'); return Array.isArray(v) ? v.filter((x) => typeof x === 'string') : []; } catch { return []; } };
export const clearSaved = () => { try { localStorage.removeItem(KEY); } catch { /* opslag geblokkeerd */ } };
const write = (ids: string[]) => { try { localStorage.setItem(KEY, JSON.stringify(ids.slice(-50))); } catch { /* opslag geblokkeerd: dan blijft het bij deze pagina */ } };

// Eén gedeelde lijst voor alle hartjes op de pagina. Ingelogd staat ze in het account, anders in de browser.
let ids = new Set<string>();
let loadedFor: string | null = null;
const subs = new Set<() => void>();
const publish = (next: Set<string>) => { ids = next; subs.forEach((f) => f()); };

function useFavoriteIds() {
  const user = useAuthUser();
  const [, tick] = useState(0);
  useEffect(() => { const f = () => tick((n) => n + 1); subs.add(f); return () => { subs.delete(f); }; }, []);
  useEffect(() => {
    if (user === undefined) return;
    const who = user ? user.id : 'gast';
    if (loadedFor === who) return;
    loadedFor = who;
    if (user) void myFavoriteIds().then((l) => publish(new Set(l))).catch(() => undefined);
    else publish(new Set(readSaved()));
  }, [user]);
  return { ids, user };
}

/** Bewaren: zonder account in de browser van de bezoeker, met account in Mijn NNV. */
export function SaveButton({ id, label = false }: { id: string; label?: boolean }) {
  const { ids: saved, user } = useFavoriteIds();
  const on = saved.has(id);
  function toggle(e: React.MouseEvent) {
    e.preventDefault();
    const next = new Set(saved);
    if (on) next.delete(id); else next.add(id);
    publish(next);
    if (user) void toggleFavorite(id, !on);
    else write([...next]);
  }
  return (
    <button type="button" onClick={toggle} aria-pressed={on} aria-label={on ? 'Verwijder uit favorieten' : 'Bewaar als favoriet'}
      className={`focus-ring inline-flex items-center gap-2 rounded-full ${label ? 'border border-line bg-white px-4 py-2 text-sm font-semibold hover:bg-sand' : 'h-9 w-9 justify-center bg-white/90 shadow hover:bg-white'}`}>
      <Heart size={18} aria-hidden className={on ? 'fill-accent text-accent' : 'text-ink'} />
      {label && (on ? 'Favoriet' : 'Bewaar')}
    </button>
  );
}
