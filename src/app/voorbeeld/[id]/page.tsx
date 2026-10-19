import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ListingDetail } from '@/components/listing-detail';
import { requireStaff } from '@/lib/auth';
import { myListing } from '@/lib/staff-data';

export const metadata: Metadata = { title: 'Voorbeeld van je woning', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

/** De woningpagina zoals bezoekers hem zien, ook als de woning nog een concept is. Alleen voor het eigen kantoor (de sessie en row level security bepalen dat). Wordt getoond in een kader in het beheer. */
export default async function Voorbeeld({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const l = await myListing((await params).id);
  if (!l) notFound();
  return <ListingDetail l={l} preview />;
}
