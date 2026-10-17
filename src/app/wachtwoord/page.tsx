import type { Metadata } from 'next';
import { Logo } from '@/components/logo';
import { PasswordForm } from './password-form';

export const metadata: Metadata = { title: 'Wachtwoord instellen', robots: { index: false } };

export default function Wachtwoord() {
  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-12">
      <div className="card w-full max-w-md p-8"><Logo /><h1 className="mt-6 text-2xl font-extrabold">Wachtwoord instellen</h1><PasswordForm /></div>
    </div>
  );
}
