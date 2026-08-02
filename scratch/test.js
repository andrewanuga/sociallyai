const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8').split('\n').reduce((acc, line) => {
  const [k, v] = line.split('=');
  if (k && v) acc[k.trim()] = v.trim();
  return acc;
}, {});

async function test() {
  const ig_token = 'EAGFRg0m5n3UBSGNjYrWJZAc5xFbB2EAsDDUe5JDNFw0ojxCbTS4LFc18tAqk6xdYIxyS3ZByomwd6heFF60i97LEQ3Xj9eI4LwHz4ZB2FMPwTtbL0VQmGjXwQN5aseX79mxBnOytBnhqzFn5i7kDLZByA9ZAbKw41xYDefZCzFF8V0fL5ON20kvxMrf0p6XhZCIPoDM7cyyJfBqZCiTCBY1OQ0ZBUdd9vasjvJCibvrVnhvz22D312OfGqu8N04SHWQpz2DC2QgZBWSAyZCq4zDzsWkHI9G5C7cTAHoc1kpwx65394madmU0PTdSu3yFkEKY8B1NaP8ZCZBxuj49ZBTZCcS1tRI';
  const external_id = '122311196564028958'; // Their Facebook/IG external ID
  
  try {
    // Try without followers_count
    const url = 'https://graph.facebook.com/v19.0/' + external_id + '?fields=username,name&access_token=' + ig_token;
    console.log('Fetching Graph API...');
    const r = await fetch(url);
    const data = await r.json();
    console.log('Graph API Result:', data);
    
    const handle = data.username || data.name;
    if (handle) {
      console.log('Got handle:', handle, 'Attempting scrape...');
      const scrapeUrl = 'https://www.instagram.com/' + handle + '/';
      const r2 = await (await fetch(scrapeUrl)).text();
      const match = r2.match(/meta content="([\d.,kmKM]+) Followers/i);
      console.log('Scrape Result:', match ? match[1] : 'No match');
    }
  } catch(e) {
    console.log('Error:', e.message);
  }
}
test();
