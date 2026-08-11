import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AgencyClient } from "./AgencyClient";

export default async function AgencyPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch the user's plan and persona
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, persona")
    .eq("id", user.id)
    .single();

  // Redirect if they somehow got here without being an advanced marketer
  // Must be advanced or team plan to access
  if ((profile?.plan !== "advanced" && profile?.plan !== "team") || profile?.persona !== "marketer") {
    redirect("/dashboard");
  }

  // Fetch all collaborative workspaces the user belongs to
  const { data: workspaces } = await supabase
    .from("workspace_members")
    .select(`
      workspace_id,
      role,
      profiles!workspace_members_workspace_id_fkey(full_name)
    `)
    .eq("user_id", user.id);

  const workspaceIds = (workspaces || []).map(w => w.workspace_id);
  workspaceIds.push(user.id); // Add their personal workspace ID just in case

  // Fetch campaign data across all accessible workspaces to aggregate spend/ROAS
  const { data: campaigns } = await supabase
    .from("social_campaigns")
    .select("user_id, spend, conversions, roas, status, platform")
    .in("user_id", workspaceIds);

  // Map workspace names
  const clientData = (workspaces || []).map(w => {
    const wId = w.workspace_id;
    const clientCampaigns = (campaigns || []).filter(c => c.user_id === wId);
    
    const totalSpend = clientCampaigns.reduce((sum, c) => sum + Number(c.spend), 0);
    const avgRoas = clientCampaigns.length 
      ? clientCampaigns.reduce((sum, c) => sum + Number(c.roas), 0) / clientCampaigns.length 
      : 0;

    return {
      id: wId,
      name: (w.profiles as any)?.full_name || "Unknown Client",
      role: w.role,
      campaignsActive: clientCampaigns.filter(c => c.status === "active").length,
      totalSpend,
      avgRoas,
    };
  });

  return (
    <AgencyClient clients={clientData} />
  );
}
