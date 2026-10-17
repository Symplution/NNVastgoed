import { NextResponse, type NextRequest } from 'next/server';
import { lookupPlace, suggestPlaces, zoomForType } from '@/lib/geo';

export const dynamic = 'force-dynamic';

/**
 * Plaatsen zoeken voor de kaart. Via de server, zodat de browser nooit rechtstreeks bij een andere dienst komt.
 *   /api/plaats?q=leeuw          → suggesties
 *   /api/plaats?id=<pdok-id>     → de locatie van één keuze
 */
export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  const id = sp.get('id');
  const headers = { 'Cache-Control': 'public, max-age=300' };
  if (id) {
    const p = await lookupPlace(id);
    return p ? NextResponse.json({ ...p, zoom: zoomForType(p.type) }, { headers }) : NextResponse.json({ fout: 'Niet gevonden.' }, { status: 404 });
  }
  return NextResponse.json({ plaatsen: await suggestPlaces(sp.get('q') ?? '') }, { headers });
}
