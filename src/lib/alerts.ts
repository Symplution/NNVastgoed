import 'server-only';
import { mapListing } from './data';
import { siteUrl } from './env';
import { formatPrice, address, TYPE_LABEL, formatEuro } from './format';
import { parseFilters, describeFilters, modeFromParams, MODE_INFO } from './search';
import { newMatches } from './alert-match';
import { provinceName } from './regions';
import { createServiceClient } from './supabase/service';
import { sendMail } from './usage';
import { PUBLIC_STATUSES, type Listing } from './types';

export const alertText = (qs: string, found: Listing[], token: string) => {
  const f = parseFilters(new URLSearchParams(qs), modeFromParams(new URLSearchParams(qs)));
  const lines = found.slice(0, 10).map((l) => `• ${address(l)}, ${l.city} — ${formatPrice(l)}, ${l.livingArea} m², ${l.rooms} kamers\n  ${siteUrl()}/woning/${l.slug}`);
  return `Nieuw bij NNvastgoed voor je zoekopdracht (${describeFilters(f, formatEuro, provinceName, (t) => TYPE_LABEL[t])}):\n\n${lines.join('\n\n')}${found.length > 10 ? `\n\n… en nog ${found.length - 10} woningen: ${siteUrl()}${MODE_INFO[f.mode].path}?${qs}` : ''}\n\nAfmelden: ${siteUrl()}/zoekopdracht/stop?token=${token}`;
};

/** Eén ronde: draait dagelijks via de cron-route. Elke mail gaat door de usage gate. */
export async function sendAlerts(): Promise<{ checked: number; sent: number }> {
  const db = createServiceClient();
  const { data: searches } = await db.from('saved_searches').select('id, email, filters, token, last_sent_at, confirmed_at').not('confirmed_at', 'is', null).is('unsubscribed_at', null).limit(1000);
  if (!searches?.length) return { checked: 0, sent: 0 };
  const oldest = searches.reduce((m, s) => ((s.last_sent_at ?? s.confirmed_at) < m ? (s.last_sent_at ?? s.confirmed_at) : m), new Date().toISOString());
  const { data: rows } = await db.from('listings').select('*').in('status', PUBLIC_STATUSES).gt('published_at', oldest).limit(2000);
  const listings = (rows ?? []).map(mapListing);
  const day = new Date().toISOString().slice(0, 10);
  let sent = 0;
  for (const s of searches) {
    const since = s.last_sent_at ?? s.confirmed_at;
    const qs = String((s.filters as { qs?: string }).qs ?? '');
    const found = newMatches(listings, qs, since);
    if (!found.length) continue;
    const r = await sendMail({ to: s.email, key: `alert:${s.id}:${day}`, subject: `${found.length} nieuwe ${found.length === 1 ? 'woning' : 'woningen'} bij NNvastgoed`, text: alertText(qs, found, s.token) });
    if (r === 'verzonden') { sent++; await db.from('saved_searches').update({ last_sent_at: new Date().toISOString() }).eq('id', s.id); }
    if (r === 'maandbudget' || r === 'uurlimiet') break;
  }
  return { checked: searches.length, sent };
}
