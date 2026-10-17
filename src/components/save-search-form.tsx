'use client';

import { useActionState } from 'react';
import { BellRing } from 'lucide-react';
import { saveSearch } from '@/app/actions';

/** E-mailalert voor de huidige zoekopdracht (dubbele opt-in). */
export function SaveSearchForm({ qs }: { qs: string }) {
  const [state, action, pending] = useActionState(saveSearch, undefined);
  if (state?.ok) return <p role="status" className="rounded-xl bg-brand-soft p-4 text-sm text-brand-dark">{state.message}</p>;
  return (
    <form action={action} className="space-y-3 rounded-xl bg-brand-soft p-4">
      <p className="flex items-center gap-2 text-sm font-semibold text-brand-dark"><BellRing size={16} aria-hidden /> Mail me bij nieuw aanbod</p>
      <input type="hidden" name="qs" value={qs} />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
      <div>
        <label htmlFor="alert-email" className="sr-only">E-mailadres</label>
        <input id="alert-email" name="email" type="email" required autoComplete="email" placeholder="je@email.nl" className="field" />
      </div>
      <label className="flex items-start gap-2 text-xs text-ink/80"><input type="checkbox" name="consent" required className="mt-0.5" /> <span>Ik ga akkoord met de <a href="/privacy" className="underline">privacyverklaring</a>. Afmelden kan altijd.</span></label>
      {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
      <button disabled={pending} className="btn-primary w-full">{pending ? 'Bezig…' : 'Houd me op de hoogte'}</button>
    </form>
  );
}
