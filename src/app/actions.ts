'use server';

import { randomUUID } from 'node:crypto';
import { hasSupabase, isDemo, siteUrl } from '@/lib/env';
import { createAnonClient } from '@/lib/supabase/anon';
import { validateLead } from '@/lib/lead-input';
import { validateBrokerRequest } from '@/lib/broker-input';
import { filtersToParams, modeFromParams, parseFilters } from '@/lib/search';
import { getOffice } from '@/lib/data';
import { sendMail } from '@/lib/usage';

export type FormState = { ok?: boolean; error?: string; message?: string } | undefined;

/** Contactverzoek bij een woning. Het kantoor komt uit de woning (database-trigger), nooit uit het formulier. */
export async function submitLead(_: FormState, form: FormData): Promise<FormState> {
  const v = validateLead(form);
  if (!v.ok) return 'bot' in v ? { ok: true, message: 'Bedankt! Het kantoor neemt snel contact met je op.' } : { error: v.error };
  const lead = v.value;
  if (isDemo()) return { ok: true, message: 'Demo: je bericht is niet verstuurd. In de echte site komt het direct bij de makelaar.' };
  if (!hasSupabase()) return { error: 'Verzenden is nu niet mogelijk. Probeer het later opnieuw.' };

  const id = randomUUID();
  const db = createAnonClient();
  const { error } = await db.from('leads').insert({
    id, listing_id: lead.listingId, office_id: lead.listingId /* wordt door de database overschreven */, name: lead.name, email: lead.email,
    phone: lead.phone ?? null, message: lead.message, kind: lead.kind, consent: true,
  });
  if (error) {
    if (/Te veel/.test(error.message)) return { error: 'Je hebt te vaak een bericht gestuurd. Probeer het later opnieuw.' };
    if (/niet beschikbaar/.test(error.message)) return { error: 'Deze woning is niet meer beschikbaar.' };
    return { error: 'Je bericht kon niet worden verstuurd. Controleer je gegevens en probeer het opnieuw.' };
  }

  // Het kantoor krijgt direct een mail (best effort, via de usage gate). Het verzoek staat sowieso in het beheer.
  const { data: l } = await db.from('listings').select('office_id, street, house_number, city').eq('id', lead.listingId).maybeSingle();
  const office = l ? await getOffice({ id: l.office_id }) : null;
  if (office && l) {
    await sendMail({
      to: office.email, replyTo: lead.email, key: `lead:${id}`, officeId: office.id,
      subject: `${lead.kind === 'bezichtiging' ? 'Bezichtiging aangevraagd' : 'Vraag'} over ${l.street} ${l.house_number}, ${l.city}`,
      text: `${lead.name} (${lead.email}${lead.phone ? `, ${lead.phone}` : ''}) schrijft:\n\n${lead.message}\n\nBeantwoord deze mail of open het verzoek in het beheer: ${siteUrl()}/beheer/leads`,
    });
  }
  return { ok: true, message: 'Bedankt! Het kantoor neemt snel contact met je op.' };
}

/** Zoekopdracht opslaan voor een e-mailalert. Dubbele opt-in: pas na de bevestigingsmail is hij actief. */
export async function saveSearch(_: FormState, form: FormData): Promise<FormState> {
  const email = String(form.get('email') ?? '').trim();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) return { error: 'Vul een geldig e-mailadres in.' };
  if (form.get('consent') !== 'on') return { error: 'Ga akkoord met de privacyverklaring om meldingen te ontvangen.' };
  if (String(form.get('website') ?? '').trim()) return { ok: true, message: 'Check je mail om te bevestigen.' };
  // Opnieuw opgebouwd uit de gevalideerde filters, dus nooit zomaar wat de browser stuurde.
  const raw = new URLSearchParams(String(form.get('qs') ?? ''));
  const qs = filtersToParams({ ...parseFilters(raw, modeFromParams(raw)), page: 1, sort: 'nieuw' }).toString();

  if (isDemo()) return { ok: true, message: 'Demo: er is geen mail verstuurd.' };
  if (!hasSupabase()) return { error: 'Opslaan is nu niet mogelijk. Probeer het later opnieuw.' };
  const token = randomUUID();
  const { error } = await createAnonClient().from('saved_searches').insert({ email, filters: { qs }, token });
  if (error) return { error: /Te veel/.test(error.message) ? 'Je hebt al meerdere zoekopdrachten opgeslagen met dit adres. Probeer het morgen opnieuw.' : 'Opslaan is niet gelukt. Probeer het opnieuw.' };

  await sendMail({
    to: email, key: `bevestig:${token}`, subject: 'Bevestig je zoekopdracht bij NNvastgoed',
    text: `Je krijgt een mail zodra er nieuwe woningen zijn die bij je zoekopdracht passen.\n\nBevestig je e-mailadres: ${siteUrl()}/zoekopdracht/bevestig?token=${token}\n\nAfmelden kan altijd: ${siteUrl()}/zoekopdracht/stop?token=${token}\n\nHeb je dit niet aangevraagd? Dan hoef je niets te doen.`,
  });
  return { ok: true, message: 'Check je mail en bevestig je e-mailadres om meldingen te ontvangen.' };
}

