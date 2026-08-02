import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI, isConfigured } from "@/lib/ai/openrouter";
import { getActiveWorkspace } from "@/lib/workspace";
import { buildGeneratePrompt } from "@/lib/ai/prompts";

/* ── Types ────────────────────────────────────────────────────── */

interface GenerateBody {
  prompt?: string;
  platform?: string;
  framework?: string;   // "aida" | "pas" | "hook" | "story"
  tone?: string;
  context?: string;
  type?: "caption" | "thread" | "reply" | "hashtags" | "bio" | "idea";
  useTrends?: boolean;
}

/* ── POST /api/ai/generate ────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    // Auth guard
    const supabase = await createClient();
    const workspace = await getActiveWorkspace(supabase);
    if (!workspace) return new Response("Unauthorized", { status: 401 });
    const workspaceId = workspace.workspaceId;

    const body: GenerateBody = await req.json();
    const { prompt, platform, framework, tone, context, type = "caption", useTrends } = body;

    let finalPrompt = prompt || "";
    let trendUsed = "";

    if (useTrends) {
      // Fetch the top trend from the user's database cache
      const { data: trends } = await supabase
        .from("social_trends")
        .select("topic, summary")
        .eq("user_id", workspaceId)
        .order("score", { ascending: false })
        .limit(1);
      
      if (trends && trends.length > 0) {
        trendUsed = trends[0].topic;
        finalPrompt = `Trend: ${trends[0].topic}. Context: ${trends[0].summary}`;
      } else {
        // Fallback if no trends generated yet
        trendUsed = "AI tools in our niche";
        finalPrompt = "Latest AI tools in our niche";
      }
    } else if (!prompt && !context) {
      return NextResponse.json(
        { error: "Prompt or context is required" },
        { status: 400 },
      );
    }

    // Get user's model preference
    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_model, ai_temperature")
      .eq("id", workspaceId)
      .single();

    // Build the generation prompt
    const systemPrompt = buildGeneratePrompt({
      type,
      platform,
      tone,
      context: context || finalPrompt || "",
      framework,
    });

    const userPrompt = context
      ? `Brand context: ${context}\n\nCreate a compelling ${platform || "social media"} post about: ${finalPrompt || "our brand"}`
      : `Create a compelling ${platform || "social media"} post about: ${finalPrompt}`;

    // ── No API key → mock ───────────────────────────────────────
    if (!isConfigured()) {
      await new Promise((r) => setTimeout(r, 800));
      return NextResponse.json({ content: getMockContent(platform, framework, tone) });
    }

    // ── Call OpenRouter ─────────────────────────────────────────
    const result = await callAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      {
        agent: "generate",
        model: profile?.ai_model || undefined,
      },
    );

    // Deduct from user's generation quota
    const { error: dbError } = await supabase.rpc("decrement_generations", { user_id: workspaceId });

    return NextResponse.json({ content: result.content, model: result.model, trendUsed });
  } catch (err) {
    console.error("[/api/ai/generate]", err);
    const errorMessage = err instanceof Error ? err.message : "Generation failed. Please try again.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 },
    );
  }
}

/* ── Mock content for dev ─────────────────────────────────────── */

function getMockContent(platform?: string, framework?: string, _tone?: string): string {
  const mocks: Record<string, string> = {
    aida: `🧵 Most founders are sleeping on this growth hack in 2026...\n\nI went from 0 to 10K followers in 60 days without spending a single Naira on ads.\n\nHere's the exact 5-step system I used 👇\n\n1/ Stop posting content. Start sharing insights.\n\n2/ The 80/20 engagement rule — spend 80% of your time commenting.\n\n3/ Post at 6am or 8pm WAT. Most Nigerian creators post during work hours.\n\n4/ Every thread needs a retention hook at the end of each tweet.\n\n5/ Auto-Plug when posts blow up.\n\nWhich step are you missing? 👇`,
    pas: `The biggest problem with social media in 2026?\n\nYou're working 3x harder for half the results.\n\nAlgorithms changed. Attention spans dropped. Competition tripled.\n\nAnd the playbook everyone taught you in 2022 is dead.\n\nHere's what actually works now → [Link in bio]`,
    hook: `"I post every day and still get zero engagement."\n\nI hear this from 9 out of 10 founders I talk to.\n\nHere's the uncomfortable truth:\n\nPosting more is not the solution.\n\nPosting smarter is.\n\nDrop a 🙋 if you want me to break down the system that changed everything for my clients.`,
    story: `18 months ago, I was ready to quit social media entirely.\n\n47 posts. 230 followers. Zero clients.\n\nThen I discovered one thing that changed everything.\n\nI stopped writing for the algorithm and started writing for one person.\n\nMy ideal client. Her exact problem. Her exact words.\n\nNext month? 4 inbound leads from a single thread.\n\nThe lesson: specificity beats volume every single time.`,
  };

  if (platform === "linkedin") {
    return `Bold first line that stops the scroll.\n\nI've been quiet about this for months, but it's time to share.\n\nHere's what I learned after working with 50+ ${platform || "brands"} this quarter:\n\n→ Insight 1\n→ Insight 2\n→ Insight 3\n\nThe lesson? Consistency compounds. But only if you're consistent about the RIGHT things.\n\nWhat's your biggest challenge right now? 👇`;
  }

  return mocks[framework || "aida"] || mocks.aida;
}
