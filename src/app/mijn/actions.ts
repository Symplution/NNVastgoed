'use server';

import { revalidatePath } from 'next/cache';
import { address, formatDateTime } from '@/lib/format';
import { getListingById, getOffice } from '@/lib/data';
import { hasSupabase, siteUrl } from '@/lib/env';
import { getSeeker } from '@/lib/seeker';
import { createAnonClient } from '@/lib/supabase/anon';
import { createClient } from '@/lib/supabase/server';
import { sendMail } from '@/lib/usage';
import { validPhone } from '@/lib/lead-input';

export type MsgState = { ok?: boolean; error?: string; conversationId?: string } | undefined;
const UUID = /^[0-9a-f-]{36}$/i;

/** Een zoeker stuurt een bericht over een woning; het gesprek wordt zo nodig aangemaakt. */
export async function sendSeekerMessage(_: MsgState, form: FormData): Promise<MsgState> {
  const me = await getSeeker();
  if (!me) return { error: 'Log in om een bericht te sturen.' };
  const listingId = String(form.get('listingId') ?? '');
  const body = String(form.get('body') ?? '').trim();
  const name = String(form.get('name') ?? '').trim().slice(0, 120);
  const phone = String(form.get('phone') ?? '').trim();
  if (!UUID.test(listingId)) return { error: 'Deze woning is niet gevonden.' };
  if (name.length < 2) return { error: 'Vul je naam in.' };
  if (!validPhone(phone)) return { error: 'Vul je telefoonnummer in (minstens 8 cijfers).' };
  if (!me.email) return { error: 'Je account heeft geen e-mailadres. Log opnieuw in.' };
  if (!body || body.length > 4000) return { error: 'Schrijf een bericht (maximaal 4000 tekens).' };
  const supabase = await createClient();
  // Naam en telefoonnummer bewaren we in je profiel: zo ziet het kantoor wie je bent en hoeft het niet opnieuw.
  await supabase.from('profiles').update({ full_name: name, phone }).eq('id', me.id);

  let { data: conv } = await supabase.from('conversations').select('id').eq('listing_id', listingId).eq('seeker_id', me.id).maybeSingle();
  if (!conv) {
    const ins = await supabase.from('conversations').insert({ listing_id: listingId, office_id: listingId, seeker_id: me.id }).select('id').single();   // kantoor en zoeker komen uit de database
    if (ins.error) return { error: /niet beschikbaar/.test(ins.error.message) ? 'Deze woning is niet meer beschikbaar.' : 'Het gesprek kon niet worden gestart.' };
    conv = ins.data;
  }
  const { error } = await supabase.from('messages').insert({ conversation_id: conv!.id, sender: 'zoeker', body });
  if (error) return { error: /Te veel/.test(error.message) ? 'Je stuurt te veel berichten. Probeer het later opnieuw.' : 'Je bericht kon niet worden verstuurd.' };

  const l = await getListingById(listingId);
  const office = l ? await getOffice({ id: l.officeId }) : null;
  if (l && office) {
    // Hoogstens één mail per gesprek per uur: het kantoor ziet de rest in het beheer.
    const hour = new Date().toISOString().slice(0, 13);
    await sendMail({ to: office.email, officeId: office.id, replyTo: me.email, key: `bericht:${conv!.id}:${hour}`, subject: `Nieuw bericht over ${address(l)}, ${l.city}`,
      text: `${name} (${me.email}, ${phone}) schrijft over ${address(l)}, ${l.city}:\n\n${body}\n\nAntwoorden kan in het beheer: ${siteUrl()}/beheer/berichten/${conv!.id}` });
  }
  revalidatePath('/mijn/berichten');
  return { ok: true, conversationId: conv!.id };
}

