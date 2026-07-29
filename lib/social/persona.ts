// Lightweight tone learning: the agent stores past user messages and derives a
// writing-style profile so replies/drafts mirror how the person actually chats.
import type { SupabaseClient } from "@supabase/supabase-js";

const EMOJI = /\p{Extended_Pictographic}/gu;

export function analyzeStyle(texts: string[]) {
  const joined = texts.join(" ");
  const words = joined.split(/\s+/).filter(Boolean);
  const sentences = joined.split(/[.!?]+/).filter((s) => s.trim().length > 0);
  const emojiCount = (joined.match(EMOJI) || []).length;
  const exclaims = (joined.match(/!/g) || []).length;
  const lowerI = (joined.match(/\bi\b/g) || []).length; // lowercase standalone "i" → casual
  const casualMarkers = (joined.match(/\b(lol|haha|omg|tbh|ngl|fr|vibe|yeah|gonna|wanna)\b/gi) || []).length;

  const avgWords = sentences.length ? Math.round(words.length / sentences.length) : words.length;
  const emojiRate = words.length ? emojiCount / words.length : 0;
  const formality = (casualMarkers + lowerI + (emojiRate > 0.03 ? 2 : 0)) > 3 ? "casual" : avgWords > 18 ? "formal" : "balanced";
  const emojiUse = emojiRate > 0.05 ? "frequent" : emojiRate > 0.01 ? "occasional" : "rare";
  const length = avgWords > 20 ? "long" : avgWords < 9 ? "short, punchy" : "medium";

  const traits = { formality, emoji: emojiUse, sentence_length: length, exclaim_rate: exclaims, avg_words: avgWords };
  const summary = `${formality}, ${length} sentences, ${emojiUse} emoji use${exclaims > texts.length ? ", energetic" : ""}`;
  return { traits, summary };
}

/** Record a message and refresh the persona from recent history. */
export async function learnPersona(supabase: SupabaseClient, userId: string, text: string, source = "chat", platform: string | null = null) {
  if (!text?.trim()) return;
  try {
    await supabase.from("ai_message_memory").insert({ user_id: userId, source, platform, role: "user", content: text.slice(0, 4000) });
    const { data: recent } = await supabase
      .from("ai_message_memory").select("content").eq("user_id", userId).eq("role", "user")
      .order("created_at", { ascending: false }).limit(40);
    const texts = (recent ?? []).map((r: { content: string }) => r.content);
    if (texts.length < 3) return;
    const { traits, summary } = analyzeStyle(texts);
    await supabase.from("ai_persona").upsert({
      user_id: userId, tone_summary: summary, style_traits: traits,
      sample_count: texts.length, updated_at: new Date().toISOString(),
    });
  } catch { /* non-fatal */ }
}

export async function getPersonaTone(supabase: SupabaseClient, userId: string): Promise<string | null> {
  try {
    const { data } = await supabase.from("ai_persona").select("tone_summary").eq("user_id", userId).single();
    return data?.tone_summary ?? null;
  } catch { return null; }
}
