import Link from 'next/link';
import { Building, Home, KeyRound, MapPin, Tag, Wrench, type LucideIcon } from 'lucide-react';
import type { Article } from '@/lib/articles';

export const TAG_STYLE: Record<Article['tag'], { pill: string; from: string; to: string; Icon: LucideIcon }> = {
  Kopen: { pill: 'bg-brand-soft text-brand', from: '#1f4d3f', to: '#4f8a6f', Icon: Home },
  Verkopen: { pill: 'bg-accent-soft text-accent-dark', from: '#b4432c', to: '#d9774f', Icon: Tag },
  Huren: { pill: 'bg-green-100 text-green-800', from: '#2f6b4f', to: '#7fb596', Icon: KeyRound },
  Nieuwbouw: { pill: 'bg-amber-100 text-amber-900', from: '#6b5a3a', to: '#b08d57', Icon: Building },
  Wonen: { pill: 'bg-yellow-100 text-yellow-900', from: '#8a6d3b', to: '#d4ae5e', Icon: Wrench },
  Regio: { pill: 'bg-sand text-ink', from: '#3d6b3a', to: '#9bc46a', Icon: MapPin },
};

/** Klein artikel: een gekleurd vlak met pictogram, de rubriek, de titel en een link. */
export function ArticleTile({ a }: { a: Article }) {
  const s = TAG_STYLE[a.tag];
  return (
    <Link href={`/artikelen/${a.slug}`} className="focus-ring group block rounded-2xl">
      <div aria-hidden className="relative flex h-32 items-center justify-center overflow-hidden rounded-2xl" style={{ background: `linear-gradient(135deg, ${s.from}, ${s.to})` }}>
        <span className="absolute -right-6 -top-8 h-28 w-28 rounded-full bg-white/15" /><span className="absolute -bottom-10 left-6 h-24 w-24 rounded-full bg-white/10" />
        <s.Icon size={44} className="relative text-white transition group-hover:scale-110" strokeWidth={1.6} />
      </div>
      <span className={`pill mt-4 ${s.pill}`}>{a.tag}</span>
      <h3 className="mt-2 font-bold leading-snug group-hover:underline">{a.title}</h3>
      <p className="mt-1 text-sm text-muted">{a.summary}</p>
      <span className="mt-2 inline-block text-sm font-semibold text-brand">Lees meer →</span>
    </Link>
  );
}
