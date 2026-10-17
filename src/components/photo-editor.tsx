'use client';

import { ArrowDown, ArrowUp, ImagePlus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Photo } from '@/lib/types';

/** Foto’s van een woning: uploaden naar de eigen map in Supabase Storage, of een https-adres plakken. De volgorde bepaalt de hoofdfoto. */
export function PhotoEditor({ officeId, initial }: { officeId: string | null; initial: Photo[] }) {
  const [photos, setPhotos] = useState<Photo[]>(initial);
  const [url, setUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(files: FileList | null) {
    if (!files?.length || !officeId) return setError(officeId ? '' : 'Kies eerst een kantoor.');
    setBusy(true); setError('');
    const supabase = createClient();
    const added: Photo[] = [];
    for (const file of Array.from(files).slice(0, 20)) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 8 * 1024 * 1024) { setError('Alleen JPG, PNG of WebP tot 8 MB.'); continue; }
      const path = `${officeId}/${crypto.randomUUID()}.${file.type.split('/')[1].replace('jpeg', 'jpg')}`;
      const { error } = await supabase.storage.from('listing-photos').upload(path, file, { contentType: file.type, cacheControl: '31536000' });
      if (error) { setError('Uploaden is niet gelukt.'); continue; }
      added.push({ url: supabase.storage.from('listing-photos').getPublicUrl(path).data.publicUrl });
    }
    setPhotos((p) => [...p, ...added]);
    setBusy(false);
  }
  const move = (i: number, d: number) => setPhotos((p) => { const n = [...p]; [n[i], n[i + d]] = [n[i + d], n[i]]; return n; });

  return (
    <div>
      <input type="hidden" name="photos" value={JSON.stringify(photos)} />
      {photos.length > 0 && (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((p, i) => (
            <li key={p.url} className="overflow-hidden rounded-lg border border-line">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={p.url} alt="" className="aspect-[4/3] w-full object-cover" />
              <div className="flex items-center justify-between gap-1 p-1.5 text-xs">
                <span className="font-semibold text-muted">{i === 0 ? 'Hoofdfoto' : i + 1}</span>
                <span className="flex">
                  <button type="button" disabled={i === 0} onClick={() => move(i, -1)} aria-label="Naar voren" className="focus-ring rounded p-1 hover:bg-sand disabled:opacity-30"><ArrowUp size={14} /></button>
                  <button type="button" disabled={i === photos.length - 1} onClick={() => move(i, 1)} aria-label="Naar achteren" className="focus-ring rounded p-1 hover:bg-sand disabled:opacity-30"><ArrowDown size={14} /></button>
                  <button type="button" onClick={() => setPhotos((x) => x.filter((_, k) => k !== i))} aria-label="Verwijder foto" className="focus-ring rounded p-1 text-red-700 hover:bg-red-50"><Trash2 size={14} /></button>
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="btn-ghost cursor-pointer"><ImagePlus size={16} aria-hidden /> {busy ? 'Uploaden…' : 'Foto’s uploaden'}<input type="file" accept="image/jpeg,image/png,image/webp" multiple className="sr-only" disabled={busy} onChange={(e) => { void upload(e.target.files); e.target.value = ''; }} /></label>
        <div className="flex flex-1 gap-2">
          <label htmlFor="photo-url" className="sr-only">Adres van een foto</label>
          <input id="photo-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…/foto.jpg" className="field min-w-[12rem]" />
          <button type="button" className="btn-ghost" onClick={() => { if (/^https:\/\/\S+$/.test(url.trim())) { setPhotos((p) => [...p, { url: url.trim() }]); setUrl(''); setError(''); } else setError('Een foto-adres begint met https://'); }}>Toevoegen</button>
        </div>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
