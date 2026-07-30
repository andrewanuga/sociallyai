import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { TOOLS, isToolConfigured, type ToolId } from "@/lib/social/tools";

function back(origin: string, params: Record<string, string>) {
  const url = new URL("/dashboard/integrations", origin);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return NextResponse.redirect(url);
}

/** OAuth start for a tool (Google Calendar/Analytics/Sheets, Slack, Notion, Discord). */
export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const origin = req.nextUrl.origin;
  const t = TOOLS[provider as ToolId];
  if (!t || t.connectType !== "oauth" || !t.oauth) return back(origin, { error: "unsupported", tool: provider });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin));
  if (!isToolConfigured(provider as ToolId)) return back(origin, { error: "not_configured", tool: provider });

  const state = randomBytes(16).toString("hex");
  (await cookies()).set(`sai_tool_${provider}`, state, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 600 });

  const url = new URL(t.oauth.authorizeUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", process.env[t.oauth.clientIdEnv]!);
  url.searchParams.set("redirect_uri", `${origin}/api/tools/callback/${provider}`);
  if (t.oauth.scopes.length) url.searchParams.set("scope", t.oauth.scopes.join(" "));
  url.searchParams.set("state", state);
  Object.entries(t.oauth.extra ?? {}).forEach(([k, v]) => url.searchParams.set(k, v));

  return NextResponse.redirect(url);
}

/** Key/webhook connect (Mailchimp, Zapier, Webhooks). */
export async function POST(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const t = TOOLS[provider as ToolId];
  if (!t || t.connectType === "oauth") return NextResponse.json({ error: "This tool uses OAuth." }, { status: 400 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { value } = await req.json();
  if (!value) return NextResponse.json({ error: `${t.keySetup?.label ?? "Value"} is required.` }, { status: 400 });

  const { error } = await supabase.from("integrations").upsert(
    {
      user_id: user.id, provider, status: "connected",
      account_label: t.connectType === "webhook" ? "Webhook" : "API key",
      config: t.connectType === "webhook" ? { url: value } : { api_key: value },
    },
    { onConflict: "user_id,provider" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

/** Disconnect. */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  await supabase.from("integrations").delete().eq("user_id", user.id).eq("provider", provider);
  return NextResponse.json({ ok: true });
}
