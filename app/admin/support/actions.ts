"use server";

import { createAdminClient, verifyAdmin } from "@/lib/supabase/server";

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
