import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { PLANS, isPlan, toKobo } from "@/lib/billing/plans";

/** Start a Paystack checkout for a plan; returns an authorization_url to redirect to. */
export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { plan } = await req.json();
  if (!isPlan(plan)) return NextResponse.json({ error: "Unknown plan" }, { status: 400 });

  // Downgrade to Free needs no payment.
  if (plan === "free") {
    await supabase.from("profiles").update({ plan: "free", subscription_status: "cancelled" }).eq("id", user.id);
    return NextResponse.json({ free: true });
  }

  const secret = process.env.PAYSTACK_SECRET_KEY;
  if (!secret) return NextResponse.json({ error: "Payments aren't configured yet." }, { status: 501 });

  const cfg = PLANS[plan];
  const planCode = cfg.planCodeEnv ? process.env[cfg.planCodeEnv] : undefined;
  const origin = req.nextUrl.origin;

  try {
    const res = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: { Authorization: `Bearer ${secret}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        email: user.email,
        amount: toKobo(cfg.price),
        currency: "NGN",
        // If a subscription plan code exists, Paystack uses it (and its amount).
        ...(planCode ? { plan: planCode } : {}),
        callback_url: `${origin}/api/billing/verify`,
        metadata: { user_id: user.id, plan },
      }),
    });
    const data = await res.json();
    if (!data.status) return NextResponse.json({ error: data.message || "Could not start checkout" }, { status: 502 });
    return NextResponse.json({ authorization_url: data.data.authorization_url, reference: data.data.reference });
  } catch {
    return NextResponse.json({ error: "Couldn't reach Paystack." }, { status: 502 });
  }
}
