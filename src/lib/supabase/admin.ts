import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client.
 * Uses SUPABASE_SERVICE_ROLE_KEY if defined, and gracefully falls back to
 * NEXT_PUBLIC_SUPABASE_ANON_KEY to prevent runtime crashes during Vercel deployment.
 */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false },
  global: { headers: { 'X-Client-Mode': 'admin' } },
});
