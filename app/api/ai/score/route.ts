import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI, isConfigured } from "@/lib/ai/openrouter";
import { buildScorePrompt } from "@/lib/ai/prompts";

/* ── Types ────────────────────────────────────────────────────── */

interface ScoreResponse {
  score: number;
  prediction: "high" | "medium" | "low";
  bestTime: string;
  reasoning: string;
  improvements: string[];
}

/* ── POST /api/ai/score ───────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { content, platform } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    // Get user's model preference
    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_model")
      .eq("id", user.id)
      .single();

    // ── No API key → mock ───────────────────────────────────────
    if (!isConfigured()) {
      await new Promise((r) => setTimeout(r, 500));
      return NextResponse.json(mockScore(content));
    }

    // ── Call OpenRouter ─────────────────────────────────────────
    const prompt = buildScorePrompt(content, platform);

    const result = await callAI(
      [
        { role: "system", content: "You are an expert social media content analyst. Return ONLY valid JSON." },
        { role: "user", content: prompt },
      ],
      {
        agent: "score",
        model: profile?.ai_model || undefined,
        jsonMode: true,
      },
    );

    // Parse JSON response
    let scoreData: ScoreResponse;
    try {
      scoreData = JSON.parse(result.content);
    } catch {
      scoreData = mockScore(content);
    }

    return NextResponse.json({ ...scoreData, model: result.model });
  } catch (err) {
    console.error("[/api/ai/score]", err);
    return NextResponse.json(
      { error: "Scoring failed. Please try again." },
      { status: 500 },
    );
  }
}

/* ── Mock fallback ────────────────────────────────────────────── */

function mockScore(content: string): ScoreResponse {
  const length = content.length;
  const hasEmoji = /\p{Emoji}/u.test(content);
  const hasNumbers = /\d/.test(content);
  const hasQuestion = content.includes("?");
  const hasThread = content.includes("🧵") || content.includes("1/");

  let score = 55;
  if (hasEmoji) score += 8;
  if (hasNumbers) score += 10;
  if (hasQuestion) score += 12;
  if (hasThread) score += 15;
  if (length > 100 && length < 400) score += 10;
  score = Math.min(score, 98);

  return {
    score,
    prediction: score >= 75 ? "high" : score >= 55 ? "medium" : "low",
    bestTime: "Thursday 8:00am WAT",
    reasoning:
      score >= 75
        ? "Strong hook, clear value proposition, and engagement driver."
        : "Solid content — a stronger opening hook would boost reach.",
    improvements: [
      "Add a specific number in the first line (e.g. '3 things', '47% of creators')",
      "End with a direct question to boost comment engagement",
      hasThread
        ? "Consider adding a final 'save this' CTA"
        : "Try breaking this into a numbered thread for higher retention",
    ],
  };
}
