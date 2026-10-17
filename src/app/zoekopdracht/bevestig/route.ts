import { NextResponse, type NextRequest } from 'next/server';
import { hasSupabase } from '@/lib/env';
import { createAnonClient } from '@/lib/supabase/anon';

// De sleutel uit de mail is het bewijs; de database-functie doet de rest.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token') ?? '';
  const ok = hasSupabase() && /^[0-9a-f-]{36}$/i.test(token) && (await createAnonClient().rpc('confirm_saved_search', { p_token: token })).data === true;
  const page = (title: string, body: string) =>
    new NextResponse(`<!doctype html><html lang="nl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${title} · NNvastgoed</title><body style="font-family:system-ui;max-width:32rem;margin:15vh auto;padding:0 1.5rem;color:#14212b"><h1>${title}</h1><p>${body}</p><p><a href="/" style="color:#0e4a6e">Naar NNvastgoed</a></p></body></html>`, { status: ok ? 200 : 404, headers: { 'content-type': 'text/html; charset=utf-8' } });
  return ok ? page('Bevestigd', 'Je zoekopdracht is bevestigd. Je ontvangt een mail zodra er nieuwe woningen zijn.') : page('Link werkt niet', 'Deze link is ongeldig of verlopen.');
}
