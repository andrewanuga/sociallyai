import * as cheerio from "cheerio";

/* ── Tool Definitions ─────────────────────────────────────────── */

export const AI_TOOLS = [
  {
    type: "function",
    function: {
      name: "get_current_time",
      description: "Get the current date and local time.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "scrape_url",
      description: "Scrape and extract the main text content from a given URL (e.g. an article, user website, or competitor page).",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "The full URL to scrape." },
        },
        required: ["url"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_trending_topics",
      description: "Get the current trending topics on social media to help generate viral and relevant content.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "generate_hashtags",
      description: "Generate a list of highly relevant and viral hashtags based on a topic.",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", description: "The topic or niche." },
        },
        required: ["topic"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "evaluate_virality",
      description: "Evaluate a drafted post for virality potential. Returns a score out of 100 and brief tips for improvement.",
      parameters: {
        type: "object",
        properties: {
          post_content: { type: "string", description: "The drafted post to evaluate." },
        },
        required: ["post_content"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "get_weather",
      description: "Get the current weather for a specific location.",
      parameters: {
        type: "object",
        properties: {
          location: { type: "string", description: "The city and state, e.g., San Francisco, CA" },
        },
        required: ["location"],
      },
    },
  },
  {
    type: "function",
    function: {
      name: "search_past_chats",
      description: "Search the user's past chats for a specific topic or keyword.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "The keyword or topic to search for in past conversations." },
        },
        required: ["query"],
      },
    },
  },
];

/* ── Tool Executors ───────────────────────────────────────────── */

export async function executeTool(name: string, args: Record<string, any>): Promise<string> {
  switch (name) {
    case "get_current_time":
      return new Date().toLocaleString("en-US", { timeZoneName: "short" });
      
    case "scrape_url":
      try {
        const res = await fetch(args.url, { 
          headers: { 
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" 
          } 
        });
        if (!res.ok) return `Failed to fetch URL. Status: ${res.status}`;
        const html = await res.text();
        const $ = cheerio.load(html);
        // Remove scripts, styles, and navs to get clean text
        $("script, style, nav, footer, header, noscript, iframe").remove();
        let text = $("body").text().replace(/\s+/g, " ").trim();
        // truncate to avoid blowing up the context window
        if (text.length > 5000) text = text.slice(0, 5000) + "... (truncated)";
        return text || "No text found on the page.";
      } catch (err: any) {
        return `Error scraping URL: ${err.message}`;
      }

    case "get_trending_topics":
      try {
        // Fallback mock if the real one isn't hooked up for free calls yet
        return JSON.stringify([
          "#AIInnovation", "#TechTrends", "#FutureOfWork", "#CreatorEconomy", "#Web3"
        ]);
      } catch (e) {
        return "Failed to get trends.";
      }

    case "generate_hashtags":
      // A simple deterministic or lightweight fallback. Realistically, we'd call an LLM here,
      // but since we're IN an LLM, returning a mock or deterministic list helps the agent.
      // But the LLM itself could generate hashtags without a tool. So we return a curated list.
      const t = args.topic.toLowerCase();
      const tags = [`#${t.replace(/\s+/g, "")}`, `#${t.replace(/\s+/g, "")}Tips`, `#Viral${t.replace(/\s+/g, "")}`, `#Explore`];
      return JSON.stringify(tags);

    case "evaluate_virality":
      // Mock score based on length and keywords
      const content = args.post_content.toLowerCase();
      let score = 50;
      if (content.length > 100) score += 10;
      if (content.includes("?") || content.includes("how to")) score += 15;
      if (content.includes("link") || content.includes("comment")) score += 15;
      if (content.includes("#")) score += 10;
      
      let tips = [];
      if (score < 70) tips.push("Add a stronger hook or question.");
      if (!content.includes("#")) tips.push("Include relevant hashtags.");
      if (!content.includes("comment") && !content.includes("share")) tips.push("Add a call-to-action.");
      
      return JSON.stringify({ score: Math.min(100, score), tips });

    case "get_weather":
      try {
        // wttr.in provides a simple text-based weather API
        const loc = encodeURIComponent(args.location);
        const res = await fetch(`https://wttr.in/${loc}?format=%C+%t+feels+like+%f,+wind+%w`);
        if (!res.ok) return "Weather currently unavailable.";
        const weatherText = await res.text();
        return `Weather in ${args.location}: ${weatherText}`;
      } catch (e) {
        return "Failed to fetch weather.";
      }

    case "search_past_chats":
      // We will need to query the DB. To avoid complex server/client issues here, 
      // we can do this via an edge API call or just mock it if we don't have supabase handy in this pure function.
      // But since tools execute on the server, we can fetch from the DB if we pass workspaceId.
      // For now, return a generic message since we'll inject recent chats anyway.
      return `Search results for "${args.query}": Not fully implemented yet. Please rely on the injected chat history.`;

    default:
      return `Unknown tool: ${name}`;
  }
}
