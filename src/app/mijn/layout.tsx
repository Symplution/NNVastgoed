import type { Metadata } from 'next';
import { FavoritesSync } from '@/components/favorites-sync';
import { MijnNav } from '@/components/mijn-nav';
import { requireSeeker } from '@/lib/seeker';
import { unreadForSeeker } from '@/lib/seeker-data';

export const metadata: Metadata = { title: { default: 'Mijn NNV', template: '%s · Mijn NNV' }, robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

export default async function MijnLayout({ children }: { children: React.ReactNode }) {
  const me = await requireSeeker();
  const unread = await unreadForSeeker(me.id);
  return (
    <div className="container-x py-8">
      <FavoritesSync />
      <h1 className="text-3xl font-extrabold tracking-tight">Mijn NNV</h1>
      <p className="mt-1 text-muted">Welkom, {me.name}.</p>
      <div className="mt-6"><MijnNav unread={unread} /></div>
      <div className="pt-8">{children}</div>
    </div>
  );
}
