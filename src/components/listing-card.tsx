import Link from 'next/link';
import { Bed, Ruler, Home } from 'lucide-react';
import type { Listing } from '@/lib/types';
import { address, formatPrice, STATUS_LABEL, TYPE_LABEL } from '@/lib/format';
import { provinceName } from '@/lib/regions';
import { SaveButton } from './save-button';

const BADGE: Record<string, string> = {
  onder_bod: 'bg-accent-soft text-accent-dark', onder_voorbehoud: 'bg-accent-soft text-accent-dark', verkocht: 'bg-ink text-white',
};

export function ListingCard({ l, priority = false }: { l: Listing; priority?: boolean }) {
  const photo = l.photos[0];
  return (
    <article className="card group relative overflow-hidden transition hover:-translate-y-0.5 hover:shadow-lg">
      <Link href={`/woning/${l.slug}`} className="focus-ring block rounded-2xl" aria-label={`${address(l)}, ${l.city}, ${formatPrice(l)}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-sand">
          {photo && /* eslint-disable-next-line @next/next/no-img-element */ <img src={photo.url} alt={photo.alt ?? `${address(l)}, ${l.city}`} loading={priority ? 'eager' : 'lazy'} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />}
          {!BADGE[l.status] && l.publishedAt && Date.now() - new Date(l.publishedAt).getTime() < 7 * 86_400_000 && <span className="pill absolute left-3 top-3 bg-accent text-white">Nieuw</span>}
          {BADGE[l.status] && <span className={`pill absolute left-3 top-3 ${BADGE[l.status]}`}>{STATUS_LABEL[l.status]}</span>}
        </div>
        <div className="space-y-1.5 p-4">
          <p className="text-lg font-bold text-brand">{formatPrice(l)}</p>
          <h3 className="font-semibold leading-snug">{address(l)}</h3>
          <p className="text-sm text-muted">{l.postcode} {l.city} · {provinceName(l.province)}</p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 pt-1.5 text-sm text-ink/80">
            <li className="inline-flex items-center gap-1.5"><Ruler size={15} aria-hidden /> {l.livingArea} m²</li>
            <li className="inline-flex items-center gap-1.5"><Bed size={15} aria-hidden /> {l.bedrooms} slaapk.</li>
            <li className="inline-flex items-center gap-1.5"><Home size={15} aria-hidden /> {TYPE_LABEL[l.propertyType]}</li>
            {l.energyLabel && <li className="rounded bg-brand-soft px-1.5 text-xs font-bold leading-5 text-brand" title="Energielabel">{l.energyLabel}</li>}
          </ul>
        </div>
      </Link>
      <div className="absolute right-3 top-3"><SaveButton id={l.id} /></div>
    </article>
  );
}
