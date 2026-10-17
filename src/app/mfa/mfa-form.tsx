'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type Mode = 'loading' | 'verify' | 'enroll';

export function MfaForm() {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>('loading');
  const [factorId, setFactorId] = useState('');
  const [qr, setQr] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    (async () => {
      const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      if (aal?.currentLevel === 'aal2') return router.replace('/beheer');
      const { data, error } = await supabase.auth.mfa.listFactors();
      if (error) return setError('Kon tweestapsverificatie niet laden.');
      const verified = data.totp.find((f) => f.status === 'verified');
      if (verified) { setFactorId(verified.id); return setMode('verify'); }
      for (const f of data.totp.filter((f) => f.status !== 'verified')) await supabase.auth.mfa.unenroll({ factorId: f.id });   // half afgeronde registraties opruimen
      const enroll = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: 'Authenticator' });
      if (enroll.error) return setError('Kon geen authenticator koppelen.');
      setFactorId(enroll.data.id); setQr(enroll.data.totp.qr_code); setSecret(enroll.data.totp.secret); setMode('enroll');
    })();
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError('');
    const supabase = createClient();
    const challenge = await supabase.auth.mfa.challenge({ factorId });
    if (challenge.error) { setBusy(false); return setError('Er ging iets mis. Probeer het opnieuw.'); }
    const verify = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.data.id, code: code.trim() });
    setBusy(false);
    if (verify.error) return setError('Deze code klopt niet. Probeer de nieuwste code.');
    router.replace('/beheer');
    router.refresh();
  }

  if (mode === 'loading') return <p className="mt-6 text-sm text-muted">{error || 'Laden…'}</p>;
  return (
    <form onSubmit={submit} className="mt-6 space-y-4">
      {mode === 'enroll' && (
        <div className="space-y-3 text-sm">
          <p>Scan deze QR-code met Google of Microsoft Authenticator en vul daarna de code in.</p>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={qr} alt="QR-code voor je authenticator" className="mx-auto h-44 w-44 rounded-xl border border-line bg-white p-2" />
          <p className="break-all text-xs text-muted">Lukt scannen niet? Voer dit in: <code>{secret}</code></p>
        </div>
      )}
      <div>
        <label htmlFor="code" className="label">Code uit je authenticator</label>
        <input id="code" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required autoFocus className="field text-center text-xl tracking-[0.4em]" />
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <button disabled={busy || code.length !== 6} className="btn-primary w-full">{busy ? 'Controleren…' : mode === 'enroll' ? 'Activeren' : 'Bevestigen'}</button>
    </form>
  );
}
