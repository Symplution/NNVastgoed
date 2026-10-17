'use client';

import { useEffect, useState, type ReactNode } from 'react';

export interface TabDef { id: string; label: string; content: ReactNode }

/** Tabbladen op de woningpagina. Een adres met #bezichtigen opent meteen dat tabblad; alle inhoud blijft staan zodat niets verloren gaat bij wisselen. */
export function ListingTabs({ tabs, initial }: { tabs: TabDef[]; initial: string }) {
  const [active, setActive] = useState(initial);
  useEffect(() => {
    const fromHash = () => { const h = window.location.hash.slice(1); if (tabs.some((t) => t.id === h)) setActive(h); };
    fromHash();
    window.addEventListener('hashchange', fromHash);
    return () => window.removeEventListener('hashchange', fromHash);
  }, [tabs]);
  function pick(id: string) { setActive(id); history.replaceState(null, '', `#${id}`); }
  return (
    <div>
      <div role="tablist" aria-label="Onderdelen van deze woning" className="flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((t) => (
          <button key={t.id} id={`tab-${t.id}`} type="button" role="tab" aria-selected={active === t.id} aria-controls={`panel-${t.id}`} onClick={() => pick(t.id)}
            className={`focus-ring -mb-px whitespace-nowrap border-b-2 px-4 py-3 text-sm font-semibold transition ${active === t.id ? 'border-accent text-brand' : 'border-transparent text-muted hover:text-ink'}`}>{t.label}</button>
        ))}
      </div>
      {tabs.map((t) => (
        <div key={t.id} id={`panel-${t.id}`} role="tabpanel" aria-labelledby={`tab-${t.id}`} hidden={active !== t.id} className="pt-6">{t.content}</div>
      ))}
    </div>
  );
}

/** Knop die het tabblad Bezichtiging plannen opent en erheen scrolt. */
export function OpenTabButton({ tab, children, className }: { tab: string; children: ReactNode; className?: string }) {
  return (
    <button type="button" className={className} onClick={() => { window.location.hash = tab; document.getElementById(`tab-${tab}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }); }}>{children}</button>
  );
}
