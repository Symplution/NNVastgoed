import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Info } from 'lucide-react';
import { PreviewFrame } from '@/components/preview-frame';
import { requireStaff } from '@/lib/auth';
import { myListing } from '@/lib/staff-data';
import { address, STATUS_LABEL } from '@/lib/format';
import { PUBLIC_STATUSES } from '@/lib/types';

export const metadata: Metadata = { title: 'Voorbeeld van je woning' };

export default async function VoorbeeldPagina({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const l = await myListing((await params).id);
  if (!l) notFound();
  const online = PUBLIC_STATUSES.includes(l.status);
  return (
    <div>
      <Link href={`/beheer/woningen/${l.id}`} className="focus-ring inline-flex items-center gap-1.5 rounded text-sm font-semibold text-brand hover:underline"><ArrowLeft size={15} aria-hidden /> Terug naar de woning</Link>
      <h1 className="mt-3 text-2xl font-extrabold tracking-tight">Voorbeeld: {address(l)}, {l.city}</h1>
      <p className="mt-2 flex items-start gap-2 rounded-xl bg-brand-soft p-4 text-sm text-brand-dark">
        <Info size={18} className="mt-0.5 shrink-0" aria-hidden />
        <span>Zo ziet een bezoeker deze woning. {online ? 'De woning staat online.' : `De woning staat nog niet online (status: ${STATUS_LABEL[l.status].toLowerCase()}).`} Contactformulier en bezichtiging zijn hier uitgeschakeld, en je bezoek telt niet mee in de statistieken.</span>
      </p>
      <div className="mt-5"><PreviewFrame src={`/voorbeeld/${l.id}`} title={`Voorbeeld van ${address(l)}`} /></div>
    </div>
  );
}
