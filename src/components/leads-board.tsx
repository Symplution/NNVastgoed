'use client';

import { Mail, NotebookPen, Phone } from 'lucide-react';
import { useState, useTransition } from 'react';
import { moveLead, saveLeadNote } from '@/app/beheer/actions';
import type { LeadRow } from '@/lib/staff-data';
import { Select } from './select';

export const STAGES = [
  { id: 'nieuw', label: 'Nieuw', hint: 'Nog niet opgepakt', tone: 'bg-accent-soft/70', dot: 'bg-accent' },
  { id: 'opgepakt', label: 'Opgepakt', hint: 'Je bent ermee bezig', tone: 'bg-brand-soft/80', dot: 'bg-brand' },
  { id: 'afgehandeld', label: 'Afgehandeld', hint: 'Klaar', tone: 'bg-green-50', dot: 'bg-green-600' },
] as const;
type Stage = (typeof STAGES)[number]['id'];
const isStage = (v: string): v is Stage => STAGES.some((s) => s.id === v);

/** Een notitie bij een lead die Opgepakt is. Bij Nieuw en Afgehandeld is een bestaande notitie alleen te lezen. */
type Noter = (id: string, note: string) => Promise<{ ok: boolean; error?: string }>;
function Note({ lead, editable, dateOf, onSaved, noter }: { lead: LeadRow; editable: boolean; dateOf: (iso: string) => string; onSaved: (note: string | null, at: string | null) => void; noter: Noter }) {
  const [text, setText] = useState(lead.note ?? '');
  const [state, setState] = useState<'' | 'bezig' | 'opgeslagen' | string>('');
  const [, start] = useTransition();
  const changed = text.trim() !== (lead.note ?? '');
  if (!editable) return lead.note ? (
    <div className="mt-3 rounded-xl bg-sand p-3 text-sm">
      <p className="mb-1 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-muted"><NotebookPen size={13} aria-hidden /> Notitie{lead.noteAt && <span className="font-normal normal-case tracking-normal"> · {dateOf(lead.noteAt)}</span>}</p>
      <p className="whitespace-pre-line">{lead.note}</p>
    </div>
  ) : null;
  const save = () => {
    setState('bezig');
    start(async () => {
      const r = await noter(lead.id, text).catch(() => ({ ok: false, error: 'Opslaan is niet gelukt.' }));
      if (r.ok) { setState('opgeslagen'); onSaved(text.trim() || null, text.trim() ? new Date().toISOString() : null); } else setState(r.error ?? 'Opslaan is niet gelukt.');
    });
  };
  return (
    <div className="mt-3">
      <label htmlFor={`n-${lead.id}`} className="label flex items-center gap-1.5"><NotebookPen size={13} aria-hidden /> Notitie</label>
      <textarea id={`n-${lead.id}`} value={text} onChange={(e) => { setText(e.target.value); setState(''); }} rows={3} maxLength={2000} placeholder="Wat is er besproken of afgesproken?" className="field text-sm" />
      <div className="mt-2 flex flex-wrap items-center gap-3">
        <button type="button" onClick={save} disabled={!changed || state === 'bezig'} className="btn-primary !py-1.5 text-sm">{state === 'bezig' ? 'Opslaan…' : 'Notitie opslaan'}</button>
        {state === 'opgeslagen' && !changed && <span role="status" className="text-sm font-semibold text-green-700">Opgeslagen, ook te zien bij Contacten.</span>}
        {state && state !== 'bezig' && state !== 'opgeslagen' && <span role="alert" className="text-sm text-red-700">{state}</span>}
        {lead.noteAt && !changed && state !== 'opgeslagen' && <span className="text-xs text-muted">Laatst gewijzigd {dateOf(lead.noteAt)}</span>}
      </div>
    </div>
  );
}

