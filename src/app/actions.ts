'use server';

import { randomUUID } from 'node:crypto';
import { hasSupabase, isDemo, siteUrl } from '@/lib/env';
import { createAnonClient } from '@/lib/supabase/anon';
import { validateLead } from '@/lib/lead-input';
import { filtersToParams, parseFilters } from '@/lib/search';
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
  const qs = filtersToParams({ ...parseFilters(new URLSearchParams(String(form.get('qs') ?? ''))), page: 1, sort: 'nieuw' }).toString();

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
