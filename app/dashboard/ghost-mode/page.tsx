import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GhostModeClient } from "./GhostModeClient";
import type { AgentActionRow } from "@/lib/supabase/types";

export default async function GhostModePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const todayStart = new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
  const weekStart  = new Date(Date.now() - 7 * 86_400_000).toISOString();

  const [
    { data: actions },
    { data: todayActions },
    { data: weekActions },
  ] = await Promise.all([
    /* Recent 20 actions for the log */
    supabase.from("agent_actions")
      .select("id, action, comment, reply, platform, reason, created_at")
      .order("created_at", { ascending: false })
      .limit(20),

    /* Today's actions for stats */
    supabase.from("agent_actions")
      .select("action")
      .gte("created_at", todayStart),

    /* Week's actions for hours-saved estimate */
    supabase.from("agent_actions")
      .select("action")
      .gte("created_at", weekStart),
  ]);

  const autoRepliesToday = todayActions?.filter(a => a.action === "auto_reply").length ?? 0;
  const leadsToday       = todayActions?.filter(a => a.action === "flag_lead").length   ?? 0;
  /* Estimate: each auto-reply saves ~5 min, each lead-triage saves ~10 min */
  const weekAutoReplies  = weekActions?.filter(a => a.action === "auto_reply").length ?? 0;
  const weekLeads        = weekActions?.filter(a => a.action === "flag_lead").length   ?? 0;
  const hoursSaved       = +((weekAutoReplies * 5 + weekLeads * 10) / 60).toFixed(1);

  const initiallyActive  = autoRepliesToday > 0 || leadsToday > 0;

  return (
    <GhostModeClient
      initialActions={(actions ?? []) as AgentActionRow[]}
      statsToday={{ autoReplies: autoRepliesToday, leads: leadsToday, hoursSaved }}
      initiallyActive={initiallyActive}
    />
  );
}
