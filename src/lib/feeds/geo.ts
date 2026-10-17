import { createAnonClient } from '../supabase/anon';
import { geocodeAddress, type Point } from '../geo';

/**
 * Zoekt de kaartlocatie op van woningen uit een koppeling die nog geen coördinaten hebben en bewaart ze.
 * Gaat met de sleutel van de koppeling; binnen een vast tijdsbudget, de rest volgt bij de volgende aanroep.
 */
export async function fillMissingGeo(connectionId: string, secretHash: string, budgetMs = 12_000): Promise<{ found: number; todo: number }> {
  const db = createAnonClient();
  const { data } = await db.rpc('feed_listings_without_geo', { p_connection: connectionId, p_secret_hash: secretHash, p_limit: 100 });
  const todo = (data ?? []) as { listing_id: string; postcode: string; house_number: string; house_suffix: string | null }[];
  if (!todo.length) return { found: 0, todo: 0 };
  const started = Date.now();
  const updates: { id: string; lat: number; lng: number }[] = [];
  for (let i = 0; i < todo.length && Date.now() - started < budgetMs; i += 8) {
    const batch = todo.slice(i, i + 8);
    const points = await Promise.all(batch.map((t) => geocodeAddress({ postcode: t.postcode, houseNumber: t.house_number, houseSuffix: t.house_suffix }).catch((): Point | null => null)));
    batch.forEach((t, k) => { const p = points[k]; if (p) updates.push({ id: t.listing_id, lat: p.lat, lng: p.lng }); });
  }
  if (updates.length) await db.rpc('feed_set_geo', { p_connection: connectionId, p_secret_hash: secretHash, p_updates: updates });
  return { found: updates.length, todo: todo.length };
}
