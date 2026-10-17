import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Globe, Mail, MapPin, Phone } from 'lucide-react';
import { ListingCard } from '@/components/listing-card';
import { getOffice, officeListings } from '@/lib/data';
import { provinceName } from '@/lib/regions';

type Props = { params: Promise<{ slug: string }> };
export const revalidate = 300;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const o = await getOffice({ slug: (await params).slug });
  return o ? { title: o.name, description: `${o.name} in ${o.city}: woningen te koop en contactgegevens.` } : {};
}

export default async function Makelaar({ params }: Props) {
  const o = await getOffice({ slug: (await params).slug });
  if (!o) notFound();
  const listings = await officeListings(o.id);
  const web = o.website && /^https:\/\//.test(o.website) ? o.website : null;
  return (
    <div className="container-x py-10">
      <nav aria-label="Kruimelpad" className="mb-4 text-sm text-muted"><Link href="/makelaars" className="hover:underline">Makelaars</Link> / {o.name}</nav>
      <header className="grid gap-6 rounded-3xl bg-brand-soft p-8 sm:grid-cols-[1fr_auto]">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">{o.name}</h1>
          <p className="mt-1 flex items-center gap-1.5 text-muted"><MapPin size={16} aria-hidden /> {o.street && `${o.street}, `}{o.postcode} {o.city} · {provinceName(o.province)}</p>
          <p className="mt-4 max-w-2xl text-ink/85">{o.description}</p>
        </div>
        <ul className="space-y-2 text-sm">
          {o.phone && <li><a className="inline-flex items-center gap-2 hover:underline" href={`tel:${o.phone.replace(/\s/g, '')}`}><Phone size={15} aria-hidden /> {o.phone}</a></li>}
          <li><a className="inline-flex items-center gap-2 hover:underline" href={`mailto:${o.email}`}><Mail size={15} aria-hidden /> {o.email}</a></li>
          {web && <li><a className="inline-flex items-center gap-2 hover:underline" href={web} rel="noopener noreferrer" target="_blank"><Globe size={15} aria-hidden /> Website</a></li>}
        </ul>
      </header>
      <h2 className="mt-10 text-2xl font-extrabold tracking-tight">Woningen van {o.name} <span className="text-muted">({listings.length})</span></h2>
      {listings.length ? <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{listings.map((l) => <ListingCard key={l.id} l={l} />)}</div> : <p className="mt-6 rounded-2xl bg-sand p-8 text-center text-muted">Dit kantoor heeft nu geen woningen online.</p>}
    </div>
  );
}
