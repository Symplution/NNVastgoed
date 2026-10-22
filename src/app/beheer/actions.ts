'use server';

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { canWrite, isManager, requireStaff } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { validateListing } from '@/lib/listing-input';
import { slugify } from '@/lib/format';
import { geocodeAddress } from '@/lib/geo';
import { resolveProvince } from '@/lib/regions';
import { TOPPER_FEE } from '@/lib/pricing';

export type SaveState = { errors?: string[]; secret?: { id: string; value: string; name?: string; kind?: 'json' | 'xml'; officeName?: string; software?: string }; ok?: string } | undefined;
const refresh = () => revalidatePath('/', 'layout');
const uuid = (v: unknown) => (typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v) ? v : null);

/** Woning aanmaken of wijzigen. RLS zorgt dat een makelaar nooit buiten het eigen kantoor schrijft; hier alleen de nette foutmelding. */
export async function saveListing(id: string | null, _: SaveState, form: FormData): Promise<SaveState> {
  const staff = await requireStaff();
  if (!canWrite(staff)) return { errors: ['Je hebt alleen leesrechten.'] };
  const v = validateListing(form);
  if (!v.ok) return { errors: v.errors };
  // Zonder opgegeven coördinaten komt de kaartlocatie uit het adres.
  if (v.value.lat === null || v.value.lng === null) {
    const p = await geocodeAddress({ postcode: v.value.postcode, houseNumber: v.value.house_number, houseSuffix: v.value.house_suffix }).catch(() => null);
    if (p) { v.value.lat = p.lat; v.value.lng = p.lng; }
  }
  const supabase = await createClient();

  if (id) {
    if (!uuid(id)) return { errors: ['Deze woning bestaat niet.'] };
    const { data, error } = await supabase.from('listings').update(v.value).eq('id', id).select('id').maybeSingle();
    if (error || !data) return { errors: ['Opslaan is niet gelukt. Heb je rechten voor deze woning?'] };
  } else {
    const officeId = isManager(staff.role) ? uuid(form.get('office_id')) : staff.officeId;
    if (!officeId) return { errors: ['Kies een kantoor voor deze woning.'] };
    const slug = `${slugify(`${v.value.street} ${v.value.house_number}${v.value.house_suffix ?? ''} ${v.value.city}`)}-${randomBytes(3).toString('hex')}`;
    const { error } = await supabase.from('listings').insert({ ...v.value, office_id: officeId, slug, source: 'handmatig' });
    if (error) return { errors: ['Opslaan is niet gelukt. Controleer de velden en probeer het opnieuw.'] };
  }
  refresh();
  redirect('/beheer/woningen');
}

export async function deleteListing(form: FormData) {
  const staff = await requireStaff();
  const id = uuid(form.get('id'));
  if (!canWrite(staff) || !id) return;
  await (await createClient()).from('listings').delete().eq('id', id);
  refresh();
  redirect('/beheer/woningen');
}

/** Een makelaar vraagt Topper van de maand aan voor een woning van het eigen kantoor (RLS bepaalt welke). */
export async function requestTopper(form: FormData) {
  const staff = await requireStaff();
  const id = uuid(form.get('id'));
  if (!canWrite(staff) || !id) return;
  await (await createClient()).from('listings').update({ topper_requested_at: new Date().toISOString() }).eq('id', id);
  refresh();
}

/** Alleen eigenaar of beheerder zet een topper aan (een maand) of uit; de database dwingt dat ook af. */
export async function setTopper(form: FormData) {
  const staff = await requireStaff();
  const id = uuid(form.get('id'));
  if (!isManager(staff.role) || !id) return;
  const on = form.get('aan') === '1';
  const until = new Date(Date.now() + TOPPER_FEE.days * 86_400_000).toISOString().slice(0, 10);
  await (await createClient()).from('listings').update(on ? { topper_until: until, topper_requested_at: null } : { topper_until: null, topper_requested_at: null }).eq('id', id);
  refresh();
}

export async function setLeadStatus(form: FormData) {
  const staff = await requireStaff();
  const id = uuid(form.get('id')), status = String(form.get('status'));
  if (!canWrite(staff) || !id || !['nieuw', 'opgepakt', 'afgehandeld'].includes(status)) return;
  await (await createClient()).from('leads').update({ status }).eq('id', id);
  revalidatePath('/beheer/leads');
}

