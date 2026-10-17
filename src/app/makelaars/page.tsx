import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, MapPin } from 'lucide-react';
import { listOffices } from '@/lib/data';
import { provinceName } from '@/lib/regions';

export const metadata: Metadata = { title: 'Makelaars in het noorden', description: 'Alle makelaars die hun woningaanbod tonen op NNvastgoed in Groningen, Friesland en Drenthe.' };
export const revalidate = 600;

export default async function Makelaars() {
  const offices = await listOffices();
  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Makelaars in het noorden</h1>
      <p className="mt-2 max-w-2xl text-muted">Kantoren die hun aanbod op NNvastgoed laten zien. Klik door voor hun woningen en contactgegevens.</p>
      {offices.length ? (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offices.map((o) => (
            <li key={o.id}>
              <Link href={`/makelaars/${o.slug}`} className="card focus-ring block h-full p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand"><Building2 size={22} aria-hidden /></span>
                <h2 className="mt-4 text-lg font-bold">{o.name}</h2>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><MapPin size={14} aria-hidden /> {o.city}, {provinceName(o.province)}</p>
                <p className="mt-3 line-clamp-3 text-sm text-ink/80">{o.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : <p className="mt-8 rounded-2xl bg-sand p-8 text-center text-muted">Er zijn nog geen kantoren aangesloten.</p>}
    </div>
  );
}
