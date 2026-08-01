"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new Error("Forbidden: Not an admin");
  
  return user;
}

export async function toggleFeatureFlag(key: string, isEnabled: boolean) {
  const user = await verifyAdmin();
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured");
  
  const { error } = await adminDb.from("feature_flags").update({
    is_enabled: isEnabled,
    updated_by: user.id,
    updated_at: new Date().toISOString()
  }).eq("key", key);
  
  if (error) throw new Error(error.message);
  
  // Log the change
  await adminDb.from("security_events").insert({
    type: "admin_action",
    user_id: user.id,
    severity: "info",
    detail: `Feature flag '${key}' ${isEnabled ? "enabled" : "disabled"}`
  });
}
