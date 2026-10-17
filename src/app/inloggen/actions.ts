'use server';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { siteUrl } from '@/lib/env';
import { safeNext } from '@/lib/safe-next';
import { createClient } from '@/lib/supabase/server';

export type AuthState = { error?: string; message?: string } | undefined;

// Eenvoudige rem tegen raden per IP (per serverinstantie); de echte blokkade zit in Supabase Auth (Authentication → Rate limits).
const attempts = new Map<string, { n: number; until: number }>();
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function limited() {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'onbekend';
  const rec = attempts.get(ip);
  return { ip, rec, blocked: Boolean(rec && rec.until > Date.now() && rec.n >= 8) };
}

export async function seekerLogin(_: AuthState, form: FormData): Promise<AuthState> {
  const { ip, rec, blocked } = await limited();
  if (blocked) return { error: 'Te veel pogingen. Probeer het over een paar minuten opnieuw.' };
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');
  const next = safeNext(String(form.get('next') ?? ''), '/mijn');
  if (!EMAIL.test(email) || !password) return { error: 'Vul je e-mailadres en wachtwoord in.' };
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    attempts.set(ip, { n: (rec && rec.until > Date.now() ? rec.n : 0) + 1, until: Date.now() + 10 * 60_000 });
    // Bewust dezelfde melding voor onbekend account, fout wachtwoord en een onbevestigd adres.
    return { error: 'E-mailadres of wachtwoord klopt niet. Heb je je e-mailadres al bevestigd?' };
  }
  attempts.delete(ip);
  // Een makelaar die hier inlogt gaat verder met zijn tweede stap.
  const { data: p } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle();
  redirect(p?.role === 'seeker' ? next : '/mfa');
}

export async function seekerSignup(_: AuthState, form: FormData): Promise<AuthState> {
  const { ip, rec, blocked } = await limited();
  if (blocked) return { error: 'Te veel pogingen. Probeer het over een paar minuten opnieuw.' };
  if (String(form.get('website') ?? '').trim()) return { message: 'Check je mail om je account te bevestigen.' };   // verborgen veld: bots
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  const password = String(form.get('password') ?? '');
  const next = safeNext(String(form.get('next') ?? ''), '/mijn');
  if (name.length < 2 || name.length > 120) return { error: 'Vul je naam in.' };
  if (!EMAIL.test(email) || email.length > 200) return { error: 'Vul een geldig e-mailadres in.' };
  if (password.length < 10) return { error: 'Kies een wachtwoord van minimaal 10 tekens.' };
  if (form.get('consent') !== 'on') return { error: 'Ga akkoord met de privacyverklaring om een account te maken.' };
  attempts.set(ip, { n: (rec && rec.until > Date.now() ? rec.n : 0) + 1, until: Date.now() + 10 * 60_000 });
  const { error } = await (await createClient()).auth.signUp({
    email, password, options: { data: { full_name: name }, emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  if (error && !/already|registered/i.test(error.message)) return { error: 'Het account kon niet worden gemaakt. Probeer het later opnieuw.' };
  // Bewust dezelfde melding als het adres al bestaat: zo lekt de site niet wie een account heeft.
  return { message: 'Check je mail en bevestig je e-mailadres. Daarna kun je inloggen.' };
}

export async function seekerReset(_: AuthState, form: FormData): Promise<AuthState> {
  const email = String(form.get('email') ?? '').trim().toLowerCase();
  if (!EMAIL.test(email)) return { error: 'Vul een geldig e-mailadres in.' };
  await (await createClient()).auth.resetPasswordForEmail(email, { redirectTo: `${siteUrl()}/auth/callback?next=/wachtwoord` });
  return { message: 'Als dit adres bij een account hoort, krijg je een mail met een link om een nieuw wachtwoord te kiezen.' };
}

export async function seekerLogout() {
  await (await createClient()).auth.signOut({ scope: 'local' });
  redirect('/');
}
