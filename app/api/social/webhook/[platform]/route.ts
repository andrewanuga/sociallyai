import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { evaluateIncomingMessage } from "@/lib/ai/engine";
import { dispatchReply } from "@/lib/social/dispatch";

// Helper to handle Meta's verification challenge
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  if (platform === "instagram" || platform === "facebook") {
    const mode = req.nextUrl.searchParams.get("hub.mode");
    const token = req.nextUrl.searchParams.get("hub.verify_token");
    const challenge = req.nextUrl.searchParams.get("hub.challenge");

    // We can accept any verify token as long as it exists, or validate against an env var.
    if (mode === "subscribe" && challenge) {
      return new NextResponse(challenge, { status: 200 });
    }
  }
  return NextResponse.json({ ok: true });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const body = await req.json();

  const supabase = createAdminClient();
  if (!supabase) return NextResponse.json({ error: "No DB" }, { status: 500 });

  try {
    if (platform === "telegram") {
      // Telegram webhook format
      if (!body.message || !body.message.text) return NextResponse.json({ ok: true });
      
      const botId = req.nextUrl.searchParams.get("bot_id"); // Ideally passed in the webhook URL
      const text = body.message.text;
      const senderId = body.message.from.id.toString();
      const senderName = body.message.from.first_name || "User";

      // Since Telegram webhook doesn't inherently say which bot received it unless we embed it in the URL,
      // we'll try to find a bot token if the user passes ?bot_id=user_id or we just search by the telegram id.
      // For this MVP, we assume the bot is registered in social_accounts.
      
      // We need the token to reply. We'll find the telegram account.
      const { data: accounts } = await supabase
        .from("social_accounts")
        .select("id, user_id, auth_data")
        .eq("platform", "telegram")
        .limit(10);
        
      if (!accounts || accounts.length === 0) return NextResponse.json({ ok: true });
      
      // Let's just pick the first one that has a ghost bot active for now.
      for (const account of accounts) {
        const token = (account.auth_data as any)?.token;
        if (!token) continue;

        const { data: bot } = await supabase
          .from("social_bots")
          .select("id, status, config")
          .eq("user_id", account.user_id)
          .eq("status", "active")
          .limit(1)
          .single();

        if (bot) {
          const rules = (bot.config as any)?.rules || [];
          const evalRes = await evaluateIncomingMessage(text, "Telegram", senderName, rules, false);
          
          if (evalRes.action === "auto_reply" && evalRes.reply) {
            await dispatchReply({
              platform: "telegram",
              recipientId: senderId,
              token,
              message: evalRes.reply
            });
          }

          // Log action
          if (evalRes.action !== "ignore") {
            await supabase.from("agent_actions").insert({
              bot_id: bot.id,
              action: evalRes.action,
              comment: evalRes.comment,
              reply: evalRes.reply || null,
              platform: "Telegram",
              reason: "Incoming message rule match"
            });
          }
          break; // processed
        }
      }
    }

    if (platform === "instagram") {
      // Meta webhook format
      if (body.object === "instagram") {
        for (const entry of body.entry) {
          const accountId = entry.id; // The Instagram Professional Account ID
          
          // Is this a DM?
          if (entry.messaging) {
            for (const msg of entry.messaging) {
              if (msg.message && msg.message.text && !msg.message.is_echo) {
                await handleInstagramInteraction(supabase, accountId, msg.sender.id, "User", msg.message.text, false);
              }
            }
          }
          
          // Is this a comment?
          if (entry.changes) {
            for (const change of entry.changes) {
              if (change.field === "comments" && change.value) {
                const text = change.value.text;
                const commentId = change.value.id;
                const senderName = change.value.from?.username || "User";
                
                // Do not reply to our own comments
                if (change.value.from?.id === accountId) continue;

                await handleInstagramInteraction(supabase, accountId, change.value.from.id, senderName, text, true, commentId);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[Webhook Error]:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}

async function handleInstagramInteraction(
  supabase: any,
  accountId: string,
  senderId: string,
  senderName: string,
  text: string,
  isComment: boolean,
  commentId?: string
) {
  // Find the associated user and token
  const { data: account } = await supabase
    .from("social_accounts")
    .select("user_id, auth_data")
    .eq("external_id", accountId)
    .limit(1)
    .single();

  if (!account) return;

  const token = (account.auth_data as any)?.access_token;
  if (!token) return;

  // Check if Ghost Mode / Bot is active
  const { data: bot } = await supabase
    .from("social_bots")
    .select("id, status, config")
    .eq("user_id", account.user_id)
    .eq("status", "active")
    .limit(1)
    .single();

  if (!bot) return;

  const rules = (bot.config as any)?.rules || [];
  const evalRes = await evaluateIncomingMessage(text, "Instagram", senderName, rules, isComment);

  if (evalRes.action === "auto_reply" && evalRes.reply) {
    await dispatchReply({
      platform: "instagram",
      recipientId: senderId,
      token,
      message: evalRes.reply,
      isComment,
      commentId
    });
  }

  if (evalRes.action !== "ignore") {
    await supabase.from("agent_actions").insert({
      bot_id: bot.id,
      action: evalRes.action,
      comment: evalRes.comment,
      reply: evalRes.reply || null,
      platform: "Instagram",
      reason: `Incoming ${isComment ? "comment" : "DM"} rule match`
    });
  }
}
