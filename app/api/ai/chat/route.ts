import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type ChatMessage = { role: "user" | "assistant" | "system"; content: string };
type Attachment = {
  type: "image" | "video" | "file";
  name: string;
  mime?: string;
  content?: string; // extracted text (for text-like files)
  dataUrl?: string; // base64 (images) — used when a vision model is configured
};

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { messages, attachments } = (await req.json()) as {
      messages: ChatMessage[];
      attachments?: Attachment[];
    };
    if (!messages?.length) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    // Fold attachments into the final user turn so the agent can use them.
    if (attachments?.length) {
      const lines: string[] = ["", "--- Attached by the user ---"];
      for (const a of attachments) {
        if (a.type === "file" && a.content) {
          lines.push(`File "${a.name}" contents:\n${a.content.slice(0, 6000)}`);
        } else if (a.type === "image") {
          lines.push(`Image: "${a.name}" (${a.mime || "image"}). Use it as visual reference for the copy.`);
        } else if (a.type === "video") {
          lines.push(`Video: "${a.name}" (${a.mime || "video"}). Treat as the asset this post promotes.`);
        } else {
          lines.push(`Attachment: "${a.name}".`);
        }
      }
      const last = [...messages].reverse().find((m) => m.role === "user");
      if (last) last.content = `${last.content}\n${lines.join("\n")}`;
    }

    // Per-user AI preferences
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, persona, niche, brand_voice, ai_model, ai_unfiltered, ai_temperature")
      .eq("id", user.id)
      .single();

    const unfiltered = !!profile?.ai_unfiltered;
    const temperature = Number(profile?.ai_temperature ?? 0.7);

    const systemPrompt = [
      "You are Socially AI — a personal social media agent for this specific user.",
      profile?.persona ? `They are a ${profile.persona}.` : "",
      profile?.niche ? `Their niche: ${profile.niche}.` : "",
      profile?.brand_voice ? `Match this brand voice: ${profile.brand_voice}.` : "",
      "You help ideate, draft, and refine posts, threads, captions, and replies across X, LinkedIn, Instagram and TikTok.",
      "Be concrete and punchy. Offer ready-to-post drafts, not vague advice.",
      unfiltered
        ? "The user has enabled raw mode: write naturally and directly without softening or corporate hedging. Still stay lawful and safe."
        : "Keep it brand-safe and professional.",
    ].filter(Boolean).join("\n");

    const vllmUrl = process.env.VLLM_SERVER_URL;
    let reply: string;

    if (vllmUrl) {
      const response = await fetch(`${vllmUrl}/v1/chat/completions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.LLAMA_MODEL || profile?.ai_model || "meta-llama/Llama-3.3-70B-Instruct",
          messages: [{ role: "system", content: systemPrompt }, ...messages],
          max_tokens: 700,
          temperature,
        }),
      });
      if (!response.ok) throw new Error(`vLLM error: ${response.statusText}`);
      const data = await response.json();
      reply = data.choices?.[0]?.message?.content || "…";
    } else {
      await new Promise((r) => setTimeout(r, 700));
      const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
      reply = mockReply(lastUser, unfiltered, attachments ?? []);
    }

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[/api/ai/chat]", err);
    return NextResponse.json({ error: "The agent hit a snag. Try again." }, { status: 500 });
  }
}

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
