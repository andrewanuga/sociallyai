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
  external_id: string; access_token: string | null; refresh_token?: string | null;
  token_expires_at?: string | null;
  handle?: string | null;
};

/** Refresh an expired Google OAuth token using the refresh_token. */
async function refreshGoogleToken(acc: Account, supabase: SupabaseClient): Promise<string | null> {
  if (!acc.refresh_token) return acc.access_token;
  try {
    const r = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        refresh_token: acc.refresh_token,
        grant_type: "refresh_token",
      }),
    });
    const d = await r.json();
    if (d.access_token) {
      const expiresAt = new Date(Date.now() + (d.expires_in - 60) * 1000).toISOString();
      await supabase.from("social_accounts").update({
        access_token: d.access_token,
        token_expires_at: expiresAt,
      }).eq("id", acc.id);
      return d.access_token;
    }
  } catch (e) {
    console.error("[sync] Google token refresh failed:", e);
  }
  return acc.access_token;
}

/** Get a valid access token, refreshing if expired. */
async function getValidToken(acc: Account, supabase: SupabaseClient): Promise<string | null> {
  if (!acc.access_token) return null;
  // Check if token is expired (with 5 min buffer)
  if (acc.token_expires_at) {
    const expiresAt = new Date(acc.token_expires_at).getTime();
    const now = Date.now();
    if (expiresAt - now < 5 * 60 * 1000) {
      // Token is expired or expiring soon
      if (acc.platform === "youtube" || acc.platform === "x") {
        return await refreshGoogleToken(acc, supabase);
      }
    }
  }
  return acc.access_token;
}

