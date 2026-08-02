import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/workspace";
import { syncAccount } from "@/lib/social/sync";

/**
 * Sync all of the signed-in user's connected accounts.
 * Trigger from the dashboard ("Sync now") or on a cron/queue in production.
 */
export async function POST() {
  const supabase = await createClient();
  const workspace = await getActiveWorkspace(supabase);
  if (!workspace) return new Response("Unauthorized", { status: 401 });
  const workspaceId = workspace.workspaceId;

  const { data: accounts } = await supabase
    .from("social_accounts")
    .select("id, user_id, platform, external_id, access_token, refresh_token, token_expires_at, handle")
    .eq("status", "connected")
    .eq("user_id", workspaceId);

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
