import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InboxClient } from "./InboxClient";
import type { SocialAccount, SocialInboxMessage } from "@/lib/social/types";

export default async function InboxPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Connected accounts (one tab each) + their inbox, newest-first (the stack).
  const [{ data: accounts }, { data: messages }] = await Promise.all([
    supabase.from("social_accounts").select("*").order("connected_at", { ascending: false }),
    supabase.from("social_inbox").select("*").order("received_at", { ascending: false }).limit(200),
  ]);

  return (
    <InboxClient
      accounts={(accounts ?? []) as SocialAccount[]}
      messages={(messages ?? []) as SocialInboxMessage[]}
    />
  );
}
