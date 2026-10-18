import { buildListingPdf } from '@/lib/listing-pdf';
import { getListing, getOffice } from '@/lib/data';

export const runtime = 'nodejs';
export const maxDuration = 30;
export const revalidate = 600;

/** Brochure (pdf) van een openbare woning, voor iedereen. Alleen woningen die ook op de site staan; de anonieme rol bepaalt dat. */
export async function GET(_: Request, { params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  if (!/^[a-z0-9-]{1,120}$/.test(slug)) return new Response('Deze woning bestaat niet.', { status: 404 });
  const listing = await getListing(slug);
  if (!listing) return new Response('Deze woning bestaat niet of staat niet meer online.', { status: 404 });
  const office = await getOffice({ id: listing.officeId });
  if (!office) return new Response('Het kantoor van deze woning is niet gevonden.', { status: 404 });
  const bytes = await buildListingPdf({ listing, office, variant: 'publiek' });
  return new Response(Buffer.from(bytes), { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="brochure-${slug}.pdf"`, 'Cache-Control': 'public, max-age=300, s-maxage=600' } });
}
