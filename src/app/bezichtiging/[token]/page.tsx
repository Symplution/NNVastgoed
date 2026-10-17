import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { CalendarCheck, CalendarPlus, Mail, Phone } from 'lucide-react';
import { hasSupabase } from '@/lib/env';
import { formatDateTime } from '@/lib/format';
import { createAnonClient } from '@/lib/supabase/anon';
import { cancelViewingAction } from '@/app/mijn/actions';

export const metadata: Metadata = { title: 'Je bezichtiging', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

const STATUS: Record<string, { label: string; tone: string }> = {
  bevestigd: { label: 'Bevestigd', tone: 'bg-green-100 text-green-900' }, geannuleerd: { label: 'Geannuleerd', tone: 'bg-red-100 text-red-900' },
  afgerond: { label: 'Afgerond', tone: 'bg-sand text-muted' }, niet_verschenen: { label: 'Niet verschenen', tone: 'bg-sand text-muted' },
};

/** Een bezichtiging bekijken en annuleren met de sleutel uit de mail, zonder account. */
export default async function Bezichtiging({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token) || !hasSupabase()) notFound();
  const { data } = await createAnonClient().rpc('get_viewing', { p_token: token });
  const v = Array.isArray(data) ? data[0] : data;
  if (!v) notFound();
  const future = new Date(v.starts_at).getTime() > Date.now();
  const st = STATUS[v.status] ?? STATUS.bevestigd;
  return (
    <div className="container-x max-w-2xl py-12">
      <div className="card p-8">
        <p className="flex items-center gap-2 text-sm font-semibold text-brand"><CalendarCheck size={16} aria-hidden /> Bezichtiging</p>
        <h1 className="mt-1 text-2xl font-extrabold tracking-tight">{v.address}, {v.city}</h1>
        <p className="mt-3 text-xl font-bold text-brand">{formatDateTime(v.starts_at)}</p>
        <p className="mt-2"><span className={`pill ${st.tone}`}>{st.label}</span></p>
        <dl className="mt-6 space-y-2 text-sm">
          <div className="flex gap-3"><dt className="w-24 text-muted">Op naam van</dt><dd className="font-medium">{v.name}</dd></div>
          <div className="flex gap-3"><dt className="w-24 text-muted">Makelaar</dt><dd className="font-medium">{v.office_name}</dd></div>
          <div className="flex flex-wrap gap-4 pt-1">
            {v.office_phone && <a href={`tel:${v.office_phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 text-brand hover:underline"><Phone size={14} aria-hidden /> {v.office_phone}</a>}
            <a href={`mailto:${v.office_email}`} className="inline-flex items-center gap-1.5 text-brand hover:underline"><Mail size={14} aria-hidden /> {v.office_email}</a>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          {v.status === 'bevestigd' && future && <a href={`/api/bezichtiging/${token}/ics`} className="btn-primary"><CalendarPlus size={16} aria-hidden /> Toevoegen aan agenda</a>}
          <Link href={`/woning/${v.listing_slug}`} className="btn-ghost">Bekijk de woning</Link>
        </div>
        {v.status === 'bevestigd' && future && (
          <form action={cancelViewingAction} className="mt-8 border-t border-line pt-6">
            <input type="hidden" name="token" value={token} />
            <p className="text-sm text-muted">Kun je toch niet? Annuleer dan, zodat het moment weer vrijkomt voor een ander.</p>
            <button className="mt-3 text-sm font-semibold text-red-700 hover:underline">Bezichtiging annuleren</button>
          </form>
        )}
      </div>
    </div>
  );
}
