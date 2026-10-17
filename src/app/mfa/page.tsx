import type { Metadata } from 'next';
import { Logo } from '@/components/logo';
import { MfaForm } from './mfa-form';

export const metadata: Metadata = { title: 'Tweestapsverificatie', robots: { index: false } };

export default function MfaPage() {
  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8">
        <Logo />
        <h1 className="mt-6 text-2xl font-extrabold">Tweestapsverificatie</h1>
        <p className="mt-1 text-sm text-muted">Verplicht voor iedereen die woningen en leads beheert.</p>
        <MfaForm />
      </div>
    </div>
  );
}
