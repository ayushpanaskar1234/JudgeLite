import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Cookie store compatible with @supabase/ssr expectations
const cookieStore = {
  // Return all cookies as an array of { name, value }
  getAll: () => {
    try {
      return cookies().getAll();
    } catch {
      return [];
    }
  },
  // Set multiple cookies; wrapped in try/catch for read-only Server Components
  setAll: (cookieArray: { name: string; value: string; options?: any }[]) => {
    cookieArray.forEach(({ name, value, options }) => {
      try {
        cookies().set(name, value, options ?? {});
      } catch {
        // Ignored when invoked in Server Components where setting cookies is restricted
      }
    });
  },
};

export const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  { cookies: cookieStore }
);
