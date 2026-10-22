import type { Metadata } from 'next';
import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { OfficeForm } from '@/components/office-form';
import { Select } from '@/components/select';
import { canWrite, isManager, requireStaff } from '@/lib/auth';
import { myOffices } from '@/lib/staff-data';
import { claimOffice } from '../actions';

export const metadata: Metadata = { title: 'Mijn kantoor' };

export default async function Kantoor() {
  const staff = await requireStaff();
  const offices = await myOffices();
  const office = offices.find((o) => o.id === staff.officeId);
  const manager = isManager(staff.role);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-extrabold tracking-tight">Mijn kantoor</h1>
      {office ? (
        canWrite(staff) ? <OfficeForm office={office} /> : <p className="rounded-xl bg-sand p-6 text-sm text-muted">Je hebt alleen leesrechten voor {office.name}.</p>
      ) : manager ? (
        <div className="space-y-6">
          <p className="flex items-start gap-3 rounded-xl bg-accent-soft p-4 text-sm text-accent-dark"><Building2 size={20} className="mt-0.5 shrink-0" aria-hidden /> Je account hoort nog niet bij een kantoor. Kies hieronder een bestaand kantoor of maak een nieuw kantoor aan. Daarna kun je koppelen, woningen plaatsen en bezichtigingen instellen.</p>
          {offices.length > 0 && (
            <section aria-labelledby="kies" className="card p-6">
              <h2 id="kies" className="text-lg font-bold">Kies een bestaand kantoor</h2>
              <form action={claimOffice} className="mt-4 grid items-end gap-4 sm:grid-cols-[1fr_auto]">
                <div><label htmlFor="k-office" className="label">Kantoor</label><Select id="k-office" name="office_id" required options={[{ value: '', label: 'Kies een kantoor…' }, ...offices.map((o) => ({ value: o.id, label: `${o.name} (${o.city})` }))]} /></div>
                <button className="btn-primary">Dit is mijn kantoor</button>
              </form>
            </section>
          )}
          <section aria-labelledby="nieuw"><h2 id="nieuw" className="mb-3 text-lg font-bold">Of maak een nieuw kantoor aan</h2><OfficeForm canSetNvm linkToMe /></section>
        </div>
      ) : (
        <div className="rounded-xl bg-sand p-8 text-center text-muted">
          <p>Je account is nog niet gekoppeld aan een kantoor.</p>
          <p className="mt-1 text-sm">De eigenaar koppelt je onder Beheer → Gebruikers. Is je kantoor nog niet aangemeld? <Link href="/voor-makelaars/aanmelden" className="font-semibold text-brand underline">Meld je kantoor gratis aan</Link>.</p>
        </div>
      )}
    </div>
  );
}
