import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { callAI } from "@/lib/ai/openrouter";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: accountId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 1. Verify ownership
  const { data: account } = await supabase
    .from("social_accounts")
    .select("platform, handle, display_name")
    .eq("id", accountId)
    .eq("user_id", user.id)
    .single();

  if (!account) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // 2. Fetch context
  const [ { data: metrics }, { data: posts } ] = await Promise.all([
    supabase.from("social_account_metrics").select("*").eq("account_id", accountId).order("date", { ascending: false }).limit(7),
    supabase.from("social_posts").select("content, impressions, likes, comments").eq("account_id", accountId).order("posted_at", { ascending: false }).limit(5)
  ]);

  if (!metrics || metrics.length === 0) {
    return NextResponse.json({ suggestions: [] });
  }

  const latestMetric = metrics[0];

  // 3. Prompt AI
  const prompt = `You are an expert social media strategist. Analyze this account's recent performance.
Account: ${account.display_name || account.handle} on ${account.platform}
Current Followers: ${latestMetric.followers}
Current Impressions: ${latestMetric.impressions}
Current Engagements: ${latestMetric.engagements}

Past 7 days metrics data: ${JSON.stringify(metrics)}
Recent 5 posts: ${JSON.stringify(posts)}

Provide exactly 3 highly actionable suggestions to improve this account. Return JSON matching:
{
  "suggestions": [
    { "title": "Catchy Title", "desc": "Detailed actionable step", "type": "growth" | "warning" | "content" }
  ]
}`;

  try {
    const aiRes = await callAI([{ role: "system", content: prompt }], {
      agent: "score",
      temperature: 0.7,
      jsonMode: true
    });
    
    let jsonStr = aiRes.content.trim();
    if (jsonStr.startsWith("```json")) jsonStr = jsonStr.replace(/```json|```/g, "").trim();
    const result = JSON.parse(jsonStr);

    // 4. Cache in DB
    await supabase
      .from("social_account_metrics")
      .update({
        ai_suggestions: result.suggestions,
        ai_generated_at: new Date().toISOString()
      })
      .eq("id", latestMetric.id);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("AI Gen Error:", error);
    return NextResponse.json({ error: "Failed to generate suggestions" }, { status: 500 });
  }
}
