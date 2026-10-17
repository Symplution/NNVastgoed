import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import { hasSupabase } from './env';

export interface Seeker { id: string; email: string; name: string; phone: string | null }

/** De ingelogde persoon als woningzoeker (favorieten, bezichtigingen, berichten). Een zoeker heeft geen tweede inlogstap nodig. */
export async function getSeeker(): Promise<Seeker | null> {
  if (!hasSupabase()) return null;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: p } = await supabase.from('profiles').select('full_name, phone').eq('id', user.id).maybeSingle();
  const email = user.email ?? '';
  return { id: user.id, email, name: p?.full_name || email.split('@')[0] || 'Zoeker', phone: p?.phone ?? null };
}

export async function requireSeeker(next = '/mijn'): Promise<Seeker> {
  const s = await getSeeker();
  if (!s) redirect(`/inloggen?next=${encodeURIComponent(next)}`);
  return s;
}
