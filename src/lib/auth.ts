import { redirect } from 'next/navigation';
import { createClient } from './supabase/server';
import type { Role } from './types';

export interface Staff { id: string; name: string; role: Role; officeId: string | null }
const ROLES: Role[] = ['owner', 'admin', 'agent', 'readonly'];

export const isManager = (r: Role) => r === 'owner' || r === 'admin';
export const canWrite = (s: Staff) => isManager(s.role) || s.role === 'agent';

/**
 * De ingelogde medewerker, of doorsturen naar inloggen / tweede stap.
 * De rol en het kantoor komen uit de database (profiles), nooit uit iets wat de browser meestuurt.
 */
export async function requireStaff(): Promise<Staff> {
  const s = await getStaff();
  if (s === 'seeker') redirect('/mijn');
  if (s === 'mfa') redirect('/mfa');
  if (s === 'blocked') redirect('/login?fout=geblokkeerd');
  if (!s) redirect('/login');
  return s;
}

export async function getStaff(): Promise<Staff | null | 'mfa' | 'blocked' | 'seeker'> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal?.currentLevel !== 'aal2') {
    // Een zoeker heeft geen tweede stap en leest zijn eigen profiel gewoon; een makelaar zonder tweede stap niet.
    const { data: own } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    return own?.role === 'seeker' ? 'seeker' : 'mfa';
  }
  const { data: p } = await supabase.from('profiles').select('id, full_name, role, office_id, active').eq('id', user.id).single();
  if (p?.role === 'seeker') return 'seeker';
  if (!p || !p.active || !ROLES.includes(p.role as Role)) { await supabase.auth.signOut(); return 'blocked'; }
  return { id: p.id, name: p.full_name || user.email || 'Medewerker', role: p.role as Role, officeId: p.office_id };
}
