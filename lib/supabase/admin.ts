import { createClient } from "@supabase/supabase-js";

/**
 * Service-role client for trusted server code (webhooks, payment verification).
 * Bypasses RLS — never expose to the browser. Returns null if not configured.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
