import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomBytes } from "crypto";
import { PLANS, type PlanId } from "@/lib/billing/plans";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { email, role } = await req.json();
    if (!email || !role) return NextResponse.json({ error: "Missing email or role" }, { status: 400 });

    // Ensure the current user has permission (must be owner or manager to invite)
    const { data: activeMembership } = await supabase.from("workspace_members")
      .select("role")
      .eq("workspace_id", user.id)
      .eq("user_id", user.id)
      .single();

    // Only owner (if fetching self) or manager can invite. We'll simplify: only the workspace owner can invite for now.
    // Wait, let's enforce that only the owner can invite.
    const workspaceId = user.id; 

    // Check plan limits
    const [{ data: profile }, { count: memberCount }, { count: inviteCount }] = await Promise.all([
      supabase.from("profiles").select("plan").eq("id", workspaceId).single(),
      supabase.from("workspace_members").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
      supabase.from("workspace_invites").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
    ]);

    const currentCount = (memberCount || 0) + (inviteCount || 0);
    const planLimit = PLANS[(profile?.plan as PlanId) || "free"]?.collaborators || 0;

    if (currentCount >= planLimit) {
      return NextResponse.json({ error: "Plan limit reached. Upgrade to invite more members." }, { status: 403 });
    }

    // Check if user is already invited or a member
    const { data: existingMember } = await supabase.from("workspace_members")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("user_id", (await supabase.from("profiles").select("id").eq("username", email).single()).data?.id || "00000000-0000-0000-0000-000000000000");

    const { data: existingInvite } = await supabase.from("workspace_invites")
      .select("id")
      .eq("workspace_id", workspaceId)
      .eq("email", email)
      .single();

    if (existingMember || existingInvite) {
      return NextResponse.json({ error: "User is already in the workspace or has a pending invite." }, { status: 400 });
    }

    // Create invite
    const token = randomBytes(32).toString("hex");
    
    // In a real app, you would send an email here with Resend/SendGrid.
    // e.g. await sendEmail(email, `${process.env.NEXT_PUBLIC_APP_URL}/invite/${token}`);

    const { error } = await supabase.from("workspace_invites").insert({
      workspace_id: workspaceId,
      email,
      role,
      token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    });

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to invite" }, { status: 500 });
  }
}
