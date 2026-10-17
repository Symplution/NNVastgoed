'use client';

import { useEffect, useState } from 'react';
import type { Listing } from '@/lib/types';
import { ListingCard } from './listing-card';
import { readSaved } from './save-button';

export function SavedList() {
  const [items, setItems] = useState<Listing[] | null>(null);
  useEffect(() => {
    const ids = readSaved();
    if (!ids.length) return setItems([]);
    fetch(`/api/listings?ids=${ids.join(',')}`).then((r) => (r.ok ? r.json() : [])).then(setItems).catch(() => setItems([]));
  }, []);
  if (items === null) return <p className="mt-8 text-muted">Laden…</p>;
  if (!items.length) return <p className="mt-8 rounded-2xl bg-sand p-8 text-center text-muted">Je hebt nog geen woningen bewaard. Klik op het hartje bij een woning.</p>;
  return <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((l) => <ListingCard key={l.id} l={l} />)}</div>;
}
