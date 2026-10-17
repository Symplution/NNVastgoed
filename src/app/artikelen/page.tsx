import type { Metadata } from 'next';
import Link from 'next/link';
import { ARTICLES } from '@/lib/articles';
import { ArticleTile } from '@/components/article-tile';

export const metadata: Metadata = { title: 'Artikelen', description: 'Korte artikelen over kopen, huren, verkopen en wonen in Groningen, Friesland en Drenthe.' };

export default function Artikelen() {
  return (
    <div className="container-x py-12">
      <h1 className="text-3xl font-extrabold tracking-tight">Artikelen</h1>
      <p className="mt-2 max-w-2xl text-muted">Korte, praktische uitleg over kopen, huren, verkopen en wonen in het noorden.</p>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{ARTICLES.map((a) => <ArticleTile key={a.slug} a={a} />)}</div>
      <p className="mt-10 text-sm text-muted">Meer weten over de prijzen? Bekijk <Link href="/woningmarkt" className="font-semibold text-brand underline">de woningmarkt</Link>.</p>
    </div>
  );
}
