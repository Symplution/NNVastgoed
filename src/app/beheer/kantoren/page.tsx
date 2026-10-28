import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { OfficeForm } from '@/components/office-form';
import { isManager, requireStaff } from '@/lib/auth';
import { myOffices } from '@/lib/staff-data';
import { provinceName } from '@/lib/regions';
import { claimOffice } from '../actions';

export const metadata: Metadata = { title: 'Alle kantoren' };

export default async function Kantoren() {
  const staff = await requireStaff();
  if (!isManager(staff.role)) redirect('/beheer');
  const offices = await myOffices();
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-extrabold tracking-tight">Alle kantoren</h1>
      <section aria-labelledby="nieuw"><h2 id="nieuw" className="mb-3 text-lg font-bold">Kantoor toevoegen</h2><OfficeForm canSetNvm linkToMe={!staff.officeId} /></section>
      <section aria-labelledby="lijst"><h2 id="lijst" className="mb-3 text-lg font-bold">Aangesloten ({offices.length})</h2>
        <ul className="divide-y divide-line rounded-xl border border-line">{offices.map((o) => (
          <li key={o.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <span><span className="font-semibold">{o.name}</span>{o.nvmMember && <span className="pill ml-2 bg-brand-soft text-brand">NVM</span>}{o.id === staff.officeId && <span className="pill ml-2 bg-green-100 text-green-900">Jouw kantoor</span>} <span className="text-muted">· {o.city}, {provinceName(o.province)} · {o.email}</span></span>
            {o.id !== staff.officeId && <form action={claimOffice}><input type="hidden" name="office_id" value={o.id} /><button className="btn-ghost !py-1.5 text-sm">Dit is mijn kantoor</button></form>}
          </li>))}</ul>
      </section>
    </div>
  );
}
