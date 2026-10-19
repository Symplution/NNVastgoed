import { NextResponse, type NextRequest } from 'next/server';
import { hasSupabase, isDemo } from '@/lib/env';
import { createAnonClient } from '@/lib/supabase/anon';

export const dynamic = 'force-dynamic';

const BOT = /bot|crawl|spider|slurp|preview|facebookexternalhit|headless|lighthouse/i;
const KINDS = ['impression', 'view', 'brochure'];

/** Telt getoond, bekeken en brochure voor woningen die online staan. De database controleert de rest (alleen openbare woningen, maximaal 24 per keer). */
export async function POST(request: NextRequest) {
  if (isDemo() || !hasSupabase() || BOT.test(request.headers.get('user-agent') ?? '')) return new NextResponse(null, { status: 204 });
  const body = await request.json().catch(() => null) as { kind?: unknown; ids?: unknown } | null;
  const kind = typeof body?.kind === 'string' ? body.kind : '';
  const ids = Array.isArray(body?.ids) ? body.ids.filter((x): x is string => typeof x === 'string' && /^[0-9a-f-]{36}$/i.test(x)).slice(0, 24) : [];
  if (!KINDS.includes(kind) || !ids.length) return new NextResponse(null, { status: 400 });
  await createAnonClient().rpc('track_listings', { p_kind: kind, p_ids: ids });
  return new NextResponse(null, { status: 204 });
}
