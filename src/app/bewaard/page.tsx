import type { Metadata } from 'next';
import { SavedList } from '@/components/saved-list';

export const metadata: Metadata = { title: 'Bewaarde woningen', robots: { index: false } };

export default function Bewaard() {
  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Bewaarde woningen</h1>
      <p className="mt-2 text-muted">Staat alleen in deze browser; je hebt hiervoor geen account nodig.</p>
      <SavedList />
    </div>
  );
}
