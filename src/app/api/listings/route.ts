import { NextResponse, type NextRequest } from 'next/server';
import { listingsByIds } from '@/lib/data';

export const dynamic = 'force-dynamic';

/** Openbare woningen op id, voor de pagina met bewaarde woningen. */
export async function GET(request: NextRequest) {
  const ids = (request.nextUrl.searchParams.get('ids') ?? '').split(',').filter(Boolean);
  return NextResponse.json(await listingsByIds(ids), { headers: { 'Cache-Control': 'private, max-age=60' } });
}
