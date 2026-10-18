'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { CheckCircle2, MessageSquare } from 'lucide-react';
import { sendSeekerMessage } from '@/app/mijn/actions';
import { useAuthUser } from '@/lib/use-auth-user';
import { ContactForm } from './contact-form';

/** Contact met de makelaar. Ingelogd: een gesprek dat je terugziet in Mijn NNV. Anders: een formulier zonder account. */
export function ContactPanel({ listingId, officeName }: { listingId: string; officeName: string }) {
  const user = useAuthUser();
  const [state, action, pending] = useActionState(sendSeekerMessage, undefined);
  if (user === undefined) return <p className="text-sm text-muted">Laden…</p>;
  if (!user) {
    return (
      <div className="space-y-4">
        <ContactForm listingId={listingId} officeName={officeName} />
        <p className="rounded-lg bg-brand-soft p-3 text-xs text-brand-dark"><Link href={`/inloggen?nieuw=1`} className="font-semibold underline">Maak een account</Link> of <Link href="/inloggen" className="font-semibold underline">log in</Link> om te chatten met de makelaar en je berichten terug te zien.</p>
      </div>
    );
  }
  if (state?.ok) {
    return (
      <div role="status" className="space-y-3 rounded-xl bg-green-50 p-4 text-sm text-green-900">
        <p className="flex items-center gap-2 font-semibold"><CheckCircle2 size={18} aria-hidden /> Je bericht is verstuurd.</p>
        <Link href={`/mijn/berichten/${state.conversationId}`} className="btn-ghost w-full">Naar het gesprek</Link>
      </div>
    );
  }
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="listingId" value={listingId} />
      <div><label htmlFor="m-name" className="label">Naam</label><input id="m-name" name="name" required minLength={2} maxLength={120} defaultValue={user.name} autoComplete="name" className="field" /></div>
      <div><label htmlFor="m-phone" className="label">Telefoonnummer</label><input id="m-phone" name="phone" type="tel" required minLength={8} maxLength={40} defaultValue={user.phone} autoComplete="tel" className="field" /></div>
      <div><label htmlFor="m-email" className="label">E-mailadres</label><input id="m-email" name="email" type="email" required readOnly value={user.email} autoComplete="email" className="field bg-sand" aria-describedby="m-email-hint" /><p id="m-email-hint" className="mt-1 text-xs text-muted">Dit is het adres van je account.</p></div>
      <div><label htmlFor="m-body" className="label">Je bericht aan {officeName}</label><textarea id="m-body" name="body" required maxLength={4000} rows={5} defaultValue="Ik heb interesse in deze woning. Kunnen jullie me meer vertellen?" className="field" /></div>
      {state?.error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-800">{state.error}</p>}
      <button disabled={pending} className="btn-accent w-full"><MessageSquare size={16} aria-hidden /> {pending ? 'Versturen…' : 'Stuur bericht'}</button>
      <p className="text-xs text-muted">Het antwoord komt in <Link href="/mijn/berichten" className="underline">Mijn NNV</Link> en in je mail.</p>
    </form>
  );
}
