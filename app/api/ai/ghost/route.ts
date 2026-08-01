import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI, isConfigured } from "@/lib/ai/openrouter";
import { buildGhostSystemPrompt } from "@/lib/ai/prompts";

/* ── POST /api/ai/ghost ───────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { comment, brandVoice, platform, mode = "reply" } = await req.json();
    if (!comment) {
      return NextResponse.json({ error: "Comment is required" }, { status: 400 });
    }

    // Get user's model preference
    const { data: profile } = await supabase
      .from("profiles")
      .select("ai_model")
      .eq("id", user.id)
      .single();

    // ── No API key → mock ───────────────────────────────────────
    if (!isConfigured()) {
      const result = mockGhost(comment);
      await logAction(supabase, user.id, comment, result, platform);
      return NextResponse.json(result);
    }

    // ── Call OpenRouter ─────────────────────────────────────────
    const systemPrompt = buildGhostSystemPrompt(
      mode === "classify" ? "classify" : "reply",
      brandVoice,
      platform,
    );

    const aiResult = await callAI(
      [
        { role: "system", content: systemPrompt },
        { role: "user", content: comment },
      ],
      {
        agent: "ghost",
        model: profile?.ai_model || undefined,
        jsonMode: true,
      },
    );

    // Parse the JSON response
    let result: GhostResult;
    try {
      result = JSON.parse(aiResult.content);
    } catch {
      // If JSON parsing fails, construct a safe response
      result = mode === "classify"
        ? { action: "auto_reply", reason: "Could not classify — defaulting to auto_reply", confidence: 0.5 }
        : { action: "auto_reply", reply: aiResult.content, reason: "Raw AI response", confidence: 0.7 };
    }

    // Log agent action
    await logAction(supabase, user.id, comment, result, platform);

    return NextResponse.json({ ...result, model: aiResult.model });
  } catch (err) {
    console.error("[/api/ai/ghost]", err);
    return NextResponse.json({ error: "Ghost Mode error" }, { status: 500 });
  }
}

/* ── Types ────────────────────────────────────────────────────── */

interface GhostResult {
  action: string;
  reply?: string;
  reason: string;
  confidence?: number;
}

/* ── Log to database ──────────────────────────────────────────── */

async function logAction(
  supabase: ReturnType<typeof createClient> extends Promise<infer T> ? T : never,
  userId: string,
  comment: string,
  result: GhostResult,
  platform?: string,
) {
  try {
    await supabase.from("agent_actions").insert({
      user_id: userId,
      comment,
      action: result.action,
      reply: result.reply || null,
      platform: platform || "unknown",
      reason: result.reason,
    });
  } catch {
    // Non-fatal — log and continue
  }
}

/* ── Mock fallback ────────────────────────────────────────────── */

function mockGhost(comment: string): GhostResult {
  const lower = comment.toLowerCase();
  const isLead =
    lower.includes("how much") || lower.includes("price") ||
    lower.includes("cost") || lower.includes("work with") || lower.includes("hire");
  const isComplaint =
    lower.includes("failed") || lower.includes("broken") ||
    lower.includes("not working") || lower.includes("problem") || lower.includes("issue");
  const isFluff =
    /^[🔥❤️😍🙌👏✨💯]+$/.test(comment.trim()) ||
    lower === "great post" || lower === "amazing" || lower.includes("love this");

  if (isLead) {
    return {
      action: "flag_lead",
      reason: "Comment contains pricing/collaboration inquiry",
      confidence: 0.9,
    };
  }
  if (isComplaint) {
    return {
      action: "escalate_complaint",
      reason: "Comment indicates product/service issue requiring human attention",
      confidence: 0.85,
    };
  }
  if (isFluff) {
    return {
      action: "auto_reply",
      reply: "Thank you so much! Really appreciate the support 🙌 Stay tuned for more.",
      reason: "Positive engagement — auto-reply appropriate",
      confidence: 0.9,
    };
  }
  return {
    action: "auto_reply",
    reply: "Great point! Drop any questions below 👇",
    reason: "General engagement — auto-reply appropriate",
    confidence: 0.75,
  };
}
