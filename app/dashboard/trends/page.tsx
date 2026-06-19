import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrendsClient } from "./TrendsClient";
import type { Trend } from "@/lib/supabase/types";

export default async function TrendsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date().toISOString();

  const [{ data: trends }, { data: profile }] = await Promise.all([
    /* Live trends (not yet expired) */
    supabase.from("trends")
      .select("*")
      .gt("expires_at", now)
      .order("score", { ascending: false })
      .limit(10),

    /* User niche for personalised refresh */
    supabase.from("profiles").select("niche").eq("id", user.id).single(),
  ]);

  return (
    <TrendsClient
      trends={(trends ?? []) as Trend[]}
      userNiche={profile?.niche ?? null}
    />
  );
}
