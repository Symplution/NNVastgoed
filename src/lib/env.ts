export const hasSupabase = () => Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
export const hasService = () => hasSupabase() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
/** Demomodus: voorbeeldwoningen zonder database. Alleen buiten productie en zonder Supabase (CLAUDE.md regel 10). */
export const isDemo = () => process.env.DEMO_MODE === '1' && process.env.NODE_ENV !== 'production' && !hasSupabase();
export const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : 'http://localhost:3000')).replace(/\/$/, '');
