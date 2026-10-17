'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

// Eenvoudige rem tegen raden per IP (per serverinstantie). De echte blokkade zit in Supabase Auth (Authentication → Rate limits).
const attempts = new Map<string, { n: number; until: number }>();

export async function login(_: unknown, form: FormData): Promise<{ error: string } | undefined> {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'onbekend';
  const rec = attempts.get(ip);
  if (rec && rec.until > Date.now() && rec.n >= 5) return { error: 'Te veel pogingen. Probeer het over een paar minuten opnieuw.' };
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');
  if (!email || !password) return { error: 'Vul je e-mailadres en wachtwoord in.' };
  const { error } = await (await createClient()).auth.signInWithPassword({ email, password });
  if (error) {
    attempts.set(ip, { n: (rec && rec.until > Date.now() ? rec.n : 0) + 1, until: Date.now() + 10 * 60_000 });
    return { error: 'E-mailadres of wachtwoord klopt niet.' };   // bewust dezelfde melding voor onbekend account en fout wachtwoord
  }
  attempts.delete(ip);
  redirect('/mfa');
}

export async function logout() {
  await (await createClient()).auth.signOut({ scope: 'local' });
  redirect('/login');
}
