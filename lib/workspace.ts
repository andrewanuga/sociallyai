import { cookies } from "next/headers";
import { NextRequest } from "next/server";
import { SupabaseClient } from "@supabase/supabase-js";

export async function getActiveWorkspace(supabase: SupabaseClient) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const cookieStore = await cookies();
  const activeWorkspaceId = cookieStore.get("socially_active_workspace")?.value;

  if (!activeWorkspaceId || activeWorkspaceId === user.id) {
    return { workspaceId: user.id, role: "owner" };
  }

  // Verify membership
  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", activeWorkspaceId)
    .eq("user_id", user.id)
    .single();

  if (member) {
    return { workspaceId: activeWorkspaceId, role: member.role };
  }

  // Fallback to own workspace if not a member
  return { workspaceId: user.id, role: "owner" };
}

export function enforceRole(role: string, required: "manager" | "admin") {
  if (role === "owner") return true;
  if (required === "manager") return role === "manager";
  if (required === "admin") return role === "manager" || role === "admin";
  return false;
}
