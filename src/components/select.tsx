'use client';

import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

export interface Option { value: string; label: string; hint?: string }
interface Props {
  options: Option[];
  /** Voor een formulier: de naam waaronder de keuze meegaat. */
  name?: string;
  id?: string;
  defaultValue?: string;
  /** Voor gebruik met eigen toestand. */
  value?: string;
  onChange?: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  /** Kleiner, voor in een tabel of naast een knop. */
  compact?: boolean;
  /** `sand`: zonder rand op een lichte achtergrond, zoals in de zoekbalk. */
  tone?: 'white' | 'sand';
  className?: string;
  'aria-label'?: string;
}

/**
 * Een keuzemenu in de stijl van de site (de gewone browserlijst is niet te stijlen). Werkt in een formulier (`name`)
 * en met eigen toestand (`value` + `onChange`), en met toetsenbord: pijltjes, Home, End, Enter, Escape en typen.
 */
export function Select({ options, name, id, defaultValue, value, onChange, required, disabled, placeholder = 'Kies…', compact, tone = 'white', className = '', ...rest }: Props) {
  const auto = useId();
  const uid = id ?? auto;
  const [inner, setInner] = useState(defaultValue ?? '');
  const current = value ?? inner;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const typed = useRef({ text: '', at: 0 });
  const selected = useMemo(() => options.find((o) => o.value === current), [options, current]);

  useEffect(() => {
    if (!open) return;
    const away = (e: MouseEvent | TouchEvent) => { if (root.current && !root.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', away);
    document.addEventListener('touchstart', away);
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('touchstart', away); };
  }, [open]);

  useEffect(() => { list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: 'nearest' }); }, [active, open]);

  function pick(v: string) {
    if (value === undefined) setInner(v);
    onChange?.(v);
    setOpen(false);
    root.current?.querySelector<HTMLButtonElement>('button')?.focus();
  }
  function openList() {
    if (disabled) return;
    setActive(Math.max(0, options.findIndex((o) => o.value === current)));
    setOpen(true);
  }
  function onKey(e: React.KeyboardEvent) {
    const last = options.length - 1;
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) { e.preventDefault(); openList(); }
      return;
    }
    if (e.key === 'Escape') { e.preventDefault(); setOpen(false); }
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(last, i + 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(0, i - 1)); }
    else if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    else if (e.key === 'End') { e.preventDefault(); setActive(last); }
    else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); if (options[active]) pick(options[active].value); }
    else if (e.key === 'Tab') setOpen(false);
    else if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
      // Typen springt naar de eerste keuze die zo begint.
      const now = Date.now();
      typed.current = { text: (now - typed.current.at > 700 ? '' : typed.current.text) + e.key.toLowerCase(), at: now };
      const hit = options.findIndex((o) => o.label.toLowerCase().startsWith(typed.current.text));
      if (hit >= 0) setActive(hit);
    }
  }

  const size = compact ? 'min-h-[2.25rem] px-3 py-1.5 text-xs' : 'min-h-[2.75rem] px-3.5 py-2.5 text-sm';
  return (
    <div ref={root} className={`relative ${className}`}>
      {/* Eén verborgen veld doet het werk voor het formulier en voor `required`. */}
      {name && <input name={name} value={current} required={required} onChange={() => undefined} tabIndex={-1} aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-px opacity-0" />}
      <button
        type="button" id={uid} disabled={disabled} aria-haspopup="listbox" aria-expanded={open} aria-controls={`${uid}-list`} aria-label={rest['aria-label']}
        onClick={() => (open ? setOpen(false) : openList())} onKeyDown={onKey}
        className={`focus-ring flex w-full items-center justify-between gap-3 rounded-xl border text-left font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${tone === 'sand' ? 'bg-sand hover:bg-brand-soft' : 'bg-white hover:border-brand/50'} ${open ? 'border-brand shadow-[0_0_0_3px_rgba(14,74,110,0.12)]' : tone === 'sand' ? 'border-transparent' : 'border-line'} ${size}`}>
        <span className={`truncate ${selected && selected.value !== '' ? 'text-ink' : 'text-muted'}`}>{selected ? selected.label : placeholder}</span>
        <ChevronDown size={compact ? 14 : 16} aria-hidden className={`shrink-0 text-muted transition-transform duration-200 ${open ? 'rotate-180 text-brand' : ''}`} />
      </button>
      {open && (
        <ul ref={list} id={`${uid}-list`} role="listbox" aria-labelledby={uid} tabIndex={-1} onKeyDown={onKey}
          className="absolute left-0 right-0 z-50 mt-1.5 max-h-64 min-w-[10rem] overflow-auto rounded-xl border border-line bg-white p-1.5 shadow-[0_12px_32px_-8px_rgba(20,33,43,0.25)]">
          {options.map((o, i) => {
            const on = o.value === current;
            return (
              <li key={o.value} data-i={i} role="option" aria-selected={on} onMouseEnter={() => setActive(i)} onClick={() => pick(o.value)}
                className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm ${i === active ? 'bg-brand-soft text-brand-dark' : 'text-ink'} ${on ? 'font-semibold' : ''}`}>
                <span className="truncate">{o.label}{o.hint && <span className="ml-2 text-xs font-normal text-muted">{o.hint}</span>}</span>
                {on && <Check size={15} aria-hidden className="shrink-0 text-brand" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
