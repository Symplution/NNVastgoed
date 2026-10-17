import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ARTICLES, articleBySlug } from '@/lib/articles';
import { ArticleTile, TAG_STYLE } from '@/components/article-tile';

export const dynamicParams = false;
export const generateStaticParams = () => ARTICLES.map((a) => ({ slug: a.slug }));
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const a = articleBySlug((await params).slug);
  return a ? { title: a.title, description: a.summary } : {};
}

export default async function ArtikelPagina({ params }: { params: Promise<{ slug: string }> }) {
  const a = articleBySlug((await params).slug);
  if (!a) notFound();
  const more = ARTICLES.filter((x) => x.slug !== a.slug).slice(0, 3);
  return (
    <div className="container-x py-12">
      <nav aria-label="Kruimelpad" className="text-sm text-muted"><Link href="/artikelen" className="hover:underline">Artikelen</Link> <span aria-hidden>/</span> {a.tag}</nav>
      <article className="mt-4 max-w-2xl">
        <span className={`pill ${TAG_STYLE[a.tag].pill}`}>{a.tag}</span>
        <h1 className="mt-3 text-3xl font-extrabold leading-tight tracking-tight sm:text-4xl">{a.title}</h1>
        <p className="mt-2 text-sm text-muted">{new Date(a.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' })} · {a.minutes} min lezen</p>
        <p className="mt-6 text-lg text-ink/90">{a.summary}</p>
        <div className="mt-4 space-y-4 leading-relaxed text-ink/90">{a.body.map((p, i) => <p key={i}>{p}</p>)}</div>
        <div className="mt-8 flex flex-wrap gap-3"><Link href="/koop" className="btn-accent">Bekijk koopwoningen</Link><Link href="/huur" className="btn-ghost">Bekijk huurwoningen</Link></div>
      </article>
      <section className="mt-14" aria-labelledby="meer"><h2 id="meer" className="text-xl font-extrabold">Meer artikelen</h2><div className="mt-5 grid gap-6 sm:grid-cols-3">{more.map((x) => <ArticleTile key={x.slug} a={x} />)}</div></section>
    </div>
  );
}
