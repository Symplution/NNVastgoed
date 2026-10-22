import { describe, expect, it } from 'vitest';
import { inviteMailText, validateInvite } from '../src/lib/staff-invite';

const office = '5f0c2e0a-1111-4222-8333-444455556666';
describe('collega uitnodigen', () => {
  it('accepteert een makelaar met een kantoor en maakt het e-mailadres netjes', () => {
    const r = validateInvite({ name: ' Eva de Vries ', email: ' Eva@Kantoor.NL ', role: 'agent', officeId: office });
    expect(r).toEqual({ ok: true, value: { name: 'Eva de Vries', email: 'eva@kantoor.nl', role: 'agent', officeId: office } });
  });
  it('een makelaar of alleen-lezen zonder kantoor kan niet, een beheerder wel', () => {
    expect(validateInvite({ name: 'Eva', email: 'e@x.nl', role: 'agent' })).toMatchObject({ ok: false });
    expect(validateInvite({ name: 'Eva', email: 'e@x.nl', role: 'readonly', officeId: 'geen-uuid' })).toMatchObject({ ok: false });
    expect(validateInvite({ name: 'Eva', email: 'e@x.nl', role: 'admin' })).toMatchObject({ ok: true });
  });
  it('eigenaar en zoeker zijn geen keuze, en slechte gegevens geven duidelijke fouten', () => {
    expect(validateInvite({ name: 'Eva', email: 'e@x.nl', role: 'owner', officeId: office })).toMatchObject({ ok: false });
    expect(validateInvite({ name: 'Eva', email: 'e@x.nl', role: 'seeker', officeId: office })).toMatchObject({ ok: false });
    const bad = validateInvite({ name: 'E', email: 'geen-mail', role: 'x' });
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.errors.length).toBeGreaterThanOrEqual(3);
  });
  it('de mail noemt de rol, het kantoor en de link', () => {
    const t = inviteMailText({ name: 'Eva', officeName: 'Martinihof', roleLabel: 'Makelaar', link: 'https://x.nl/l', from: 'Martijn' });
    expect(t).toContain('Martinihof'); expect(t).toContain('Makelaar'); expect(t).toContain('https://x.nl/l');
  });
});
