import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only admin client using the service role key.
 * Bypasses RLS — use only for read-only aggregate queries
 * (e.g., teacher directory, cross-teacher stats).
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
