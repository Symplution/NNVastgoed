'use client';

import { ImagePlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export const BANNER_SIZE = { width: 1600, height: 400 };

/** De banner van een kantoor: uploaden (JPG, PNG of WebP tot 2 MB) naar de eigen map in Supabase Storage, in de breedte 4 op 1. */
export function BannerEditor({ officeId, initial }: { officeId: string | null; initial?: string | null }) {
  const [url, setUrl] = useState(initial ?? '');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!officeId) return setError('Sla het kantoor eerst op en voeg daarna de banner toe.');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) return setError('Alleen JPG, PNG of WebP tot 2 MB.');
    setBusy(true); setError('');
    const supabase = createClient();
    const path = `${officeId}/banner-${crypto.randomUUID()}.${file.type.split('/')[1].replace('jpeg', 'jpg')}`;
    const { error: e } = await supabase.storage.from('office-logos').upload(path, file, { contentType: file.type, cacheControl: '31536000' });
    setBusy(false);
    if (e) return setError('Uploaden is niet gelukt.');
    setUrl(supabase.storage.from('office-logos').getPublicUrl(path).data.publicUrl);
  }

  return (
    <div>
      <input type="hidden" name="banner_url" value={url} />
      <div className="flex flex-wrap items-center gap-4">
        {url ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt="Banner van het kantoor" className="aspect-[4/1] h-16 rounded-lg border border-line object-cover" />
            <button type="button" onClick={() => setUrl('')} className="focus-ring inline-flex items-center gap-1.5 rounded text-sm font-semibold text-red-700 hover:underline"><Trash2 size={14} aria-hidden /> Banner verwijderen</button>
          </>
        ) : <p className="text-sm text-muted">Nog geen banner. Je ziet dan een standaard achtergrond.</p>}
        <label className="btn-ghost cursor-pointer"><ImagePlus size={16} aria-hidden /> {busy ? 'Uploaden…' : url ? 'Andere banner' : 'Banner uploaden'}<input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" disabled={busy} onChange={(e) => { void upload(e.target.files); e.target.value = ''; }} /></label>
      </div>
      <p className="mt-2 text-xs text-muted">Formaat: <strong>{BANNER_SIZE.width} × {BANNER_SIZE.height} pixels</strong> (breed, 4 op 1), JPG, PNG of WebP, maximaal 2 MB. De banner wordt op het midden bijgesneden, dus zet belangrijke dingen niet aan de randen. Het logo staat linksonder over de banner heen.</p>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
