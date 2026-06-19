import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InboxClient } from "./InboxClient";
import type { InboxMessage } from "@/lib/supabase/types";

export default async function InboxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: messages } = await supabase
    .from("inbox_messages")
    .select("*")
    .order("received_at", { ascending: false })
    .limit(50);

  return <InboxClient messages={(messages ?? []) as InboxMessage[]} />;
}
