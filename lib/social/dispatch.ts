/**
 * Dispatches automated replies to social platforms (Telegram, Instagram).
 */

export async function dispatchReply(params: {
  platform: string;
  recipientId: string;
  token: string;
  message: string;
  isComment?: boolean;
  commentId?: string;
}): Promise<boolean> {
  const { platform, recipientId, token, message, isComment, commentId } = params;

  try {
    if (platform === "telegram") {
      const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: recipientId,
          text: message
        })
      });
      if (!res.ok) throw new Error(`Telegram Error: ${await res.text()}`);
      return true;
    }

    if (platform === "instagram") {
      if (isComment && commentId) {
        // Reply to an Instagram comment
        const res = await fetch(`https://graph.facebook.com/v21.0/${commentId}/replies`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ message })
        });
        if (!res.ok) throw new Error(`Instagram Comment Error: ${await res.text()}`);
      } else {
        // Reply to an Instagram DM
        const res = await fetch(`https://graph.facebook.com/v21.0/me/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({
            recipient: { id: recipientId },
            message: { text: message }
          })
        });
        if (!res.ok) throw new Error(`Instagram DM Error: ${await res.text()}`);
      }
      return true;
    }

    console.warn(`[Dispatch] Unsupported platform: ${platform}`);
    return false;

  } catch (err) {
    console.error(`[Dispatch] Failed to send reply to ${platform}:`, err);
    return false;
  }
}
