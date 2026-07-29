import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { TrendsClient } from "./TrendsClient";
import type { SocialTrend } from "@/lib/social/types";
import type { SocialAccount } from "@/lib/social/types";

export default async function TrendsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const now = new Date().toISOString();
  const [{ data: trends }, { data: profile }, { data: accounts }] = await Promise.all([
    supabase.from("social_trends").select("*").gt("expires_at", now).order("score", { ascending: false }).limit(12),
    supabase.from("profiles").select("niche, persona").eq("id", user.id).single(),
    supabase.from("social_accounts").select("id, platform, handle, display_name").eq("status", "connected"),
  ]);

  return (
    <TrendsClient
      trends={(trends ?? []) as SocialTrend[]}
      accounts={(accounts ?? []) as Pick<SocialAccount, "id" | "platform" | "handle" | "display_name">[]}
      userNiche={profile?.niche ?? null}
      persona={profile?.persona ?? "creator"}
    />
  );
}
