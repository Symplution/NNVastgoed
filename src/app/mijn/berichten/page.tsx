import type { Metadata } from 'next';
import Link from 'next/link';
import { AutoRefresh } from '@/components/auto-refresh';
import { requireSeeker } from '@/lib/seeker';
import { formatDate } from '@/lib/format';
import { myThreads } from '@/lib/seeker-data';

export const metadata: Metadata = { title: 'Berichten' };

export default async function Berichten() {
  await requireSeeker('/mijn/berichten');
  const threads = await myThreads();
  if (!threads.length) return <div className="rounded-2xl bg-sand p-10 text-center"><p className="font-semibold">Nog geen berichten</p><p className="mt-1 text-sm text-muted">Stuur een bericht aan een makelaar via de pagina van een woning.</p><Link href="/koop" className="btn-primary mt-4">Zoek een woning</Link></div>;
  return (
    <>
      <AutoRefresh />
      <ul className="space-y-3">
        {threads.map((t) => (
          <li key={t.id}>
            <Link href={`/mijn/berichten/${t.id}`} className="card flex items-start justify-between gap-4 p-5 hover:shadow-lg">
              <div className="min-w-0">
                <p className="font-bold">{t.address}, {t.city} <span className="font-normal text-muted">· {t.officeName}</span></p>
                <p className={`mt-1 truncate text-sm ${t.unread ? 'font-semibold text-ink' : 'text-muted'}`}>{t.lastFrom === 'zoeker' ? 'Jij: ' : ''}{t.last}</p>
              </div>
              <div className="shrink-0 text-right text-xs text-muted">{formatDate(t.lastAt)}{t.unread > 0 && <span className="mt-1 block rounded-full bg-accent px-2 py-0.5 text-center font-bold text-white">{t.unread} nieuw</span>}</div>
            </Link>
          </li>
        ))}
      </ul>
    </>
  );
}
