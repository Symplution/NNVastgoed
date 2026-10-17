'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Listing } from '@/lib/types';
import { useAuthUser } from '@/lib/use-auth-user';
import { ListingCard } from './listing-card';
import { readSaved } from './save-button';

/** Favorieten van een bezoeker zonder account (in de browser). Met account gaat het naar Mijn NNV. */
export function SavedList() {
  const user = useAuthUser();
  const router = useRouter();
  const [items, setItems] = useState<Listing[] | null>(null);
  useEffect(() => {
    if (user === undefined) return;
    if (user) { router.replace('/mijn/favorieten'); return; }
    const ids = readSaved();
    if (!ids.length) return setItems([]);
    fetch(`/api/listings?ids=${ids.join(',')}`).then((r) => (r.ok ? r.json() : [])).then(setItems).catch(() => setItems([]));
  }, [user, router]);
  if (items === null) return <p className="mt-8 text-muted">Laden…</p>;
  return (
    <>
      {!items.length && <p className="mt-8 rounded-2xl bg-sand p-8 text-center text-muted">Je hebt nog geen favorieten. Klik op het hartje bij een woning.</p>}
      {items.length > 0 && <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((l) => <ListingCard key={l.id} l={l} />)}</div>}
      <p className="mt-8 rounded-xl bg-brand-soft p-4 text-sm text-brand-dark"><Link href="/inloggen?nieuw=1&next=/mijn/favorieten" className="font-semibold underline">Maak een gratis account</Link> om je favorieten op al je apparaten te zien, bezichtigingen te plannen en met makelaars te chatten.</p>
    </>
  );
}
