'use server';

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { canWrite, isManager, requireStaff } from '@/lib/auth';
import { createClient } from '@/lib/supabase/server';
import { validateListing } from '@/lib/listing-input';
import { slugify } from '@/lib/format';
import { resolveProvince } from '@/lib/regions';

export type SaveState = { errors?: string[]; secret?: { id: string; value: string }; ok?: string } | undefined;
const refresh = () => revalidatePath('/', 'layout');
const uuid = (v: unknown) => (typeof v === 'string' && /^[0-9a-f-]{36}$/i.test(v) ? v : null);

/** Woning aanmaken of wijzigen. RLS zorgt dat een makelaar nooit buiten het eigen kantoor schrijft; hier alleen de nette foutmelding. */
export async function saveListing(id: string | null, _: SaveState, form: FormData): Promise<SaveState> {
  const staff = await requireStaff();
  if (!canWrite(staff)) return { errors: ['Je hebt alleen leesrechten.'] };
  const v = validateListing(form);
  if (!v.ok) return { errors: v.errors };
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
  const name = String(form.get('name') ?? '').trim();
  const kind = form.get('kind') === 'xml' ? 'xml' : 'json';
  const officeId = isManager(staff.role) ? uuid(form.get('office_id')) : staff.officeId;
  if (name.length < 2 || name.length > 80) return { errors: ['Geef de koppeling een naam (2 tot 80 tekens).'] };
  if (!officeId) return { errors: ['Kies een kantoor.'] };
  const secret = randomBytes(32).toString('base64url');
  const id = randomUUID();
  const { error } = await (await createClient()).from('feed_connections').insert({
    id, office_id: officeId, name, kind, secret_hash: createHash('sha256').update(secret).digest('hex'), secret_hint: secret.slice(-4),
  });
  if (error) return { errors: ['De koppeling kon niet worden aangemaakt.'] };
  revalidatePath('/beheer/koppelingen');
  return { secret: { id, value: secret } };
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
  };
  const errors: string[] = [];
  if (data.name.length < 2) errors.push('Vul de naam van het kantoor in.');
  if (!data.city) errors.push('Vul de plaats in.');
  if (!province) errors.push('Kies een provincie.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(data.email)) errors.push('Vul een geldig e-mailadres in.');
  if (data.website && !/^https:\/\/\S+$/.test(data.website)) errors.push('De website moet met https:// beginnen.');
  if (errors.length) return { errors };
  const supabase = await createClient();
  if (id) {
    if (!uuid(id)) return { errors: ['Dit kantoor bestaat niet.'] };
    const { data: row, error } = await supabase.from('offices').update(data).eq('id', id).select('id').maybeSingle();
    if (error || !row) return { errors: ['Opslaan is niet gelukt.'] };
  } else {
    const slug = slugify(data.name) || randomBytes(3).toString('hex');
    const { error } = await supabase.from('offices').insert({ ...data, slug });
    if (error) return { errors: [/duplicate|unique/i.test(error.message) ? 'Er bestaat al een kantoor met deze naam.' : 'Het kantoor kon niet worden aangemaakt.'] };
  }
  refresh();
  return { ok: 'Opgeslagen.' };
}

/** Rol en kantoor van een gebruiker: alleen de eigenaar (de database dwingt dat ook af). */
export async function setProfile(form: FormData) {
  const staff = await requireStaff();
  const id = uuid(form.get('id'));
  const role = String(form.get('role'));
  if (staff.role !== 'owner' || !id || !['owner', 'admin', 'agent', 'readonly'].includes(role)) return;
  await (await createClient()).from('profiles').update({ role, office_id: uuid(form.get('office_id')), active: form.get('active') === '1' }).eq('id', id);
  revalidatePath('/beheer/gebruikers');
}
