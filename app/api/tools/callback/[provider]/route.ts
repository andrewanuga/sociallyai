import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { TOOLS, type ToolId } from "@/lib/social/tools";

function back(origin: string, params: Record<string, string>) {
  const url = new URL("/dashboard/integrations", origin);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  return NextResponse.redirect(url);
}

/** OAuth callback for a tool — exchange the code and store in `integrations`. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const { provider } = await params;
  const origin = req.nextUrl.origin;
  const t = TOOLS[provider as ToolId];
  const sp = req.nextUrl.searchParams;
  if (!t?.oauth) return back(origin, { error: "unsupported", tool: provider });
  if (sp.get("error")) return back(origin, { error: "denied", tool: provider });

  const code = sp.get("code");
  const state = sp.get("state");
  const jar = await cookies();
  const expected = jar.get(`sai_tool_${provider}`)?.value;
  jar.delete(`sai_tool_${provider}`);
  if (!code || !state || state !== expected) return back(origin, { error: "bad_state", tool: provider });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.redirect(new URL("/login", origin));

  const clientId = process.env[t.oauth.clientIdEnv]!;
  const clientSecret = process.env[t.oauth.clientSecretEnv]!;
  const redirectUri = `${origin}/api/tools/callback/${provider}`;

  try {
    const isNotion = provider === "notion";
    const headers: Record<string, string> = {
      "Content-Type": isNotion ? "application/json" : "application/x-www-form-urlencoded",
    };
    // Notion authenticates the token exchange with HTTP Basic and a JSON body.
    if (isNotion) {
      headers.Authorization = "Basic " + Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    }
    const body = isNotion
      ? JSON.stringify({ grant_type: "authorization_code", code, redirect_uri: redirectUri })
      : new URLSearchParams({
          grant_type: "authorization_code", code, redirect_uri: redirectUri,
          client_id: clientId, client_secret: clientSecret,
        });

    const tokenRes = await fetch(t.oauth.tokenUrl, { method: "POST", headers, body });
    const token = await tokenRes.json();
    if (!tokenRes.ok || !(token.access_token)) return back(origin, { error: "token_failed", tool: provider });

    const { error } = await supabase.from("integrations").upsert(
      {
        user_id: user.id, provider, status: "connected",
        account_label: token.team?.name || token.workspace_name || t.name,
        config: {
          access_token: token.access_token,
          refresh_token: token.refresh_token ?? null,
          scope: token.scope ?? t.oauth.scopes.join(" "),
        },
      },
      { onConflict: "user_id,provider" }
    );
    if (error) return back(origin, { error: "store_failed", tool: provider });
    return back(origin, { connected: provider });
  } catch {
    return back(origin, { error: "exchange_error", tool: provider });
  }
}
