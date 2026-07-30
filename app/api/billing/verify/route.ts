import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPlan } from "@/lib/billing/plans";

/** Paystack callback: verify the transaction, then apply the plan + record the payment. */
export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin;
  const reference = req.nextUrl.searchParams.get("reference") || req.nextUrl.searchParams.get("trxref");
  const done = (params: Record<string, string>) => {
    const url = new URL("/dashboard/billing", origin);
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    return NextResponse.redirect(url);
  };

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!reference || !secret) return done({ paid: "0" });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin));

  try {
    const res = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${secret}` },
    });
    const { data } = await res.json();
    if (!data || data.status !== "success") return done({ paid: "0" });

    const plan = isPlan(data.metadata?.plan) ? data.metadata.plan : "pro";
    const admin = createAdminClient();

    // Update the subscription on the profile.
    await supabase.from("profiles").update({
      plan,
      paystack_customer_code: data.customer?.customer_code ?? null,
      subscription_status: "active",
      plan_renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", user.id);

    // Record the payment (service role so it isn't blocked by RLS).
    await (admin ?? supabase).from("payments").upsert({
      user_id: user.id,
      reference: data.reference,
      plan,
      amount: (data.amount ?? 0) / 100,
      currency: data.currency ?? "NGN",
      status: "success",
      channel: data.channel ?? null,
      paid_at: data.paid_at ?? new Date().toISOString(),
      raw: data,
    }, { onConflict: "reference" });

    return done({ paid: "1", plan });
  } catch {
    return done({ paid: "0" });
  }
}
