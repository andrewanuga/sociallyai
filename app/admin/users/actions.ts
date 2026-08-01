"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { type PlanId } from "@/lib/billing/plans";
import { cookies } from "next/headers";

async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");
  
  // Ensure we check the REAL user, bypassing any impersonation in verifyAdmin
  // Wait, if createClient() is already intercepted, this could be tricky. 
  // We need to bypass it by directly creating a raw client.
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client missing");
  const { data: profile } = await adminDb.from("profiles").select("is_admin").eq("id", user.id).single();
  if (!profile?.is_admin) throw new Error("Forbidden: Not an admin");
  return user;
}

export async function updateUserPlan(userId: string, plan: PlanId) {
  await verifyAdmin();
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured - check SUPABASE_SERVICE_ROLE_KEY");
  
  const { error } = await adminDb.from("profiles").update({ plan }).eq("id", userId);
  if (error) throw new Error(error.message);
}

export async function toggleUserSuspension(userId: string, suspend: boolean, fullName: string | null) {
  await verifyAdmin();
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured - check SUPABASE_SERVICE_ROLE_KEY");
  
  const { error } = await adminDb.from("profiles").update({
    suspended: suspend,
    suspended_at: suspend ? new Date().toISOString() : null,
  }).eq("id", userId);
  
  if (error) throw new Error(error.message);
  
  // Log the admin action via service role
  await adminDb.from("security_events").insert({ 
    type: "account_suspended", 
    user_id: userId, 
    severity: "warning", 
    detail: `${suspend ? "Suspended" : "Reinstated"} ${fullName ?? userId}` 
  }).then(() => {}, () => {});
}

export async function impersonateUser(targetUserId: string) {
  const admin = await verifyAdmin();
  if (admin.id === targetUserId) throw new Error("Cannot impersonate yourself");
  
  const adminDb = createAdminClient();
  if (!adminDb) throw new Error("Admin client not configured");
  
  // Verify target user exists and is not an admin
  const { data: targetProfile, error } = await adminDb.from("profiles").select("is_admin").eq("id", targetUserId).single();
  if (error || !targetProfile) throw new Error("Target user not found");
  if (targetProfile.is_admin) throw new Error("Cannot impersonate another admin");

  const cookieStore = await cookies();
  cookieStore.set("sai-admin-impersonate", targetUserId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/"
  });
  
  await adminDb.from("security_events").insert({
    type: "admin_action",
    user_id: targetUserId,
    severity: "warning",
    detail: `Admin ${admin.id} started impersonating user`
  });
}

export async function stopImpersonation() {
  const cookieStore = await cookies();
  cookieStore.delete("sai-admin-impersonate");
}
