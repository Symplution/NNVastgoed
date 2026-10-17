'use client';

import { useActionState, useEffect, useRef } from 'react';
import { Send } from 'lucide-react';
import { formatDateTime } from '@/lib/format';

export interface ThreadMsg { id: string; sender: 'zoeker' | 'makelaar'; body: string; createdAt: string }
type ReplyState = { ok?: boolean; error?: string } | undefined;

/** Een gesprek met berichten als tekstballonnen en een antwoordveld. `me` is de kant van de kijker. */
export function ThreadView({ messages, me, conversationId, action, otherName }: {
  messages: ThreadMsg[]; me: 'zoeker' | 'makelaar'; conversationId: string; otherName: string;
  action: (prev: ReplyState, form: FormData) => Promise<ReplyState>;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const end = useRef<HTMLDivElement>(null);
  const ref = useRef<HTMLFormElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }); }, [messages.length]);
  useEffect(() => { if (state?.ok) ref.current?.reset(); }, [state]);
  return (
    <div className="flex flex-col gap-4">
      <ul className="max-h-[28rem] space-y-3 overflow-y-auto rounded-2xl bg-sand p-4" aria-label="Berichten" aria-live="polite">
        {messages.map((m) => {
          const mine = m.sender === me;
          return (
            <li key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${mine ? 'rounded-br-sm bg-brand text-white' : 'rounded-bl-sm bg-white shadow-card'}`}>
                {!mine && <p className="mb-0.5 text-xs font-semibold text-muted">{otherName}</p>}
                <p className="whitespace-pre-line">{m.body}</p>
                <p className={`mt-1 text-[11px] ${mine ? 'text-white/70' : 'text-muted'}`}>{formatDateTime(m.createdAt)}</p>
              </div>
            </li>
          );
        })}
        <div ref={end} />
      </ul>
      <form ref={ref} action={formAction} className="space-y-2">
        <input type="hidden" name="conversationId" value={conversationId} />
        <label htmlFor="reply" className="sr-only">Je antwoord</label>
        <textarea id="reply" name="body" required maxLength={4000} rows={3} placeholder="Schrijf een bericht…" className="field" />
        {state?.error && <p role="alert" className="text-sm text-red-700">{state.error}</p>}
        <button disabled={pending} className="btn-primary"><Send size={16} aria-hidden /> {pending ? 'Versturen…' : 'Verstuur'}</button>
      </form>
    </div>
  );
}
