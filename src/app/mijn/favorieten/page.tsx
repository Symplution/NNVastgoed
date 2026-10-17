import type { Metadata } from 'next';
import Link from 'next/link';
import { ListingCard } from '@/components/listing-card';
import { requireSeeker } from '@/lib/seeker';
import { myFavorites } from '@/lib/seeker-data';

export const metadata: Metadata = { title: 'Favorieten' };

export default async function Favorieten() {
  await requireSeeker('/mijn/favorieten');
  const items = await myFavorites();
  return items.length
    ? <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{items.map((l) => <ListingCard key={l.id} l={l} />)}</div>
    : <div className="rounded-2xl bg-sand p-10 text-center"><p className="font-semibold">Nog geen favorieten</p><p className="mt-1 text-sm text-muted">Klik op het hartje bij een woning om hem hier te bewaren.</p><Link href="/koop" className="btn-primary mt-4">Zoek een woning</Link></div>;
}
