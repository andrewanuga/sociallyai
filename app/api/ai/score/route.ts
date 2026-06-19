import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface ScoreResponse {
  score: number;
  prediction: "high" | "medium" | "low";
  bestTime: string;
  reasoning: string;
  improvements: string[];
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { content, platform } = await req.json();

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    const vllmUrl = process.env.VLLM_SERVER_URL;
    let scoreData: ScoreResponse;

    if (vllmUrl) {
      const prompt = `Analyze this ${platform || "social media"} post and return a JSON object with:
- score (0-100): predicted engagement score
- prediction: "high" | "medium" | "low"
- bestTime: optimal posting time (e.g. "Thursday 8am WAT")
- reasoning: one sentence explanation
- improvements: array of 2-3 specific actionable improvements

Post to analyze:
"""
${content}
"""

Return ONLY valid JSON, no markdown.`;

      const response = await fetch(`${vllmUrl}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.LLAMA_MODEL || "meta-llama/Llama-3.3-70B-Instruct",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 256,
          temperature: 0.3,
          response_format: { type: "json_object" },
        }),
      });

      const data = await response.json();
      scoreData = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    } else {
      // Development mock
      await new Promise((r) => setTimeout(r, 500));
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

      scoreData = {
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

    return NextResponse.json(scoreData);
  } catch (err) {
    console.error("[/api/ai/score]", err);
    return NextResponse.json(
      { error: "Scoring failed. Please try again." },
      { status: 500 }
    );
  }
}
