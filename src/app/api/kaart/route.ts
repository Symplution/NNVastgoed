import { NextResponse, type NextRequest } from 'next/server';
import { mapListings } from '@/lib/data';
import { isMode, parseFilters } from '@/lib/search';

export const dynamic = 'force-dynamic';

/** Woningen voor de kaart, met dezelfde filters als de zoekpagina (`soort` = koop, huur, nieuwbouw of bedrijfsruimte). */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const soort = sp.get('soort');
  const f = parseFilters(sp, isMode(soort) ? soort : 'koop');
  return NextResponse.json(await mapListings(f), { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } });
}
