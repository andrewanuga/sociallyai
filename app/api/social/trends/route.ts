import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Hit = { title: string; url: string; source: string; snippet: string };

/**
 * Refresh niche trends for the signed-in user.
 * Uses a real web search (Tavily) when TAVILY_API_KEY is set; otherwise falls
 * back to the LLM; otherwise a deterministic seed. Each trend is scored and
 * referred to a connected account whose platform fits the ecosystem.
 */
export async function POST() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [{ data: profile }, { data: accounts }] = await Promise.all([
    supabase.from("profiles").select("persona, niche").eq("id", user.id).single(),
    supabase.from("social_accounts").select("id, platform").eq("status", "connected"),
  ]);

  const persona = profile?.persona ?? "creator";
  const niche = profile?.niche ?? "general";
  const query = `latest ${niche} trends for ${persona}s on social media this week`;

  let hits: Hit[] = [];
  try {
    if (process.env.TAVILY_API_KEY) {
      const r = await fetch("https://api.tavily.com/search", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ api_key: process.env.TAVILY_API_KEY, query, max_results: 6, search_depth: "basic", topic: "news" }),
      });
      const d = await r.json();
      hits = (d.results ?? []).map((x: Record<string, string>) => ({
        title: x.title, url: x.url, source: new URL(x.url).hostname.replace("www.", ""), snippet: x.content?.slice(0, 200) ?? "",
      }));
    } else if (process.env.VLLM_SERVER_URL) {
      const r = await fetch(`${process.env.VLLM_SERVER_URL}/v1/chat/completions`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.LLAMA_MODEL || "meta-llama/Llama-3.3-70B-Instruct",
          messages: [{ role: "user", content: `List 6 concrete trending topics right now for ${persona}s in the "${niche}" niche. For each: a short topic, a one-line why. Return as "topic :: why" lines.` }],
          max_tokens: 400, temperature: 0.7,
        }),
      });
      const d = await r.json();
      const text: string = d.choices?.[0]?.message?.content ?? "";
      hits = text.split("\n").filter((l) => l.includes("::")).slice(0, 6).map((l) => {
        const [t, why] = l.split("::");
        return { title: t.replace(/^\d+[.)]\s*/, "").trim(), url: "", source: "AI", snippet: (why ?? "").trim() };
      });
    }
  } catch { /* fall through to seed */ }

  if (hits.length === 0) {
    hits = [
      { title: `AI tools reshaping ${niche}`, url: "", source: "seed", snippet: "Automation is the story creators keep returning to." },
      { title: `Short-form video wins in ${niche}`, url: "", source: "seed", snippet: "Reels/Shorts outpace static posts on reach." },
      { title: `Behind-the-scenes builds trust`, url: "", source: "seed", snippet: "Process content converts better than polish." },
    ];
  }

  // Ecosystem → platform hint for referral.
  const platformHint = (h: Hit): string | null => {
    const t = (h.title + h.snippet).toLowerCase();
    if (t.includes("video") || t.includes("reel") || t.includes("short")) return accounts?.find((a) => ["youtube", "instagram", "tiktok"].includes(a.platform))?.id ?? null;
    return accounts?.[0]?.id ?? null;
  };

  const rows = hits.map((h, i) => ({
    user_id: user.id, persona, niche, ecosystem: niche,
    topic: h.title, summary: h.snippet, source_url: h.url || null, source_name: h.source,
    score: 92 - i * 6, momentum: i < 2 ? "Accelerating" : "Building",
    relevant_platforms: accounts?.map((a) => a.platform) ?? [],
    suggested_account_id: platformHint(h),
    draft: null,
    expires_at: new Date(Date.now() + 12 * 3600 * 1000).toISOString(),
  }));

  // Replace this user's cache.
  await supabase.from("social_trends").delete().eq("user_id", user.id);
  const { data, error } = await supabase.from("social_trends").insert(rows).select();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ trends: data, searched: !!process.env.TAVILY_API_KEY });
}
