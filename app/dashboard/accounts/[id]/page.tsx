import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { daysAgoISO } from "@/lib/dashboard/helpers";
import { AccountClient } from "./AccountClient";

export default async function AccountPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id: accountId } = await params;

  // 1. Fetch account details
  const { data: account, error } = await supabase
    .from("social_accounts")
    .select("*")
    .eq("id", accountId)
    .single();

  if (error || !account || account.user_id !== user.id) {
    redirect("/dashboard");
  }

  // 2. Fetch recent posts
  const d30 = daysAgoISO(30);
  const { data: posts } = await supabase
    .from("social_posts")
    .select("*")
    .eq("account_id", accountId)
    .gte("posted_at", d30)
    .order("posted_at", { ascending: false })
    .limit(10);

  // 3. Fetch historical metrics
  const { data: metrics } = await supabase
    .from("social_account_metrics")
    .select("*")
    .eq("account_id", accountId)
    .order("date", { ascending: false })
    .limit(30);

  return (
    <AccountClient
      account={account}
      posts={posts || []}
      metrics={metrics || []}
    />
  );
}
