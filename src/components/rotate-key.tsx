'use client';

import { KeyRound } from 'lucide-react';
import { useActionState } from 'react';
import { rotateConnectionKey } from '@/app/beheer/actions';
import { SecretPanel } from './secret-panel';

/** Een nieuwe geheime sleutel voor een bestaande koppeling; de oude werkt daarna niet meer. */
export function RotateKey({ id, baseUrl }: { id: string; baseUrl: string }) {
  const [state, action, pending] = useActionState(rotateConnectionKey, undefined);
  return (
    <div>
      <form action={action} onSubmit={(e) => { if (!confirm('Een nieuwe sleutel maken? De oude sleutel werkt daarna niet meer; je moet de nieuwe doorgeven aan je ICT-partner.')) e.preventDefault(); }}>
        <input type="hidden" name="id" value={id} />
        <button disabled={pending} className="btn-ghost !py-1.5"><KeyRound size={15} aria-hidden /> Nieuwe sleutel</button>
      </form>
      {state?.errors && <p role="alert" className="mt-2 text-sm text-red-700">{state.errors.join(' ')}</p>}
      {state?.secret && <div className="mt-3 basis-full rounded-xl border border-line bg-white p-4"><SecretPanel secret={state.secret} baseUrl={baseUrl} /></div>}
    </div>
  );
}
