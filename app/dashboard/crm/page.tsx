import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CrmClient } from "./CrmClient";

export default async function CrmPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Fetch the user's plan and persona
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, persona")
    .eq("id", user.id)
    .single();

  if ((profile?.plan !== "advanced" && profile?.plan !== "team") || profile?.persona !== "marketer") {
    redirect("/dashboard");
  }

  // Fetch all leads for this user's campaigns
  const { data: campaigns } = await supabase
    .from("dm_campaigns")
    .select("id, name, platform")
    .eq("user_id", user.id);

  const campaignIds = (campaigns || []).map(c => c.id);
  
  const { data: leads } = await supabase
    .from("dm_campaign_leads")
    .select("*")
    .in("campaign_id", campaignIds)
    .order("created_at", { ascending: false });

  // Map campaign info to leads
  const enrichedLeads = (leads || []).map(l => {
    const c = campaigns?.find(camp => camp.id === l.campaign_id);
    return {
      ...l,
      campaign_name: c?.name || "Unknown Campaign",
      platform: c?.platform || "Unknown",
    };
  });

  return (
    <CrmClient initialLeads={enrichedLeads} />
  );
}
