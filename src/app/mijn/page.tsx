import Link from 'next/link';
import { CalendarCheck, Heart, MessageSquare } from 'lucide-react';
import { getStaff } from '@/lib/auth';
import { Stappenplan } from '@/components/stappenplan';
import { seekerSteps, staffSteps } from '@/lib/onboarding';
import { requireSeeker } from '@/lib/seeker';
import { formatDateTime } from '@/lib/format';
import { myFavorites, myThreads, myViewings } from '@/lib/seeker-data';

export default async function Overzicht() {
  await requireSeeker();
  const staff = await getStaff();   // een makelaar ziet hier ook zijn stappenplan
  const [favs, viewings, threads, seeker, broker] = await Promise.all([myFavorites(), myViewings(), myThreads(), seekerSteps(), typeof staff === 'object' && staff ? staffSteps(staff) : Promise.resolve(null)]);
  const upcoming = viewings.filter((v) => v.status === 'bevestigd' && new Date(v.startsAt).getTime() > Date.now());
  const unread = threads.reduce((n, t) => n + t.unread, 0);
  const card = 'card block p-5 transition hover:-translate-y-0.5 hover:shadow-lg';
  return (
    <div className="space-y-8">
      {broker && <Stappenplan title="Aan de slag als makelaar" intro="Zet je kantoor online in een paar stappen. Elke stap vinkt zichzelf af." steps={broker} />}
      <Stappenplan title="Aan de slag met Mijn NNV" intro="Zo haal je het meeste uit je account." steps={seeker} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Link href="/mijn/favorieten" className={card}><Heart size={20} className="text-accent" aria-hidden /><p className="mt-2 text-3xl font-extrabold">{favs.length}</p><p className="text-sm text-muted">favorieten</p></Link>
        <Link href="/mijn/bezichtigingen" className={card}><CalendarCheck size={20} className="text-brand" aria-hidden /><p className="mt-2 text-3xl font-extrabold">{upcoming.length}</p><p className="text-sm text-muted">geplande bezichtigingen</p></Link>
        <Link href="/mijn/berichten" className={card}><MessageSquare size={20} className="text-brand" aria-hidden /><p className="mt-2 text-3xl font-extrabold">{unread}</p><p className="text-sm text-muted">ongelezen {unread === 1 ? 'bericht' : 'berichten'}</p></Link>
      </div>
      <section aria-labelledby="volgende">
        <h2 id="volgende" className="text-lg font-bold">Eerstvolgende bezichtiging</h2>
        {upcoming[0] ? (
          <Link href={`/bezichtiging/${upcoming[0].token}`} className="card mt-3 block p-5 hover:shadow-lg">
            <p className="text-lg font-bold text-brand">{formatDateTime(upcoming[0].startsAt)}</p>
            <p className="text-sm text-muted">{upcoming[0].listing?.address}, {upcoming[0].listing?.city}</p>
          </Link>
        ) : <p className="mt-3 rounded-xl bg-sand p-6 text-sm text-muted">Je hebt nog niets gepland. Open een woning en kies het tabblad <strong>Bezichtiging plannen</strong>.</p>}
      </section>
      <p><Link href="/koop" className="btn-primary">Zoek een woning</Link></p>
    </div>
  );
}
