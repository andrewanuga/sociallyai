import { callAI, ChatMessage } from "./openrouter";

export type AgentActionType = "auto_reply" | "flag_lead" | "escalate_complaint" | "ignore";

export interface EvaluationResult {
  action: AgentActionType;
  comment: string;
  reply?: string;
}

/**
 * Evaluates an incoming message based on the user's Ghost Mode rules.
 */
export async function evaluateIncomingMessage(
  incomingText: string,
  platform: string,
  senderName: string,
  rules: { label: string; enabled: boolean }[],
  isComment: boolean = false
): Promise<EvaluationResult> {
  const activeRules = rules.filter(r => r.enabled).map(r => r.label);
  
  if (activeRules.length === 0) {
    return { action: "ignore", comment: "No active Ghost Mode rules." };
  }

  const prompt = `You are the core logic engine for 'Ghost Mode', an autonomous social media AI assistant.
Your job is to read an incoming ${isComment ? "comment" : "direct message"} on ${platform} from "${senderName}" and decide how to handle it based strictly on the user's active rules.

ACTIVE RULES:
${activeRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}

INCOMING MESSAGE:
"${incomingText}"

INSTRUCTIONS:
1. Classify the message based on the active rules.
2. Choose one of the following actions:
   - "auto_reply": If a rule dictates replying to this type of message (generate a natural, friendly reply).
   - "flag_lead": If a rule dictates flagging this as a potential lead/sales opportunity.
   - "escalate_complaint": If a rule dictates escalating complaints/support issues.
   - "ignore": If the message does not trigger any active rules, or is spam/irrelevant.
3. Keep your reply concise (under 2 sentences) and suitable for social media ${isComment ? "comments" : "DMs"}.
4. Output PURE JSON. Do not use markdown blocks.

JSON SCHEMA:
{
  "action": "auto_reply" | "flag_lead" | "escalate_complaint" | "ignore",
  "comment": "Short explanation of why you chose this action based on the rules.",
  "reply": "The actual text to send back to the user (ONLY IF action is 'auto_reply', otherwise omit or null)"
}`;

  try {
    const res = await callAI([{ role: "system", content: prompt }], {
      agent: "ghost_engine",
      temperature: 0.2,
      responseFormat: { type: "json_object" }
    });

    let jsonStr = res.content.trim();
    if (jsonStr.startsWith("\`\`\`json")) jsonStr = jsonStr.replace(/\`\`\`json/g, "").replace(/\`\`\`/g, "").trim();
    if (jsonStr.startsWith("\`\`\`")) jsonStr = jsonStr.replace(/\`\`\`/g, "").trim();

    const parsed = JSON.parse(jsonStr) as EvaluationResult;
    
    // Fallback validation
    if (!["auto_reply", "flag_lead", "escalate_complaint", "ignore"].includes(parsed.action)) {
      parsed.action = "ignore";
    }

    return parsed;
  } catch (err) {
    console.error("[GhostEngine] Evaluation failed:", err);
    return { action: "ignore", comment: "AI evaluation error." };
  }
}
