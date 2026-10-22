'use client';

import { MailPlus } from 'lucide-react';
import { useActionState } from 'react';
import { inviteStaff } from '@/app/beheer/actions';
import { INVITE_ROLES, INVITE_ROLE_LABEL } from '@/lib/staff-invite';
import type { Office } from '@/lib/types';
import { CopyButton } from './copy-button';
import { Select } from './select';

/** Een collega uitnodigen: naam, e-mail, rol en kantoor. De collega krijgt een mail met een link om een wachtwoord te kiezen. */
export function InviteForm({ offices }: { offices: Office[] }) {
  const [state, action, pending] = useActionState(inviteStaff, undefined);
  return (
    <section aria-labelledby="uitnodigen" className="card p-6">
      <h2 id="uitnodigen" className="flex items-center gap-2 text-lg font-bold"><MailPlus size={18} aria-hidden /> Nodig een collega uit</h2>
      <p className="mt-1 text-sm text-muted">Je collega krijgt een mail met een link om een wachtwoord te kiezen. Rol en kantoor staan dan al goed.</p>
      <form action={action} className="mt-4 grid gap-4 sm:grid-cols-2">
        <div><label htmlFor="i-name" className="label">Naam</label><input id="i-name" name="name" required minLength={2} maxLength={120} className="field" autoComplete="off" /></div>
        <div><label htmlFor="i-email" className="label">E-mailadres</label><input id="i-email" name="email" type="email" required className="field" autoComplete="off" /></div>
        <div><label htmlFor="i-role" className="label">Rol</label><Select id="i-role" name="role" defaultValue="agent" options={INVITE_ROLES.map((r) => ({ value: r, label: INVITE_ROLE_LABEL[r] }))} /></div>
        <div><label htmlFor="i-office" className="label">Kantoor</label><Select id="i-office" name="office_id" defaultValue="" options={[{ value: '', label: 'Kies een kantoor…' }, ...offices.map((o) => ({ value: o.id, label: o.name }))]} /></div>
        {state?.errors && <ul role="alert" className="list-disc pl-5 text-sm text-red-700 sm:col-span-2">{state.errors.map((e) => <li key={e}>{e}</li>)}</ul>}
        {state?.ok && (
          <div role="status" className="space-y-2 rounded-xl bg-green-50 p-4 text-sm text-green-900 sm:col-span-2">
            {state.ok.mailed
              ? <p className="font-semibold">Uitnodiging verstuurd naar {state.ok.email}.</p>
              : <p className="font-semibold">Het account voor {state.ok.email} staat klaar, maar de mail is niet verstuurd (mail is hier nog niet ingesteld). Stuur deze eenmalige link zelf door:</p>}
            {!state.ok.mailed && <div className="flex items-start gap-2"><code className="block min-w-0 flex-1 break-all rounded bg-white p-2 text-xs">{state.ok.link}</code><CopyButton text={state.ok.link} /></div>}
          </div>
        )}
        <div className="sm:col-span-2"><button disabled={pending} className="btn-accent">{pending ? 'Bezig…' : 'Uitnodiging versturen'}</button></div>
      </form>
    </section>
  );
}
