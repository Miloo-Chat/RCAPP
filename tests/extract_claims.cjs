const fs = require('fs');
const path = require('path');

const files = [
  'client/src/pages/Privacy.jsx',
  'client/src/pages/Terms.jsx',
  'client/src/pages/CookiePolicy.jsx',
  'client/src/pages/Safety.jsx',
  'client/src/pages/blog/StaySafeOnline.jsx',
  'client/src/pages/blog/SpotScams.jsx',
  'client/src/pages/blog/ProtectingPrivacyVideoChat.jsx',
  'client/src/pages/blog/ReportBlockAbuse.jsx',
  'client/src/pages/blog/GoodConversations.jsx',
  'client/src/pages/blog/OnlineHarassment.jsx',
  'client/src/pages/blog/OmegleAlternative.jsx',
  'client/src/pages/blog/RandomVideoChatIndia.jsx',
  'client/src/pages/blog/StrangerChatIndia.jsx',
  'client/src/pages/blog/VideoChatNoSignup.jsx'
];

console.log('=== EXTERNAL LINKS AUDIT ===\n');

for (const f of files) {
  const fullPath = path.resolve(__dirname, '..', f);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, 'utf8');
  const links = content.match(/https?:\/\/[^\s"'`<>]+/g) || [];
  const external = [...new Set(links.filter(l => 
    !l.includes('miloo.chat') && 
    !l.includes('localhost') && 
    !l.includes('schema.org') && 
    !l.includes('w3.org')
  ))];

  if (external.length > 0) {
    console.log(`File: ${f}`);
    external.forEach(l => console.log(`  - ${l}`));
    console.log('');
  }
}

