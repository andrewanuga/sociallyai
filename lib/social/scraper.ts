export async function scrapeFollowers(platform: string, handle: string): Promise<number | undefined> {
  if (!handle) return undefined;
  
  // Clean handle
  const cleanHandle = handle.replace('@', '').trim();
  if (!cleanHandle) return undefined;

  try {
    if (platform === "instagram") {
      // Best effort IG scraping using public search endpoint which sometimes bypasses login walls
      const res = await fetch(`https://www.instagram.com/web/search/topsearch/?context=blended&query=${cleanHandle}`, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        }
      });
      if (res.ok) {
        const text = await res.text();
        try {
          const data = JSON.parse(text);
          const user = data.users?.find((u: any) => u.user?.username?.toLowerCase() === cleanHandle.toLowerCase());
          if (user && user.user?.follower_count !== undefined) {
            return user.user.follower_count;
          }
        } catch { /* json parse error */ }
      }
    }
    
    // As a fallback for Facebook, Instagram, or Threads, try Microlink's free API which sometimes extracts meta tags
    // Or we can try parsing the meta description directly
    const urls: Record<string, string> = {
      instagram: `https://www.instagram.com/${cleanHandle}/`,
      facebook: `https://www.facebook.com/${cleanHandle}`,
      threads: `https://www.threads.net/@${cleanHandle}`
    };

    const targetUrl = urls[platform];
    if (!targetUrl) return undefined;

    const res = await fetch(targetUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
        "Accept-Language": "en-US,en;q=0.9",
      }
    });

    if (res.ok) {
      const html = await res.text();
      // Look for meta description: <meta property="og:description" content="1M Followers, 200 Following..." />
      const metaMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]+)"/i) || 
                        html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
                        
      if (metaMatch && metaMatch[1]) {
        const desc = metaMatch[1].toLowerCase();
        // Parse "X followers" or "X followers on"
        const followersMatch = desc.match(/([0-9,.]+[km]?)\s+followers/i) || 
                               desc.match(/([0-9,.]+[km]?)\s+fans/i); // Facebook sometimes uses fans
                               
        if (followersMatch && followersMatch[1]) {
          return parseScrapedNumber(followersMatch[1]);
        }
      }
    }

  } catch (e) {
    console.error(`[scraper] Failed to scrape ${platform} for ${cleanHandle}:`, e);
  }

  return undefined;
}

function parseScrapedNumber(str: string): number {
  str = str.toLowerCase().replace(/,/g, '').replace(/[^\d.km]/g, '');
  if (str.includes('k')) return parseFloat(str) * 1000;
  if (str.includes('m')) return parseFloat(str) * 1000000;
  return parseInt(str) || 0;
}
