import { requireStaff } from '@/lib/auth';
import { buildListingPdf } from '@/lib/listing-pdf';
import { myListing, myOffices } from '@/lib/staff-data';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/** Intern pdf-overzicht van een woning. Alleen voor medewerkers; row level security bepaalt welke woningen je kunt openen. */
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const listing = await myListing((await params).id);
  if (!listing) return new Response('Deze woning bestaat niet.', { status: 404 });
  const office = (await myOffices()).find((o) => o.id === listing.officeId);
  if (!office) return new Response('Het kantoor van deze woning is niet gevonden.', { status: 404 });
  const bytes = await buildListingPdf({ listing, office });
  const name = `${listing.slug}`.replace(/[^a-z0-9-]/gi, '').slice(0, 80) || 'woning';
  return new Response(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="woning-${name}.pdf"`, 'Cache-Control': 'private, no-store' } });
}
