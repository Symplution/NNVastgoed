'use client';

import { useEffect } from 'react';
import { syncFavorites } from '@/app/mijn/actions';
import { clearSaved, readSaved } from './save-button';

/** Na het inloggen: favorieten uit de browser verhuizen naar het account. */
export function FavoritesSync() {
  useEffect(() => {
    const ids = readSaved();
    if (!ids.length) return;
    void syncFavorites(ids).then(() => clearSaved()).catch(() => undefined);
  }, []);
  return null;
}
