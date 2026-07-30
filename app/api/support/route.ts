import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getTransporter, MAIL_FROM } from "@/lib/mailer";
import { cleanText, oneOf } from "@/lib/security/validate";

// nodemailer needs the Node.js runtime (not edge).
export const runtime = "nodejs";

const SUPPORT_EMAIL = process.env.SUPPORT_EMAIL || "socially.ai.io@gmail.com";
const CATEGORIES = ["bug", "feature", "help", "other"] as const;
const LABEL: Record<string, string> = {
  bug: "Bug report", feature: "Feature request", help: "Help", other: "Other",
};

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const cat = oneOf(body.category, CATEGORIES, "other");
  const message = cleanText(body.message, 4000);
  if (!message) return NextResponse.json({ error: "Message is required." }, { status: 400 });

  // 1) Store the ticket.
  const { error } = await supabase.from("support_tickets").insert({
    user_id: user.id, category: cat, message, email: user.email,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // 2) Email it to the team via SMTP (nodemailer). Best-effort — the ticket
  //    is stored regardless of whether SMTP is configured.
  const transporter = getTransporter();
  if (transporter) {
    try {
      await transporter.sendMail({
        from: MAIL_FROM,
        to: SUPPORT_EMAIL,
        replyTo: user.email ?? undefined,
        subject: `[Support · ${LABEL[cat]}] from ${user.email}`,
        text: `Category: ${LABEL[cat]}\nFrom: ${user.email} (${user.id})\n\n${message}`,
      });
    } catch { /* stored regardless */ }
  }

  return NextResponse.json({ ok: true });
}
