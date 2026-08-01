import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI, isConfigured } from "@/lib/ai/openrouter";
import { getActiveWorkspace } from "@/lib/workspace";
import { buildTrendsPrompt } from "@/lib/ai/prompts";

/* ── Types ────────────────────────────────────────────────────── */

interface TrendResult {
  topic: string;
  category: string;
  score: number;
  growth: string;
  momentum: string;
  why: string;
  draft: string;
}

/* ── Web search (Tavily) ──────────────────────────────────────── */

const TAVILY = process.env.TAVILY_API_KEY;

async function webSearch(query: string): Promise<string> {
  if (!TAVILY) return "";
  try {
    const res = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: TAVILY,
        query,
        search_depth: "basic",
        max_results: 5,
      }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    return (data.results ?? [])
      .map((r: { title: string; content: string }) => `• ${r.title}: ${r.content}`)
      .join("\n");
  } catch {
    return "";
  }
}

/* ── GET /api/ai/trends ───────────────────────────────────────── */

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const workspace = await getActiveWorkspace(supabase);
    if (!workspace) return new Response("Unauthorized", { status: 401 });
    const workspaceId = workspace.workspaceId;

    const { searchParams } = new URL(req.url);
    const niche = searchParams.get("niche") || "general";

    // Get user's model preference
    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_model, niche")
      .eq("id", workspaceId)
      .single();

    const userNiche = niche !== "general" ? niche : profile?.niche || "general";

    // ── No API key → mock ───────────────────────────────────────
    if (!isConfigured()) {
      return NextResponse.json({ trends: getMockTrends(userNiche) });
    }

    // ── Web search for context ──────────────────────────────────
    const searchResults = await webSearch(
      `trending ${userNiche} content social media ${new Date().toISOString().slice(0, 7)}`,
    );

    // ── Call OpenRouter ─────────────────────────────────────────
    const prompt = buildTrendsPrompt(userNiche, searchResults || undefined);

    const result = await callAI(
      [
        { role: "system", content: "Return ONLY valid JSON. No markdown, no backticks, no explanation." },
        { role: "user", content: prompt },
      ],
      {
        agent: "trends",
        model: profile?.ai_model || undefined,
        jsonMode: true,
      },
    );

    // Parse JSON response
    let trends: TrendResult[];
    try {
      const parsed = JSON.parse(result.content);
      trends = parsed.trends || parsed;
    } catch {
      trends = getMockTrends(userNiche);
    }

    return NextResponse.json({ trends, model: result.model });
  } catch (err) {
    console.error("[/api/ai/trends]", err);
    return NextResponse.json(
      { error: "Failed to fetch trends." },
      { status: 500 },
    );
  }
}

/* ── Mock trends ──────────────────────────────────────────────── */

function getMockTrends(niche: string): TrendResult[] {
  return [
    {
      topic: "AI Regulation in Africa",
      category: "Tech / Policy",
      score: 94,
      growth: "+342%",
      momentum: "Accelerating",
      why: `High relevance to ${niche}-focused accounts with strong policy discussion history`,
      draft:
        "🚨 Nigeria's AI governance framework just dropped — here's what it means for every founder building AI products in Africa...\n\nThis changes everything about how we build, deploy, and monetize AI in 2026.\n\nThread 🧵",
    },
    {
      topic: "Naira Stabilization & SaaS Pricing",
      category: "Fintech / Business",
      score: 87,
      growth: "+218%",
      momentum: "Rising fast",
      why: "Directly relevant to Nigeria-focused business audience",
      draft:
        "The Naira holding steady at ₦1,580/$ for 6 weeks straight has fundamentally changed how we price SaaS in Africa.\n\nHere's what I've learned after repricing 3 products this quarter 👇",
    },
    {
      topic: "Creator Economy Nigeria 2026",
      category: "Creators / Marketing",
      score: 81,
      growth: "+156%",
      momentum: "Steady",
      why: "Matches primary content niche and target audience",
      draft:
        "The Nigerian creator economy just crossed $1.2B. Yet 87% of creators are still monetizing it wrong.\n\nHere's the playbook nobody talks about for building real revenue from your audience in 2026:",
    },
    {
      topic: "Remote Work Africa: The New Normal",
      category: "Lifestyle / Work",
      score: 74,
      growth: "+98%",
      momentum: "Building",
      why: "Strong performance pattern on remote work content",
      draft:
        "I managed a fully remote team across 4 African countries for 18 months.\n\nWhat nobody tells you about timezone struggles, power outages, and keeping culture alive when everyone is 2,000km apart:",
    },
    {
      topic: "Bootstrapped vs Funded: The 2026 Data",
      category: "Startups / VC",
      score: 68,
      growth: "+74%",
      momentum: "Moderate",
      why: "Matches founder audience profile",
      draft:
        "After studying 50+ Nigerian startups up close: here's the data on when to bootstrap vs when to raise.\n\nThe answer surprised even me.",
    },
  ];
}
