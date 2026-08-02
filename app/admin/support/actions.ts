"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client missing");
  const { data: profile } = await adminDb.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new Error("Forbidden: Not an admin");
  return user;
}

export async function resolveTicket(id: string) {
  await verifyAdmin();
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured");

  const { error } = await adminDb
    .from("support_tickets")
    .update({ status: "resolved" })
    .eq("id", id);
    
  if (error) throw new Error(error.message);
}
