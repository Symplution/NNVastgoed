'use client';

import { Film, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

const TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const MAX = 50 * 1024 * 1024;

/** De video van een woning: één stuk. Uploaden naar de eigen map in Supabase Storage (tot 50 MB), of een https-adres plakken. */
export function VideoEditor({ officeId, initial }: { officeId: string | null; initial?: string | null }) {
  const [url, setUrl] = useState(initial ?? '');
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(files: FileList | null) {
    const file = files?.[0];
    if (!file) return;
    if (!officeId) return setError('Kies eerst een kantoor.');
    if (!TYPES.includes(file.type) || file.size > MAX) return setError('Alleen MP4, WebM of MOV tot 50 MB.');
    setBusy(true); setError('');
    const supabase = createClient();
    const ext = file.type === 'video/webm' ? 'webm' : file.type === 'video/quicktime' ? 'mov' : 'mp4';
    const path = `${officeId}/${crypto.randomUUID()}.${ext}`;
    const { error: e } = await supabase.storage.from('listing-videos').upload(path, file, { contentType: file.type, cacheControl: '31536000' });
    setBusy(false);
    if (e) return setError('Uploaden is niet gelukt.');
    setUrl(supabase.storage.from('listing-videos').getPublicUrl(path).data.publicUrl);
  }

  return (
    <div>
      <input type="hidden" name="video_url" value={url} />
      {url ? (
        <div className="max-w-md">
          <video src={url} controls preload="metadata" className="aspect-video w-full rounded-lg bg-ink" />
          <button type="button" onClick={() => setUrl('')} className="focus-ring mt-2 inline-flex items-center gap-1.5 rounded text-sm font-semibold text-red-700 hover:underline"><Trash2 size={14} aria-hidden /> Video verwijderen</button>
        </div>
      ) : <p className="text-sm text-muted">Er is nog geen video. Je kunt er één per woning toevoegen.</p>}
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <label className="btn-ghost cursor-pointer"><Film size={16} aria-hidden /> {busy ? 'Uploaden…' : url ? 'Video vervangen' : 'Video uploaden'}<input type="file" accept={TYPES.join(',')} className="sr-only" disabled={busy} onChange={(e) => { void upload(e.target.files); e.target.value = ''; }} /></label>
        <div className="flex flex-1 gap-2">
          <label htmlFor="video-url" className="sr-only">Adres van een video</label>
          <input id="video-url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://…/video.mp4" className="field min-w-[12rem]" />
          <button type="button" className="btn-ghost" onClick={() => { if (/^https:\/\/\S+\.(mp4|webm|mov|m4v)(\?\S*)?$/i.test(link.trim())) { setUrl(link.trim()); setLink(''); setError(''); } else setError('Een video-adres begint met https:// en eindigt op .mp4, .webm of .mov'); }}>Toevoegen</button>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">MP4 (H.264) werkt in elke browser. Een nieuwe video vervangt de huidige.</p>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  );
}
