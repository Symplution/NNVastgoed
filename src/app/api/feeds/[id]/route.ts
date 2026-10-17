import { createHash } from 'node:crypto';
import { NextResponse, type NextRequest } from 'next/server';
import { hasSupabase } from '@/lib/env';
import { createAnonClient } from '@/lib/supabase/anon';
import { parseJsonFeed, parseXmlFeed, type ParsedFeed } from '@/lib/feeds/parse';

export const dynamic = 'force-dynamic';
const MAX_BYTES = 8 * 1024 * 1024;
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

/**
 * Koppeling: het systeem van een kantoor stuurt zijn aanbod hierheen.
 *   POST /api/feeds/<koppeling-id>   Authorization: Bearer <sleutel>
 *   JSON ({ "volledig": false, "woningen": [...] }) of XML (<woningen><woning>…).
 * Er is geen account of service key nodig: de database-functie `ingest_listings` controleert de sleutel (alleen de hash staat in de database).
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const token = /^Bearer\s+(\S{16,200})$/.exec(request.headers.get('authorization') ?? '')?.[1];
  if (!hasSupabase()) return json({ fout: 'Niet geconfigureerd.' }, 503);
  if (!token || !/^[0-9a-f-]{36}$/i.test(id)) return json({ fout: 'Ongeldige koppeling of sleutel.' }, 401);
  if (Number(request.headers.get('content-length') ?? 0) > MAX_BYTES) return json({ fout: 'Te groot (maximaal 8 MB).' }, 413);

  const text = await request.text();
  if (text.length > MAX_BYTES) return json({ fout: 'Te groot (maximaal 8 MB).' }, 413);

  let parsed: ParsedFeed;
  try {
    parsed = /xml/i.test(request.headers.get('content-type') ?? '') ? parseXmlFeed(text, id) : parseJsonFeed(JSON.parse(text), id);
  } catch (e) {
    return json({ fout: `Kon het bericht niet lezen: ${e instanceof Error ? e.message : 'onbekende fout'}` }, 400);
  }

  const { data, error } = await createAnonClient().rpc('ingest_listings', {
    p_connection: id, p_secret_hash: createHash('sha256').update(token).digest('hex'),
    p_items: parsed.items, p_rejected: parsed.rejected.slice(0, 50), p_full: parsed.full,
  });
  if (error) {
    if (error.code === '28000') return json({ fout: 'Ongeldige koppeling of sleutel.' }, 401);
    return json({ fout: 'De woningen konden niet worden opgeslagen.', detail: error.message }, 422);
  }
  return json({ ...data, afgewezen_details: parsed.rejected.slice(0, 50) });
}
