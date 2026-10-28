import type { Metadata } from 'next';
import { canWrite, isManager, requireStaff } from '@/lib/auth';
import { LeadsBoard } from '@/components/leads-board';
import { myLeads } from '@/lib/staff-data';
import { formatDate } from '@/lib/format';

export const metadata: Metadata = { title: 'Leads' };

export default async function Leads() {
  const staff = await requireStaff();
  const leads = await myLeads();
  const dateOf = Object.fromEntries(leads.map((l) => [l.id, formatDate(l.createdAt)]));
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Leads</h1>
      <p className="mt-1 text-sm text-muted">Contactverzoeken bij jouw woningen. Je krijgt ze ook per mail. {canWrite(staff) ? 'Pak een lead vast en sleep hem naar het volgende stadium, of kies het stadium in het menu op de kaart.' : ''}</p>
      {leads.length ? <div className="mt-6"><LeadsBoard leads={leads} canEdit={canWrite(staff)} showOffice={isManager(staff.role)} dateOf={dateOf} /></div> : <p className="mt-6 rounded-xl bg-sand p-10 text-center text-muted">Nog geen leads.</p>}
    </div>
  );
}
