const fs = require('fs');

async function testMicrolink() {
  try {
    const handle = 'therock';
    const r = await fetch(`https://api.microlink.io?url=https://www.instagram.com/${handle}`);
    console.log("Status:", r.status);
    const text = await r.text();
    fs.writeFileSync('microlink.json', text);
    try {
      const data = JSON.parse(text);
      console.log("Description:", data?.data?.description);
    } catch {
      console.log("Failed to parse JSON");
    }
  } catch (e) {
    console.log("Microlink Error", e);
  }
}

testMicrolink();
