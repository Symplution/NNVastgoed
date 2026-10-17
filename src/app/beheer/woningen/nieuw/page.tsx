import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ListingForm } from '@/components/listing-form';
import { canWrite, isManager, requireStaff } from '@/lib/auth';
import { myOffices } from '@/lib/staff-data';

export const metadata: Metadata = { title: 'Nieuwe woning' };

export default async function Nieuw() {
  const staff = await requireStaff();
  if (!canWrite(staff)) redirect('/beheer/woningen');
  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">Nieuwe woning</h1>
      <ListingForm offices={await myOffices()} officeId={staff.officeId} canPickOffice={isManager(staff.role)} />
    </div>
  );
}