/** Aanmelding van een makelaarskantoor. Iedereen mag aanmelden; alleen eigenaar en beheerder lezen de aanmeldingen. */
export async function submitBrokerRequest(_: FormState, form: FormData): Promise<FormState> {
  const v = validateBrokerRequest(form);
  const done = { ok: true, message: 'Bedankt voor je aanmelding! We nemen binnen twee werkdagen contact met je op om je kantoor aan te sluiten.' };
  if (!v.ok) return v.bot ? done : { error: v.error };
  const b = v.value;
  if (isDemo()) return { ok: true, message: 'Demo: je aanmelding is niet verstuurd. In de echte site komt hij direct bij het beheer van NNvastgoed.' };
  if (!hasSupabase()) return { error: 'Aanmelden is nu niet mogelijk. Probeer het later opnieuw.' };
  const { error } = await createAnonClient().from('broker_requests').insert({
    office_name: b.officeName, city: b.city, province: b.province, kvk: b.kvk ?? null, nvm_member: b.nvm, contact_name: b.contactName, email: b.email,
    phone: b.phone ?? null, software: b.software ?? null, listing_count: b.listingCount ?? null, message: b.message ?? null, consent: true,
  });
  if (error) return { error: /Te veel/.test(error.message) ? 'Er zijn al meerdere aanmeldingen met dit adres verstuurd. Probeer het later opnieuw.' : 'Aanmelden is niet gelukt. Controleer je gegevens en probeer het opnieuw.' };
  const to = process.env.NEXT_PUBLIC_CONTACT_EMAIL;
  if (to) await sendMail({ to, replyTo: b.email, key: `aanmelding:${b.email}:${new Date().toISOString().slice(0, 10)}`, subject: `Nieuwe aanmelding makelaar: ${b.officeName}, ${b.city}`, text: `${b.contactName} (${b.email}${b.phone ? `, ${b.phone}` : ''}) meldt ${b.officeName} aan.\n\nBekijk de aanmelding: ${siteUrl()}/beheer/aanmeldingen` });
  return done;
}

// ───────────────────────── Bezichtigingen ─────────────────────────
import { getSeeker } from '@/lib/seeker';
import { createClient } from '@/lib/supabase/server';
import { demoSlots, type Slot } from '@/lib/viewings';
import { address, formatDateTime } from '@/lib/format';
import { getListingById } from '@/lib/data';

/** Vrije momenten voor een woning. De pagina zelf is gecachet, dus dit wordt per bezoek opgehaald. */
export async function getViewingSlots(listingId: string): Promise<{ slots: Slot[]; error?: string }> {
  if (!/^[A-Za-z0-9-]{1,40}$/.test(listingId)) return { slots: [] };
  if (isDemo()) return { slots: demoSlots() };
  if (!hasSupabase()) return { slots: [] };
  const { data, error } = await createAnonClient().rpc('viewing_slots', { p_listing: listingId, p_days: 21 });
  if (error) return { slots: [], error: 'De momenten konden niet worden opgehaald.' };
  return { slots: (data ?? []).map((r: { slot_start: string; slot_end: string }) => ({ start: r.slot_start, end: r.slot_end })) };
}

