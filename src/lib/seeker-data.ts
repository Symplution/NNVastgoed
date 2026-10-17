import { mapListing } from './data';
import { createClient } from './supabase/server';
import type { Listing } from './types';

// Gegevens voor Mijn NNV, met de sessie van de zoeker: row level security laat alleen zijn eigen rijen door.
type Row = Record<string, any>;

export async function unreadForSeeker(userId: string): Promise<number> {
  const supabase = await createClient();
  const { data: convs } = await supabase.from('conversations').select('id').eq('seeker_id', userId);
  const ids = (convs ?? []).map((c) => c.id);
  if (!ids.length) return 0;
  const { count } = await supabase.from('messages').select('id', { count: 'exact', head: true }).in('conversation_id', ids).eq('sender', 'makelaar').is('read_at', null);
  return count ?? 0;
}

export async function myFavorites(): Promise<Listing[]> {
  const { data } = await (await createClient()).from('favorites').select('created_at, listings(*)').order('created_at', { ascending: false });
  return (data ?? []).flatMap((r: Row) => (r.listings ? [mapListing(r.listings)] : []));
}

export interface MyViewing { id: string; token: string; startsAt: string; endsAt: string; status: string; note: string | null; listing: { slug: string; address: string; city: string } | null }
export async function myViewings(): Promise<MyViewing[]> {
  const { data } = await (await createClient()).from('viewings').select('id, token, starts_at, ends_at, status, note, listings(slug, street, house_number, house_suffix, city)').order('starts_at', { ascending: true });
  return (data ?? []).map((r: Row) => ({
    id: r.id, token: r.token, startsAt: r.starts_at, endsAt: r.ends_at, status: r.status, note: r.note,
    listing: r.listings ? { slug: r.listings.slug, address: `${r.listings.street} ${r.listings.house_number}${r.listings.house_suffix ?? ''}`, city: r.listings.city } : null,
  }));
}

export interface ThreadSummary { id: string; listingSlug: string; address: string; city: string; officeName: string; last: string; lastAt: string; lastFrom: 'zoeker' | 'makelaar'; unread: number }
export async function myThreads(): Promise<ThreadSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase.from('conversations').select('id, last_message_at, listings(slug, street, house_number, city), offices(name), messages(body, sender, read_at, created_at)').order('last_message_at', { ascending: false });
  return (data ?? []).map((c: Row) => {
    const msgs = [...(c.messages ?? [])].sort((a: Row, b: Row) => a.created_at.localeCompare(b.created_at));
    const last = msgs.at(-1);
    return {
      id: c.id, listingSlug: c.listings?.slug ?? '', address: c.listings ? `${c.listings.street} ${c.listings.house_number}` : 'Woning', city: c.listings?.city ?? '', officeName: c.offices?.name ?? 'Makelaar',
      last: last?.body ?? '', lastAt: c.last_message_at, lastFrom: last?.sender ?? 'zoeker',
      unread: msgs.filter((m: Row) => m.sender === 'makelaar' && !m.read_at).length,
    };
  });
}

export interface ThreadMessage { id: string; sender: 'zoeker' | 'makelaar'; body: string; createdAt: string }
export async function myThread(id: string): Promise<{ id: string; address: string; city: string; slug: string; officeName: string; messages: ThreadMessage[]; unread: number } | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data: c } = await (await createClient()).from('conversations').select('id, listings(slug, street, house_number, city), offices(name), messages(id, body, sender, read_at, created_at)').eq('id', id).maybeSingle();
  if (!c) return null;
  const messages = [...((c as Row).messages ?? [])].sort((a: Row, b: Row) => a.created_at.localeCompare(b.created_at));
  const l = (c as Row).listings;
  return {
    id: c.id, slug: l?.slug ?? '', address: l ? `${l.street} ${l.house_number}` : 'Woning', city: l?.city ?? '', officeName: (c as Row).offices?.name ?? 'Makelaar',
    messages: messages.map((m: Row) => ({ id: m.id, sender: m.sender, body: m.body, createdAt: m.created_at })),
    unread: messages.filter((m: Row) => m.sender === 'makelaar' && !m.read_at).length,
  };
}
