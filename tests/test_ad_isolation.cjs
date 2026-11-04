// test_ad_isolation.cjs
// Unit test: Ensures AdSlot is NEVER imported or rendered in chat, call, admin, age-gate, or transparency routes.
// Fails with exit code 1 if any forbidden file contains AdSlot references.

const fs = require('fs')
const path = require('path')

const FORBIDDEN_FILES = [
  'client/src/pages/ChatRoom.jsx',
  'client/src/pages/AdminModeration.jsx',
  'client/src/components/AgeGateModal.jsx',
  'client/src/pages/Transparency.jsx',
  'client/src/components/TurnstileModal.jsx',
  'client/src/components/ReportModal.jsx',
]

console.log('--- RUNNING AD ISOLATION INTEGRITY AUDIT ---')
let violations = 0

for (const relPath of FORBIDDEN_FILES) {
  const fullPath = path.resolve(__dirname, '..', relPath)
  if (!fs.existsSync(fullPath)) {
    console.error(`❌ Target file missing: ${relPath}`)
    violations++
    continue
  }

  const content = fs.readFileSync(fullPath, 'utf8')
  const importMatch = content.match(/import.*AdSlot.*/i)
  const tagMatch = content.match(/<AdSlot/i)

  if (importMatch || tagMatch) {
    console.error(`❌ VIOLATION: AdSlot detected in forbidden route: ${relPath}`)
    if (importMatch) console.error(`   Found: ${importMatch[0]}`)
    if (tagMatch) console.error(`   Found JSX: ${tagMatch[0]}`)
    violations++
  } else {
    console.log(`✓ Clean (no ad components): ${relPath}`)
  }
}

if (violations > 0) {
  console.error(`\n🚨 AUDIT FAILED: Found ${violations} forbidden AdSlot references!`)
  process.exit(1)
} else {
  console.log('\n✅ AUDIT PASSED: All sensitive, chat, admin, age-gate, and transparency routes are 100% ad-isolated.')
  process.exit(0)
}

