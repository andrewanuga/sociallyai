import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { learnPersona, getPersonaTone } from "@/lib/social/persona";
import { callAI, callAIStream, isConfigured, buildMultimodalContent } from "@/lib/ai/openrouter";
import { buildChatSystemPrompt } from "@/lib/ai/prompts";
import { RECOMMENDED_MODELS } from "@/lib/ai/models";
import type { ChatMessage } from "@/lib/ai/openrouter";

/* ── Types ────────────────────────────────────────────────────── */

type InputMessage = { role: "user" | "assistant" | "system"; content: string };
type Attachment = {
  type: "image" | "video" | "file";
  name: string;
  mime?: string;
  content?: string;   // extracted text (for text-like files)
  dataUrl?: string;   // base64 (images) — used with vision models
};

/* ── POST /api/ai/chat ────────────────────────────────────────── */

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messages, attachments, stream: wantsStream } = (await req.json()) as {
      messages: InputMessage[];
      attachments?: Attachment[];
      stream?: boolean;
    };
    if (!messages?.length) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    // ── Per-user AI preferences from profile ───────────────────
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, persona, niche, brand_voice, ai_model, ai_unfiltered, ai_temperature")
      .eq("id", user.id)
      .single();

    const unfiltered = !!profile?.ai_unfiltered;
    const temperature = Number(profile?.ai_temperature ?? 0.7);
    const userModel = profile?.ai_model || undefined;

    // ── Personalization: learned writing style ──────────────────
    const lastUserText = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const tone = await getPersonaTone(supabase, user.id);
    learnPersona(supabase, user.id, lastUserText); // fire-and-forget

    // ── Build attachment context ────────────────────────────────
    const imageDataUrls: string[] = [];
    const attachmentLines: string[] = [];

    if (attachments?.length) {
      for (const a of attachments) {
        if (a.type === "image" && a.dataUrl) {
          imageDataUrls.push(a.dataUrl);
          attachmentLines.push(`Image: "${a.name}" — use it as the visual anchor for content.`);
        } else if (a.type === "video") {
          attachmentLines.push(`Video: "${a.name}" (${a.mime || "video"}) — this is the asset the post promotes.`);
        } else if (a.type === "file" && a.content) {
          attachmentLines.push(`File "${a.name}" contents:\n${a.content.slice(0, 6000)}`);
        } else {
          attachmentLines.push(`Attachment: "${a.name}".`);
        }
      }
    }

    // ── Check if selected model supports vision ─────────────────
    const selectedModel = userModel || undefined;
    const modelInfo = RECOMMENDED_MODELS.find((m) => m.id === selectedModel);
    const canDoVision = modelInfo ? modelInfo.supportsVision : true; // assume true for unknown models

    // ── Build system prompt ─────────────────────────────────────
    const attachSummary = attachmentLines.length
      ? attachmentLines.join("\n")
      : null;

    const systemPrompt = buildChatSystemPrompt(
      {
        full_name: profile?.full_name,
        persona: profile?.persona,
        niche: profile?.niche,
        brand_voice: profile?.brand_voice,
        ai_unfiltered: unfiltered,
      },
      tone,
      attachSummary,
    );

    // ── Build messages array for OpenRouter ─────────────────────
    const aiMessages: ChatMessage[] = [
      { role: "system", content: systemPrompt },
    ];

    for (const msg of messages) {
      if (msg.role === "system") continue;
      aiMessages.push({ role: msg.role, content: msg.content });
    }

    // ── Inject images into the last user message (vision) ───────
    if (imageDataUrls.length > 0 && canDoVision) {
      const lastUserMsg = [...aiMessages].reverse().find((m) => m.role === "user");
      if (lastUserMsg) {
        const textContent = typeof lastUserMsg.content === "string"
          ? lastUserMsg.content
          : lastUserMsg.content.map((p) => (p.type === "text" ? p.text : "")).join("");

        // Add non-image attachment text to the user message
        const nonImageAttachments = attachmentLines.filter((l) => !l.startsWith("Image:"));
        const fullText = nonImageAttachments.length
          ? `${textContent}\n\n--- Attached by the user ---\n${nonImageAttachments.join("\n")}`
          : textContent;

        lastUserMsg.content = buildMultimodalContent(fullText, imageDataUrls);
      }
    } else if (attachmentLines.length > 0) {
      // No vision → fold attachments as text into the last user message
      const lastUserMsg = [...aiMessages].reverse().find((m) => m.role === "user");
      if (lastUserMsg && typeof lastUserMsg.content === "string") {
        lastUserMsg.content = `${lastUserMsg.content}\n\n--- Attached by the user ---\n${attachmentLines.join("\n")}`;
      }
    }

    // ── No API key configured → mock ────────────────────────────
    if (!isConfigured()) {
      await new Promise((r) => setTimeout(r, 700));
      const reply = mockReply(lastUserText, unfiltered, attachments ?? []);
      return NextResponse.json({ reply });
    }

    // ── Streaming response ──────────────────────────────────────
    if (wantsStream) {
      try {
        const stream = await callAIStream(aiMessages, {
          agent: "chat",
          model: selectedModel,
          temperature,
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache",
            "Transfer-Encoding": "chunked",
          },
        });
      } catch (err) {
        console.error("[Chat stream fallback]", err);
        // Fall through to non-streaming
      }
    }

    // ── Non-streaming response ──────────────────────────────────
    const result = await callAI(aiMessages, {
      agent: "chat",
      model: selectedModel,
      temperature,
    });

    return NextResponse.json({ reply: result.content, model: result.model });
  } catch (err) {
    console.error("[/api/ai/chat]", err);

    // If OpenRouter is down, try mock
    if (!isConfigured()) {
      return NextResponse.json({ reply: mockReply("", false, []) });
    }

    return NextResponse.json(
      { error: "The agent hit a snag. Try again." },
      { status: 500 },
    );
  }
}

/* ── Mock fallback for dev without API key ────────────────────── */

function mockReply(lastUser: string, unfiltered: boolean, attachments: Attachment[]): string {
  const topic = (lastUser.split("--- Attached")[0]).slice(0, 80).trim() || "your idea";
  const attachNote = attachments.length
    ? [
        "",
        `I've got your ${attachments.map((a) => a.type).join(", ")} — I'll anchor the copy to ${attachments.map((a) => `"${a.name}"`).join(", ")}.`,
      ].join("\n")
    : "";
  return [
    `Here's a first draft on "${topic}":${attachNote}`,
    "",
    unfiltered
      ? "Let's be blunt — most people scrolling past this don't care yet. So we earn it in line one:"
      : "Opening with a hook that stops the scroll:",
    "",
    `"Everyone told me ${topic} was a solved problem. It isn't — and here's the 3-minute version of why."`,
    "",
    "• Point 1 — the tension nobody names",
    "• Point 2 — the shift that changes it",
    "• Point 3 — what you do Monday morning",
    "",
    "Want this as an X thread, a LinkedIn post, or a Reel script? I can also tune the tone.",
  ].join("\n");
}
