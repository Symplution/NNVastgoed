'use client';

import { useEffect, useState } from 'react';
import { createClient } from './supabase/client';

export interface AuthUser { id: string; email: string; name: string; seeker: boolean }

/** De ingelogde persoon in de browser; `undefined` zolang we het nog niet weten, `null` als er niemand is ingelogd. */
export function useAuthUser(): AuthUser | null | undefined {
  const [user, setUser] = useState<AuthUser | null | undefined>(undefined);
  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL) { setUser(null); return; }
    const supabase = createClient();
    let alive = true;
    async function load() {
      const { data: { user: u } } = await supabase.auth.getUser();
      if (!alive) return;
      if (!u) return setUser(null);
      // Een zoeker leest zijn eigen profiel zonder tweede stap; bij een makelaar zonder die stap komt er niets terug.
      const { data: p } = await supabase.from('profiles').select('full_name, role').eq('id', u.id).maybeSingle();
      if (alive) setUser({ id: u.id, email: u.email ?? '', name: p?.full_name || (u.email ?? '').split('@')[0] || 'Mijn NNV', seeker: p?.role === 'seeker' });
    }
    void load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => { void load(); });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, []);
  return user;
}
