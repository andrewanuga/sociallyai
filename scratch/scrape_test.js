const fs = require('fs');

async function testIG() {
  try {
    const r = await fetch('https://www.instagram.com/therock/', {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      }
    });
    const html = await r.text();
    fs.writeFileSync('ig.html', html);
    const match = html.match(/meta content="([^"]+Followers[^"]+)"/i) || html.match(/meta content="([\d.,kmKM]+) Followers/i);
    console.log("IG Match:", match ? match[0] : "No match");
  } catch (e) {
    console.log("IG Error", e);
  }
}

async function testYT() {
  try {
    const r = await fetch('https://www.youtube.com/@MrBeast');
    const html = await r.text();
    fs.writeFileSync('yt.html', html);
    const match = html.match(/"subscriberCountText".*?"simpleText":"(.*?)"/i);
    console.log("YT Match:", match ? match[1] : "No match");
  } catch (e) {
    console.log("YT Error", e);
  }
}

testIG();
testYT();
