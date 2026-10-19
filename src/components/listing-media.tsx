'use client';

import { ChevronLeft, ChevronRight, Copy, FileDown, Grid2x2, Images, LayoutPanelTop, Play, Rotate3d, Share2, Video, X } from 'lucide-react';
import { track } from './track-listing';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Photo } from '@/lib/types';
import { SaveButton } from './save-button';

type Kind = 'foto' | 'plattegrond' | '360';
type Slide = Photo & { video?: boolean };
const LABEL: Record<Kind, string> = { foto: 'Foto’s', plattegrond: 'Plattegrond', '360': '360° foto’s' };
const ICON: Record<Kind, ReactNode> = { foto: <Images size={18} aria-hidden />, plattegrond: <LayoutPanelTop size={18} aria-hidden />, '360': <Rotate3d size={18} aria-hidden /> };
type View = { kind: Kind; i: number } | 'alle' | null;

/** Een 360°-foto: een breed beeld dat je met de muis of je vinger langs sleept. */
function Panorama({ url, alt }: { url: string; alt: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(0);
  const [imgW, setImgW] = useState(0);
  const drag = useRef<{ sx: number; ox: number } | null>(null);
  const clamp = useCallback((v: number) => Math.min(0, Math.max(v, -(imgW - (box.current?.clientWidth ?? 0)))), [imgW]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => { if (e.key === 'ArrowLeft') setX((v) => clamp(v + 120)); if (e.key === 'ArrowRight') setX((v) => clamp(v - 120)); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [clamp]);
  return (
    <div className="relative h-full w-full">
      <div ref={box} className="h-full w-full cursor-grab touch-pan-y overflow-hidden active:cursor-grabbing"
        onPointerDown={(e) => { drag.current = { sx: e.clientX, ox: x }; (e.target as HTMLElement).setPointerCapture?.(e.pointerId); }}
        onPointerMove={(e) => { if (drag.current) setX(clamp(drag.current.ox + e.clientX - drag.current.sx)); }}
        onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={url} alt={alt} draggable={false} onLoad={(e) => { const im = e.currentTarget; setImgW((im.naturalWidth / im.naturalHeight) * im.clientHeight); setX(0); }}
          className="h-full max-w-none select-none" style={{ transform: `translateX(${x}px)` }} />
      </div>
      <p className="pointer-events-none absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs text-white">Sleep om rond te kijken</p>
    </div>
  );
}

/** De media bovenaan een woning: een mozaïek met de hoofdfoto, video en foto's, en onderaan knoppen voor foto's, plattegrond, video en 360°. */
export function ListingMedia({ listingId, title, brochureHref, photos, floorplans = [], photos360 = [], videoUrl }: { listingId: string; title: string; brochureHref?: string; photos: Photo[]; floorplans?: Photo[]; photos360?: Photo[]; videoUrl?: string | null }) {
  const [view, setView] = useState<View>(null);
  const [note, setNote] = useState('');
  // De video staat altijd op de tweede plek tussen de foto's (na de hoofdfoto).
  const videoAt = videoUrl ? Math.min(1, photos.length) : -1;
  const slides: Slide[] = videoUrl ? [...photos.slice(0, videoAt), { url: videoUrl, video: true }, ...photos.slice(videoAt)] : photos;
  const lists: Record<Kind, Slide[]> = { foto: slides, plattegrond: floorplans, '360': photos360 };
  const kinds = (['foto', 'plattegrond', '360'] as Kind[]).filter((k) => lists[k].length > 0);
  const open = (kind: Kind, i = 0) => setView({ kind, i });
  const close = useCallback(() => setView(null), []);
  const step = useCallback((d: number) => setView((v) => (v && v !== 'alle' ? { ...v, i: (v.i + d + lists[v.kind].length) % lists[v.kind].length } : v)), [slides.length, floorplans.length, photos360.length]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!view) return;
    const key = (e: KeyboardEvent) => { if (e.key === 'Escape') close(); if (view !== 'alle' && (view.kind === 'foto' || view.kind === 'plattegrond')) { if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); } };
    document.addEventListener('keydown', key);
    const prev = document.body.style.overflow; document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', key); document.body.style.overflow = prev; };
  }, [view, close, step]);

  async function share() {
    const url = window.location.href.split('#')[0];
    try {
      if (navigator.share) await navigator.share({ title, url });
      else { await navigator.clipboard.writeText(url); setNote('Link gekopieerd'); setTimeout(() => setNote(''), 2500); }
    } catch { /* gesloten of niet toegestaan */ }
  }

  // De vier kleine vakken: de video (altijd als eerste), dan de volgende foto's, dan plattegrond en 360°.
  type Tile = { kind: Kind; i: number; url: string; alt?: string; video?: boolean };
  const tiles: Tile[] = [
    ...(videoUrl ? [{ kind: 'foto' as Kind, i: videoAt, url: photos[1]?.url ?? photos[0]?.url ?? '', video: true }] : []),
    ...photos.slice(videoUrl ? 2 : 1).map((p, k) => ({ kind: 'foto' as Kind, i: k + (videoUrl ? 3 : 1), url: p.url, alt: p.alt })),
    ...floorplans.slice(0, 1).map((p) => ({ kind: 'plattegrond' as Kind, i: 0, url: p.url, alt: p.alt })),
    ...photos360.slice(0, 1).map((p) => ({ kind: '360' as Kind, i: 0, url: p.url, alt: p.alt })),
  ].slice(0, 4);

  if (!photos.length && !kinds.length) return <div className="flex aspect-[16/7] items-center justify-center rounded-2xl bg-sand text-muted">Geen foto’s beschikbaar</div>;
  const main = photos[0] ?? floorplans[0] ?? photos360[0];
  const btn = 'focus-ring inline-flex items-center gap-2 rounded-lg px-3 py-2 text-[15px] font-semibold text-brand hover:bg-brand-soft';

  return (
    <div>
      <div className="relative">
        <div className="grid h-[17rem] grid-cols-4 grid-rows-2 gap-1.5 overflow-hidden rounded-2xl sm:h-[26rem]">
          <button type="button" onClick={() => open(photos.length ? 'foto' : floorplans.length ? 'plattegrond' : '360', 0)} aria-label="Foto groter bekijken" className="focus-ring col-span-4 row-span-2 block overflow-hidden bg-sand sm:col-span-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={main.url} alt={main.alt ?? `${title}, hoofdfoto`} className="h-full w-full object-cover transition hover:scale-[1.02]" />
          </button>
          {[0, 1, 2, 3].map((n) => {
            const t = tiles[n];
            return t ? (
              <button key={n} type="button" onClick={() => open(t.kind, t.i)} aria-label={t.video ? 'Video afspelen' : `${LABEL[t.kind]} bekijken`} className="focus-ring relative hidden overflow-hidden bg-sand sm:block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={t.url} alt={t.alt ?? ''} className={`h-full w-full object-cover transition hover:scale-[1.03] ${t.kind === 'plattegrond' ? 'bg-white object-contain p-2' : ''}`} />
                {t.video && <span className="absolute inset-0 flex items-center justify-center bg-black/10"><span className="flex h-16 w-16 items-center justify-center rounded-full bg-ink/80 text-white"><Play size={28} fill="currentColor" aria-hidden /></span></span>}
                {t.kind === '360' && <span className="absolute inset-0 flex items-center justify-center bg-black/10"><span className="flex h-14 w-14 items-center justify-center rounded-full bg-ink/80 text-white"><Rotate3d size={26} aria-hidden /></span></span>}
              </button>
            ) : <div key={n} className="hidden bg-sand sm:block" aria-hidden />;
          })}
        </div>
        <div className="absolute right-3 top-3 flex gap-2">
          <button type="button" onClick={() => void share()} aria-label="Deel deze woning" className="focus-ring inline-flex items-center gap-2 rounded-lg bg-white px-3.5 py-2.5 text-sm font-semibold text-brand shadow-md hover:bg-brand-soft"><Share2 size={18} aria-hidden /><span className="sr-only sm:not-sr-only">Delen</span></button>
          <span className="rounded-lg bg-white px-1 shadow-md"><SaveButton id={listingId} label /></span>
        </div>
        {note && <p role="status" className="absolute right-3 top-16 inline-flex items-center gap-1.5 rounded-lg bg-ink px-3 py-1.5 text-xs text-white"><Copy size={12} aria-hidden /> {note}</p>}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-1 gap-y-1 border-b border-line pb-3">
        {kinds.map((k) => (
          <button key={k} type="button" onClick={() => open(k, 0)} className={btn}>{ICON[k]} {LABEL[k]} <span className="font-normal text-muted">{k === 'foto' ? photos.length : lists[k].length}</span></button>
        ))}
        {videoUrl && <button type="button" onClick={() => open('foto', videoAt)} className={btn}><Video size={18} aria-hidden /> Video</button>}
        {brochureHref && <a href={brochureHref} download className={btn} onClick={() => track('brochure', listingId)}><FileDown size={18} aria-hidden /> Brochure (pdf)</a>}
        <span className="grow" />
        <button type="button" onClick={() => setView('alle')} className={btn}><Grid2x2 size={18} aria-hidden /> Alle media</button>
      </div>

      {view && (
        <div role="dialog" aria-modal="true" aria-label={`Media van ${title}`} className="fixed inset-0 z-[70] flex flex-col bg-black text-white">
          <div className="flex items-center gap-2 px-4 py-3">
            <div className="flex flex-1 flex-wrap gap-1">
              {kinds.map((k) => <button key={k} type="button" onClick={() => open(k, 0)} aria-pressed={view !== 'alle' && view.kind === k} className={`focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${view !== 'alle' && view.kind === k ? 'bg-white text-ink' : 'text-white/85 hover:bg-white/15'}`}>{ICON[k]} {LABEL[k]}</button>)}
              <button type="button" onClick={() => setView('alle')} aria-pressed={view === 'alle'} className={`focus-ring inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold ${view === 'alle' ? 'bg-white text-ink' : 'text-white/85 hover:bg-white/15'}`}><Grid2x2 size={18} aria-hidden /> Alle media</button>
            </div>
            {view !== 'alle' && lists[view.kind].length > 1 && <span className="text-sm text-white/75">{view.i + 1} / {lists[view.kind].length}</span>}
            <button type="button" onClick={close} aria-label="Sluiten" className="focus-ring rounded-full p-2 hover:bg-white/15"><X size={22} aria-hidden /></button>
          </div>
          <div className="relative min-h-0 flex-1">
            {view === 'alle' ? (
              <div className="h-full overflow-y-auto px-4 pb-8">
                {kinds.map((k) => (
                  <section key={k} className="mb-8" aria-label={LABEL[k]}>
                    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-white/75">{ICON[k]} {LABEL[k]}</h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                      {lists[k].map((p, i) => (
                        <button key={p.url + i} type="button" onClick={() => open(k, i)} className="focus-ring relative aspect-[4/3] overflow-hidden rounded-lg bg-white/10">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          {p.video ? <span className="flex h-full items-center justify-center bg-ink"><Play size={36} aria-hidden /></span> : <img src={p.url} alt={p.alt ?? ''} loading="lazy" className={`h-full w-full ${k === 'plattegrond' ? 'bg-white object-contain p-2' : 'object-cover'}`} />}
                        </button>
                      ))}
                    </div>
                  </section>
                ))}
              </div>
            ) : view.kind === '360' ? (
              <div className="h-full"><Panorama key={view.i} url={lists['360'][view.i].url} alt={lists['360'][view.i].alt ?? `${title}, 360° foto`} /></div>
            ) : (
              <div className="flex h-full items-center justify-center px-14">
                {lists[view.kind][view.i].video ? (
                  // eslint-disable-next-line jsx-a11y/media-has-caption
                  <video key={view.i} src={lists[view.kind][view.i].url} controls autoPlay playsInline className="h-full max-h-full w-full max-w-5xl rounded-lg bg-black object-contain" />
                ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={lists[view.kind][view.i].url} alt={lists[view.kind][view.i].alt ?? `${title}, ${LABEL[view.kind].toLowerCase()} ${view.i + 1}`} className={`max-h-full max-w-full rounded-lg object-contain ${view.kind === 'plattegrond' ? 'bg-white' : ''}`} />
                )}
              </div>
            )}
            {view !== 'alle' && lists[view.kind].length > 1 && (view.kind === 'foto' || view.kind === 'plattegrond' || view.kind === '360') && (
              <>
                <button type="button" onClick={() => step(-1)} aria-label="Vorige" className="focus-ring absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 hover:bg-white/30"><ChevronLeft size={24} aria-hidden /></button>
                <button type="button" onClick={() => step(1)} aria-label="Volgende" className="focus-ring absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/15 p-3 hover:bg-white/30"><ChevronRight size={24} aria-hidden /></button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
