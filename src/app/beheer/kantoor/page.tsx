import type { Metadata } from 'next';
import { OfficeForm } from '@/components/office-form';
import { canWrite, requireStaff } from '@/lib/auth';
import { myOffices } from '@/lib/staff-data';

export const metadata: Metadata = { title: 'Mijn kantoor' };

export default async function Kantoor() {
  const staff = await requireStaff();
  const office = (await myOffices()).find((o) => o.id === staff.officeId);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">Mijn kantoor</h1>
      {!office ? <p className="rounded-xl bg-sand p-8 text-center text-muted">Je account hoort niet bij een kantoor. Beheerders vinden alle kantoren onder “Alle kantoren”.</p>
        : canWrite(staff) ? <OfficeForm office={office} /> : <p className="rounded-xl bg-sand p-6 text-sm text-muted">Je hebt alleen leesrechten voor {office.name}.</p>}
    </div>
  );
}
