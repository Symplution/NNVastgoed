'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ArrowRight, Check, Compass, PartyPopper, RotateCcw, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { EMPTY_STATE, TOURS, TOUR_IDS, currentStep, isComplete, markVisited, parseState, type TourId, type TourState } from '@/lib/rondleiding';

const KEY = 'nnv-rondleiding';
type Box = { top: number; left: number; width: number; height: number };

/** Het eerste zichtbare element dat bij de selector hoort (de mobiele en de grote navigatie staan allebei in de pagina). */
function findTarget(selector: string): HTMLElement | null {
  let list: HTMLElement[] = [];
  try { list = [...document.querySelectorAll<HTMLElement>(selector)]; } catch { return null; }
  return list.find((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== 'hidden'; }) ?? null;
}

/**
 * Een tabje linksonder met twee rondleidingen: voor een woningzoeker en voor een makelaar. Het onderdeel waar je nu moet zijn wordt belicht,
 * een afgeronde stap krijgt een vinkje in het rondje, en aan het eind volgt een melding die je kunt wegklikken.
 */
export function Rondleiding() {
  const path = usePathname();
  const [state, setState] = useState<TourState>(EMPTY_STATE);
  const [ready, setReady] = useState(false);
  const [box, setBox] = useState<Box | null>(null);
  const [onPage, setOnPage] = useState(false);
  const [congrats, setCongrats] = useState<TourId | null>(null);

  useEffect(() => { try { setState(parseState(localStorage.getItem(KEY))); } catch { /* opslag geblokkeerd */ } setReady(true); }, []);
  useEffect(() => { if (ready) try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* opslag geblokkeerd: de voortgang blijft dan bij deze pagina */ } }, [state, ready]);

  // Een pagina bezocht? Dan is de bijbehorende stap af.
  useEffect(() => { if (ready) setState((s) => markVisited(s, path)); }, [path, ready]);

  // Alles af? Dan een melding (één keer per rondleiding).
  useEffect(() => {
    if (!ready) return;
    const id = TOUR_IDS.find((t) => state.started[t] && isComplete(state, t) && !state.celebrated[t]);
    if (id) { setCongrats(id); setState((s) => ({ ...s, celebrated: { ...s.celebrated, [id]: true } })); }
  }, [state, ready]);

  const tour = TOURS[state.tab];
  const step = currentStep(state, state.tab);
  const spotlight = state.open && state.started[state.tab] && step;

  // Het belichte onderdeel volgen, ook bij scrollen en een andere schermgrootte.
  const target = spotlight ? step.target : null;
  useEffect(() => {
    if (!target) { setBox(null); setOnPage(false); return; }
    let scrolledFor = '';
    const measure = () => {
      const el = findTarget(target);
      setOnPage(Boolean(el));
      if (!el) { setBox(null); return; }
      const r = el.getBoundingClientRect();
      if (scrolledFor !== target && (r.top < 80 || r.bottom > window.innerHeight - 20)) { scrolledFor = target; el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
      else scrolledFor = target;
      setBox({ top: r.top, left: r.left, width: r.width, height: r.height });
    };
    measure();
    const t = setInterval(measure, 350);
    window.addEventListener('resize', measure); window.addEventListener('scroll', measure, { passive: true });
    return () => { clearInterval(t); window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure); };
  }, [target, path]);

  useEffect(() => {
    if (!state.open) return;
    const f = (e: KeyboardEvent) => { if (e.key === 'Escape') setState((s) => ({ ...s, open: false })); };
    window.addEventListener('keydown', f);
    return () => window.removeEventListener('keydown', f);
  }, [state.open]);

  const start = useCallback((tab: TourId) => setState((s) => markVisited({ ...s, tab, open: true, started: { ...s.started, [tab]: true } }, path)), [path]);
  const finishStep = (id: string) => setState((s) => ({ ...s, done: { ...s.done, [s.tab]: s.done[s.tab].includes(id) ? s.done[s.tab] : [...s.done[s.tab], id] } }));
  const reset = () => setState((s) => ({ ...s, started: { ...s.started, [s.tab]: true }, done: { ...s.done, [s.tab]: [] }, celebrated: { ...s.celebrated, [s.tab]: false } }));

  if (!ready || path.startsWith('/voorbeeld')) return null;
  const doneCount = tour.steps.filter((s) => state.done[state.tab].includes(s.id)).length;
  const pct = Math.round((doneCount / tour.steps.length) * 100);

  return (
    <>
      {box && (
        <div aria-hidden className="pointer-events-none fixed z-[45] rounded-xl ring-4 ring-accent motion-safe:animate-pulse" style={{ top: box.top - 6, left: box.left - 6, width: box.width + 12, height: box.height + 12, boxShadow: '0 0 0 9999px rgba(10, 53, 80, 0.5)' }} />
      )}

      {!state.open && (
        <button type="button" onClick={() => setState((s) => ({ ...s, open: true }))} className="focus-ring fixed bottom-4 left-4 z-[50] inline-flex items-center gap-2 rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-brand-dark">
          <Compass size={18} aria-hidden /> Rondleiding
          {state.started[state.tab] && !isComplete(state, state.tab) && <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs">{doneCount}/{tour.steps.length}</span>}
          {state.started[state.tab] && isComplete(state, state.tab) && <Check size={16} aria-label="afgerond" />}
        </button>
      )}

      {state.open && (
        <section role="dialog" aria-label="Rondleiding" className="fixed inset-x-3 bottom-3 z-[50] flex max-h-[55vh] flex-col sm:max-h-[80vh] overflow-hidden rounded-2xl border border-line bg-white shadow-2xl sm:inset-x-auto sm:bottom-4 sm:left-4 sm:w-[24rem]">
          <header className="flex items-center justify-between gap-3 bg-brand px-4 py-3 text-white">
            <h2 className="flex items-center gap-2 font-extrabold"><Compass size={18} aria-hidden /> Rondleiding</h2>
            <button type="button" onClick={() => setState((s) => ({ ...s, open: false }))} className="focus-ring rounded p-1 hover:bg-white/15" aria-label="Rondleiding sluiten"><X size={18} aria-hidden /></button>
          </header>

          <div role="tablist" aria-label="Kies een rondleiding" className="grid grid-cols-2 border-b border-line text-sm font-semibold">
            {TOUR_IDS.map((id) => (
              <button key={id} role="tab" type="button" aria-selected={state.tab === id} onClick={() => setState((s) => ({ ...s, tab: id }))} className={`focus-ring inline-flex items-center justify-center gap-1.5 px-3 py-2.5 ${state.tab === id ? 'border-b-2 border-accent text-brand' : 'text-muted hover:text-ink'}`}>
                {isComplete(state, id) && state.started[id] && <Check size={14} className="text-green-600" aria-hidden />}{TOURS[id].label}
              </button>
            ))}
          </div>

          <div className="overflow-y-auto p-4">
            {!state.started[state.tab] ? (
              <div>
                <p className="text-sm text-muted">{tour.intro}</p>
                <p className="mt-2 text-sm text-muted">{tour.steps.length} stappen. We lichten steeds het onderdeel uit waar je moet zijn.</p>
                <button type="button" onClick={() => start(state.tab)} className="btn-accent mt-4 w-full">Start de rondleiding <ArrowRight size={16} aria-hidden /></button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs font-semibold text-muted"><span>{doneCount} van {tour.steps.length} stappen</span><span>{pct}%</span></div>
                <div className="mt-1 h-2 overflow-hidden rounded-full bg-sand" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Voortgang"><div className="h-full rounded-full bg-green-600 transition-all" style={{ width: `${pct}%` }} /></div>

                {step ? (
                  <div className="mt-4 rounded-xl bg-accent-soft p-4">
                    <p className="text-xs font-bold uppercase tracking-wide text-accent-dark">Nu: stap {doneCount + 1}</p>
                    <p className="mt-0.5 font-bold">{step.title}</p>
                    <p className="mt-1 text-sm">{step.text}</p>
                    <p className="mt-3 text-sm font-semibold text-brand-dark">{onPage ? 'Klik op het gemarkeerde onderdeel.' : 'Dit onderdeel staat op een andere pagina.'}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {!onPage && <Link href={step.href} className="btn-accent !py-2 text-sm">Ga erheen <ArrowRight size={15} aria-hidden /></Link>}
                      <button type="button" onClick={() => finishStep(step.id)} className="btn-ghost !py-2 text-sm">Klaar, volgende</button>
                    </div>
                  </div>
                ) : (
                  <p className="mt-4 flex items-center gap-2 rounded-xl bg-green-50 p-4 text-sm font-semibold text-green-800"><PartyPopper size={18} aria-hidden /> Alle stappen zijn afgerond.</p>
                )}

                <ol className="mt-4 space-y-1">
                  {tour.steps.map((s) => {
                    const done = state.done[state.tab].includes(s.id);
                    const now = step?.id === s.id;
                    return (
                      <li key={s.id}>
                        <Link href={s.href} className={`focus-ring flex items-center gap-3 rounded-lg px-2 py-1.5 text-sm hover:bg-sand ${now ? 'bg-accent-soft/60 font-semibold' : ''}`}>
                          <span aria-hidden className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${done ? 'border-green-600 bg-green-600 text-white' : now ? 'border-accent' : 'border-line'}`}>{done && <Check size={14} strokeWidth={3} />}</span>
                          <span className={done ? 'text-muted' : ''}>{s.title}</span>
                          <span className="sr-only">{done ? '(klaar)' : now ? '(nu aan de beurt)' : '(nog te doen)'}</span>
                        </Link>
                      </li>
                    );
                  })}
                </ol>
                <button type="button" onClick={reset} className="focus-ring mt-4 inline-flex items-center gap-1.5 rounded text-xs font-semibold text-muted hover:text-ink"><RotateCcw size={13} aria-hidden /> Opnieuw beginnen</button>
              </>
            )}
          </div>
        </section>
      )}

      {congrats && (
        <div role="status" aria-live="polite" className="fixed inset-x-3 bottom-4 z-[60] mx-auto flex max-w-md items-start gap-3 rounded-2xl border border-green-200 bg-white p-4 shadow-2xl sm:inset-x-auto sm:bottom-6 sm:left-1/2 sm:-translate-x-1/2">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-white"><Check size={22} strokeWidth={3} aria-hidden /></span>
          <div className="min-w-0 flex-1">
            <p className="text-lg font-extrabold">Succesvol afgerond!</p>
            <p className="mt-0.5 text-sm text-muted">Je hebt de rondleiding {congrats === 'klant' ? 'voor woningzoekers' : 'voor makelaars'} doorlopen.{TOUR_IDS.some((t) => t !== congrats && !isComplete(state, t)) && ' Er is ook nog een rondleiding voor de ander.'}</p>
          </div>
          <button type="button" onClick={() => setCongrats(null)} className="focus-ring rounded p-1 text-muted hover:text-ink" aria-label="Melding sluiten"><X size={18} aria-hidden /></button>
        </div>
      )}
    </>
  );
}
