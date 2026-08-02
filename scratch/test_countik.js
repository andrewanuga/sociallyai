const fs = require('fs');

async function testCountik() {
  try {
    const handle = 'therock';
    const r = await fetch(`https://countik.com/api/instagram/user/${handle}`);
    console.log("Status:", r.status);
    const text = await r.text();
    fs.writeFileSync('countik.json', text);
    console.log("Response:", text.slice(0, 200));
  } catch (e) {
    console.log("Countik Error", e);
  }
}

testCountik();
