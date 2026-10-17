'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { CalendarCheck, ChevronDown, Heart, LogIn, LogOut, MessageSquare, User, Building2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useAuthUser } from '@/lib/use-auth-user';

/** Favorieten en inloggen (zoeker of makelaar) rechtsboven. Los van de pagina zelf, zodat pagina's gecachet kunnen blijven. */
export function AccountMenu() {
  const user = useAuthUser();
  const ref = useRef<HTMLDetailsElement>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const close = (e: MouseEvent) => { if (ref.current?.open && !ref.current.contains(e.target as Node)) ref.current.open = false; };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape' && ref.current) ref.current.open = false; };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', close); document.removeEventListener('keydown', esc); };
  }, []);
  async function logout() {
    setBusy(true);
    await createClient().auth.signOut({ scope: 'local' });
    window.location.href = '/';
  }
  const link = 'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-brand-soft hover:text-brand';
  return (
    <div className="flex items-center gap-1">
      <Link href={user ? '/mijn/favorieten' : '/bewaard'} className="focus-ring inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium hover:bg-brand-soft hover:text-brand" aria-label="Favorieten">
        <Heart size={16} aria-hidden /><span className="hidden md:inline">Favorieten</span>
      </Link>
      <details ref={ref} className="relative">
        <summary className="focus-ring flex cursor-pointer list-none items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-semibold hover:bg-sand [&::-webkit-details-marker]:hidden">
          {user ? <User size={16} aria-hidden /> : <LogIn size={16} aria-hidden />}
          <span className="max-w-[8rem] truncate">{user === undefined ? 'Inloggen' : user ? user.name.split(' ')[0] : 'Inloggen'}</span>
          <ChevronDown size={14} aria-hidden />
        </summary>
        <div className="absolute right-0 z-40 mt-2 w-64 rounded-xl border border-line bg-white p-2 shadow-lg">
          {user ? (
            <>
              <p className="truncate px-3 py-1.5 text-xs text-muted">{user.email}</p>
              <Link href="/mijn" className={link}><User size={16} aria-hidden /> Mijn NNV</Link>
              <Link href="/mijn/favorieten" className={link}><Heart size={16} aria-hidden /> Favorieten</Link>
              <Link href="/mijn/bezichtigingen" className={link}><CalendarCheck size={16} aria-hidden /> Bezichtigingen</Link>
              <Link href="/mijn/berichten" className={link}><MessageSquare size={16} aria-hidden /> Berichten</Link>
              {!user.seeker && <Link href="/beheer" className={link}><Building2 size={16} aria-hidden /> Naar het beheer</Link>}
              <button type="button" onClick={logout} disabled={busy} className={`${link} w-full text-left`}><LogOut size={16} aria-hidden /> Uitloggen</button>
            </>
          ) : (
            <>
              <Link href="/inloggen" className={`${link} flex-col !items-start !gap-0`}><span className="font-semibold">Ik zoek een woning</span><span className="text-xs font-normal text-muted">Inloggen of account maken</span></Link>
              <Link href="/login" className={`${link} flex-col !items-start !gap-0`}><span className="font-semibold">Ik ben makelaar</span><span className="text-xs font-normal text-muted">Naar het beheer van je kantoor</span></Link>
            </>
          )}
        </div>
      </details>
    </div>
  );
}