/** Naam, e-mail en telefoon van de ingelogde zoeker, om het formulier in te vullen. */
export async function getMyContact(): Promise<{ name: string; email: string; phone: string } | null> {
  const me = await getSeeker();
  return me ? { name: me.name, email: me.email, phone: me.phone ?? '' } : null;
}

export type BookState = { ok?: boolean; error?: string; token?: string; label?: string; start?: string } | undefined;

export async function bookViewing(_: BookState, form: FormData): Promise<BookState> {
  if (String(form.get('website') ?? '').trim()) return { ok: true, label: 'Je bezichtiging is bevestigd.' };   // bot
  const listingId = String(form.get('listingId') ?? '');
  const start = String(form.get('start') ?? '');
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const phone = String(form.get('phone') ?? '').trim();
  const note = String(form.get('note') ?? '').trim();
  if (!/^[A-Za-z0-9-]{1,40}$/.test(listingId) || Number.isNaN(Date.parse(start))) return { error: 'Kies eerst een moment.' };
  if (name.length < 2 || name.length > 120) return { error: 'Vul je naam in.' };
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 200) return { error: 'Vul een geldig e-mailadres in.' };
  if (phone.length > 40 || note.length > 1000) return { error: 'Het telefoonnummer of de opmerking is te lang.' };
  if (form.get('consent') !== 'on') return { error: 'Ga akkoord met de privacyverklaring om te boeken.' };

  if (isDemo()) return { ok: true, token: 'demo', start, label: `Demo: ${formatDateTime(start)}. Er is niets ingepland en er is geen mail verstuurd.` };
  if (!hasSupabase()) return { error: 'Inplannen is nu niet mogelijk. Probeer het later opnieuw.' };

  // Met de sessie van de bezoeker: een ingelogde zoeker krijgt de bezichtiging in Mijn NNV, een gast niet.
  const { data, error } = await (await createClient()).rpc('book_viewing', { p_listing: listingId, p_starts_at: start, p_name: name, p_email: email, p_phone: phone || null, p_note: note || null });
  if (error) {
    if (/niet meer beschikbaar/.test(error.message)) return { error: 'Dit moment is net door iemand anders gekozen. Kies een ander moment.' };
    if (/Te veel|zes bezichtigingen/.test(error.message)) return { error: error.message.replace(/^.*?(Te veel|Je hebt)/, '$1') };
    return { error: 'Inplannen is niet gelukt. Probeer het opnieuw.' };
  }
  const row = Array.isArray(data) ? data[0] : data;
  const l = await getListingById(listingId);
  const office = l ? await getOffice({ id: l.officeId }) : null;
  const when = formatDateTime(row.out_start);
  const where = l ? `${address(l)}, ${l.postcode} ${l.city}` : 'de woning';
  const link = `${siteUrl()}/bezichtiging/${row.out_token}`;
  await Promise.all([
    sendMail({ to: email, key: `bez-zoeker:${row.out_id}`, officeId: office?.id, replyTo: office?.email, subject: `Bezichtiging bevestigd: ${where}`,
      text: `Hallo ${name},\n\nje bezichtiging is bevestigd.\n\nWat: ${where}\nWanneer: ${when}\nMakelaar: ${office?.name ?? ''}${office?.phone ? ` (${office.phone})` : ''}\n\nToevoegen aan je agenda, verzetten of annuleren: ${link}\n\nTot dan!` }),
    office && sendMail({ to: office.email, replyTo: email, key: `bez-kantoor:${row.out_id}`, officeId: office.id, subject: `Nieuwe bezichtiging: ${where}, ${when}`,
      text: `${name} (${email}${phone ? `, ${phone}` : ''}) heeft een bezichtiging ingepland.\n\nWoning: ${where}\nWanneer: ${when}${note ? `\nOpmerking: ${note}` : ''}\n\nBekijk alle bezichtigingen: ${siteUrl()}/beheer/bezichtigingen` }),
  ]);
  return { ok: true, token: row.out_token, start: row.out_start, label: `Je bezichtiging is bevestigd: ${when}.` };
}
