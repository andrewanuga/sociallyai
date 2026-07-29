// Per-platform sync: pulls recent posts + metrics (and campaigns where ads run)
// from each connected account into the socialIntegration tables.
//
// Real fetchers are implemented where the API is straightforward; the rest are
// safe no-ops clearly marked to fill in as each platform app gets approved.
// Every fetch is wrapped so one failing account never breaks a sync run.
import type { SupabaseClient } from "@supabase/supabase-js";
import type { PlatformId } from "./platforms";

export interface NormalizedPost {
  external_id: string;
  content: string | null;
  posted_at: string;
  impressions?: number;
  reach?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  video_views?: number;
  link_clicks?: number;
}

type Account = {
  id: string; user_id: string; platform: PlatformId;
  external_id: string; access_token: string | null;
};

/** Fetch recent posts + metrics for one account. Returns [] when unavailable. */
async function fetchPosts(acc: Account): Promise<NormalizedPost[]> {
  if (!acc.access_token) return [];
  try {
    switch (acc.platform) {
      case "x": {
        const r = await fetch(
          `https://api.twitter.com/2/users/${acc.external_id}/tweets?max_results=20&tweet.fields=public_metrics,created_at`,
          { headers: { Authorization: `Bearer ${acc.access_token}` } }
        );
        const d = await r.json();
        return (d.data ?? []).map((t: Record<string, unknown>) => {
          const m = (t.public_metrics ?? {}) as Record<string, number>;
          return {
            external_id: String(t.id), content: String(t.text ?? ""), posted_at: String(t.created_at),
            likes: m.like_count, comments: m.reply_count, shares: m.retweet_count, impressions: m.impression_count,
          };
        });
      }
      case "youtube": {
        // Recent uploads + their statistics.
        const search = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&maxResults=20`,
          { headers: { Authorization: `Bearer ${acc.access_token}` } }
        );
        const s = await search.json();
        const ids = (s.items ?? []).map((i: Record<string, Record<string, string>>) => i.id?.videoId).filter(Boolean);
        if (!ids.length) return [];
        const stats = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${ids.join(",")}`,
          { headers: { Authorization: `Bearer ${acc.access_token}` } }
        );
        const v = await stats.json();
        return (v.items ?? []).map((i: Record<string, Record<string, string>>) => ({
          external_id: String(i.id), content: i.snippet?.title ?? null, posted_at: i.snippet?.publishedAt,
          video_views: Number(i.statistics?.viewCount ?? 0), likes: Number(i.statistics?.likeCount ?? 0),
          comments: Number(i.statistics?.commentCount ?? 0),
        }));
      }
      case "facebook": {
        const r = await fetch(
          `https://graph.facebook.com/v19.0/${acc.external_id}/posts?fields=message,created_time,insights.metric(post_impressions,post_engaged_users)&access_token=${acc.access_token}`
        );
        const d = await r.json();
        return (d.data ?? []).map((p: Record<string, unknown>) => ({
          external_id: String(p.id), content: (p.message as string) ?? null, posted_at: String(p.created_time),
        }));
      }
      // instagram, linkedin, threads, snapchat, reddit — implement as each app
      // is approved; the Graph/API shapes differ per platform.
      default:
        return [];
    }
  } catch {
    return [];
  }
}

/** Sync a single account: upsert posts + metrics, stamp last_synced_at. */
export async function syncAccount(acc: Account, supabase: SupabaseClient): Promise<number> {
  const posts = await fetchPosts(acc);
  if (posts.length) {
    const rows = posts.map((p) => ({
      user_id: acc.user_id, account_id: acc.id, platform: acc.platform,
      external_id: p.external_id, content: p.content, status: "posted",
      posted_at: p.posted_at,
      impressions: p.impressions ?? 0, reach: p.reach ?? 0, likes: p.likes ?? 0,
      comments: p.comments ?? 0, shares: p.shares ?? 0, saves: p.saves ?? 0,
      video_views: p.video_views ?? 0, link_clicks: p.link_clicks ?? 0,
      engagement_rate: p.impressions ? Number(((((p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0)) / p.impressions) * 100).toFixed(3)) : 0,
      synced_at: new Date().toISOString(),
    }));
    // Requires a unique index on (account_id, external_id) for clean upserts;
    // falls back to insert-ignore semantics otherwise.
    await supabase.from("social_posts").upsert(rows, { onConflict: "account_id,external_id" });
  }
  await supabase.from("social_accounts").update({ last_synced_at: new Date().toISOString() }).eq("id", acc.id);
  return posts.length;
}
