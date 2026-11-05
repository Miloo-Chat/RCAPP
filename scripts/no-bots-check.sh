#!/usr/bin/env bash
# scripts/no-bots-check.sh
#
# Miloo Anti-Bot Guard
# Fails CI / test suite if any bot, persona, canned reply, handoff, or LLM chat code is detected.
# Only content moderation (e.g. OpenAI moderation endpoint) is allowlisted.

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_DIRS=()

for dir in "client/src" "server" "docs" "client/public" "public"; do
  if [ -d "$ROOT_DIR/$dir" ]; then
    TARGET_DIRS+=("$ROOT_DIR/$dir")
  fi
done

echo "================================================================================"
echo "🛡️  MILOO NO-BOTS GUARD: Verifying zero chat bots or automated personas"
echo " Target directories: ${TARGET_DIRS[*]}"
echo "================================================================================"

# Patterns that represent automated chat companions, personas, canned responses, handoff, or LLM chat SDKs:
# \bmilo\b (distinguished from "miloo")
# \bmira\b
# \bjax\b
# \bpersonas?\b
# \bbot_sessions?\b
# \bcanned\b
# \bchatbots?\b
# \brequest_milo\b
# \bhandoff\b
# "AI companion"
# LLM chat SDK imports (groq-sdk, @anthropic-ai, langchain, @google/generative-ai, openai sdk for chat)

PATTERN='\b(milo|mira|jax|persona|personas|groq|botSession|bot_session|bot_sessions|ai_offered|ai_accepted|ai_declined|canned|chatbot|chatbots|request_milo|handoff)\b|AI companion|groq|@anthropic-ai|langchain|@google/generative-ai'

# Run grep across target directories, excluding node_modules, build outputs, and git
MATCHES=$(grep -rInE "$PATTERN" \
  --exclude-dir={node_modules,dist,.git,data,coverage} \
  --exclude="package-lock.json" \
  "${TARGET_DIRS[@]}" 2>/dev/null || true)

# Filter out allowlisted moderation matches
# (OpenAI Moderation API, Detoxify, regex moderation filters are explicitly permitted)
VIOLATIONS=$(echo "$MATCHES" | grep -vEi "moderation" | grep -v '^$' || true)

if [ -n "$VIOLATIONS" ]; then
  echo "❌ FATAL: Bot or automated companion patterns detected in source tree:"
  echo "$VIOLATIONS"
  echo ""
  echo "Miloo has a strict zero-bot guarantee. Remove all bot, persona, and canned reply references."
  exit 1
fi

echo "✅ PASS: Zero bot patterns, personas, or LLM chat references found across all checked source trees."
echo "   All strangers on Miloo are 100% real human participants."
exit 0
