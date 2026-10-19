import { createClient } from './supabase/server';
import { mapListing, mapOffice } from './data';
import type { Listing, Office } from './types';

// Gegevens voor het beheer. Alles loopt met de sessie van de gebruiker, dus row level security bepaalt wat hij ziet.
type Row = Record<string, any>;

export async function myListings(): Promise<Listing[]> {
  const { data } = await (await createClient()).from('listings').select('*').order('updated_at', { ascending: false }).limit(500);
  return (data ?? []).map(mapListing);
}
export async function myListing(id: string): Promise<Listing | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const { data } = await (await createClient()).from('listings').select('*').eq('id', id).maybeSingle();
  return data ? mapListing(data) : null;
}
export async function myOffices(): Promise<Office[]> {
  const { data } = await (await createClient()).from('offices').select('*').order('name');
  return (data ?? []).map(mapOffice);
}
export interface LeadRow { id: string; listingId: string; listing: string; name: string; email: string; phone: string | null; message: string; kind: string; status: string; createdAt: string; office: string }
export async function myLeads(): Promise<LeadRow[]> {
  const { data } = await (await createClient()).from('leads').select('*, listings(street, house_number, city), offices(name)').order('created_at', { ascending: false }).limit(300);
  return (data ?? []).map((r: Row) => ({
    id: r.id, listingId: r.listing_id, listing: r.listings ? `${r.listings.street} ${r.listings.house_number}, ${r.listings.city}` : 'Onbekende woning',
    name: r.name, email: r.email, phone: r.phone, message: r.message, kind: r.kind, status: r.status, createdAt: r.created_at, office: r.offices?.name ?? '',
  }));
}
export interface ConnectionRow { id: string; officeId: string; name: string; kind: string; hint: string; active: boolean; lastRunAt: string | null; lastStatus: string | null; lastReceived: number | null; lastUpserted: number | null }
export async function myConnections(): Promise<ConnectionRow[]> {
  const { data } = await (await createClient()).from('feed_connections').select('id, office_id, name, kind, secret_hint, active, last_run_at, last_status, last_received, last_upserted').order('created_at', { ascending: false });
  return (data ?? []).map((r: Row) => ({ id: r.id, officeId: r.office_id, name: r.name, kind: r.kind, hint: r.secret_hint, active: r.active, lastRunAt: r.last_run_at, lastStatus: r.last_status, lastReceived: r.last_received, lastUpserted: r.last_upserted }));
}
export interface RunRow { id: string; connectionId: string; at: string; received: number; upserted: number; rejected: number; errors: { index: number; external_id?: string; reason: string }[] }
export async function recentRuns(): Promise<RunRow[]> {
  const { data } = await (await createClient()).from('feed_runs').select('*').order('at', { ascending: false }).limit(15);
  return (data ?? []).map((r: Row) => ({ id: r.id, connectionId: r.connection_id, at: r.at, received: r.received, upserted: r.upserted, rejected: r.rejected, errors: r.errors ?? [] }));
}
export interface ProfileRow { id: string; name: string; role: string; officeId: string | null; active: boolean }
export async function allProfiles(): Promise<ProfileRow[]> {
  const { data } = await (await createClient()).from('profiles').select('id, full_name, role, office_id, active').order('created_at');
  return (data ?? []).map((r: Row) => ({ id: r.id, name: r.full_name, role: r.role, officeId: r.office_id, active: r.active }));
}

// ───────────────────────── Bezichtigingen, berichten, contacten ─────────────────────────
export interface ViewingRow {
  id: string; listingId: string; listingSlug: string; listing: string; city: string; name: string; email: string; phone: string | null; note: string | null;
  startsAt: string; endsAt: string; status: string; source: string; byAccount: boolean; cancelledBy: string | null;
}
const mapViewing = (r: Row): ViewingRow => ({
  id: r.id, listingId: r.listing_id, listingSlug: r.listings?.slug ?? '', listing: r.listings ? `${r.listings.street} ${r.listings.house_number}${r.listings.house_suffix ?? ''}` : 'Woning', city: r.listings?.city ?? '',
  name: r.name, email: r.email, phone: r.phone, note: r.note, startsAt: r.starts_at, endsAt: r.ends_at, status: r.status, source: r.source, byAccount: Boolean(r.seeker_id), cancelledBy: r.cancelled_by,
});

export async function officeViewings(fromIso?: string, toIso?: string): Promise<ViewingRow[]> {
  let q = (await createClient()).from('viewings').select('*, listings(slug, street, house_number, house_suffix, city)').order('starts_at', { ascending: true }).limit(1000);
  if (fromIso) q = q.gte('starts_at', fromIso);
  if (toIso) q = q.lt('starts_at', toIso);
  const { data } = await q;
  return (data ?? []).map(mapViewing);
}

