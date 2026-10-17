import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { AutoRefresh } from '@/components/auto-refresh';
import { MarkRead } from '@/components/mark-read';
import { ThreadView } from '@/components/thread-view';
import { requireSeeker } from '@/lib/seeker';
import { myThread } from '@/lib/seeker-data';
import { markSeekerRead, seekerReply } from '../../actions';

export const metadata: Metadata = { title: 'Gesprek' };

export default async function Gesprek({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  await requireSeeker(`/mijn/berichten/${id}`);
  const t = await myThread(id);
  if (!t) notFound();
  return (
    <div className="max-w-3xl">
      <AutoRefresh />
      <MarkRead action={markSeekerRead} id={t.id} unread={t.unread} />
      <p className="text-sm"><Link href="/mijn/berichten" className="text-muted hover:underline">← Alle berichten</Link></p>
      <h2 className="mt-2 text-xl font-bold">{t.address}, {t.city}</h2>
      <p className="mb-5 text-sm text-muted">Gesprek met {t.officeName} · <Link href={`/woning/${t.slug}`} className="underline">bekijk de woning</Link></p>
      <ThreadView messages={t.messages} me="zoeker" conversationId={t.id} otherName={t.officeName} action={seekerReply} />
    </div>
  );
}
