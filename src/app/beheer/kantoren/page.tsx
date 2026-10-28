import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { CheckCircle2, UserX } from 'lucide-react';
import { InviteForm } from '@/components/invite-form';
import { OfficeForm } from '@/components/office-form';
import { isManager, requireStaff } from '@/lib/auth';
import { allProfiles, myOffices } from '@/lib/staff-data';
import { provinceName } from '@/lib/regions';
import { claimOffice, setAccountActive } from '../actions';

export const metadata: Metadata = { title: 'Alle kantoren' };

export default async function Kantoren() {
  const staff = await requireStaff();
  if (!isManager(staff.role)) redirect('/beheer');
  const [offices, profiles] = await Promise.all([myOffices(), allProfiles()]);
  const accountOf = (officeId: string) => profiles.find((p) => p.officeId === officeId && p.role === 'agent');
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Alle kantoren</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">Elk kantoor heeft één account. Teamleden van een kantoor delen dat account. Nodig hieronder het account van een kantoor uit.</p>
      </div>
      <section aria-labelledby="lijst"><h2 id="lijst" className="mb-3 text-lg font-bold">Aangesloten ({offices.length})</h2>
        <ul className="space-y-3">{offices.map((o) => {
          const account = accountOf(o.id);
          return (
            <li key={o.id} className="card p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p><span className="text-base font-bold">{o.name}</span>{o.nvmMember && <span className="pill ml-2 bg-brand-soft text-brand">NVM</span>}{o.id === staff.officeId && <span className="pill ml-2 bg-green-100 text-green-900">Jouw kantoor</span>} <span className="block text-muted sm:inline">· {o.city}, {provinceName(o.province)} · {o.email}</span></p>
                {o.id !== staff.officeId && <form action={claimOffice}><input type="hidden" name="office_id" value={o.id} /><button className="btn-ghost !py-1.5 text-sm">Dit is mijn kantoor</button></form>}
              </div>
              {account ? (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-sand p-3">
                  <p className="inline-flex items-center gap-2 font-semibold"><CheckCircle2 size={16} className={account.active ? 'text-green-600' : 'text-muted'} aria-hidden /> Account: {account.name || 'zonder naam'} <span className={`pill ${account.active ? 'bg-green-100 text-green-900' : 'bg-white text-muted'}`}>{account.active ? 'Toegang' : 'Geen toegang'}</span></p>
                  {staff.role === 'owner' && <form action={setAccountActive}><input type="hidden" name="id" value={account.id} /><input type="hidden" name="active" value={account.active ? '0' : '1'} /><button className="btn-ghost !py-1.5 text-sm">{account.active ? 'Toegang uitzetten' : 'Toegang aanzetten'}</button></form>}
                </div>
              ) : (
                <div className="mt-3 rounded-xl bg-accent-soft/60 p-3">
                  <p className="mb-3 inline-flex items-center gap-2 font-semibold text-accent-dark"><UserX size={16} aria-hidden /> Nog geen account</p>
                  {staff.role === 'owner' ? <InviteForm office={o} /> : <p className="text-muted">Alleen de eigenaar kan een account uitnodigen.</p>}
                </div>
              )}
            </li>
          );
        })}</ul>
      </section>
      <section aria-labelledby="nieuw"><h2 id="nieuw" className="mb-3 text-lg font-bold">Kantoor toevoegen</h2><OfficeForm canSetNvm linkToMe={!staff.officeId} /></section>
    </div>
  );
}
