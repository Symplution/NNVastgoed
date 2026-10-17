'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function PasswordForm() {
  const router = useRouter();
  const [pw, setPw] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pw.length < 12) return setError('Kies een wachtwoord van minimaal 12 tekens.');
    setBusy(true); setError('');
    const { error } = await createClient().auth.updateUser({ password: pw });
    setBusy(false);
    if (error) return setError('Dit wachtwoord is niet gelukt. Probeer een ander wachtwoord.');
    router.replace('/mfa');
  }
  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div><label htmlFor="pw" className="label">Nieuw wachtwoord (minimaal 12 tekens)</label><input id="pw" type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" required className="field" /></div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={busy} className="btn-primary w-full">{busy ? 'Bezig…' : 'Opslaan'}</button>
    </form>
  );
}
