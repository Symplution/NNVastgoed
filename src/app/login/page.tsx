import type { Metadata } from 'next';
import { Logo } from '@/components/logo';
import { LoginForm } from './login-form';

export const metadata: Metadata = { title: 'Inloggen voor makelaars', robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ fout?: string }> }) {
  const { fout } = await searchParams;
  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <Logo />
        <h1 className="mt-6 text-2xl font-extrabold">Inloggen voor makelaars</h1>
        <p className="mt-1 text-sm text-muted">Beheer je woningen, leads en koppelingen.</p>
        {fout === 'geblokkeerd' && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-800">Dit account heeft geen toegang. Neem contact op met NNvastgoed.</p>}
        {fout === 'link' && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">Deze link werkt niet meer of is al gebruikt. Vraag een nieuwe uitnodiging aan.</p>}
        <LoginForm />
      </div>
    </div>
  );
}
