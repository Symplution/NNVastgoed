import { NextResponse, type NextRequest } from 'next/server';
import { searchListings } from '@/lib/data';
import { isMode, parseFilters } from '@/lib/search';

export const dynamic = 'force-dynamic';

/** Hoeveel woningen passen bij deze keuzes? Voor de "Vind je plek"-wizard op de voorpagina; dezelfde filters als de zoekpagina. */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const soort = sp.get('soort');
  const { total } = await searchListings(parseFilters(sp, isMode(soort) ? soort : 'koop'));
  return NextResponse.json({ total }, { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120' } });
}
