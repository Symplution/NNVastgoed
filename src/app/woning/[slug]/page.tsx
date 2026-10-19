import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ListingDetail } from '@/components/listing-detail';
import { getListing } from '@/lib/data';
import { address, formatPrice, OFFER_LABEL, TYPE_LABEL } from '@/lib/format';
import { provinceName } from '@/lib/regions';

type Props = { params: Promise<{ slug: string }> };
export const revalidate = 120;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const l = await getListing((await params).slug);
  if (!l) return {};
  const title = `${address(l)}, ${l.postcode} ${l.city}`;
  const description = `${TYPE_LABEL[l.propertyType]} ${OFFER_LABEL[l.offer].toLowerCase()} in ${l.city} (${provinceName(l.province)}) voor ${formatPrice(l)}. ${l.livingArea} m²${l.rooms ? `, ${l.rooms} kamers` : ''}.`;
  return { title, description, alternates: { canonical: `/woning/${l.slug}` }, openGraph: { title, description, images: l.photos[0] ? [l.photos[0].url] : undefined } };
}

export default async function Woning({ params }: Props) {
  const l = await getListing((await params).slug);
  if (!l) notFound();
  return <ListingDetail l={l} />;
}
