// Een collega uitnodigen: wat er ingevuld moet zijn. Alleen de eigenaar mag uitnodigen; eigenaar en zoeker zijn hier geen keuze.
export const INVITE_ROLES = ['admin', 'agent', 'readonly'] as const;
export type InviteRole = (typeof INVITE_ROLES)[number];
export const INVITE_ROLE_LABEL: Record<InviteRole, string> = { admin: 'Beheerder (alle kantoren)', agent: 'Makelaar (eigen kantoor)', readonly: 'Alleen lezen (eigen kantoor)' };

export type InviteInput = { name: string; email: string; role: InviteRole; officeId: string | null };

export function validateInvite(raw: { name?: unknown; email?: unknown; role?: unknown; officeId?: unknown }): { ok: true; value: InviteInput } | { ok: false; errors: string[] } {
  const name = String(raw.name ?? '').trim().slice(0, 120);
  const email = String(raw.email ?? '').trim().toLowerCase().slice(0, 200);
  const role = String(raw.role ?? '');
  const officeId = typeof raw.officeId === 'string' && /^[0-9a-f-]{36}$/i.test(raw.officeId) ? raw.officeId : null;
  const errors: string[] = [];
  if (name.length < 2) errors.push('Vul de naam in.');
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) errors.push('Vul een geldig e-mailadres in.');
  if (!(INVITE_ROLES as readonly string[]).includes(role)) errors.push('Kies een rol.');
  if (role !== 'admin' && !officeId) errors.push('Kies het kantoor waar deze collega bij hoort.');
  if (errors.length) return { ok: false, errors };
  return { ok: true, value: { name, email, role: role as InviteRole, officeId } };
}

export function inviteMailText(o: { name: string; officeName: string | null; roleLabel: string; link: string; from: string }): string {
  return `Hallo ${o.name},\n\n${o.from} heeft je uitgenodigd voor het beheer van NNvastgoed${o.officeName ? ` namens ${o.officeName}` : ''}.\nJe rol: ${o.roleLabel}.\n\nKies via deze link je wachtwoord en stel daarna de tweede inlogstap in (een authenticator-app):\n${o.link}\n\nDe link is eenmalig. Werkt hij niet meer? Vraag een nieuwe uitnodiging aan.\n`;
}
