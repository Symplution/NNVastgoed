'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

/** Kopieert een tekst naar het klembord en zegt dat het gelukt is. */
export function CopyButton({ text, label = 'Kopieer', className = 'btn-ghost !py-1.5 text-sm' }: { text: string; label?: string; className?: string }) {
  const [done, setDone] = useState(false);
  const copy = async () => {
    try { await navigator.clipboard.writeText(text); }
    catch { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } finally { t.remove(); } }
    setDone(true); setTimeout(() => setDone(false), 2000);
  };
  return <button type="button" onClick={copy} className={className}>{done ? <><Check size={15} aria-hidden /> Gekopieerd</> : <><Copy size={15} aria-hidden /> {label}</>}</button>;
}
