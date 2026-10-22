'use client';

import { Mail, ShieldAlert } from 'lucide-react';
import { CopyButton } from './copy-button';
import { partnerInstructions } from '@/lib/feeds/instructions';

export interface SecretInfo { id: string; value: string; name?: string; kind?: 'json' | 'xml'; officeName?: string; software?: string }

/** Na het aanmaken of vernieuwen: adres en sleutel om te kopiëren, en een kant-en-klare instructie voor Realworks of de ICT-partner. */
export function SecretPanel({ secret, baseUrl, onClose }: { secret: SecretInfo; baseUrl: string; onClose?: () => void }) {
  const url = `${baseUrl}/api/feeds/${secret.id}`;
  const text = partnerInstructions({ baseUrl, id: secret.id, kind: secret.kind ?? 'json', officeName: secret.officeName ?? 'ons kantoor', software: secret.name, secret: secret.value });
  const short = `${text.split('5. Voorbeeld')[0]}Voorbeeld van het formaat: ${baseUrl}/voor-makelaars#koppelen\n`;
  const mail = `mailto:?subject=${encodeURIComponent(`Koppeling met NNvastgoed voor ${secret.officeName ?? 'ons kantoor'}`)}&body=${encodeURIComponent(short)}`;
  const row = (label: string, value: string) => (
    <div>
      <p className="label">{label}</p>
      <div className="flex items-start gap-2"><code className="block min-w-0 flex-1 break-all rounded bg-sand p-2 text-sm">{value}</code><CopyButton text={value} /></div>
    </div>
  );
  return (
    <div role="status" className="mt-4 space-y-5 text-sm">
      <p className="flex items-start gap-2 rounded-lg bg-amber-50 p-3 font-semibold text-amber-900"><ShieldAlert size={18} className="mt-0.5 shrink-0" aria-hidden /> Bewaar de geheime sleutel nu. Je ziet hem hierna niet meer; kwijt? Dan maak je een nieuwe sleutel.</p>
      <section aria-labelledby="stap1">
        <h3 id="stap1" className="font-bold">Stap 1 · Je gegevens</h3>
        <div className="mt-2 space-y-3">{row('Adres', url)}{row('Geheime sleutel', secret.value)}</div>
      </section>
      <section aria-labelledby="stap2">
        <h3 id="stap2" className="font-bold">Stap 2 · Stuur dit naar Realworks of je ICT-partner</h3>
        <p className="mt-1 text-muted">Dit is een kant-en-klare instructie met adres, sleutel en een voorbeeld. Je hoeft zelf niets in te vullen.</p>
        <textarea readOnly value={text} rows={8} aria-label="Instructie voor je ICT-partner" className="field mt-2 font-mono text-xs" />
        <div className="mt-2 flex flex-wrap gap-2">
          <CopyButton text={text} label="Kopieer de hele instructie" className="btn-primary !py-2 text-sm" />
          <a href={mail} className="btn-ghost !py-2 text-sm"><Mail size={15} aria-hidden /> Open in je mailprogramma</a>
        </div>
      </section>
      <section aria-labelledby="stap3">
        <h3 id="stap3" className="font-bold">Stap 3 · Wachten op de eerste aanroep</h3>
        <p className="mt-1 text-muted">Zodra het systeem iets verstuurt, staat de koppeling hieronder op <strong>Verbonden</strong> en zie je hoeveel woningen er zijn verwerkt. Deze pagina ververst vanzelf.</p>
      </section>
      {onClose && <button type="button" onClick={onClose} className="btn-ghost">Klaar, sluiten</button>}
    </div>
  );
}
