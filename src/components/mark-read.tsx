'use client';

import { useEffect } from 'react';

/** Markeert de berichten van de ander als gelezen zodra het gesprek open staat. */
export function MarkRead({ action, id, unread }: { action: (id: string) => Promise<void>; id: string; unread: number }) {
  useEffect(() => { if (unread > 0) void action(id); }, [action, id, unread]);
  return null;
}
