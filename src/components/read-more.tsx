'use client';

import { useState } from 'react';

/** Een lange tekst, ingekort tot een paar regels met "Lees meer". */
export function ReadMore({ children, lines = 8 }: { children: string; lines?: number }) {
  const [open, setOpen] = useState(false);
  const long = children.length > 700 || children.split('\n').length > lines;
  return (
    <div>
      <div className="whitespace-pre-line text-[17px] leading-relaxed text-ink/90" style={!open && long ? { display: '-webkit-box', WebkitLineClamp: lines, WebkitBoxOrient: 'vertical', overflow: 'hidden' } : undefined}>{children}</div>
      {long && <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="focus-ring mt-2 rounded text-[17px] font-semibold text-brand hover:underline">{open ? 'Lees minder' : 'Lees meer'}</button>}
    </div>
  );
}
