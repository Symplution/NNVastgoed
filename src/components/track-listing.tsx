'use client';

import { useEffect, useRef } from 'react';

type Kind = 'impression' | 'view' | 'brochure';
const queue: Record<Kind, Set<string>> = { impression: new Set(), view: new Set(), brochure: new Set() };
let timer: ReturnType<typeof setTimeout> | undefined;

/** Eén keer per browsersessie per woning en soort; alles wat zich opstapelt gaat in één bericht weg. */
export function track(kind: Kind, id: string) {
  try {
    const key = `nnv-stat-${kind}-${id}`;
    if (sessionStorage.getItem(key)) return;
    sessionStorage.setItem(key, '1');
  } catch { /* opslag geblokkeerd: dan tellen we gewoon mee */ }
  queue[kind].add(id);
  clearTimeout(timer);
  timer = setTimeout(flush, 1200);
}

function flush() {
  for (const kind of Object.keys(queue) as Kind[]) {
    const ids = [...queue[kind]].slice(0, 24);
    queue[kind].clear();
    if (!ids.length) continue;
    const body = JSON.stringify({ kind, ids });
    try { if (!navigator.sendBeacon('/api/stat', new Blob([body], { type: 'application/json' }))) void fetch('/api/stat', { method: 'POST', body, keepalive: true }); } catch { /* telling is nooit belangrijker dan de pagina */ }
  }
}

/** Telt als "getoond" zodra de kaart voor het eerst in beeld komt. */
export function TrackImpression({ id }: { id: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) { track('impression', id); io.disconnect(); } }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [id]);
  return <span ref={ref} aria-hidden className="pointer-events-none absolute inset-0" />;
}

/** Telt als "bekeken" bij het openen van de woningpagina. */
export function TrackView({ id }: { id: string }) {
  useEffect(() => { track('view', id); }, [id]);
  return null;
}
