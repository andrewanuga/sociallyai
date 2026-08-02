const fs = require('fs');

async function testPicuki() {
  try {
    const handle = 'therock';
    const r = await fetch(`https://www.picuki.com/profile/${handle}`);
    console.log("Status:", r.status);
    const text = await r.text();
    fs.writeFileSync('picuki.html', text);
    const followersMatch = text.match(/<span class="total_followers">([\d.,kmKM]+)<\/span>/i);
    console.log("Followers:", followersMatch ? followersMatch[1] : "No match");
  } catch (e) {
    console.log("Picuki Error", e);
  }
}

testPicuki();
