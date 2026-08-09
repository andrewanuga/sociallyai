import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CampaignsClient } from "./CampaignsClient";

export default async function CampaignsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch the user's plan and persona
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, persona")
    .eq("id", user.id)
    .single();

  if (profile?.plan !== "advanced" || profile?.persona !== "marketer") {
    redirect("/dashboard");
  }

  // Fetch DM campaigns
  const { data: campaigns } = await supabase
    .from("dm_campaigns")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch leads for these campaigns to get basic stats
  const campaignIds = (campaigns || []).map(c => c.id);
  const { data: leads } = await supabase
    .from("dm_campaign_leads")
    .select("campaign_id, status")
    .in("campaign_id", campaignIds);

  const enrichedCampaigns = (campaigns || []).map(c => {
    const cLeads = (leads || []).filter(l => l.campaign_id === c.id);
    const totalLeads = cLeads.length;
    const sentCount = cLeads.filter(l => l.status === "sent" || l.status === "replied").length;
    const repliedCount = cLeads.filter(l => l.status === "replied").length;

    return {
      ...c,
      stats: {
        totalLeads,
        sentCount,
        repliedCount,
        replyRate: sentCount > 0 ? (repliedCount / sentCount) * 100 : 0
      }
    };
  });

  return (
    <CampaignsClient initialCampaigns={enrichedCampaigns} />
  );
}
