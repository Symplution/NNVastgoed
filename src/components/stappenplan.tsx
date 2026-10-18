import Link from 'next/link';
import { ArrowRight, Check, Rocket } from 'lucide-react';
import type { Step } from '@/lib/onboarding';

/** Stappenplan voor nieuwe gebruikers: voortgang, de volgende stap uitgelicht en alle stappen met een vinkje zodra ze klaar zijn. */
export function Stappenplan({ title, intro, steps }: { title: string; intro: string; steps: Step[] }) {
  const required = steps.filter((s) => !s.optional);
  const done = required.filter((s) => s.done).length;
  const complete = done === required.length;
  const next = steps.find((s) => !s.done && !s.optional) ?? steps.find((s) => !s.done);
  const pct = Math.round((done / required.length) * 100);
  const list = (
    <ol className="mt-5 divide-y divide-line rounded-xl border border-line bg-white">
      {steps.map((s, i) => {
        const active = next?.id === s.id && !complete;
        return (
          <li key={s.id} className={`flex gap-4 px-4 py-4 ${active ? 'bg-accent-soft/40' : ''}`}>
            <span aria-hidden className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${s.done ? 'bg-green-600 text-white' : active ? 'bg-accent text-white' : 'border border-line text-muted'}`}>{s.done ? <Check size={16} /> : i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{s.title} {s.optional && <span className="ml-1 rounded-full bg-sand px-2 py-0.5 text-xs font-medium text-muted">optioneel</span>} <span className="sr-only">{s.done ? '(klaar)' : '(nog te doen)'}</span></p>
              <p className="mt-0.5 text-sm text-muted">{s.text}</p>
            </div>
            <Link href={s.href} className={`${active ? 'btn-accent' : 'btn-ghost'} h-fit shrink-0 self-center !py-2 text-sm`}>{s.done ? 'Bekijk' : s.cta} {!s.done && <ArrowRight size={15} aria-hidden />}</Link>
          </li>
        );
      })}
    </ol>
  );
  return (
    <section aria-labelledby="stappenplan" className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent-dark"><Rocket size={22} aria-hidden /></span>
          <div><h2 id="stappenplan" className="text-xl font-extrabold tracking-tight">{complete ? 'Je bent helemaal ingesteld' : title}</h2><p className="mt-0.5 text-sm text-muted">{complete ? 'Alle stappen zijn gedaan. Goed bezig!' : intro}</p></div>
        </div>
        <p className="text-sm font-semibold text-brand" aria-label={`${done} van de ${required.length} stappen klaar`}>{done} van {required.length} klaar</p>
      </div>
      <div className="mt-4 h-2 overflow-hidden rounded-full bg-sand" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Voortgang"><div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} /></div>
      {complete ? <details className="mt-4"><summary className="focus-ring cursor-pointer text-sm font-semibold text-brand">Bekijk de stappen</summary>{list}</details> : list}
    </section>
  );
}
