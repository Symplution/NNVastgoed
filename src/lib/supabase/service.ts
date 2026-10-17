import 'server-only';
import { createClient } from '@supabase/supabase-js';

/**
 * Alleen op de server, alleen voor wat geen gebruiker heeft: het verzenden van alerts en het loggen van gebruik.
 * Nooit importeren in een component die in de browser draait (CLAUDE.md regel 6).
 */
export const createServiceClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
