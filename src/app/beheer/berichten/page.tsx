import type { Metadata } from 'next';
import Link from 'next/link';
import { AutoRefresh } from '@/components/auto-refresh';
import { requireStaff } from '@/lib/auth';
import { formatDate } from '@/lib/format';
import { staffThreads } from '@/lib/staff-data';

export const metadata: Metadata = { title: 'Berichten' };

export default async function Berichten() {
  await requireStaff();
  const threads = await staffThreads();
  return (
    <div>
      <AutoRefresh />
      <h1 className="text-2xl font-extrabold tracking-tight">Berichten</h1>
      <p className="mt-1 text-sm text-muted">Gesprekken met woningzoekers die via een woning contact opnamen. Een antwoord komt bij hen in Mijn NNV en in hun mail.</p>
      {threads.length ? (
        <ul className="mt-6 space-y-3">
          {threads.map((t) => (
            <li key={t.id}>
              <Link href={`/beheer/berichten/${t.id}`} className="card flex items-start justify-between gap-4 p-4 hover:shadow-lg">
                <div className="min-w-0">
                  <p className="font-bold">{t.name} <span className="font-normal text-muted">· {t.address}, {t.city}</span></p>
                  <p className={`mt-1 truncate text-sm ${t.unread ? 'font-semibold' : 'text-muted'}`}>{t.lastFrom === 'makelaar' ? 'Jij: ' : ''}{t.last}</p>
                </div>
                <div className="shrink-0 text-right text-xs text-muted">{formatDate(t.lastAt)}{t.unread > 0 && <span className="mt-1 block rounded-full bg-accent px-2 py-0.5 text-center font-bold text-white">{t.unread} nieuw</span>}</div>
              </Link>
            </li>
          ))}
        </ul>
      ) : <p className="mt-6 rounded-xl bg-sand p-10 text-center text-muted">Nog geen berichten.</p>}
    </div>
  );
}