/** Leads in drie kolommen naast elkaar. Het stadium kies je in het menu op de kaart; bij Opgepakt kun je een notitie maken. */
export function LeadsBoard({ leads, canEdit, showOffice, dateOf, mover = moveLead, noter = saveLeadNote }: { leads: LeadRow[]; canEdit: boolean; showOffice: boolean; dateOf: Record<string, string>; /** Opslaan van een verplaatsing; alleen te vervangen in een test. */ mover?: (id: string, status: string) => Promise<{ ok: boolean }>; noter?: Noter }) {
  const [items, setItems] = useState(leads);
  const [error, setError] = useState('');
  const [, start] = useTransition();
  const fmt = (iso: string) => new Date(iso).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' });

  const move = (id: string, status: string) => {
    if (!canEdit || !isStage(status)) return;
    const before = items.find((l) => l.id === id);
    if (!before || before.status === status) return;
    setError('');
    setItems((all) => all.map((l) => (l.id === id ? { ...l, status } : l)));     // meteen zichtbaar
    start(async () => {
      const r = await mover(id, status).catch(() => ({ ok: false }));
      if (!r.ok) { setItems((all) => all.map((l) => (l.id === id ? { ...l, status: before.status } : l))); setError('Verplaatsen is niet gelukt. Probeer het opnieuw.'); }
    });
  };

  return (
    <div>
      {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 p-3 text-sm text-red-800">{error}</p>}
      <div className="grid gap-4 md:grid-cols-3">
        {STAGES.map((s) => {
          const list = items.filter((l) => l.status === s.id);
          return (
            <section key={s.id} aria-labelledby={`col-${s.id}`} className={`rounded-3xl p-3 ${s.tone}`}>
              <header className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div><h2 id={`col-${s.id}`} className="flex items-center gap-2 font-sans text-base font-extrabold"><span aria-hidden className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />{s.label}</h2><p className="text-xs text-muted">{s.hint}</p></div>
                <span className="rounded-full bg-sand px-2.5 py-1 text-sm font-bold tabular-nums" aria-label={`${list.length} leads`}>{list.length}</span>
              </header>
              <ul className="mt-3 min-h-[8rem] space-y-3">
                {list.map((l) => (
                  <li key={l.id} className="rounded-2xl border border-line bg-white p-4 shadow-card">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-bold leading-snug">{l.name}</p>
                      <span className="pill shrink-0 bg-brand-soft text-brand">{l.kind === 'bezichtiging' ? 'Bezichtiging' : 'Vraag'}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-muted">{l.listing} · {dateOf[l.id]}{showOffice && l.office && ` · ${l.office}`}</p>
                    <p className="mt-2 line-clamp-4 whitespace-pre-line text-sm">{l.message}</p>
                    <p className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      <a href={`mailto:${l.email}`} className="inline-flex items-center gap-1.5 break-all text-brand hover:underline"><Mail size={14} aria-hidden /> {l.email}</a>
                      {l.phone && <a href={`tel:${l.phone.replace(/\s/g, '')}`} className="inline-flex items-center gap-1.5 text-brand hover:underline"><Phone size={14} aria-hidden /> {l.phone}</a>}
                    </p>
                    <Note key={`${l.id}-${l.status}`} noter={noter} lead={l} editable={canEdit && l.status === 'opgepakt'} dateOf={fmt}
                      onSaved={(note, at) => setItems((all) => all.map((x) => (x.id === l.id ? { ...x, note, noteAt: at } : x)))} />
                    {canEdit && (
                      <div className="mt-3 border-t border-line pt-3">
                        <label htmlFor={`m-${l.id}`} className="label">Stadium</label>
                        <Select id={`m-${l.id}`} compact value={l.status} onChange={(v) => move(l.id, v)} options={STAGES.map((x) => ({ value: x.id, label: x.label }))} />
                      </div>
                    )}
                  </li>
                ))}
                {list.length === 0 && <li className="rounded-2xl border-2 border-dashed border-line/80 p-6 text-center text-sm text-muted">Geen leads</li>}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