/** Fetch profile metadata (followers) for one account. */
async function fetchProfile(acc: Account, token: string | null): Promise<{ followers?: number; avatar_url?: string; handle?: string; display_name?: string }> {
  try {
    if (token) {
      switch (acc.platform) {
        case "x": {
          const r = await fetch(
            `https://api.twitter.com/2/users/${acc.external_id}?user.fields=public_metrics,profile_image_url,username`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const d = await r.json();
          if (d.data) {
            return {
              followers: d.data.public_metrics?.followers_count,
              avatar_url: d.data.profile_image_url,
              handle: d.data.username,
            };
          }
          break;
        }
        case "youtube": {
          // Use mine=true instead of id= so it always fetches the authenticated user's channel
          const r = await fetch(
            `https://www.googleapis.com/youtube/v3/channels?part=statistics,snippet&mine=true`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const d = await r.json();
          if (d.items?.[0]) {
            return {
              followers: Number(d.items[0].statistics?.subscriberCount),
              avatar_url: d.items[0].snippet?.thumbnails?.default?.url,
              handle: d.items[0].snippet?.customUrl || `@${d.items[0].snippet?.title}`,
              display_name: d.items[0].snippet?.title,
            };
          }
          break;
        }
        case "facebook": {
          // Try fetching personal profile data — pages_read_engagement gives us posts
          // Personal profile followers_count is not available in Graph API v19+
          // We get the profile picture and name at minimum
          const r = await fetch(
            `https://graph.facebook.com/v19.0/${acc.external_id}?fields=name,picture&access_token=${token}`
          );
          const d = await r.json();
          if (d.id) {
            return {
              // Facebook personal profiles don't expose follower counts via API
              // Only Facebook Pages (with page access tokens) can get fan_count
              avatar_url: d.picture?.data?.url,
              handle: d.name,
              display_name: d.name,
            };
          }
          break;
        }
        case "instagram": {
          // Instagram Basic Display API - check if we have a proper IG Business account
          // The external_id may be a FB Page ID or IG User ID
          const r = await fetch(
            `https://graph.facebook.com/v19.0/${acc.external_id}?fields=id,name,followers_count,profile_picture_url&access_token=${token}`
          );
          const d = await r.json();
          if (d.id && !d.error) {
            return {
              followers: d.followers_count,
              avatar_url: d.profile_picture_url,
              display_name: d.name,
            };
          }
          break;
        }
        case "threads": {
          const r = await fetch(
            `https://graph.threads.net/v1.0/me?fields=id,username,name,threads_profile_picture_url,threads_biography,follower_count&access_token=${token}`
          );
          const d = await r.json();
          if (d.id) {
            return {
              followers: d.follower_count,
              avatar_url: d.threads_profile_picture_url,
              handle: d.username,
              display_name: d.name,
            };
          }
          break;
        }
        case "telegram": {
          // Use Telegram Bot API to get chat member count
          const r = await fetch(`https://api.telegram.org/bot${token}/getMe`);
          const d = await r.json();
          if (d.ok) {
            return {
              handle: `@${d.result.username}`,
              display_name: d.result.first_name,
            };
          }
          break;
        }
      }
    }
  } catch {
    // API failed, proceed to fallback
  }

  // Fallback: Web Scraper for platforms without official API or if token failed
  if (acc.handle) {
    try {
      if (acc.platform === "youtube") {
        const r = await fetch(`https://www.youtube.com/${acc.handle}`);
        const html = await r.text();
        const match = html.match(/"subscriberCountText".*?"simpleText":"(.*?)"/i);
        if (match) {
          const subs = match[1].replace(/[^\d.,kmKM]/g, '');
          if (subs) return { followers: parseScrapedNumber(subs), handle: acc.handle };
        }
      }
    } catch {
      // Scrape failed
    }
  }

  // Could not fetch or scrape real data. Return empty to avoid saving fake data.
  return {};
}

function parseScrapedNumber(str: string): number {
  str = str.toLowerCase().replace(/,/g, '.').replace(/[^\d.km]/g, '');
  if (str.includes('k')) return parseFloat(str) * 1000;
  if (str.includes('m')) return parseFloat(str) * 1000000;
  return parseInt(str) || 0;
}

/** Fetch recent posts + metrics for one account. Returns [] when unavailable. */
async function fetchPosts(acc: Account, token: string | null): Promise<NormalizedPost[]> {
  if (!token) return [];
  try {
    switch (acc.platform) {
      case "x": {
        const r = await fetch(
          `https://api.twitter.com/2/users/${acc.external_id}/tweets?max_results=20&tweet.fields=public_metrics,created_at`,
          { headers: { Authorization: `Bearer ${token}` } }
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
        try {
          const search = await fetch(
            `https://www.googleapis.com/youtube/v3/search?part=snippet&forMine=true&type=video&maxResults=20`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const s = await search.json();
          if (s.error) {
            console.error("[sync] YouTube search error:", s.error);
          } else {
            const ids = (s.items ?? []).map((i: Record<string, Record<string, string>>) => i.id?.videoId).filter(Boolean);
            if (ids.length) {
              const stats = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics&id=${ids.join(",")}`,
                { headers: { Authorization: `Bearer ${token}` } }
              );
              const v = await stats.json();
              if (!v.error) {
                return (v.items ?? []).map((i: Record<string, Record<string, string>>) => ({
                  external_id: String(i.id), content: i.snippet?.title ?? null, posted_at: i.snippet?.publishedAt,
                  video_views: Number(i.statistics?.viewCount ?? 0), likes: Number(i.statistics?.likeCount ?? 0),
                  comments: Number(i.statistics?.commentCount ?? 0),
                  impressions: Number(i.statistics?.viewCount ?? 0), // viewCount as impressions for YouTube
                }));
              }
            }
          }
        } catch (e) {
          console.error("[sync] YouTube API error:", e);
        }
        // Fallback to RSS if API fails
        if (acc.external_id) {
          try {
            const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${acc.external_id}`);
            const xml = await r.text();
            const matches = [...xml.matchAll(/<entry>[\s\S]*?<id>yt:video:(.*?)<\/id>[\s\S]*?<title>(.*?)<\/title>[\s\S]*?<published>(.*?)<\/published>[\s\S]*?<\/entry>/g)];
            return matches.map(m => ({
              external_id: m[1], content: m[2], posted_at: m[3],
              video_views: 0, likes: 0, comments: 0, impressions: 0
            })).slice(0, 10);
          } catch {}
        }
        return [];
      }
      case "facebook": {
        const r = await fetch(
          `https://graph.facebook.com/v19.0/${acc.external_id}/posts?fields=message,created_time&limit=20&access_token=${token}`
        );
        const d = await r.json();
        if (d.error) {
          console.error("[sync] Facebook posts error:", d.error);
          return [];
        }
        return (d.data ?? []).map((p: Record<string, unknown>) => ({
          external_id: String(p.id), content: (p.message as string) ?? null, posted_at: String(p.created_time),
          impressions: 0, likes: 0, comments: 0,
        }));
      }
      case "instagram": {
        // Get Instagram media
        const r = await fetch(
          `https://graph.facebook.com/v19.0/${acc.external_id}/media?fields=id,caption,timestamp,like_count,comments_count,impressions&limit=20&access_token=${token}`
        );
        const d = await r.json();
        if (d.error) {
          console.error("[sync] Instagram media error:", d.error);
          return [];
        }
        return (d.data ?? []).map((p: Record<string, unknown>) => ({
          external_id: String(p.id), content: (p.caption as string) ?? null, posted_at: String(p.timestamp),
          impressions: Number(p.impressions ?? 0), likes: Number(p.like_count ?? 0), comments: Number(p.comments_count ?? 0),
        }));
      }
      case "threads": {
        const r = await fetch(
          `https://graph.threads.net/v1.0/me/threads?fields=id,text,timestamp,like_count,reply_count&limit=20&access_token=${token}`
        );
        const d = await r.json();
        if (d.error) {
          console.error("[sync] Threads error:", d.error);
          return [];
        }
        return (d.data ?? []).map((p: Record<string, unknown>) => ({
          external_id: String(p.id), content: (p.text as string) ?? null, posted_at: String(p.timestamp),
          likes: Number(p.like_count ?? 0), comments: Number(p.reply_count ?? 0), impressions: 0,
        }));
      }
      default:
        return [];
    }
  } catch (e) {
    console.error(`[sync] fetchPosts error for ${acc.platform}:`, e);
    return [];
  }
}

/** Sync a single account: upsert posts + metrics, stamp last_synced_at. */
export async function syncAccount(acc: Account, supabase: SupabaseClient): Promise<number> {
  // 0. Refresh token if expired
  const token = await getValidToken(acc, supabase);

  // 1. Fetch Profile info (followers)
  const profile = await fetchProfile(acc, token);
  if (profile.followers !== undefined || profile.display_name || profile.avatar_url) {
    await supabase.from("social_accounts").update({
      ...(profile.followers !== undefined && { followers: profile.followers }),
      ...(profile.avatar_url && { avatar_url: profile.avatar_url }),
      ...(profile.handle && { handle: profile.handle }),
      ...(profile.display_name && { display_name: profile.display_name }),
      last_synced_at: new Date().toISOString()
    }).eq("id", acc.id);
  } else {
    await supabase.from("social_accounts").update({ last_synced_at: new Date().toISOString() }).eq("id", acc.id);
  }

  // 2. Fetch Posts
  const posts = await fetchPosts(acc, token);
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
    await supabase.from("social_posts").upsert(rows, { onConflict: "account_id,external_id" });
  }

  // 3. Snapshot Metrics for Deep Analytics
  if (profile.followers !== undefined) {
    const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
    
    // Sum engagement from recent posts
    let sumImp = 0; let sumEng = 0;
    posts.forEach(p => {
      sumImp += p.impressions ?? 0;
      sumEng += (p.likes ?? 0) + (p.comments ?? 0) + (p.shares ?? 0) + (p.video_views ?? 0);
    });
    
    await supabase.from("social_account_metrics").upsert({
      account_id: acc.id,
      date: today,
      followers: profile.followers,
      impressions: sumImp,
      engagements: sumEng,
      updated_at: new Date().toISOString()
    }, { onConflict: "account_id,date" });
  }

  return posts.length;
}
