import { createClient as createJsClient } from '@supabase/supabase-js';

/**
 * Zonder sessie en zonder cookies: voor het openbare deel van de site. Zo blijven pagina's cachebaar
 * en ziet een bezoeker nooit meer dan de anonieme rol mag (row level security).
 */
export const createAnonClient = () =>
  createJsClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
