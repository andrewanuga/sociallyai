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

export async function createBroadcast(message: string, type: "info" | "warning" | "critical") {
  const user = await verifyAdmin();
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured");
  
  const { error } = await adminDb.from("system_broadcasts").insert({
    message, type, created_by: user.id
  });
  if (error) throw new Error(error.message);
}

export async function toggleBroadcast(id: string, isActive: boolean) {
  await verifyAdmin();
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured");
  
  const { error } = await adminDb.from("system_broadcasts").update({
    is_active: isActive
  }).eq("id", id);
  
  if (error) throw new Error(error.message);
}

export async function deleteBroadcast(id: string) {
  await verifyAdmin();
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured");
  
  const { error } = await adminDb.from("system_broadcasts").delete().eq("id", id);
  if (error) throw new Error(error.message);
}
