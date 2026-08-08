import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/lib/workspace";

/**
 * POST /api/social/send-dm
 * Send a direct message on a connected social platform.
 *
 * Body: { platform, recipient, message, account_id? }
 *
 * Platform support:
 *  - telegram:  Uses the stored bot token → sendMessage API
 *  - twitter/x: Uses Twitter API v2 DMs (requires Elevated access)
 *  - instagram:  Uses Instagram Graph API private replies
 *  - facebook:   Uses Facebook Messenger Send API
 *  - whatsapp:   Uses WhatsApp Cloud API
 *  - linkedin:   Uses LinkedIn Messaging API
 *  - threads:    Not supported yet (no official DM API)
 *  - tiktok:     Not supported yet (no official DM API)
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const workspace = await getActiveWorkspace(supabase);
    if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const userId = workspace.workspaceId;

    const { platform, recipient, message, account_id } = await req.json();

    if (!platform || !recipient || !message) {
      return NextResponse.json({ error: "platform, recipient, and message are required" }, { status: 400 });
    }

    // Fetch the connected account and its token
    let accountQuery = supabase
      .from("social_accounts")
      .select("id, platform, access_token, external_id, handle, metadata")
      .eq("user_id", userId)
      .eq("platform", platform)
      .eq("status", "connected");

    if (account_id) accountQuery = accountQuery.eq("id", account_id);

    const { data: accounts, error: accError } = await accountQuery.limit(1);
    if (accError || !accounts?.length) {
      return NextResponse.json({
        error: `No connected ${platform} account found. Please connect one in Integrations.`,
        platform,
      }, { status: 404 });
    }

    const account = accounts[0];
    const token = account.access_token;

    let result: { success: boolean; message_id?: string; error?: string };

    switch (platform.toLowerCase()) {
      case "telegram": {
        // Telegram Bot API — send message to chat_id
        const botToken = process.env.TELEGRAM_BOT_TOKEN || token;
        const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: recipient, // can be @username or numeric chat ID
            text: message,
            parse_mode: "Markdown",
          }),
        });
        const data = await res.json();
        if (data.ok) {
          result = { success: true, message_id: String(data.result?.message_id) };
        } else {
          result = { success: false, error: data.description || "Telegram send failed" };
        }
        break;
      }

      case "twitter":
      case "x": {
        // Twitter API v2 — Direct Messages (requires Elevated or OAuth 1.0a)
        if (!token) {
          result = { success: false, error: "Twitter/X account not connected with required DM permissions" };
          break;
        }
        // First resolve username → user_id if recipient looks like a handle
        let recipientId = recipient;
        if (recipient.startsWith("@") || !/^\d+$/.test(recipient)) {
          const handle = recipient.replace("@", "");
          const lookupRes = await fetch(`https://api.twitter.com/2/users/by/username/${handle}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const lookupData = await lookupRes.json();
          if (lookupData.data?.id) {
            recipientId = lookupData.data.id;
          } else {
            result = { success: false, error: `Could not resolve Twitter handle @${handle}` };
            break;
          }
        }
        const dmRes = await fetch(`https://api.twitter.com/2/dm_conversations/with/${recipientId}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ text: message }),
        });
        const dmData = await dmRes.json();
        if (dmData.data?.dm_conversation_id) {
          result = { success: true, message_id: dmData.data.dm_event_id };
        } else {
          const errMsg = dmData.errors?.[0]?.message || dmData.detail || "Twitter DM failed";
          result = { success: false, error: errMsg };
        }
        break;
      }

      case "instagram": {
        // Instagram Graph API — send private reply or message
        // Requires instagram_manage_messages permission
        const igRes = await fetch(`https://graph.facebook.com/v19.0/me/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: { id: recipient },
            message: { text: message },
            access_token: token,
          }),
        });
        const igData = await igRes.json();
        if (igData.message_id) {
          result = { success: true, message_id: igData.message_id };
        } else {
          result = { success: false, error: igData.error?.message || "Instagram DM failed. Ensure you have instagram_manage_messages permission." };
        }
        break;
      }

      case "facebook": {
        // Facebook Messenger Send API
        const fbRes = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${token}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            recipient: { id: recipient },
            message: { text: message },
          }),
        });
        const fbData = await fbRes.json();
        if (fbData.message_id) {
          result = { success: true, message_id: fbData.message_id };
        } else {
          result = { success: false, error: fbData.error?.message || "Facebook message failed" };
        }
        break;
      }

      case "whatsapp": {
        const waToken = process.env.WHATSAPP_TOKEN || token;
        const phoneId = process.env.WHATSAPP_PHONE_ID;
        if (!phoneId) {
          result = { success: false, error: "WhatsApp Phone ID not configured" };
          break;
        }
        const waRes = await fetch(`https://graph.facebook.com/v19.0/${phoneId}/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${waToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to: recipient.replace(/\D/g, ""), // strip non-digits from phone number
            type: "text",
            text: { body: message },
          }),
        });
        const waData = await waRes.json();
        if (waData.messages?.[0]?.id) {
          result = { success: true, message_id: waData.messages[0].id };
        } else {
          result = { success: false, error: waData.error?.message || "WhatsApp send failed" };
        }
        break;
      }

      case "linkedin": {
        // LinkedIn Messaging API — send DM via member URN
        const recipientUrn = recipient.startsWith("urn:") 
          ? recipient 
          : `urn:li:member:${recipient}`;
        const liBody = {
          recipients: {
            values: [recipientUrn],
          },
          subject: "Message from Socially AI",
          body: message,
          messageType: {
            "com.linkedin.voyager.messaging.create.MessageCreate": {},
          },
        };
        const liRes = await fetch(`https://api.linkedin.com/v2/messages`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            "X-Restli-Protocol-Version": "2.0.0",
          },
          body: JSON.stringify(liBody),
        });
        if (liRes.status === 201 || liRes.ok) {
          result = { success: true };
        } else {
          const liData = await liRes.json().catch(() => ({}));
          result = { success: false, error: (liData as any).message || `LinkedIn DM failed (status ${liRes.status})` };
        }
        break;
      }

      case "threads":
        result = { success: false, error: "Threads does not have a public DM API yet. Coming soon." };
        break;

      case "tiktok":
        result = { success: false, error: "TikTok DM API requires special partner access. Coming soon." };
        break;

      case "snapchat":
        result = { success: false, error: "Snapchat DM API is not publicly available. Coming soon." };
        break;

      default:
        result = { success: false, error: `Platform '${platform}' does not support direct messaging via Socially AI yet.` };
    }

    // Log the send attempt to the database
    await supabase.from("dm_log").insert({
      user_id: userId,
      platform,
      recipient,
      message: message.slice(0, 500),
      success: result.success,
      error: result.error || null,
      sent_at: new Date().toISOString(),
    }).then(() => {}); // fire-and-forget, ignore errors

    if (result.success) {
      return NextResponse.json({ success: true, message_id: result.message_id, platform, recipient });
    } else {
      return NextResponse.json({ success: false, error: result.error, platform }, { status: 422 });
    }
  } catch (err) {
    console.error("[/api/social/send-dm]", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Internal error" }, { status: 500 });
  }
}
