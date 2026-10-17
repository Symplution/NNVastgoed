import { NextResponse } from 'next/server';
import { hasSupabase, siteUrl } from '@/lib/env';
import { createAnonClient } from '@/lib/supabase/anon';
import { buildIcs } from '@/lib/viewings';

export const dynamic = 'force-dynamic';

/** Agenda-bestand van een bezichtiging; de sleutel in het adres is het bewijs. */
export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(token) || !hasSupabase()) return new NextResponse('Niet gevonden', { status: 404 });
  const { data } = await createAnonClient().rpc('get_viewing', { p_token: token });
  const v = Array.isArray(data) ? data[0] : data;
  if (!v) return new NextResponse('Niet gevonden', { status: 404 });
  const ics = buildIcs({
    uid: v.id, start: v.starts_at, end: v.ends_at, summary: `Bezichtiging ${v.address}, ${v.city}`,
    description: `Bezichtiging via NNvastgoed bij ${v.office_name}.${v.office_phone ? ` Telefoon: ${v.office_phone}.` : ''} Annuleren kan via de link.`,
    location: `${v.address}, ${v.city}`, url: `${siteUrl()}/bezichtiging/${token}`, cancelled: v.status === 'geannuleerd',
  });
  return new NextResponse(ics, { headers: { 'Content-Type': 'text/calendar; charset=utf-8', 'Content-Disposition': 'attachment; filename="bezichtiging.ics"', 'Cache-Control': 'no-store' } });
}
