'use client';

import { ImagePlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

/** Het logo van een kantoor: uploaden (JPG, PNG of WebP tot 2 MB) naar de eigen map in Supabase Storage. Komt op het pdf-overzicht van een woning. */
export function LogoEditor({ officeId, initial }: { officeId: string | null; initial?: string | null }) {
  const [url, setUrl] = useState(initial ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!officeId) return setError('Sla het kantoor eerst op en voeg daarna het logo toe.');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) return setError('Alleen JPG, PNG of WebP tot 2 MB.');
    setBusy(true); setError('');
    const supabase = createClient();
    const path = `${officeId}/${crypto.randomUUID()}.${file.type.split('/')[1].replace('jpeg', 'jpg')}`;
    const { error: e } = await supabase.storage.from('office-logos').upload(path, file, { contentType: file.type, cacheControl: '31536000' });
    setBusy(false);
    if (e) return setError('Uploaden is niet gelukt.');
    setUrl(supabase.storage.from('office-logos').getPublicUrl(path).data.publicUrl);
  }

  return (
    <div>
      <input type="hidden" name="logo_url" value={url} />
      <div className="flex flex-wrap items-center gap-4">
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Logo van het kantoor" className="h-16 max-w-[12rem] rounded-lg border border-line bg-white object-contain p-2" />
            <button type="button" onClick={() => setUrl('')} className="focus-ring inline-flex items-center gap-1.5 rounded text-sm font-semibold text-red-700 hover:underline"><Trash2 size={14} aria-hidden /> Logo verwijderen</button>
          </>
        ) : <p className="text-sm text-muted">Nog geen logo.</p>}
        <label className="btn-ghost cursor-pointer"><ImagePlus size={16} aria-hidden /> {busy ? 'Uploaden…' : url ? 'Ander logo' : 'Logo uploaden'}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={(e) => { void upload(e.target.files); e.target.value = ''; }} /></label>
      </div>
      <p className="mt-2 text-xs text-muted">Formaat: <strong>1000 × 1000 pixels</strong> (vierkant), JPG, PNG of WebP, maximaal 2 MB. Een logo op een witte of doorzichtige achtergrond ziet er het mooist uit.</p>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
