import type { Metadata } from 'next';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { canWrite, requireStaff } from '@/lib/auth';
import { myListings, myOffices } from '@/lib/staff-data';
import { address, formatDate, formatEuro, STATUS_LABEL } from '@/lib/format';

export const metadata: Metadata = { title: 'Woningen' };

const TONE: Record<string, string> = { concept: 'bg-sand text-muted', beschikbaar: 'bg-green-100 text-green-900', onder_bod: 'bg-accent-soft text-accent-dark', onder_voorbehoud: 'bg-accent-soft text-accent-dark', verkocht: 'bg-ink text-white', ingetrokken: 'bg-red-100 text-red-900' };

export default async function Woningen() {
  const staff = await requireStaff();
  const [listings, offices] = await Promise.all([myListings(), myOffices()]);
  const officeName = new Map(offices.map((o) => [o.id, o.name]));
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">Woningen</h1>
        {canWrite(staff) && <Link href="/beheer/woningen/nieuw" className="btn-primary"><Plus size={16} aria-hidden /> Nieuwe woning</Link>}
      </div>
      {listings.length ? (
        <div className="mt-6 overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[40rem] text-left text-sm">
            <thead className="bg-sand text-xs uppercase tracking-wide text-muted"><tr><th className="px-4 py-3">Adres</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Aanbod</th><th className="px-4 py-3">Prijs</th><th className="px-4 py-3">Bron</th><th className="px-4 py-3">Gewijzigd</th></tr></thead>
            <tbody className="divide-y divide-line">
              {listings.map((l) => (
                <tr key={l.id} className="hover:bg-sand/60">
                  <td className="px-4 py-3"><Link href={`/beheer/woningen/${l.id}`} className="font-semibold text-brand hover:underline">{address(l)}, {l.city}</Link>{staff.role === 'owner' || staff.role === 'admin' ? <span className="block text-xs text-muted">{officeName.get(l.officeId)}</span> : null}</td>
                  <td className="px-4 py-3"><span className={`pill ${TONE[l.status]}`}>{STATUS_LABEL[l.status]}</span></td>
                  <td className="px-4 py-3 text-muted">{l.offer === 'huur' ? 'Huur' : 'Koop'}{l.newBuild ? ' · nieuwbouw' : ''}{l.category === 'bedrijfsruimte' ? ' · bedrijf' : ''}</td>
                  <td className="px-4 py-3">{formatEuro(l.askingPrice)}{l.offer === 'huur' ? ' p.m.' : ''}</td>
                  <td className="px-4 py-3 text-muted">{l.source === 'koppeling' ? 'Koppeling' : 'Handmatig'}</td>
                  <td className="px-4 py-3 text-muted">{formatDate(l.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : <p className="mt-6 rounded-xl bg-sand p-10 text-center text-muted">Nog geen woningen. Voeg er een toe of maak een koppeling.</p>}
    </div>
  );
}
