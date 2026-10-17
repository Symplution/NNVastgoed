'use client';

import dynamic from 'next/dynamic';

const skeleton = (h: string) => function Skeleton() { return <div className={`${h} w-full animate-pulse rounded-2xl bg-sand`} aria-busy="true" aria-label="Kaart laden" />; };

// Leaflet werkt alleen in de browser; de kaart wordt daarom pas daar geladen.
export const ListingsMapLazy = dynamic(() => import('./listings-map').then((m) => m.ListingsMap), { ssr: false, loading: skeleton('h-[28rem] lg:h-[40rem]') });
export const LocationMapLazy = dynamic(() => import('./location-map').then((m) => m.LocationMap), { ssr: false, loading: skeleton('h-80') });
