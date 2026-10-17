'use client';

import { useActionState } from 'react';
import { login } from './actions';

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  return (
    <form action={action} className="mt-6 space-y-4">
      <div><label htmlFor="email" className="label">E-mailadres</label><input id="email" name="email" type="email" required autoComplete="email" className="field" /></div>
      <div><label htmlFor="password" className="label">Wachtwoord</label><input id="password" name="password" type="password" required autoComplete="current-password" className="field" /></div>
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full">{pending ? 'Bezig…' : 'Inloggen'}</button>
    </form>
  );
}
