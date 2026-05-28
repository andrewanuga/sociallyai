import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    // Auth guard
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { prompt, platform, framework, tone, context } = body;

    if (!prompt && !context) {
      return NextResponse.json(
        { error: "Prompt or context is required" },
        { status: 400 }
      );
    }

    // Build the system prompt based on framework & tone
    const frameworkInstructions: Record<string, string> = {
      aida: "Structure the post using the AIDA framework: Attention (hook), Interest (expand), Desire (value), Action (CTA).",
      pas: "Structure the post using PAS: Problem (identify pain), Agitate (intensify), Solve (your solution).",
      hook: "Start with a provocative or surprising statement that creates an open loop, making readers want to continue.",
      story: "Use a narrative arc: set the scene, introduce conflict or challenge, reveal transformation, end with insight.",
    };

    const platformGuidelines: Record<string, string> = {
      x: "Keep under 280 characters for the opening hook. If writing a thread, number each tweet 1/, 2/, etc.",
      linkedin:
        "Start with a bold first line (no greeting). Use short paragraphs. End with a question to drive comments.",
      instagram:
        "Lead with a visual hook. Use line breaks generously. Add relevant hashtags at the end (max 10).",
      tiktok:
        "Write a punchy video script or caption. Hook in the first 3 words. Keep it energetic and conversational.",
    };

    const systemPrompt = `You are SociallyAI, an expert social media copywriter for Nigerian and African brands.
Your writing style: ${tone || "Professional"}.
Platform: ${platformGuidelines[platform] || platformGuidelines.x}
${framework ? frameworkInstructions[framework] || "" : ""}

Rules:
- Sound human, not robotic
- Use specific numbers and facts when possible
- Never use generic filler phrases like "In conclusion" or "In today's world"
- Emojis are strategic, not decorative
- End with a clear call to action or engagement hook
- If given brand context, maintain that voice throughout`;

    const userPrompt = context
      ? `Brand context: ${context}\n\nCreate a compelling ${platform || "social media"} post about: ${prompt || "our brand"}`
      : `Create a compelling ${platform || "social media"} post about: ${prompt}`;

    // Call vLLM / Gemma server (falls back to mock in development)
    const vllmUrl = process.env.VLLM_SERVER_URL;

    let generatedContent: string;

    if (vllmUrl) {
      const response = await fetch(`${vllmUrl}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.GEMMA_MODEL || "gemma-9b",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          max_tokens: 512,
          temperature: 0.8,
          response_format: { type: "text" },
        }),
      });

      if (!response.ok) {
        throw new Error(`vLLM error: ${response.statusText}`);
      }

      const data = await response.json();
      generatedContent =
        data.choices?.[0]?.message?.content || "No content generated.";
    } else {
      // Development mock — replace with real vLLM in production
      await new Promise((r) => setTimeout(r, 800));
      generatedContent = getMockContent(platform, framework, tone);
    }

    // Deduct from user's generation quota
    await supabase.rpc("decrement_generations", { user_id: user.id });

    return NextResponse.json({ content: generatedContent });
  } catch (err) {
    console.error("[/api/ai/generate]", err);
    return NextResponse.json(
      { error: "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}

function getMockContent(
  platform?: string,
  framework?: string,
  tone?: string
): string {
  const mocks: Record<string, string> = {
    aida: `🧵 Most founders are sleeping on this growth hack in 2026...\n\nI went from 0 to 10K followers in 60 days without spending a single Naira on ads.\n\nHere's the exact 5-step system I used 👇\n\n1/ Stop posting content. Start sharing insights.\n\n2/ The 80/20 engagement rule — spend 80% of your time commenting.\n\n3/ Post at 6am or 8pm WAT. Most Nigerian creators post during work hours.\n\n4/ Every thread needs a retention hook at the end of each tweet.\n\n5/ Auto-Plug when posts blow up.\n\nWhich step are you missing? 👇`,
    pas: `The biggest problem with social media in 2026?\n\nYou're working 3x harder for half the results.\n\nAlgorithms changed. Attention spans dropped. Competition tripled.\n\nAnd the playbook everyone taught you in 2022 is dead.\n\nHere's what actually works now → [Link in bio]`,
    hook: `"I post every day and still get zero engagement."\n\nI hear this from 9 out of 10 founders I talk to.\n\nHere's the uncomfortable truth:\n\nPosting more is not the solution.\n\nPosting smarter is.\n\nDrop a 🙋 if you want me to break down the system that changed everything for my clients.`,
    story: `18 months ago, I was ready to quit social media entirely.\n\n47 posts. 230 followers. Zero clients.\n\nThen I discovered one thing that changed everything.\n\nI stopped writing for the algorithm and started writing for one person.\n\nMy ideal client. Her exact problem. Her exact words.\n\nNext month? 4 inbound leads from a single thread.\n\nThe lesson: specificity beats volume every single time.`,
  };

  return mocks[framework || "aida"] || mocks["aida"];
}
