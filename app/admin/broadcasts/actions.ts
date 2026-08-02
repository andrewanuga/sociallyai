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

import { sendBroadcastEmail } from "@/lib/mailer";

export async function createBroadcast(message: string, type: "info" | "warning" | "critical", targetUserId?: string) {
  const user = await verifyAdmin();
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured");
  
  let targetUsers: { id: string, email?: string }[] = [];

  if (targetUserId) {
    // Single user target
    const { data: { user: tUser } } = await adminDb.auth.admin.getUserById(targetUserId);
    if (!tUser) throw new Error("Target user not found");
    targetUsers = [{ id: tUser.id, email: tUser.email }];
  } else {
    // Global broadcast
    const { error: bError } = await adminDb.from("system_broadcasts").insert({
      message, type, created_by: user.id
    });
    if (bError) throw new Error(bError.message);

    // Fetch all users for notifications/emails
    // In production with 10k+ users, this should paginate or use a background worker.
    const { data: { users }, error: uError } = await adminDb.auth.admin.listUsers();
    if (uError) throw new Error(uError.message);
    targetUsers = users.map(u => ({ id: u.id, email: u.email }));
  }

  // Insert user notifications
  if (targetUsers.length > 0) {
    const notifs = targetUsers.map(u => ({
      user_id: u.id,
      title: type === "info" ? "New Announcement" : "System Alert",
      body: message,
      type: "system",
      is_read: false
    }));
    
    // Batch insert notifications (max 1000 per chunk usually, but we assume small scale for MVP)
    await adminDb.from("user_notifications").insert(notifs);

    // Dispatch emails asynchronously so we don't block the UI
    const emails = targetUsers.map(u => u.email).filter(Boolean) as string[];
    if (emails.length > 0) {
      sendBroadcastEmail(emails, message, type).catch(console.error);
    }
  }
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
