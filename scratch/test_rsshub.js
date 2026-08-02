const fs = require('fs');

async function testRSSHub() {
  try {
    const handle = 'therock';
    const r = await fetch(`https://rsshub.app/instagram/user/${handle}`);
    console.log("Status:", r.status);
    const text = await r.text();
    fs.writeFileSync('rsshub.json', text);
    console.log("Response:", text.slice(0, 200));
  } catch (e) {
    console.log("RSSHub Error", e);
  }
}

testRSSHub();
