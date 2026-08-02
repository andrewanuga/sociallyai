async function test() {
  const handles = ['andrewadakole', 'andrew.adakole', 'adakoleandrew'];
  
  for (const h of handles) {
    try {
      const r = await fetch('https://www.instagram.com/' + h + '/');
      const html = await r.text();
      const match = html.match(/meta content="([\d.,kmKM]+) Followers/i);
      console.log('Testing IG handle', h, '->', match ? match[1] : 'No match (or private/not found)');
    } catch(e) {}
  }
}
test();
