'use client';

import { MailPlus } from 'lucide-react';
import { useActionState } from 'react';
import { inviteStaff } from '@/app/beheer/actions';
import type { Office } from '@/lib/types';
import { CopyButton } from './copy-button';

/** Het account van een kantoor uitnodigen (één per kantoor): contactpersoon en e-mailadres, de rest staat vast. */
export function InviteForm({ office }: { office: Pick<Office, 'id' | 'name' | 'email'> }) {
  const [state, action, pending] = useActionState(inviteStaff, undefined);
  const id = `i-${office.id}`;
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
      <input type="hidden" name="role" value="agent" /><input type="hidden" name="office_id" value={office.id} />
      <div><label htmlFor={`${id}-name`} className="label">Contactpersoon</label><input id={`${id}-name`} name="name" required minLength={2} maxLength={120} defaultValue={office.name} className="field" autoComplete="off" /></div>
      <div><label htmlFor={`${id}-email`} className="label">E-mailadres voor het account</label><input id={`${id}-email`} name="email" type="email" required defaultValue={office.email} className="field" autoComplete="off" /></div>
      <button disabled={pending} className="btn-accent"><MailPlus size={15} aria-hidden /> {pending ? 'Bezig…' : 'Uitnodigen'}</button>
      {state?.errors && <ul role="alert" className="list-disc pl-5 text-sm text-red-700 sm:col-span-3">{state.errors.map((e) => <li key={e}>{e}</li>)}</ul>}
      {state?.ok && (
        <div role="status" className="space-y-2 rounded-xl bg-green-50 p-3 text-sm text-green-900 sm:col-span-3">
          {state.ok.mailed
            ? <p className="font-semibold">Uitnodiging verstuurd naar {state.ok.email}.</p>
            : <p className="font-semibold">Het account voor {state.ok.email} staat klaar, maar de mail is niet verstuurd (mail is hier nog niet ingesteld). Stuur deze eenmalige link zelf door:</p>}
          {!state.ok.mailed && <div className="flex items-start gap-2"><code className="block min-w-0 flex-1 break-all rounded bg-white p-2 text-xs">{state.ok.link}</code><CopyButton text={state.ok.link} /></div>}
        </div>
      )}
    </form>
  );
}