export interface RuleRow { id: string; officeId: string; weekday: number; start: string; end: string; slotMinutes: number; capacity: number }
export async function viewingRules(): Promise<RuleRow[]> {
  const { data } = await (await createClient()).from('viewing_rules').select('*').order('weekday').order('start_time');
  return (data ?? []).map((r: Row) => ({ id: r.id, officeId: r.office_id, weekday: r.weekday, start: String(r.start_time).slice(0, 5), end: String(r.end_time).slice(0, 5), slotMinutes: r.slot_minutes, capacity: r.capacity }));
}
export interface BlockRow { id: string; officeId: string; startsAt: string; endsAt: string; reason: string | null }
export async function viewingBlocks(): Promise<BlockRow[]> {
  const { data } = await (await createClient()).from('viewing_blocks').select('*').gte('ends_at', new Date().toISOString()).order('starts_at');
  return (data ?? []).map((r: Row) => ({ id: r.id, officeId: r.office_id, startsAt: r.starts_at, endsAt: r.ends_at, reason: r.reason }));
}

export interface StaffThread { id: string; listingSlug: string; address: string; city: string; name: string; email: string; phone: string | null; last: string; lastAt: string; lastFrom: 'zoeker' | 'makelaar'; unread: number; office: string }
export async function staffThreads(): Promise<StaffThread[]> {
  const supabase = await createClient();
  const [{ data }, { data: contacts }] = await Promise.all([
    supabase.from('conversations').select('id, last_message_at, listings(slug, street, house_number, city), offices(name), messages(body, sender, read_at, created_at)').order('last_message_at', { ascending: false }).limit(300),
    supabase.rpc('conversation_contacts'),
  ]);
  const who = new Map((contacts ?? []).map((c: Row) => [c.conversation_id, c]));
  return (data ?? []).map((c: Row) => {
    const msgs = [...(c.messages ?? [])].sort((a: Row, b: Row) => a.created_at.localeCompare(b.created_at));
    const last = msgs.at(-1);
    const p = who.get(c.id) as Row | undefined;
    return {
      id: c.id, listingSlug: c.listings?.slug ?? '', address: c.listings ? `${c.listings.street} ${c.listings.house_number}` : 'Woning', city: c.listings?.city ?? '',
      name: p?.full_name ?? 'Zoeker', email: p?.email ?? '', phone: p?.phone ?? null, last: last?.body ?? '', lastAt: c.last_message_at, lastFrom: last?.sender ?? 'zoeker',
      unread: msgs.filter((m: Row) => m.sender === 'zoeker' && !m.read_at).length, office: c.offices?.name ?? '',
    };
  });
}

export async function staffThread(id: string) {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const supabase = await createClient();
  const { data: c } = await supabase.from('conversations').select('id, listings(slug, street, house_number, city), messages(id, body, sender, read_at, created_at)').eq('id', id).maybeSingle();
  if (!c) return null;
  const { data: contacts } = await supabase.rpc('conversation_contacts');
  const p = (contacts ?? []).find((x: Row) => x.conversation_id === id) as Row | undefined;
  const messages = [...((c as Row).messages ?? [])].sort((a: Row, b: Row) => a.created_at.localeCompare(b.created_at));
  const l = (c as Row).listings;
  return {
    id: c.id, slug: l?.slug ?? '', address: l ? `${l.street} ${l.house_number}` : 'Woning', city: l?.city ?? '',
    name: p?.full_name ?? 'Zoeker', email: p?.email ?? '', phone: p?.phone ?? null,
    messages: messages.map((m: Row) => ({ id: m.id, sender: m.sender as 'zoeker' | 'makelaar', body: m.body as string, createdAt: m.created_at as string })),
    unread: messages.filter((m: Row) => m.sender === 'zoeker' && !m.read_at).length,
  };
}

export async function staffUnread(): Promise<number> {
  const { count } = await (await createClient()).from('messages').select('id', { count: 'exact', head: true }).eq('sender', 'zoeker').is('read_at', null);
  return count ?? 0;
}

// Eén persoon, uit alle plekken waar hij contact opnam: contactformulier, bezichtigingen en gesprekken.
export interface ContactEvent { at: string; kind: 'lead' | 'bezichtiging' | 'bericht'; title: string; detail: string; href?: string }
export interface Contact { email: string; name: string; phone: string | null; hasAccount: boolean; lastAt: string; leads: number; viewings: number; conversations: number; events: ContactEvent[] }

