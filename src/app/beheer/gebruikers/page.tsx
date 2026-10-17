import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { requireStaff } from '@/lib/auth';
import { allProfiles, myOffices } from '@/lib/staff-data';
import { setProfile } from '../actions';

export const metadata: Metadata = { title: 'Gebruikers' };

export default async function Gebruikers() {
  const staff = await requireStaff();
  if (staff.role !== 'owner') redirect('/beheer');
  const [profiles, offices] = await Promise.all([allProfiles(), myOffices()]);
  return (
    <div>
      <h1 className="text-2xl font-extrabold tracking-tight">Gebruikers</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted">Nodig nieuwe mensen uit via Supabase (Authentication → Users → Invite). Ze beginnen met alleen lezen en zonder kantoor; hier koppel je ze aan een kantoor en geef je ze een rol.</p>
      <ul className="mt-6 space-y-3">
        {profiles.map((p) => (
          <li key={p.id} className="card p-4">
            <form action={setProfile} className="grid items-end gap-3 sm:grid-cols-[1fr_9rem_1fr_auto_auto]">
              <input type="hidden" name="id" value={p.id} />
              <p className="font-semibold">{p.name || 'Zonder naam'}</p>
              <div><label htmlFor={`r-${p.id}`} className="label">Rol</label><select id={`r-${p.id}`} name="role" defaultValue={p.role} className="field"><option value="owner">Eigenaar</option><option value="admin">Beheerder</option><option value="agent">Makelaar</option><option value="readonly">Alleen lezen</option></select></div>
              <div><label htmlFor={`k-${p.id}`} className="label">Kantoor</label><select id={`k-${p.id}`} name="office_id" defaultValue={p.officeId ?? ''} className="field"><option value="">Geen</option>{offices.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
              <label className="flex items-center gap-2 pb-2 text-sm"><input type="checkbox" name="active" value="1" defaultChecked={p.active} /> Toegang</label>
              <button className="btn-ghost">Opslaan</button>
            </form>
          </li>
        ))}
      </ul>
    </div>
  );
}
