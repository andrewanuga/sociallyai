import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "30d";

    // Fetch post performance data
    const daysBack = period === "7d" ? 7 : period === "90d" ? 90 : 30;
    const since = new Date();
    since.setDate(since.getDate() - daysBack);

    const { data: posts, error } = await supabase
      .from("post_history")
      .select(
        "id, content, platform, impressions, engagements, followers_gained, link_clicks, revenue_attributed, posted_at"
      )
      .eq("user_id", user.id)
      .gte("posted_at", since.toISOString())
      .order("posted_at", { ascending: false });

    if (error) throw error;

    // Aggregate stats
    const totals = (posts || []).reduce(
      (acc, p) => ({
        impressions: acc.impressions + (p.impressions || 0),
        engagements: acc.engagements + (p.engagements || 0),
        followers: acc.followers + (p.followers_gained || 0),
        clicks: acc.clicks + (p.link_clicks || 0),
        revenue: acc.revenue + (p.revenue_attributed || 0),
      }),
      { impressions: 0, engagements: 0, followers: 0, clicks: 0, revenue: 0 }
    );

    // Group by platform
    const byPlatform = (posts || []).reduce(
      (acc: Record<string, typeof totals>, p) => {
        if (!acc[p.platform]) {
          acc[p.platform] = {
            impressions: 0,
            engagements: 0,
            followers: 0,
            clicks: 0,
            revenue: 0,
          };
        }
        acc[p.platform].impressions += p.impressions || 0;
        acc[p.platform].engagements += p.engagements || 0;
        acc[p.platform].followers += p.followers_gained || 0;
        acc[p.platform].clicks += p.link_clicks || 0;
        acc[p.platform].revenue += p.revenue_attributed || 0;
        return acc;
      },
      {}
    );

    // Top 5 posts by impressions
    const topPosts = (posts || [])
      .sort((a, b) => (b.impressions || 0) - (a.impressions || 0))
      .slice(0, 5);

    return NextResponse.json({
      period,
      totals,
      byPlatform,
      topPosts,
      postCount: posts?.length || 0,
    });
  } catch (err) {
    console.error("[/api/analytics]", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