export function buildContacts(input: { leads: LeadRow[]; viewings: ViewingRow[]; threads: StaffThread[] }): Contact[] {
  const map = new Map<string, Contact>();
  const get = (email: string, name: string, phone: string | null) => {
    const key = email.toLowerCase();
    let c = map.get(key);
    if (!c) { c = { email: key, name, phone, hasAccount: false, lastAt: '', leads: 0, viewings: 0, conversations: 0, events: [] }; map.set(key, c); }
    if (!c.phone && phone) c.phone = phone;
    if (c.name.length < name.length && name !== 'Zoeker') c.name = name;
    return c;
  };
  for (const l of input.leads) {
    const c = get(l.email, l.name, l.phone); c.leads++;
    c.events.push({ at: l.createdAt, kind: 'lead', title: `${l.kind === 'bezichtiging' ? 'Bezichtiging gevraagd' : 'Vraag'} over ${l.listing}`, detail: l.message });
  }
  for (const v of input.viewings) {
    const c = get(v.email, v.name, v.phone); c.viewings++; if (v.byAccount) c.hasAccount = true;
    c.events.push({ at: v.startsAt, kind: 'bezichtiging', title: `Bezichtiging ${v.listing}, ${v.city}`, detail: v.status.replace('_', ' ') + (v.note ? ` · ${v.note}` : '') });
  }
  for (const t of input.threads) {
    if (!t.email) continue;
    const c = get(t.email, t.name, t.phone); c.conversations++; c.hasAccount = true;
    c.events.push({ at: t.lastAt, kind: 'bericht', title: `Gesprek over ${t.address}, ${t.city}`, detail: t.last, href: `/beheer/berichten/${t.id}` });
  }
  for (const c of map.values()) {
    c.events.sort((a, b) => b.at.localeCompare(a.at));
    c.lastAt = c.events[0]?.at ?? '';
  }
  return [...map.values()].sort((a, b) => b.lastAt.localeCompare(a.lastAt));
}

export interface BrokerRequestRow { id: string; officeName: string; city: string; province: string; kvk: string | null; nvm: boolean; contactName: string; email: string; phone: string | null; software: string | null; listingCount: number | null; message: string | null; status: string; createdAt: string }
export async function brokerRequests(): Promise<BrokerRequestRow[]> {
  const { data } = await (await createClient()).from('broker_requests').select('*').order('created_at', { ascending: false }).limit(300);
  return (data ?? []).map((r: Row) => ({ id: r.id, officeName: r.office_name, city: r.city, province: r.province, kvk: r.kvk, nvm: r.nvm_member, contactName: r.contact_name, email: r.email, phone: r.phone, software: r.software, listingCount: r.listing_count, message: r.message, status: r.status, createdAt: r.created_at }));
}

// ───────────────────────── Statistieken per woning ─────────────────────────
export interface StatTotals { impressions: number; views: number; saves: number; brochures: number }
export const NO_STATS: StatTotals = { impressions: 0, views: 0, saves: 0, brochures: 0 };
export const STAT_PERIODS = { '7': { days: 7, label: 'Laatste 7 dagen' }, '30': { days: 30, label: 'Laatste 30 dagen' }, alles: { days: null, label: 'Sinds plaatsing' } } as const;
export type StatPeriod = keyof typeof STAT_PERIODS;
export const parsePeriod = (v: unknown): StatPeriod => (v === '7' || v === 'alles' ? v : '30');

/** Totalen per woning; de database geeft alleen woningen van het eigen kantoor terug. */
export async function statTotals(days: number | null): Promise<Map<string, StatTotals>> {
  const { data } = await (await createClient()).rpc('listing_stats_totals', { p_days: days });
  return new Map((data ?? []).map((r: Row) => [r.listing_id as string, { impressions: Number(r.impressions), views: Number(r.views), saves: Number(r.saves), brochures: Number(r.brochures) }]));
}

export interface StatDay extends StatTotals { day: string }
/** Cijfers per dag voor één woning, oplopend, met de dagen zonder weergaven op nul. */
export async function listingStatDays(id: string, days: number | null): Promise<StatDay[]> {
  const { data } = await (await createClient()).from('listing_stats_daily').select('day, impressions, views, saves, brochures').eq('listing_id', id).order('day');
  const byDay = new Map((data ?? []).map((r: Row) => [r.day as string, { day: r.day as string, impressions: r.impressions, views: r.views, saves: r.saves, brochures: r.brochures } as StatDay]));
  const dayStr = (d: Date) => d.toISOString().slice(0, 10);
  const end = new Date();
  const first = days ? new Date(end.getTime() - (days - 1) * 86_400_000) : new Date(`${[...byDay.keys()][0] ?? dayStr(end)}T00:00:00Z`);
  const out: StatDay[] = [];
  for (let t = first.getTime(); dayStr(new Date(t)) <= dayStr(end) && out.length < 400; t += 86_400_000) {
    const k = dayStr(new Date(t));
    out.push(byDay.get(k) ?? { day: k, ...NO_STATS });
  }
  return out;
}

/** Berichten en bezichtigingen voor één woning in dezelfde periode (live uit leads en viewings). */
export async function listingResponses(id: string, days: number | null): Promise<{ leads: number; viewings: number }> {
  const supabase = await createClient();
  const since = days ? new Date(Date.now() - days * 86_400_000).toISOString() : null;
  let l = supabase.from('leads').select('id', { count: 'exact', head: true }).eq('listing_id', id);
  let v = supabase.from('viewings').select('id', { count: 'exact', head: true }).eq('listing_id', id).neq('status', 'geannuleerd');
  if (since) { l = l.gte('created_at', since); v = v.gte('created_at', since); }
  const [a, b] = await Promise.all([l, v]);
  return { leads: a.count ?? 0, viewings: b.count ?? 0 };
}
