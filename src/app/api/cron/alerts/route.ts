import { NextResponse, type NextRequest } from 'next/server';
import { sendAlerts } from '@/lib/alerts';
import { hasService } from '@/lib/env';

export const dynamic = 'force-dynamic';

/** Dagelijks via Vercel Cron (zie vercel.json). Vercel stuurt `Authorization: Bearer $CRON_SECRET` mee. */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) return NextResponse.json({ fout: 'Geen toegang.' }, { status: 401 });
  if (!hasService()) return NextResponse.json({ fout: 'SUPABASE_SERVICE_ROLE_KEY ontbreekt.' }, { status: 503 });
  return NextResponse.json(await sendAlerts());
}
