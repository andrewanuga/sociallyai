import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAIStream } from "@/lib/ai/openrouter";
import { getActiveWorkspace } from "@/lib/workspace";

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const workspace = await getActiveWorkspace(supabase);
    
    // Allow anonymous chat if no workspace is active
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const { messages, chatId: inputChatId } = await req.json();
    if (!messages?.length) {
      return new Response("Messages required", { status: 400 });
    }

    let chatId = inputChatId;
    const lastUserMsg = messages[messages.length - 1];

    if (!chatId) {
      const { data: chat } = await supabase.from("support_chats").insert({
        user_id: user.id,
      }).select("id").single();
      if (chat) chatId = chat.id;
    }

    if (chatId) {
      await supabase.from("support_messages").insert({
        chat_id: chatId,
        role: "user",
        content: lastUserMsg.content,
      });
    }

    // Prepend system prompt
    const systemPrompt = `You are the friendly, helpful AI support agent for Socially.AI, an AI-powered social media management platform.
Your job is to help the user navigate the platform, answer questions about features, troubleshoot issues, and collect bug reports or feature requests.

Key features of Socially.AI:
- "Ghost Mode" / Firehose: Real-time lead generation by listening to global social streams (Twitter, Reddit, etc.) based on keywords.
- Sync: Automatically pulls followers, metrics, and posts from YouTube, Telegram, Facebook, Instagram, and Threads.
- Post Scheduling: Compose and schedule posts across platforms.
- AI Content Generation: "Suggest Ideas" button creates contextual content based on current social trends.

Important limitations:
- Facebook Personal profiles do not expose follower counts, only Business Pages do.
- Instagram requires a Business Account linked to a Facebook Page to sync properly.

If the user is reporting a bug or requesting a feature, let them know you'll record it for the human team.
Keep your responses concise, helpful, and formatted in Markdown. Avoid long walls of text. Use bullet points where appropriate.`;

    const aiMessages = [
      { role: "system", content: systemPrompt },
      ...messages.map((m: any) => ({ role: m.role, content: m.content }))
    ];

    const stream = await callAIStream(aiMessages, {
      agent: "chat", // uses generic chat defaults
      temperature: 0.5, // keep support relatively grounded
    });

    // We intercept the stream to save the assistant's reply to Supabase when it finishes
    const encoder = new TextEncoder();
    const decoder = new TextDecoder();
    let assistantMessage = "";

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        assistantMessage += decoder.decode(chunk, { stream: true });
        controller.enqueue(chunk);
      },
      async flush(controller) {
        assistantMessage += decoder.decode(); // flush remaining
        if (chatId) {
          await supabase.from("support_messages").insert({
            chat_id: chatId,
            role: "assistant",
            content: assistantMessage,
          });
        }
      }
    });

    const finalStream = stream.pipeThrough(transformStream);

    return new Response(finalStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
        "X-Chat-Id": chatId || "",
      },
    });

  } catch (err) {
    console.error("[/api/support/chat]", err);
    return new Response(err instanceof Error ? err.message : "Internal Server Error", { status: 500 });
  }
}
