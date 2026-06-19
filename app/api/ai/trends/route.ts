import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface TrendResult {
  topic: string;
  category: string;
  score: number;
  growth: string;
  momentum: string;
  why: string;
  draft: string;
}

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const niche = searchParams.get("niche") || "general";

    const vllmUrl = process.env.VLLM_SERVER_URL;
    let trends: TrendResult[];

    if (vllmUrl) {
      const response = await fetch(`${vllmUrl}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.LLAMA_MODEL || "meta-llama/Llama-3.3-70B-Instruct",
          messages: [
            {
              role: "user",
              content: `You are a social media trend analyst for African markets, particularly Nigeria.
Generate 5 trending topics for a ${niche} creator in 2026.
Return a JSON array of objects with fields: topic, category, score (0-100), growth (e.g. "+234%"), momentum ("Accelerating"|"Rising fast"|"Steady"|"Building"|"Moderate"), why (personalized reason), draft (a 100-word post draft).
Only return valid JSON array, no markdown.`,
            },
          ],
          max_tokens: 1024,
          temperature: 0.7,
          response_format: { type: "json_object" },
        }),
      });

      const data = await response.json();
      trends = JSON.parse(data.choices?.[0]?.message?.content || "[]");
    } else {
      // Development mock
      trends = getMockTrends(niche);
    }

    return NextResponse.json({ trends });
  } catch (err) {
    console.error("[/api/ai/trends]", err);
    return NextResponse.json(
      { error: "Failed to fetch trends." },
      { status: 500 }
    );
  }
}

function getMockTrends(niche: string): TrendResult[] {
  return [
    {
      topic: "AI Regulation in Africa",
      category: "Tech / Policy",
      score: 94,
      growth: "+342%",
      momentum: "Accelerating",
      why: "High relevance to tech-focused accounts with strong policy discussion history",
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
