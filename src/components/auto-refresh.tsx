'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

/** Haalt de pagina elke 20 seconden opnieuw op, zolang het tabblad open staat (nieuwe berichten verschijnen zo vanzelf). */
export function AutoRefresh({ seconds = 20 }: { seconds?: number }) {
  const router = useRouter();
  useEffect(() => {
    const id = setInterval(() => { if (document.visibilityState === 'visible') router.refresh(); }, seconds * 1000);
    return () => clearInterval(id);
  }, [router, seconds]);
  return null;
}
