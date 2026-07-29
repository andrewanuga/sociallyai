import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { syncAccount } from "@/lib/social/sync";

/**
 * Sync all of the signed-in user's connected accounts.
 * Trigger from the dashboard ("Sync now") or on a cron/queue in production.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("id, user_id, platform, external_id, access_token")
    .eq("status", "connected");

  if (!accounts?.length) {
    return NextResponse.json({ synced: 0, accounts: 0, message: "No connected accounts to sync." });
  }

  let total = 0;
  for (const acc of accounts) {
    try {
      total += await syncAccount(acc, supabase);
    } catch { /* skip a failing account */ }
  }

  return NextResponse.json({ accounts: accounts.length, synced: total });
}
