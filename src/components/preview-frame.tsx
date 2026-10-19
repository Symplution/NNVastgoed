'use client';

import { Monitor, Smartphone, Tablet } from 'lucide-react';
import { useState } from 'react';

const SIZES = [
  { id: 'computer', label: 'Computer', width: '100%', Icon: Monitor },
  { id: 'tablet', label: 'Tablet', width: '820px', Icon: Tablet },
  { id: 'telefoon', label: 'Telefoon', width: '390px', Icon: Smartphone },
] as const;

/** De woningpagina in een kader, zodat je ook de telefoonweergave kunt controleren. */
export function PreviewFrame({ src, title }: { src: string; title: string }) {
  const [size, setSize] = useState<(typeof SIZES)[number]['id']>('computer');
  const width = SIZES.find((s) => s.id === size)!.width;
  return (
    <div>
      <div role="group" aria-label="Schermgrootte" className="inline-flex rounded-xl border border-line bg-white p-1">
        {SIZES.map(({ id, label, Icon }) => (
          <button key={id} type="button" onClick={() => setSize(id)} aria-pressed={size === id} className={`focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${size === id ? 'bg-brand text-white' : 'text-muted hover:bg-brand-soft hover:text-brand'}`}><Icon size={16} aria-hidden /> {label}</button>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-sand p-3 sm:p-5">
        <iframe key={src} title={title} src={src} style={{ width, maxWidth: '100%' }} className="mx-auto block h-[75vh] min-h-[32rem] rounded-xl border border-line bg-white shadow-sm" />
      </div>
    </div>
  );
}
