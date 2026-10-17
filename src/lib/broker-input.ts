import { isProvince } from './regions';
import type { Province } from './types';

export interface BrokerRequestInput {
  officeName: string; city: string; province: Province; kvk?: string; nvm: boolean; contactName: string; email: string;
  phone?: string; software?: string; listingCount?: number; message?: string;
}
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Controle van het aanmeldformulier voor makelaars. Het verborgen veld "website" is een val voor bots. */
export function validateBrokerRequest(form: FormData): { ok: true; value: BrokerRequestInput } | { ok: false; error: string; bot?: true } {
  if (String(form.get('website') ?? '').trim()) return { ok: false, error: 'Verzonden.', bot: true };
  const s = (k: string) => String(form.get(k) ?? '').trim();
  const officeName = s('office_name'), city = s('city'), kvk = s('kvk').replace(/\s/g, ''), contactName = s('contact_name'), email = s('email');
  const phone = s('phone'), software = s('software'), message = s('message'), province = s('province'), count = s('listing_count');
  if (officeName.length < 2 || officeName.length > 120) return { ok: false, error: 'Vul de naam van je kantoor in.' };
  if (city.length < 2 || city.length > 80) return { ok: false, error: 'Vul de plaats van je kantoor in.' };
  if (!isProvince(province)) return { ok: false, error: 'Kies de provincie van je kantoor.' };
  if (kvk && !/^[0-9]{8}$/.test(kvk)) return { ok: false, error: 'Een KvK-nummer heeft 8 cijfers.' };
  if (contactName.length < 2 || contactName.length > 120) return { ok: false, error: 'Vul je naam in.' };
  if (!EMAIL.test(email) || email.length > 200) return { ok: false, error: 'Vul een geldig e-mailadres in.' };
  if (phone.length > 40 || software.length > 80) return { ok: false, error: 'Een van de velden is te lang.' };
  if (message.length > 2000) return { ok: false, error: 'Je opmerking is te lang (maximaal 2000 tekens).' };
  const n = count ? Number(count) : undefined;
  if (n !== undefined && (!Number.isInteger(n) || n < 0 || n > 100000)) return { ok: false, error: 'Vul het aantal woningen als geheel getal in.' };
  if (form.get('consent') !== 'on') return { ok: false, error: 'Ga akkoord met de privacyverklaring om je aan te melden.' };
  return { ok: true, value: { officeName, city, province, kvk: kvk || undefined, nvm: form.get('nvm') === 'on', contactName, email, phone: phone || undefined, software: software || undefined, listingCount: n, message: message || undefined } };
}
