'use client';

import { Mail, Phone } from 'lucide-react';
import { useState, useTransition } from 'react';
import { moveLead } from '@/app/beheer/actions';
import type { LeadRow } from '@/lib/staff-data';
import { Select } from './select';

export const STAGES = [
  { id: 'nieuw', label: 'Nieuw', hint: 'Nog niet opgepakt', tone: 'bg-accent-soft/70', dot: 'bg-accent' },
  { id: 'opgepakt', label: 'Opgepakt', hint: 'Je bent ermee bezig', tone: 'bg-brand-soft/80', dot: 'bg-brand' },
  { id: 'afgehandeld', label: 'Afgehandeld', hint: 'Klaar', tone: 'bg-green-50', dot: 'bg-green-600' },
] as const;
type Stage = (typeof STAGES)[number]['id'];
const isStage = (v: string): v is Stage => STAGES.some((s) => s.id === v);

/** Leads in drie kolommen naast elkaar: pak een lead vast en laat hem in een andere kolom vallen, of kies het stadium in het menu. */
export function LeadsBoard({ leads, canEdit, showOffice, dateOf, mover = moveLead }: { leads: LeadRow[]; canEdit: boolean; showOffice: boolean; dateOf: Record<string, string>; /** Opslaan van een verplaatsing; alleen te vervangen in een test. */ mover?: (id: string, status: string) => Promise<{ ok: boolean }> }) {
  const [items, setItems] = useState(leads);
  const [dragging, setDragging] = useState<string | null>(null);
  const [over, setOver] = useState<Stage | null>(null);
  const [error, setError] = useState('');
  const [, start] = useTransition();

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
            <section key={s.id} aria-labelledby={`col-${s.id}`}
              onDragOver={(e) => { if (canEdit && dragging) { e.preventDefault(); setOver(s.id); } }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setOver((o) => (o === s.id ? null : o)); }}
              onDrop={(e) => { e.preventDefault(); const id = e.dataTransfer.getData('text/plain') || dragging; setOver(null); setDragging(null); if (id) move(id, s.id); }}
              className={`rounded-3xl p-3 transition ${s.tone} ${over === s.id ? 'ring-2 ring-brand ring-offset-2' : ''}`}>
              <header className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm">
                <div><h2 id={`col-${s.id}`} className="flex items-center gap-2 font-sans text-base font-extrabold"><span aria-hidden className={`h-2.5 w-2.5 rounded-full ${s.dot}`} />{s.label}</h2><p className="text-xs text-muted">{s.hint}</p></div>
                <span className="rounded-full bg-sand px-2.5 py-1 text-sm font-bold tabular-nums" aria-label={`${list.length} leads`}>{list.length}</span>
              </header>
              <ul className="mt-3 max-h-[70vh] min-h-[8rem] space-y-3 overflow-y-auto pr-0.5">
                {list.map((l) => (
                  <li key={l.id} draggable={canEdit}
                    onDragStart={(e) => { e.dataTransfer.setData('text/plain', l.id); e.dataTransfer.effectAllowed = 'move'; setDragging(l.id); }}
                    onDragEnd={() => { setDragging(null); setOver(null); }}
                    className={`rounded-2xl border border-line bg-white p-4 shadow-card ${canEdit ? 'cursor-grab active:cursor-grabbing' : ''} ${dragging === l.id ? 'opacity-40' : ''}`}>
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
                    {canEdit && (
                      <div className="mt-3 border-t border-line pt-3">
                        <label htmlFor={`m-${l.id}`} className="label">Verplaats naar</label>
                        <Select id={`m-${l.id}`} compact value={l.status} onChange={(v) => move(l.id, v)} options={STAGES.map((x) => ({ value: x.id, label: x.label }))} />
                      </div>
                    )}
                  </li>
                ))}
                {list.length === 0 && <li className="rounded-2xl border-2 border-dashed border-line/80 p-6 text-center text-sm text-muted">{canEdit ? 'Sleep een lead hierheen' : 'Geen leads'}</li>}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
