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
