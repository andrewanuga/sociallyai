const fs = require('fs');

async function testIGAPI() {
  try {
    const handle = 'therock';
    const r = await fetch(`https://www.instagram.com/api/v1/users/web_profile_info/?username=${handle}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "x-ig-app-id": "936619743392459"
      }
    });
    console.log("Status:", r.status);
    const text = await r.text();
    fs.writeFileSync('ig_api.json', text);
    try {
      const data = JSON.parse(text);
      console.log("Followers:", data?.data?.user?.edge_followed_by?.count);
    } catch {
      console.log("Failed to parse JSON", text.slice(0, 100));
    }
  } catch (e) {
    console.log("IG Error", e);
  }
}

testIGAPI();
