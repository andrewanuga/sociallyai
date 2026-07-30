import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "socially.ai.io@gmail.com";
const CATEGORIES = ["bug", "feature", "help", "other"] as const;
const LABEL: Record<string, string> = {
  bug: "Bug report", feature: "Feature request", help: "Help", other: "Other",
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { category, message } = await req.json();
  const cat = CATEGORIES.includes(category) ? category : "other";
  if (!message?.trim()) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  // 1) Store the ticket.
  const { error } = await supabase.from("support_tickets").insert({
    user_id: user.id, category: cat, message: message.trim(), email: user.email,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 2) Email it to the team (best-effort; requires RESEND_API_KEY).
  if (process.env.RESEND_API_KEY) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: process.env.SUPPORT_FROM || "Socially AI <onboarding@resend.dev>",
          to: [SUPPORT_EMAIL],
          reply_to: user.email,
          subject: `[Support · ${LABEL[cat]}] from ${user.email}`,
          text: `Category: ${LABEL[cat]}\nFrom: ${user.email} (${user.id})\n\n${message.trim()}`,
        }),
      });
    } catch { /* stored regardless */ }
  }

  return NextResponse.json({ ok: true });
}
