import { Sparkles } from 'lucide-react';
import type { Listing } from '@/lib/types';
import { TOPPER_FEE, euro } from '@/lib/pricing';
import { formatDate } from '@/lib/format';
import { requestTopper, setTopper } from '@/app/beheer/actions';

/** Topper van de maand per woning: een makelaar vraagt aan, een beheerder zet hem een maand live. */
export function TopperPanel({ listing, canWrite, manager }: { listing: Listing; canWrite: boolean; manager: boolean }) {
  const today = new Date().toISOString().slice(0, 10);
  const active = Boolean(listing.topperUntil && listing.topperUntil >= today);
  const requested = !active && Boolean(listing.topperRequestedAt);
  const online = ['beschikbaar', 'onder_bod', 'onder_voorbehoud'].includes(listing.status);
  return (
    <section aria-labelledby="topper" className="card mb-8 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 id="topper" className="flex items-center gap-2 text-xl font-extrabold tracking-tight"><Sparkles size={20} className="text-accent" aria-hidden /> {TOPPER_FEE.name}</h2>
          {active ? (
            <p className="mt-1 text-sm">Deze woning staat uitgelicht op de homepage tot en met <strong>{formatDate(listing.topperUntil!)}</strong>.</p>
          ) : requested ? (
            <p className="mt-1 text-sm">Aangevraagd op {formatDate(listing.topperRequestedAt!)}. Een beheerder zet de woning daarna een maand live.</p>
          ) : (
            <p className="mt-1 text-sm text-muted">Laat deze woning een maand uitgelicht op de homepage staan, met een label op de kaart. Meerprijs {euro(TOPPER_FEE.amount)} per woning (excl. btw), geen abonnement.</p>
          )}
          {!online && !active && <p className="mt-2 text-sm text-muted">Dit kan zodra de woning online staat.</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          {canWrite && online && !active && !requested && !manager && (
            <form action={requestTopper}><input type="hidden" name="id" value={listing.id} /><button className="btn-accent">Aanvragen voor {euro(TOPPER_FEE.amount)}</button></form>
          )}
          {manager && online && !active && (
            <form action={setTopper}><input type="hidden" name="id" value={listing.id} /><input type="hidden" name="aan" value="1" /><button className="btn-accent">Activeer voor {TOPPER_FEE.days} dagen</button></form>
          )}
          {manager && active && (
            <form action={setTopper}><input type="hidden" name="id" value={listing.id} /><input type="hidden" name="aan" value="0" /><button className="btn-ghost">Stoppen</button></form>
          )}
        </div>
      </div>
    </section>
  );
}
