import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { PLATFORMS, type PlatformId } from "@/lib/social/platforms";

function back(origin: string, params: Record<string, string>) {
  const url = new URL("/dashboard/integrations", origin);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return NextResponse.redirect(url);
}

/** OAuth callback — exchange the code for tokens and store the account. */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const origin = req.nextUrl.origin;
  const p = PLATFORMS[platform as PlatformId];
  const sp = req.nextUrl.searchParams;

  if (!p?.oauth) return back(origin, { error: "unsupported", platform });
  if (sp.get("error")) return back(origin, { error: "denied", platform });

  const code = sp.get("code");
  const state = sp.get("state");
  const jar = await cookies();
  const expected = jar.get(`sai_oauth_${platform}`)?.value;
  jar.delete(`sai_oauth_${platform}`);
  if (!code || !state || state !== expected) return back(origin, { error: "bad_state", platform });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin));

  const clientId = process.env[p.oauth.clientIdEnv]!;
  const clientSecret = process.env[p.oauth.clientSecretEnv]!;
  const redirectUri = `${origin}/api/social/callback/${platform}`;

  try {
    // ── Exchange the authorization code for an access token ──
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
    });
    const headers: Record<string, string> = { "Content-Type": "application/x-www-form-urlencoded" };

    // x + reddit authenticate the token request with HTTP Basic.
    if (platform === "x" || platform === "reddit") {
      headers.Authorization = "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
      if (platform === "x") body.set("code_verifier", state); // PKCE (plain)
    } else {
      body.set("client_secret", clientSecret);
    }
    if (platform === "reddit") headers["User-Agent"] = "socially-ai/1.0";

    const tokenRes = await fetch(p.oauth.tokenUrl, { method: "POST", headers, body });
    const token = await tokenRes.json();
    if (!tokenRes.ok || !token.access_token) return back(origin, { error: "token_failed", platform });

    // ── Best-effort profile lookup (fills handle/id; sync fills the rest) ──
    const profile = await fetchProfile(platform as PlatformId, token.access_token);

    const { error } = await supabase.from("social_accounts").upsert(
      {
        user_id: user.id,
        platform,
        account_type: profile.type ?? "personal",
        external_id: profile.id ?? `me:${user.id}`,
        handle: profile.handle ?? null,
        display_name: profile.name ?? p.name,
        avatar_url: profile.avatar ?? null,
        access_token: token.access_token,
        refresh_token: token.refresh_token ?? null,
        token_expires_at: token.expires_in ? new Date(Date.now() + token.expires_in * 1000).toISOString() : null,
        scopes: p.oauth.scopes,
        status: "connected",
      },
      { onConflict: "user_id,platform,external_id" }
    );
    if (error) return back(origin, { error: "store_failed", platform });

    return back(origin, { connected: platform });
  } catch {
    return back(origin, { error: "exchange_error", platform });
  }
}

type Profile = { id?: string; handle?: string; name?: string; avatar?: string; type?: "personal" | "business" | "creator" | "page" | "channel" };

/** Minimal identity lookups. Full metrics come from the background sync worker. */
async function fetchProfile(platform: PlatformId, accessToken: string): Promise<Profile> {
  const auth = { Authorization: `Bearer ${accessToken}` };
  try {
    if (platform === "x") {
      const r = await fetch("https://api.twitter.com/2/users/me", { headers: auth });
      const d = await r.json();
      return { id: d.data?.id, handle: d.data?.username ? `@${d.data.username}` : undefined, name: d.data?.name };
    }
    if (platform === "linkedin") {
      const r = await fetch("https://api.linkedin.com/v2/userinfo", { headers: auth });
      const d = await r.json();
      return { id: d.sub, name: d.name, avatar: d.picture };
    }
    if (platform === "youtube") {
      const r = await fetch("https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true", { headers: auth });
      const d = await r.json();
      const c = d.items?.[0];
      return { id: c?.id, handle: c?.snippet?.customUrl, name: c?.snippet?.title, avatar: c?.snippet?.thumbnails?.default?.url, type: "channel" };
    }
    if (platform === "reddit") {
      const r = await fetch("https://oauth.reddit.com/api/v1/me", { headers: { ...auth, "User-Agent": "socially-ai/1.0" } });
      const d = await r.json();
      return { id: d.id, handle: d.name ? `u/${d.name}` : undefined, name: d.name };
    }
    if (platform === "facebook" || platform === "instagram") {
      const r = await fetch(`https://graph.facebook.com/v19.0/me?fields=id,name&access_token=${accessToken}`);
      const d = await r.json();
      return { id: d.id, name: d.name, type: platform === "instagram" ? "business" : "page" };
    }
    if (platform === "threads") {
      const r = await fetch(`https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url&access_token=${accessToken}`);
      const d = await r.json();
      return { id: d.id, handle: d.username ? `@${d.username}` : undefined, name: d.name, avatar: d.threads_profile_picture_url, type: "creator" };
    }
  } catch { /* fall through to empty profile */ }
  return {};
}
