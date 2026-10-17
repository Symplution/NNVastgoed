import 'server-only';
import { hasService } from './env';
import { evaluateGate } from './usage-gate';
import { createServiceClient } from './supabase/service';

// De usage gate (CLAUDE.md regel 4): elke uitgaande mail gaat hierdoor: maandbudget, uurlimiet, unieke sleutel, loggen naar usage_events.
// Dezelfde poort wordt later gebruikt voor de AI-departments (kind 'ai').
export interface Mail { to: string; subject: string; text: string; key: string; officeId?: string; replyTo?: string }
export type MailResult = 'verzonden' | 'overgeslagen' | 'dubbel' | 'maandbudget' | 'uurlimiet' | 'mislukt';

const limit = (name: string, fallback: number) => { const n = Number(process.env[name]); return Number.isFinite(n) && n > 0 ? n : fallback; };

export async function sendMail(m: Mail): Promise<MailResult> {
  if (!hasService() || !process.env.RESEND_API_KEY || !process.env.MAIL_FROM) return 'overgeslagen';
  const db = createServiceClient();
  const monthStart = new Date(); monthStart.setUTCDate(1); monthStart.setUTCHours(0, 0, 0, 0);
  const [{ count: monthCount }, { count: hourCount }] = await Promise.all([
    db.from('usage_events').select('id', { count: 'exact', head: true }).eq('kind', 'mail').gte('created_at', monthStart.toISOString()),
    db.from('usage_events').select('id', { count: 'exact', head: true }).eq('kind', 'mail').gte('created_at', new Date(Date.now() - 3_600_000).toISOString()),
  ]);
  const verdict = evaluateGate({ monthCount: monthCount ?? 0, hourCount: hourCount ?? 0, monthLimit: limit('MAIL_MONTHLY_LIMIT', 2000), hourLimit: limit('MAIL_HOURLY_LIMIT', 200) });
  if (verdict !== 'ok') return verdict;

  // Eerst vastleggen (unieke sleutel), dan pas versturen: nooit twee keer dezelfde mail.
  const { error } = await db.from('usage_events').insert({ kind: 'mail', unique_key: m.key, office_id: m.officeId ?? null, detail: { subject: m.subject } });
  if (error) return error.code === '23505' ? 'dubbel' : 'mislukt';

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.MAIL_FROM, to: [m.to], subject: m.subject, text: m.text, ...(m.replyTo ? { reply_to: m.replyTo } : {}) }),
  }).catch(() => null);
  if (!res?.ok) {
    await db.from('usage_events').update({ detail: { subject: m.subject, fout: res ? res.status : 'netwerk' } }).eq('unique_key', m.key);
    return 'mislukt';
  }
  return 'verzonden';
}
