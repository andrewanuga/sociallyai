import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { isPlan } from "@/lib/billing/plans";

/** Paystack webhook — verify signature, then reconcile subscription state. */
export async function POST(req: NextRequest) {
  const secret = process.env.PAYSTACK_SECRET_KEY;
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature") || "";
  if (!secret) return NextResponse.json({ ok: true }); // nothing to verify against

  const expected = createHmac("sha512", secret).update(raw).digest("hex");
  const a = Buffer.from(expected), b = Buffer.from(signature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const admin = createAdminClient();
  if (!admin) return NextResponse.json({ ok: true });

  const event = JSON.parse(raw);
  const data = event.data ?? {};
  const customerCode: string | undefined = data.customer?.customer_code;
  const userId: string | undefined = data.metadata?.user_id;

  const findUser = async () => {
    if (userId) return userId;
    if (customerCode) {
      const { data: p } = await admin.from("profiles").select("id").eq("paystack_customer_code", customerCode).single();
      return p?.id as string | undefined;
    }
    return undefined;
  };

  switch (event.event) {
    case "charge.success": {
      const uid = await findUser();
      const plan = isPlan(data.metadata?.plan) ? data.metadata.plan : undefined;
      if (uid) {
        if (plan) {
          await admin.from("profiles").update({
            plan, subscription_status: "active",
            plan_renews_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          }).eq("id", uid);
        }
        await admin.from("payments").upsert({
          user_id: uid, reference: data.reference, plan: plan ?? null,
          amount: (data.amount ?? 0) / 100, currency: data.currency ?? "NGN",
          status: "success", channel: data.channel ?? null,
          paid_at: data.paid_at ?? new Date().toISOString(), raw: data,
        }, { onConflict: "reference" });
      }
      break;
    }
    case "subscription.create": {
      const uid = await findUser();
      if (uid) await admin.from("profiles").update({
        paystack_subscription_code: data.subscription_code, subscription_status: "active",
      }).eq("id", uid);
      break;
    }
    case "subscription.not_renew":
    case "subscription.disable": {
      const uid = await findUser();
      if (uid) await admin.from("profiles").update({
        subscription_status: event.event === "subscription.disable" ? "cancelled" : "non-renewing",
      }).eq("id", uid);
      break;
    }
    case "invoice.payment_failed": {
      const uid = await findUser();
      if (uid) await admin.from("profiles").update({ subscription_status: "non-renewing" }).eq("id", uid);
      break;
    }
  }

  return NextResponse.json({ ok: true });
}
