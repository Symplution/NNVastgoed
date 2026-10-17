import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, MapPin, ShieldCheck } from 'lucide-react';
import { listOffices } from '@/lib/data';
import { provinceName } from '@/lib/regions';

export const metadata: Metadata = { title: 'Makelaars in het noorden', description: 'Alle makelaars die hun woningaanbod tonen op NNvastgoed in Groningen, Friesland en Drenthe.' };
export const revalidate = 600;

export default async function Makelaars({ searchParams }: { searchParams: Promise<{ nvm?: string }> }) {
  const nvm = (await searchParams).nvm === '1';
  const offices = await listOffices({ nvmOnly: nvm });
  return (
    <div className="container-x py-10">
      <h1 className="text-3xl font-extrabold tracking-tight">Makelaars in het noorden</h1>
      <p className="mt-2 max-w-2xl text-muted">Kantoren die hun aanbod op NNvastgoed laten zien. Klik door voor hun woningen en contactgegevens.</p>
      <nav aria-label="Filter" className="mt-5 flex gap-2">
        <Link href="/makelaars" aria-current={!nvm ? 'page' : undefined} className={`focus-ring rounded-full px-4 py-1.5 text-sm font-semibold ${!nvm ? 'bg-brand text-white' : 'border border-line bg-white hover:bg-brand-soft'}`}>Alle makelaars</Link>
        <Link href="/makelaars?nvm=1" aria-current={nvm ? 'page' : undefined} className={`focus-ring inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold ${nvm ? 'bg-brand text-white' : 'border border-line bg-white hover:bg-brand-soft'}`}><ShieldCheck size={14} aria-hidden /> NVM-makelaars</Link>
      </nav>
      {offices.length ? (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {offices.map((o) => (
            <li key={o.id}>
              <Link href={`/makelaars/${o.slug}`} className="card focus-ring block h-full p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-soft text-brand"><Building2 size={22} aria-hidden /></span>
                <h2 className="mt-4 text-lg font-bold">{o.name}</h2>
                {o.nvmMember && <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-brand-soft px-2.5 py-0.5 text-xs font-semibold text-brand"><ShieldCheck size={13} aria-hidden /> NVM-lid</p>}
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted"><MapPin size={14} aria-hidden /> {o.city}, {provinceName(o.province)}</p>
                <p className="mt-3 line-clamp-3 text-sm text-ink/80">{o.description}</p>
              </Link>
            </li>
          ))}
        </ul>
      ) : <p className="mt-8 rounded-2xl bg-sand p-8 text-center text-muted">{nvm ? 'Er zijn nog geen NVM-makelaars aangesloten.' : 'Er zijn nog geen kantoren aangesloten.'}</p>}
    </div>
  );
}
