import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { comment, brandVoice, platform } = await req.json();

    if (!comment) {
      return NextResponse.json(
        { error: "Comment is required" },
        { status: 400 }
      );
    }

    const vllmUrl = process.env.VLLM_SERVER_URL;
    let result: { action: string; reply?: string; reason: string };

    if (vllmUrl) {
      const prompt = `You are a social media brand manager. Analyze this comment and decide the best action.
Brand voice: ${brandVoice || "Professional and helpful"}
Platform: ${platform || "general"}
Comment: "${comment}"

Return a JSON object with:
- action: "auto_reply" | "flag_lead" | "escalate_complaint" | "ignore"
- reply: (if action is auto_reply) the reply text in brand voice
- reason: brief explanation

Return only valid JSON.`;

      const response = await fetch(`${vllmUrl}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.GEMMA_MODEL || "gemma-9b",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 200,
          temperature: 0.4,
          response_format: { type: "json_object" },
        }),
      });

      const data = await response.json();
      result = JSON.parse(data.choices?.[0]?.message?.content || "{}");
    } else {
      // Mock classification
      const lower = comment.toLowerCase();
      const isLead =
        lower.includes("how much") ||
        lower.includes("price") ||
        lower.includes("cost") ||
        lower.includes("work with") ||
        lower.includes("hire");
      const isComplaint =
        lower.includes("failed") ||
        lower.includes("broken") ||
        lower.includes("not working") ||
        lower.includes("problem") ||
        lower.includes("issue");
      const isFluff =
        /^[🔥❤️😍🙌👏✨💯]+$/.test(comment.trim()) ||
        lower === "great post" ||
        lower === "amazing" ||
        lower.includes("love this");

      if (isLead) {
        result = {
          action: "flag_lead",
          reason: "Comment contains pricing/collaboration inquiry",
        };
      } else if (isComplaint) {
        result = {
          action: "escalate_complaint",
          reason: "Comment indicates product/service issue requiring human attention",
        };
      } else if (isFluff) {
        result = {
          action: "auto_reply",
          reply: "Thank you so much! Really appreciate the support 🙌 Stay tuned for more.",
          reason: "Positive engagement — auto-reply appropriate",
        };
      } else {
        result = {
          action: "auto_reply",
          reply: "Great point! Drop any questions below 👇",
          reason: "General engagement — auto-reply appropriate",
        };
      }
    }

    // Log agent action to database
    await supabase.from("agent_actions").insert({
      user_id: user.id,
      comment,
      action: result.action,
      reply: result.reply || null,
      platform: platform || "unknown",
      reason: result.reason,
    });

    return NextResponse.json(result);
  } catch (err) {
    console.error("[/api/ai/ghost]", err);
    return NextResponse.json({ error: "Ghost Mode error" }, { status: 500 });
  }
}