/** Nieuwe koppeling: de geheime sleutel wordt één keer getoond; in de database staat alleen de hash. */
export async function createConnection(_: SaveState, form: FormData): Promise<SaveState> {
  const staff = await requireStaff();
  if (!canWrite(staff)) return { errors: ['Je hebt alleen leesrechten.'] };
  const software = String(form.get('software') ?? 'realworks');
  const given = String(form.get('name') ?? '').trim();
  const name = software === 'realworks' ? 'Realworks' : given;
  const kind = form.get('kind') === 'xml' ? 'xml' : 'json';
  const officeId = isManager(staff.role) ? uuid(form.get('office_id')) ?? staff.officeId : staff.officeId;
  if (name.length < 2 || name.length > 80) return { errors: ['Geef de koppeling een naam (2 tot 80 tekens).'] };
  if (!officeId) return { errors: ['Kies een kantoor, of maak eerst je kantoor aan onder Mijn kantoor.'] };
  const secret = randomBytes(32).toString('base64url');
  const id = randomUUID();
  const supabase = await createClient();
  const { error } = await supabase.from('feed_connections').insert({
    id, office_id: officeId, name, kind, secret_hash: createHash('sha256').update(secret).digest('hex'), secret_hint: secret.slice(-4),
  });
  if (error) return { errors: ['De koppeling kon niet worden aangemaakt.'] };
  const { data: office } = await supabase.from('offices').select('name').eq('id', officeId).maybeSingle();
  revalidatePath('/beheer/koppelingen');
  return { secret: { id, value: secret, name, kind, officeName: office?.name ?? 'je kantoor', software } };
}

/** Nieuwe geheime sleutel voor een bestaande koppeling (de oude werkt meteen niet meer). */
export async function rotateConnectionKey(_: SaveState, form: FormData): Promise<SaveState> {
  const staff = await requireStaff();
  const id = uuid(form.get('id'));
  if (!canWrite(staff) || !id) return { errors: ['Je hebt hier geen rechten voor.'] };
  const secret = randomBytes(32).toString('base64url');
  const supabase = await createClient();
  const { data, error } = await supabase.from('feed_connections').update({ secret_hash: createHash('sha256').update(secret).digest('hex'), secret_hint: secret.slice(-4) }).eq('id', id).select('name, kind, offices(name)').maybeSingle();
  if (error || !data) return { errors: ['De sleutel kon niet worden vernieuwd.'] };
  revalidatePath('/beheer/koppelingen');
  return { secret: { id, value: secret, name: data.name, kind: data.kind === 'xml' ? 'xml' : 'json', officeName: (data as any).offices?.name ?? 'je kantoor' } };
}

export async function toggleConnection(form: FormData) {
  const staff = await requireStaff();
  const id = uuid(form.get('id'));
  if (!canWrite(staff) || !id) return;
  await (await createClient()).from('feed_connections').update({ active: form.get('active') === '1' }).eq('id', id);
  revalidatePath('/beheer/koppelingen');
}

export async function deleteConnection(form: FormData) {
  const staff = await requireStaff();
  const id = uuid(form.get('id'));
  if (!canWrite(staff) || !id) return;
  await (await createClient()).from('feed_connections').delete().eq('id', id);
  revalidatePath('/beheer/koppelingen');
}

const clean = (f: FormData, k: string, max: number) => String(f.get(k) ?? '').trim().slice(0, max);

