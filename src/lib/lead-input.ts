export interface LeadInput { listingId: string; name: string; email: string; phone?: string; message: string; kind: 'info' | 'bezichtiging'; consent: boolean }
export type LeadResult = { ok: true; value: LeadInput } | { ok: false; error: string };

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Controle van het contactformulier. Het verborgen veld "website" is een val voor bots. */
export function validateLead(form: FormData): LeadResult | { ok: false; error: string; bot: true } {
  if (String(form.get('website') ?? '').trim()) return { ok: false, error: 'Verzonden.', bot: true };
  const listingId = String(form.get('listingId') ?? '');
  const name = String(form.get('name') ?? '').trim();
  const email = String(form.get('email') ?? '').trim();
  const phone = String(form.get('phone') ?? '').trim();
  const message = String(form.get('message') ?? '').trim();
  const kind = form.get('kind') === 'bezichtiging' ? 'bezichtiging' : 'info';
  if (!/^[A-Za-z0-9-]{1,40}$/.test(listingId)) return { ok: false, error: 'Deze woning is niet gevonden.' };
  if (name.length < 2 || name.length > 120) return { ok: false, error: 'Vul je naam in.' };
  if (!EMAIL.test(email) || email.length > 200) return { ok: false, error: 'Vul een geldig e-mailadres in.' };
  if (phone.length > 40) return { ok: false, error: 'Dit telefoonnummer is te lang.' };
  if (!message || message.length > 2000) return { ok: false, error: 'Schrijf een bericht (maximaal 2000 tekens).' };
  if (form.get('consent') !== 'on') return { ok: false, error: 'Ga akkoord met de privacyverklaring om je bericht te versturen.' };
  return { ok: true, value: { listingId, name, email, phone: phone || undefined, message, kind, consent: true } };
}
