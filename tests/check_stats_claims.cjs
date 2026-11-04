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

for (const f of files) {
  const fullPath = path.resolve(__dirname, '..', f);
  if (!fs.existsSync(fullPath)) continue;
  const content = fs.readFileSync(fullPath, 'utf8');
  // Match sentences or lines with stats, laws, acts, or percentages
  const lines = content.split('\n');
  const matched = [];
  lines.forEach((line, idx) => {
    if (
      /\b(percent|%|\b\d{4}\b|Act|Rules|Section|GDPR|CCPA|COPPA|IPC|IT Act|law|legal|statute|court|million|billion|survey|study|research)\b/i.test(line) &&
      !line.includes('import') &&
      !line.includes('datePublished') &&
      !line.includes('copyright') &&
      !line.includes('width') &&
      !line.includes('maxWidth')
    ) {
      matched.push({ line: idx + 1, text: line.trim() });
    }
  });

  if (matched.length > 0) {
    console.log(`\n======================================================`);
    console.log(`File: ${f}`);
    console.log(`======================================================`);
    matched.forEach(m => console.log(`L${m.line}: ${m.text}`));
  }
}