/** Kantoorgegevens wijzigen (eigen kantoor), of als NNV-beheerder een nieuw kantoor aanmaken. */
export async function saveOffice(id: string | null, _: SaveState, form: FormData): Promise<SaveState> {
  const staff = await requireStaff();
  if (!canWrite(staff) || (!id && !isManager(staff.role))) return { errors: ['Je hebt hier geen rechten voor.'] };
  const province = resolveProvince(clean(form, 'province', 20));
  const data = {
    name: clean(form, 'name', 120), city: clean(form, 'city', 80), province, street: clean(form, 'street', 120) || null, postcode: clean(form, 'postcode', 10) || null,
    phone: clean(form, 'phone', 40) || null, email: clean(form, 'email', 200), website: clean(form, 'website', 200) || null, description: clean(form, 'description', 2000),
    logo_url: clean(form, 'logo_url', 500) || null,
    // Het NVM-lidmaatschap zet alleen NNV-beheer; voor anderen blijft het veld buiten de wijziging (en de database weigert het ook).
    ...(isManager(staff.role) ? { nvm_member: form.get('nvm_member') === 'on' } : {}),
  };
  const errors: string[] = [];
  if (data.name.length < 2) errors.push('Vul de naam van het kantoor in.');
  if (!data.city) errors.push('Vul de plaats in.');
  if (!province) errors.push('Kies een provincie.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) errors.push('Vul een geldig e-mailadres in.');
  if (data.website && !/^https:\/\/\S+$/.test(data.website)) errors.push('De website moet met https:// beginnen.');
  if (data.logo_url && !/^https:\/\/\S+$/.test(data.logo_url)) errors.push('Het logo moet een https-adres hebben.');
  if (errors.length) return { errors };
  const supabase = await createClient();
  if (id) {
    if (!uuid(id)) return { errors: ['Dit kantoor bestaat niet.'] };
    const { data: row, error } = await supabase.from('offices').update(data).eq('id', id).select('id').maybeSingle();
    if (error || !row) return { errors: ['Opslaan is niet gelukt.'] };
  } else {
    const slug = slugify(data.name) || randomBytes(3).toString('hex');
    const { data: created, error } = await supabase.from('offices').insert({ ...data, slug }).select('id').single();
    if (error || !created) return { errors: [/duplicate|unique/i.test(error?.message ?? '') ? 'Er bestaat al een kantoor met deze naam.' : 'Het kantoor kon niet worden aangemaakt.'] };
    // Meteen aan je eigen account koppelen (eigenaar of beheerder), zodat je direct verder kunt.
    if (form.get('link_to_me') === 'on' && isManager(staff.role)) {
      const { error: linkError } = await supabase.rpc('set_my_office', { p_office: created.id });
      if (linkError) { refresh(); return { errors: ['Het kantoor is aangemaakt, maar koppelen aan je account is niet gelukt. Kies het kantoor onder Alle kantoren.'] }; }
    }
  }
  refresh();
  return { ok: 'Opgeslagen.' };
}

/** Eigenaar of beheerder kiest een bestaand kantoor als het eigen kantoor. */
export async function claimOffice(form: FormData): Promise<void> {
  const staff = await requireStaff();
  const id = uuid(form.get('office_id'));
  if (!isManager(staff.role) || !id) return;
  await (await createClient()).rpc('set_my_office', { p_office: id });
  refresh();
  redirect('/beheer/kantoor');
}

/** Rol en kantoor van een gebruiker: alleen de eigenaar (de database dwingt dat ook af). */
export async function setProfile(form: FormData) {
  const staff = await requireStaff();
  const id = uuid(form.get('id'));
  const role = String(form.get('role'));
  if (staff.role !== 'owner' || !id || !['owner', 'admin', 'agent', 'readonly', 'seeker'].includes(role)) return;
  await (await createClient()).from('profiles').update({ role, office_id: uuid(form.get('office_id')), active: form.get('active') === '1' }).eq('id', id);
  revalidatePath('/beheer/gebruikers');
}

// ───────────────────────── Bezichtigingen en berichten ─────────────────────────
import { zonedToUtc } from '@/lib/viewings';
import { getListingById } from '@/lib/data';
import { formatDateTime, address as fmtAddress } from '@/lib/format';
import { siteUrl } from '@/lib/env';
import { sendMail } from '@/lib/usage';
import { createServiceClient } from '@/lib/supabase/service';

export async function setViewingStatus(form: FormData) {
  const staff = await requireStaff();
  const id = uuid(form.get('id')), status = String(form.get('status'));
  if (!canWrite(staff) || !id || !['bevestigd', 'geannuleerd', 'afgerond', 'niet_verschenen'].includes(status)) return;
  await (await createClient()).from('viewings').update({ status }).eq('id', id);
  revalidatePath('/beheer/bezichtigingen');
}

/** De makelaar plant zelf een bezichtiging in, bijvoorbeeld na een telefoontje. */
export async function addViewing(_: SaveState, form: FormData): Promise<SaveState> {
  const staff = await requireStaff();
  if (!canWrite(staff)) return { errors: ['Je hebt alleen leesrechten.'] };
  const listingId = uuid(form.get('listing_id'));
  const start = zonedToUtc(String(form.get('start') ?? ''));
  const minutes = Math.min(180, Math.max(10, Number(form.get('minutes')) || 30));
  const name = String(form.get('name') ?? '').trim(), email = String(form.get('email') ?? '').trim(), phone = String(form.get('phone') ?? '').trim(), note = String(form.get('note') ?? '').trim();
  const errors: string[] = [];
  if (!listingId) errors.push('Kies een woning.');
  if (!start) errors.push('Kies een datum en tijd.');
  if (name.length < 2) errors.push('Vul de naam in.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push('Vul een geldig e-mailadres in.');
  if (errors.length) return { errors };
  const end = new Date(start!.getTime() + minutes * 60_000);
  const { data: l } = await (await createClient()).from('listings').select('office_id').eq('id', listingId!).maybeSingle();
  if (!l) return { errors: ['Deze woning is niet gevonden.'] };
  const { data, error } = await (await createClient()).from('viewings').insert({
    listing_id: listingId, office_id: l.office_id, name, email: email.toLowerCase(), phone: phone || null, note: note || null,
    starts_at: start!.toISOString(), ends_at: end.toISOString(), source: 'makelaar', status: 'bevestigd',
  }).select('id, token').single();
  if (error) return { errors: [/duplicate|unique/i.test(error.message) ? 'Voor deze woning staat op dat moment al een bezichtiging.' : 'De bezichtiging kon niet worden ingepland.'] };
  const lst = await getListingById(listingId!);
  if (lst) await sendMail({ to: email, key: `bez-zoeker:${data.id}`, officeId: l.office_id, subject: `Bezichtiging bevestigd: ${fmtAddress(lst)}, ${lst.city}`,
    text: `Hallo ${name},\n\nje bezichtiging is bevestigd.\n\nWat: ${fmtAddress(lst)}, ${lst.postcode} ${lst.city}\nWanneer: ${formatDateTime(start!.toISOString())}\n\nAgenda, verzetten of annuleren: ${siteUrl()}/bezichtiging/${data.token}` });
  revalidatePath('/beheer/bezichtigingen');
  return { ok: 'Ingepland.' };
}

export async function addRule(form: FormData) {
  const staff = await requireStaff();
  const officeId = isManager(staff.role) ? uuid(form.get('office_id')) : staff.officeId;
  const weekday = Number(form.get('weekday')), slot = Number(form.get('slot_minutes')), cap = Number(form.get('capacity'));
  const start = String(form.get('start_time') ?? ''), end = String(form.get('end_time') ?? '');
  if (!canWrite(staff) || !officeId || !(weekday >= 1 && weekday <= 7) || !/^\d{2}:\d{2}$/.test(start) || !/^\d{2}:\d{2}$/.test(end) || end <= start) return;
  await (await createClient()).from('viewing_rules').insert({ office_id: officeId, weekday, start_time: start, end_time: end, slot_minutes: Math.min(180, Math.max(10, slot || 30)), capacity: Math.min(20, Math.max(1, cap || 1)) });
  revalidatePath('/beheer/bezichtigingen/beschikbaarheid');
}
export async function deleteRule(form: FormData) {
  const staff = await requireStaff(); const id = uuid(form.get('id'));
  if (!canWrite(staff) || !id) return;
  await (await createClient()).from('viewing_rules').delete().eq('id', id);
  revalidatePath('/beheer/bezichtigingen/beschikbaarheid');
}
export async function addBlock(form: FormData) {
  const staff = await requireStaff();
  const officeId = isManager(staff.role) ? uuid(form.get('office_id')) : staff.officeId;
  const from = zonedToUtc(String(form.get('from') ?? '')), to = zonedToUtc(String(form.get('to') ?? ''));
  if (!canWrite(staff) || !officeId || !from || !to || to <= from) return;
  await (await createClient()).from('viewing_blocks').insert({ office_id: officeId, starts_at: from.toISOString(), ends_at: to.toISOString(), reason: String(form.get('reason') ?? '').trim().slice(0, 200) || null });
  revalidatePath('/beheer/bezichtigingen/beschikbaarheid');
}
export async function deleteBlock(form: FormData) {
  const staff = await requireStaff(); const id = uuid(form.get('id'));
  if (!canWrite(staff) || !id) return;
  await (await createClient()).from('viewing_blocks').delete().eq('id', id);
  revalidatePath('/beheer/bezichtigingen/beschikbaarheid');
}

type ReplyState = { ok?: boolean; error?: string } | undefined;

/** Het kantoor antwoordt in een gesprek; de zoeker krijgt een mail (hoogstens één per gesprek per uur). */
export async function officeReply(_: ReplyState, form: FormData): Promise<ReplyState> {
  const staff = await requireStaff();
  if (!canWrite(staff)) return { error: 'Je hebt alleen leesrechten.' };
  const id = uuid(form.get('conversationId')), body = String(form.get('body') ?? '').trim();
  if (!id) return { error: 'Dit gesprek bestaat niet.' };
  if (!body || body.length > 4000) return { error: 'Schrijf een bericht (maximaal 4000 tekens).' };
  const supabase = await createClient();
  const { data: conv } = await supabase.from('conversations').select('id, seeker_id, listing_id').eq('id', id).maybeSingle();
  if (!conv) return { error: 'Dit gesprek bestaat niet.' };
  const { error } = await supabase.from('messages').insert({ conversation_id: id, sender: 'makelaar', body });
  if (error) return { error: 'Het bericht kon niet worden verstuurd.' };
  // Het e-mailadres van de zoeker staat in het account; alleen de server (met de service key) leest het, uitsluitend voor deze mail.
  try {
    const { data: u } = await createServiceClient().auth.admin.getUserById(conv.seeker_id);
    const l = await getListingById(conv.listing_id);
    if (u.user?.email && l) await sendMail({ to: u.user.email, key: `antwoord:${id}:${new Date().toISOString().slice(0, 13)}`, subject: `Antwoord van de makelaar over ${fmtAddress(l)}, ${l.city}`,
      text: `Je hebt een nieuw bericht over ${fmtAddress(l)}, ${l.city}:\n\n${body}\n\nAntwoorden kan in Mijn NNV: ${siteUrl()}/mijn/berichten/${id}` });
  } catch { /* zonder service key geen mail; het bericht staat er wel */ }
  revalidatePath(`/beheer/berichten/${id}`);
  return { ok: true };
}

export async function markOfficeRead(conversationId: string) {
  const staff = await requireStaff();
  if (!canWrite(staff) || !uuid(conversationId)) return;
  await (await createClient()).from('messages').update({ read_at: new Date().toISOString() }).eq('conversation_id', conversationId).eq('sender', 'zoeker').is('read_at', null);
  revalidatePath('/beheer', 'layout');
}

/** Maakt uit een aanmelding het kantoor aan (met de gegevens van de aanvraag) en zet de aanvraag op Aangesloten. Alleen eigenaar of beheerder. */
export async function createOfficeFromRequest(form: FormData): Promise<void> {
  const staff = await requireStaff();
  const id = uuid(form.get('id'));
  if (!isManager(staff.role) || !id) return;
  const supabase = await createClient();
  const { data: r } = await supabase.from('broker_requests').select('office_name, city, province, email, phone').eq('id', id).maybeSingle();
  if (!r) return;
  const base = slugify(r.office_name) || randomBytes(3).toString('hex');
  const { data: existing } = await supabase.from('offices').select('id').eq('slug', base).maybeSingle();
  if (!existing) {
    const { error } = await supabase.from('offices').insert({
      slug: base, name: r.office_name, city: r.city, province: r.province, email: r.email, phone: r.phone || null, description: '',
      // Het NVM-lidmaatschap zet NNV-beheer pas na controle; de aanvraag alleen is geen bewijs.
      nvm_member: false,
    });
    if (error) return;
  }
  await supabase.from('broker_requests').update({ status: 'aangesloten' }).eq('id', id);
  refresh();
  revalidatePath('/beheer/aanmeldingen');
}

const REQUEST_STATUS = ['nieuw', 'in_behandeling', 'aangesloten', 'afgewezen'];
/** Status van een aanmelding van een makelaar. Alleen eigenaar en beheerder; RLS dwingt dat ook in de database af. */
export async function setBrokerRequestStatus(form: FormData): Promise<void> {
  const staff = await requireStaff();
  if (!isManager(staff.role)) return;
  const id = uuid(form.get('id')), status = String(form.get('status') ?? '');
  if (!id || !REQUEST_STATUS.includes(status)) return;
  await (await createClient()).from('broker_requests').update({ status }).eq('id', id);
  revalidatePath('/beheer/aanmeldingen');
}
