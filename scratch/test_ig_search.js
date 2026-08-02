const fs = require('fs');

async function testIGSearch() {
  try {
    const handle = 'therock';
    const r = await fetch(`https://www.instagram.com/web/search/topsearch/?context=blended&query=${handle}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    });
    console.log("Status:", r.status);
    const text = await r.text();
    fs.writeFileSync('ig_search.json', text);
    try {
      const data = JSON.parse(text);
      const user = data.users.find(u => u.user.username === handle);
      console.log("Followers:", user?.user?.follower_count);
    } catch {
      console.log("Failed to parse JSON", text.slice(0, 100));
    }
  } catch (e) {
    console.log("IG Error", e);
  }
}

testIGSearch();
