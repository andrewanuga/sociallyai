import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { PLATFORMS, isPlatformConfigured, type PlatformId } from "@/lib/social/platforms";

function backToIntegrations(origin: string, params: Record<string, string>) {
  const url = new URL("/dashboard/integrations", origin);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return NextResponse.redirect(url);
}

/** OAuth start — redirect the user to the platform's consent screen. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const origin = req.nextUrl.origin;
  const p = PLATFORMS[platform as PlatformId];

  if (!p || p.connectType !== "oauth" || !p.oauth) {
    return backToIntegrations(origin, { error: "unsupported", platform });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin));

  if (!isPlatformConfigured(platform as PlatformId)) {
    return backToIntegrations(origin, { error: "not_configured", platform });
  }

  const state = randomBytes(16).toString("hex");
  (await cookies()).set(`sai_oauth_${platform}`, state, {
    httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 600,
  });

  const url = new URL(p.oauth.authorizeUrl);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", process.env[p.oauth.clientIdEnv]!);
  url.searchParams.set("redirect_uri", `${origin}/api/social/callback/${platform}`);
  url.searchParams.set("scope", p.oauth.scopes.join(platform === "reddit" ? "," : " "));
  url.searchParams.set("state", state);

  // Provider-specific extras for a refresh token.
  if (platform === "youtube") { url.searchParams.set("access_type", "offline"); url.searchParams.set("prompt", "consent"); }
  if (platform === "reddit") { url.searchParams.set("duration", "permanent"); }
  // X requires PKCE. We use the plain method with the state as the verifier.
  if (platform === "x") { url.searchParams.set("code_challenge", state); url.searchParams.set("code_challenge_method", "plain"); }

  return NextResponse.redirect(url);
}

/** Token connect — Telegram (BotFather) / WhatsApp (Cloud API). */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const p = PLATFORMS[platform as PlatformId];
  if (!p || p.connectType !== "token") {
    return NextResponse.json({ error: "This platform uses OAuth, not a token." }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { token } = await req.json();
  if (!token) return NextResponse.json({ error: "Token is required." }, { status: 400 });

  let external_id = platform;
  let handle: string | null = null;
  let display_name: string | null = p.name;

  try {
    if (platform === "telegram") {
      // Validate the bot token via getMe.
      const r = await fetch(`https://api.telegram.org/bot${token}/getMe`);
      const data = await r.json();
      if (!data.ok) return NextResponse.json({ error: "Invalid bot token." }, { status: 400 });
      external_id = String(data.result.id);
      handle = data.result.username ? `@${data.result.username}` : data.result.first_name;
      display_name = data.result.first_name ?? "Telegram bot";
    } else if (platform === "whatsapp") {
      // Cloud API: token + phone number id. We store as-is; verified on first send.
      external_id = process.env.WHATSAPP_PHONE_ID || "whatsapp";
      handle = "WhatsApp Business";
    }
  } catch {
    return NextResponse.json({ error: `Couldn't reach ${p.name}. Check the token and try again.` }, { status: 502 });
  }

  const { error } = await supabase.from("social_accounts").upsert(
    {
      user_id: user.id, platform, account_type: "bot",
      external_id, handle, display_name,
      access_token: token, status: "connected",
      scopes: p.capabilities,
    },
    { onConflict: "user_id,platform,external_id" }
  );
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ ok: true });
}
