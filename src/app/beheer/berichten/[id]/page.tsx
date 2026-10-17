import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Mail, Phone } from 'lucide-react';
import { AutoRefresh } from '@/components/auto-refresh';
import { MarkRead } from '@/components/mark-read';
import { ThreadView } from '@/components/thread-view';
import { canWrite, requireStaff } from '@/lib/auth';
import { staffThread } from '@/lib/staff-data';
import { markOfficeRead, officeReply } from '../../actions';

export const metadata: Metadata = { title: 'Gesprek' };

export default async function Gesprek({ params }: { params: Promise<{ id: string }> }) {
  const staff = await requireStaff();
  const t = await staffThread((await params).id);
  if (!t) notFound();
  return (
    <div className="max-w-3xl">
      <AutoRefresh />
      {canWrite(staff) && <MarkRead action={markOfficeRead} id={t.id} unread={t.unread} />}
      <p className="text-sm"><Link href="/beheer/berichten" className="text-muted hover:underline">← Alle berichten</Link></p>
      <h1 className="mt-2 text-xl font-bold">{t.name}</h1>
      <p className="text-sm text-muted">Over <Link href={`/woning/${t.slug}`} className="underline" target="_blank">{t.address}, {t.city}</Link></p>
      <p className="mb-5 mt-1 flex flex-wrap gap-4 text-sm">{t.email && <a href={`mailto:${t.email}`} className="inline-flex items-center gap-1.5 text-brand hover:underline"><Mail size={14} aria-hidden /> {t.email}</a>}{t.phone && <a href={`tel:${t.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 text-brand hover:underline"><Phone size={14} aria-hidden /> {t.phone}</a>}</p>
      {canWrite(staff)
        ? <ThreadView messages={t.messages} me="makelaar" conversationId={t.id} otherName={t.name} action={officeReply} />
        : <p className="rounded-xl bg-sand p-4 text-sm text-muted">Je hebt alleen leesrechten.</p>}
    </div>
  );
}
