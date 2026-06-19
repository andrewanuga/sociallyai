import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { CalendarClient, type ScheduledPostSlim } from "./CalendarClient";

export default async function CalendarPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  /* Fetch scheduled + queued posts (status not yet posted/failed) */
  const { data: posts } = await supabase
    .from("scheduled_posts")
    .select("id, platform, content, scheduled_at, status")
    .in("status", ["scheduled", "queued"])
    .order("scheduled_at", { ascending: true });

  return <CalendarClient posts={(posts ?? []) as ScheduledPostSlim[]} />;
}
