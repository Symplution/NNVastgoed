'use client';

import { useActionState, useState } from 'react';
import { seekerLogin, seekerReset, seekerSignup } from './actions';

type Mode = 'login' | 'signup' | 'reset';

export function AuthForms({ next, initial = 'login' }: { next: string; initial?: Mode }) {
  const [mode, setMode] = useState<Mode>(initial);
  const [login, loginAction, loginPending] = useActionState(seekerLogin, undefined);
  const [signup, signupAction, signupPending] = useActionState(seekerSignup, undefined);
  const [reset, resetAction, resetPending] = useActionState(seekerReset, undefined);
  const tab = (m: Mode, label: string) => (
    <button type="button" role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
      className={`focus-ring flex-1 rounded-lg px-3 py-2 text-sm font-semibold ${mode === m ? 'bg-white text-brand shadow' : 'text-muted hover:text-ink'}`}>{label}</button>
  );
  return (
    <div>
      <div role="tablist" aria-label="Inloggen of account maken" className="flex gap-1 rounded-xl bg-sand p-1">{tab('login', 'Inloggen')}{tab('signup', 'Account maken')}</div>

      {mode === 'login' && (
        <form action={loginAction} className="mt-5 space-y-4">
          <input type="hidden" name="next" value={next} />
          <div><label htmlFor="l-email" className="label">E-mailadres</label><input id="l-email" name="email" type="email" required autoComplete="email" className="field" /></div>
          <div><label htmlFor="l-pw" className="label">Wachtwoord</label><input id="l-pw" name="password" type="password" required autoComplete="current-password" className="field" /></div>
          {login?.error && <p role="alert" className="text-sm text-red-700">{login.error}</p>}
          <button disabled={loginPending} className="btn-primary w-full">{loginPending ? 'Bezig…' : 'Inloggen'}</button>
          <button type="button" onClick={() => setMode('reset')} className="focus-ring w-full text-center text-sm text-muted underline">Wachtwoord vergeten?</button>
        </form>
      )}

      {mode === 'signup' && (
        <form action={signupAction} className="mt-5 space-y-4">
          <input type="hidden" name="next" value={next} />
          <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
          {signup?.message ? <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-900">{signup.message}</p> : (
            <>
              <div><label htmlFor="s-name" className="label">Naam</label><input id="s-name" name="name" required minLength={2} maxLength={120} autoComplete="name" className="field" /></div>
              <div><label htmlFor="s-email" className="label">E-mailadres</label><input id="s-email" name="email" type="email" required autoComplete="email" className="field" /></div>
              <div><label htmlFor="s-pw" className="label">Wachtwoord (minimaal 10 tekens)</label><input id="s-pw" name="password" type="password" required minLength={10} autoComplete="new-password" className="field" /></div>
              <label className="flex items-start gap-2 text-xs text-muted"><input type="checkbox" name="consent" required className="mt-0.5" /><span>Ik ga akkoord met de <a href="/privacy" className="underline">privacyverklaring</a>.</span></label>
              {signup?.error && <p role="alert" className="text-sm text-red-700">{signup.error}</p>}
              <button disabled={signupPending} className="btn-primary w-full">{signupPending ? 'Bezig…' : 'Account maken'}</button>
            </>
          )}
        </form>
      )}

      {mode === 'reset' && (
        <form action={resetAction} className="mt-5 space-y-4">
          <p className="text-sm text-muted">Vul je e-mailadres in. Je krijgt een mail met een link om een nieuw wachtwoord te kiezen.</p>
          <div><label htmlFor="r-email" className="label">E-mailadres</label><input id="r-email" name="email" type="email" required autoComplete="email" className="field" /></div>
          {reset?.error && <p role="alert" className="text-sm text-red-700">{reset.error}</p>}
          {reset?.message && <p role="status" className="rounded-xl bg-green-50 p-4 text-sm text-green-900">{reset.message}</p>}
          <button disabled={resetPending} className="btn-primary w-full">{resetPending ? 'Bezig…' : 'Stuur de link'}</button>
          <button type="button" onClick={() => setMode('login')} className="focus-ring w-full text-center text-sm text-muted underline">Terug naar inloggen</button>
        </form>
      )}
    </div>
  );
}
