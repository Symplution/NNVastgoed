import type { Metadata } from 'next';
import { SavedList } from '@/components/saved-list';

export const metadata: Metadata = { title: 'Favorieten', robots: { index: false } };

export default function Bewaard() {
  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Favorieten</h1>
      <p className="mt-2 text-muted">Zonder account staan je favorieten alleen in deze browser.</p>
      <SavedList />
    </div>
  );
}
