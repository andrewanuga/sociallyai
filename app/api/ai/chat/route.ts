import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { learnPersona, getPersonaTone } from "@/lib/social/persona";
import { callAI, callAIStream, isConfigured, buildMultimodalContent } from "@/lib/ai/openrouter";
import { getActiveWorkspace } from "@/lib/workspace";
import { buildChatSystemPrompt } from "@/lib/ai/prompts";
import { RECOMMENDED_MODELS } from "@/lib/ai/models";
import type { ChatMessage } from "@/lib/ai/openrouter";
import { AI_TOOLS, executeTool } from "@/lib/ai/tools";

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
    const workspace = await getActiveWorkspace(supabase);
    if (!workspace) return new Response("Unauthorized", { status: 401 });
    const workspaceId = workspace.workspaceId;

    const { messages, attachments, model, stream: wantsStream, chatId: inputChatId } = (await req.json()) as {
      messages: InputMessage[];
      attachments?: Attachment[];
      model?: string;
      stream?: boolean;
      chatId?: string;
    };
    if (!messages?.length) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    // ── Per-user AI preferences from profile ───────────────────
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, persona, niche, brand_voice, ai_model, ai_unfiltered, ai_temperature")
      .eq("id", workspaceId)
      .single();

    const unfiltered = !!profile?.ai_unfiltered;
    const temperature = Number(profile?.ai_temperature ?? 0.7);
    const userModel = profile?.ai_model || undefined;

    // ── Personalization: learned writing style ──────────────────
    const lastUserText = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";
    const tone = await getPersonaTone(supabase, workspaceId);
    learnPersona(supabase, workspaceId, lastUserText); // fire-and-forget

    // ── Database persistence: save user message ─────────────────
    let activeChatId = inputChatId;
    if (!activeChatId) {
      // Create new chat
      const title = lastUserText ? (lastUserText.slice(0, 40) + (lastUserText.length > 40 ? "..." : "")) : "New Chat";
      const { data: newChat, error: chatErr } = await supabase
        .from("chats")
        .insert({ workspace_id: workspaceId, title })
        .select("id")
        .single();
      if (!chatErr && newChat) activeChatId = newChat.id;
    }

    if (activeChatId) {
      // Save user message
      await supabase.from("chat_messages").insert({
        chat_id: activeChatId,
        role: "user",
        content: lastUserText,
        attachments: attachments || [],
      });
    }

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
    const selectedModel = model || userModel || undefined;
    const modelInfo = RECOMMENDED_MODELS.find((m) => m.id === selectedModel);
    const canDoVision = modelInfo ? modelInfo.supportsVision : true; // assume true for unknown models

    // ── Inject past chat context ────────────────────────────────
    let pastChatsContext = "";
    if (activeChatId) {
      const { data: pastMsgs } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("chat_id", activeChatId)
        .order("created_at", { ascending: false })
        .limit(10);
        
      if (pastMsgs && pastMsgs.length > 0) {
        pastMsgs.reverse();
        pastChatsContext = "\n\n--- Past Conversation Context ---\n" + 
          pastMsgs.map(m => `${m.role.toUpperCase()}: ${m.content}`).join("\n");
      }
    }

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
    ) + pastChatsContext;

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

    // ── Agentic Tool Calling Loop ───────────────────────────────
    // ── Agentic Tool Calling Loop ───────────────────────────────
    let loopCount = 0;
    const MAX_LOOPS = 4;
    let finalContent = "";
    let finalModel = selectedModel;

    while (loopCount < MAX_LOOPS) {
      loopCount++;
      const res = await callAI(aiMessages, {
        agent: "chat",
        model: selectedModel,
        temperature,
        tools: AI_TOOLS,
      });

      finalModel = res.model;

      if (res.tool_calls && res.tool_calls.length > 0) {
        // Model called a tool
        const toolCall = res.tool_calls[0]; // execute first tool
        const name = toolCall.function?.name;
        const args = toolCall.function?.arguments ? JSON.parse(toolCall.function.arguments) : {};
        
        // Push the assistant's tool call intent
        aiMessages.push({ role: "assistant", content: `[Called tool: ${name} with args: ${JSON.stringify(args)}]` });

        // Execute it
        const toolResult = await executeTool(name, args);

        // Push the tool result as system/user observation
        aiMessages.push({ role: "system", content: `Tool '${name}' returned: ${toolResult}` });
      } else {
        // No tools called, we have our final text
        finalContent = res.content;
        break;
      }
    }

    if (!finalContent && loopCount >= MAX_LOOPS) {
      finalContent = "I reached my maximum number of thinking steps and had to stop. Please try asking again in a different way.";
    }

    // Save final assistant message to db
    if (activeChatId) {
      await supabase.from("chat_messages").insert({
        chat_id: activeChatId,
        role: "assistant",
        content: finalContent,
        model: finalModel,
      });
    }

    // ── Return Response ──────────────────────────────────────────
    if (!wantsStream) {
      return NextResponse.json({ reply: finalContent, model: finalModel, chatId: activeChatId });
    }

    // The UI expects a ReadableStream. We can wrap the final generated text in one chunk.
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        // We can chunk it out to make it look like a stream visually
        const words = finalContent.split(" ");
        let i = 0;
        const interval = setInterval(() => {
          if (i < words.length) {
            controller.enqueue(encoder.encode(words[i] + " "));
            i++;
          } else {
            clearInterval(interval);
            controller.close();
          }
        }, 10);
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Chat-Id": activeChatId || "",
      },
    });

  } catch (err) {
    console.error("[/api/ai/chat]", err);

    // If OpenRouter is down, try mock
    if (!isConfigured()) {
      return NextResponse.json({ reply: mockReply("", false, []) });
    }

    const errorMessage = err instanceof Error ? err.message : "The agent hit a snag. Try again.";

    return NextResponse.json(
      { error: errorMessage },
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
