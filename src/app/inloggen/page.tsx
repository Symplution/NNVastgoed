import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2, Search } from 'lucide-react';
import { Logo } from '@/components/logo';
import { safeNext } from '@/lib/safe-next';
import { AuthForms } from './auth-forms';

export const metadata: Metadata = { title: 'Inloggen', robots: { index: false } };

export default async function Inloggen({ searchParams }: { searchParams: Promise<{ next?: string; nieuw?: string }> }) {
  const sp = await searchParams;
  const next = safeNext(sp.next, '/mijn');
  return (
    <div className="container-x py-12">
      <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-[1.2fr_1fr]">
        <section className="card p-8" aria-labelledby="zoeker">
          <Logo />
          <p className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-brand"><Search size={16} aria-hidden /> Ik zoek een woning</p>
          <h1 id="zoeker" className="mt-1 text-2xl font-extrabold">Mijn NNV</h1>
          <p className="mb-6 mt-1 text-sm text-muted">Met een account zie je je favoriete woningen, je geplande bezichtigingen en je berichten met makelaars op één plek.</p>
          <AuthForms next={next} initial={sp.nieuw ? 'signup' : 'login'} />
        </section>
        <aside className="card flex flex-col justify-between bg-brand-soft p-8">
          <div>
            <p className="inline-flex items-center gap-2 text-sm font-semibold text-brand"><Building2 size={16} aria-hidden /> Ik ben makelaar</p>
            <h2 className="mt-1 text-xl font-extrabold">Naar het beheer</h2>
            <p className="mt-2 text-sm text-muted">Woningen, bezichtigingen, berichten en leads van je kantoor. Inloggen met je makelaarsaccount en een authenticator-app.</p>
          </div>
          <Link href="/login" className="btn-primary mt-6">Inloggen voor makelaars</Link>
        </aside>
      </div>
    </div>
  );
}
