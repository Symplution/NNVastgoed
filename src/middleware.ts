import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { hasSupabase } from '@/lib/env';
import { updateSession } from '@/lib/supabase/middleware';

// Het openbare deel van de site raakt de middleware niet; alleen het beheer en Mijn NNV hebben een sessie nodig.
export async function middleware(request: NextRequest) {
  if (!hasSupabase()) return new NextResponse('Supabase is niet geconfigureerd. Zet NEXT_PUBLIC_SUPABASE_URL en NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.', { status: 503 });
  return updateSession(request);
}

export const config = { matcher: ['/beheer/:path*', '/mijn/:path*', '/login', '/mfa', '/wachtwoord'] };
