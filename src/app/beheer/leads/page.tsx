import type { Metadata } from 'next';
import { Mail, Phone } from 'lucide-react';
import { canWrite, requireStaff } from '@/lib/auth';
import { myLeads } from '@/lib/staff-data';
import { formatDate } from '@/lib/format';
import { setLeadStatus } from '../actions';
import { Select } from '@/components/select';

export const metadata: Metadata = { title: 'Leads' };

export default async function Leads() {
  const staff = await requireStaff();
  const leads = await myLeads();
  const write = canWrite(staff);
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Leads</h1>
      <p className="mt-1 text-sm text-muted">Contactverzoeken bij jouw woningen. Je krijgt ze ook per mail.</p>
      {leads.length ? (
        <ul className="mt-6 space-y-4">
          {leads.map((l) => (
            <li key={l.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold">{l.name} <span className="pill ml-2 bg-brand-soft text-brand">{l.kind === 'bezichtiging' ? 'Bezichtiging' : 'Vraag'}</span></p>
                  <p className="text-sm text-muted">{l.listing} · {formatDate(l.createdAt)}{l.office && ` · ${l.office}`}</p>
                </div>
                {write ? (
                  <form action={setLeadStatus} className="flex items-center gap-2"><input type="hidden" name="id" value={l.id} />
                    <label htmlFor={`s-${l.id}`} className="sr-only">Status</label>
                    <Select id={`s-${l.id}`} name="status" compact defaultValue={l.status} className="min-w-[9rem]" options={[{ value: 'nieuw', label: 'Nieuw' }, { value: 'opgepakt', label: 'Opgepakt' }, { value: 'afgehandeld', label: 'Afgehandeld' }]} />
                    <button className="btn-ghost !py-1.5">Opslaan</button></form>
                ) : <span className="pill bg-sand text-muted">{l.status}</span>}
              </div>
              <p className="mt-3 whitespace-pre-line text-sm">{l.message}</p>
              <p className="mt-3 flex flex-wrap gap-4 text-sm"><a href={`mailto:${l.email}`} className="inline-flex items-center gap-1.5 text-brand hover:underline"><Mail size={14} aria-hidden /> {l.email}</a>{l.phone && <a href={`tel:${l.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 text-brand hover:underline"><Phone size={14} aria-hidden /> {l.phone}</a>}</p>
            </li>
          ))}
        </ul>
      ) : <p className="mt-6 rounded-xl bg-sand p-10 text-center text-muted">Nog geen leads.</p>}
    </div>
  );
}
