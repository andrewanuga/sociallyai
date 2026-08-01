"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new Error("Forbidden: Not an admin");
}

export async function fetchFirehose() {
  await verifyAdmin();
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured");
  
  const { data, error } = await adminDb
    .from("agent_actions")
    .select(`
      id, action, platform, comment, reply, reason, created_at,
      profiles ( full_name, username )
    `)
    .order("created_at", { ascending: false })
    .limit(50);
    
  if (error) throw new Error(error.message);
  return data;
}
