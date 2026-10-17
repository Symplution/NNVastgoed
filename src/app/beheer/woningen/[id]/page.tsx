import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink } from 'lucide-react';
import { ListingForm } from '@/components/listing-form';
import { canWrite, isManager, requireStaff } from '@/lib/auth';
import { myListing, myOffices } from '@/lib/staff-data';
import { deleteListing } from '../../actions';

export const metadata: Metadata = { title: 'Woning bewerken' };

export default async function Bewerk({ params }: { params: Promise<{ id: string }> }) {
  const staff = await requireStaff();
  const listing = await myListing((await params).id);
  if (!listing) notFound();
  const write = canWrite(staff);
  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold tracking-tight">{listing.street} {listing.houseNumber}, {listing.city}</h1>
        <Link href={`/woning/${listing.slug}`} className="btn-ghost" target="_blank"><ExternalLink size={15} aria-hidden /> Bekijk op de site</Link>
      </div>
      {listing.source === 'koppeling' && <p className="mb-6 rounded-xl bg-brand-soft p-4 text-sm text-brand-dark">Deze woning komt uit een koppeling. Wijzigingen die je hier doet worden bij de volgende aanroep van de koppeling overschreven.</p>}
      {write ? (
        <>
          <ListingForm listing={listing} offices={await myOffices()} officeId={staff.officeId} canPickOffice={isManager(staff.role)} />
          <form action={deleteListing} className="mt-10 border-t border-line pt-6"><input type="hidden" name="id" value={listing.id} /><button className="text-sm font-semibold text-red-700 hover:underline">Woning verwijderen</button><p className="mt-1 text-xs text-muted">Liever offline? Zet de status op Ingetrokken.</p></form>
        </>
      ) : <p className="rounded-xl bg-sand p-6 text-sm text-muted">Je hebt alleen leesrechten.</p>}
    </div>
  );
}