/** Antwoorden in een bestaand gesprek (de zoeker). */
export async function seekerReply(_: MsgState, form: FormData): Promise<MsgState> {
  const me = await getSeeker();
  if (!me) return { error: 'Log in om te antwoorden.' };
  const id = String(form.get('conversationId') ?? '');
  const body = String(form.get('body') ?? '').trim();
  if (!UUID.test(id)) return { error: 'Dit gesprek bestaat niet.' };
  if (!body || body.length > 4000) return { error: 'Schrijf een bericht (maximaal 4000 tekens).' };
  const supabase = await createClient();
  const { data: conv } = await supabase.from('conversations').select('id, listing_id, office_id').eq('id', id).eq('seeker_id', me.id).maybeSingle();
  if (!conv) return { error: 'Dit gesprek bestaat niet.' };
  const { error } = await supabase.from('messages').insert({ conversation_id: id, sender: 'zoeker', body });
  if (error) return { error: 'Je bericht kon niet worden verstuurd.' };
  const office = await getOffice({ id: conv.office_id });
  const l = await getListingById(conv.listing_id);
  if (office && l) await sendMail({ to: office.email, officeId: office.id, replyTo: me.email, key: `bericht:${id}:${new Date().toISOString().slice(0, 13)}`, subject: `Nieuw bericht over ${address(l)}, ${l.city}`,
    text: `${me.name} schrijft:\n\n${body}\n\nAntwoorden kan in het beheer: ${siteUrl()}/beheer/berichten/${id}` });
  revalidatePath(`/mijn/berichten/${id}`);
  return { ok: true, conversationId: id };
}

export async function markSeekerRead(conversationId: string) {
  if (!UUID.test(conversationId)) return;
  const me = await getSeeker();
  if (!me) return;
  await (await createClient()).from('messages').update({ read_at: new Date().toISOString() }).eq('conversation_id', conversationId).eq('sender', 'makelaar').is('read_at', null);
  revalidatePath('/mijn', 'layout');
}

export async function toggleFavorite(listingId: string, on: boolean) {
  if (!UUID.test(listingId)) return;
  const me = await getSeeker();
  if (!me) return;
  const supabase = await createClient();
  if (on) await supabase.from('favorites').upsert({ user_id: me.id, listing_id: listingId }, { onConflict: 'user_id,listing_id', ignoreDuplicates: true });
  else await supabase.from('favorites').delete().eq('user_id', me.id).eq('listing_id', listingId);
  revalidatePath('/mijn/favorieten');
}

/** Bij het inloggen: wat een bezoeker al in zijn browser bewaarde gaat mee naar zijn account. */
export async function syncFavorites(ids: string[]) {
  const me = await getSeeker();
  const clean = ids.filter((i) => UUID.test(i)).slice(0, 50);
  if (!me || !clean.length) return;
  await (await createClient()).from('favorites').upsert(clean.map((listing_id) => ({ user_id: me.id, listing_id })), { onConflict: 'user_id,listing_id', ignoreDuplicates: true });
  revalidatePath('/mijn/favorieten');
}

/** Annuleren met de sleutel van de bezichtiging; ook voor gasten. Het kantoor krijgt een mail. */
export async function cancelViewingAction(form: FormData) {
  const token = String(form.get('token') ?? '');
  if (!UUID.test(token) || !hasSupabase()) return;
  const db = createAnonClient();
  const { data: before } = await db.rpc('get_viewing', { p_token: token });
  const v = Array.isArray(before) ? before[0] : before;
  const { data: ok } = await db.rpc('cancel_viewing', { p_token: token });
  if (ok && v) await sendMail({ to: v.office_email, key: `bez-geannuleerd:${v.id}`, subject: `Bezichtiging geannuleerd: ${v.address}, ${v.city}`,
    text: `${v.name} heeft de bezichtiging van ${formatDateTime(v.starts_at)} bij ${v.address}, ${v.city} geannuleerd. Het moment staat weer open op de site.\n\nBekijk het overzicht: ${siteUrl()}/beheer/bezichtigingen` });
  revalidatePath(`/bezichtiging/${token}`);
  revalidatePath('/mijn/bezichtigingen');
}

export async function myFavoriteIds(): Promise<string[]> {
  const me = await getSeeker();
  if (!me) return [];
  const { data } = await (await createClient()).from('favorites').select('listing_id').eq('user_id', me.id);
  return (data ?? []).map((r) => r.listing_id as string);
}

export async function saveProfile(form: FormData) {
  const me = await getSeeker();
  if (!me) return;
  const name = String(form.get('name') ?? '').trim().slice(0, 120);
  const phone = String(form.get('phone') ?? '').trim().slice(0, 40);
  if (name.length < 2) return;
  await (await createClient()).from('profiles').update({ full_name: name, phone: phone || null }).eq('id', me.id);
  revalidatePath('/mijn', 'layout');
}
