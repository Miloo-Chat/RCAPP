#!/usr/bin/env bash
# scripts/smoke.sh
#
# Miloo Post-Deployment Smoke Test Script
# Usage:
#   BASE_URL=https://miloo.chat bash scripts/smoke.sh
#   or locally against Vite preview / static server:
#   BASE_URL=http://localhost:4173 bash scripts/smoke.sh

set -u

BASE_URL="${BASE_URL:-https://miloo.chat}"
# Remove trailing slash
BASE_URL="${BASE_URL%/}"

PASS_COUNT=0
FAIL_COUNT=0
declare -a TABLE_ROWS=()

record_result() {
  local status="$1"
  local item="$2"
  local detail="$3"

  if [ "$status" = "PASS" ]; then
    PASS_COUNT=$((PASS_COUNT + 1))
    TABLE_ROWS+=("✅ PASS | $item | $detail")
  else
    FAIL_COUNT=$((FAIL_COUNT + 1))
    TABLE_ROWS+=("❌ FAIL | $item | $detail")
  fi
}

echo "================================================================================"
echo " Starting Miloo Post-Deploy Smoke Test"
echo " Target URL: $BASE_URL"
echo " Date: $(date -u)"
echo "================================================================================"

# -----------------------------------------------------------------------------
# 1. Check HTTP 200 on all public pages
# -----------------------------------------------------------------------------
PUBLIC_PAGES=(
  "/"
  "/about"
  "/safety"
  "/faq"
  "/privacy"
  "/terms"
  "/transparency"
  "/community-guidelines"
  "/how-it-works"
  "/contact"
  "/blog"
  "/cookie-policy"
)

for path in "${PUBLIC_PAGES[@]}"; do
  http_code=$(curl -s -k -o /dev/null -w "%{http_code}" -L "$BASE_URL$path")
  if [ "$http_code" = "200" ]; then
    record_result "PASS" "Public page: $path" "HTTP $http_code"
  else
    record_result "FAIL" "Public page: $path" "Expected 200, got $http_code"
  fi
done

# -----------------------------------------------------------------------------
# 2. Check HTTP 404 for random nonexistent URL
# -----------------------------------------------------------------------------
RANDOM_PATH="/test-nonexistent-url-$RANDOM-$RANDOM"
http_code=$(curl -s -k -o /dev/null -w "%{http_code}" -L "$BASE_URL$RANDOM_PATH")
if [ "$http_code" = "404" ]; then
  record_result "PASS" "Nonexistent path: $RANDOM_PATH" "HTTP 404 Not Found"
else
  # Some single-page apps return 200 with client-side 404 view; note it if so
  record_result "FAIL" "Nonexistent path: $RANDOM_PATH" "Expected 404, got $http_code"
fi

# -----------------------------------------------------------------------------
# 3. Check /cookie redirect to /cookie-policy (HTTP 301 or 308)
# -----------------------------------------------------------------------------
cookie_code=$(curl -s -k -o /dev/null -w "%{http_code}" "$BASE_URL/cookie")
if [ "$cookie_code" = "301" ] || [ "$cookie_code" = "308" ]; then
  record_result "PASS" "Legacy redirect: /cookie" "HTTP $cookie_code Redirect"
else
  record_result "FAIL" "Legacy redirect: /cookie" "Expected 301/308, got $cookie_code"
fi

# -----------------------------------------------------------------------------
# 4. Check noindex headers on /admin, /chat, /call
# -----------------------------------------------------------------------------
NOINDEX_ROUTES=("/admin" "/chat" "/call")
for route in "${NOINDEX_ROUTES[@]}"; do
  resp_headers=$(curl -s -k -I -L "$BASE_URL$route")
  if echo "$resp_headers" | grep -qi "X-Robots-Tag:.*noindex"; then
    record_result "PASS" "Noindex header on $route" "Found X-Robots-Tag: noindex"
  else
    record_result "FAIL" "Noindex header on $route" "Missing X-Robots-Tag: noindex"
  fi
done

# -----------------------------------------------------------------------------
# 5. Check noindex headers on 4 hidden blog posts (SHOW_SEO_POSTS=false)
# -----------------------------------------------------------------------------
HIDDEN_POSTS=(
  "/blog/omegle-alternative"
  "/blog/random-video-chat-india"
  "/blog/stranger-chat-india"
  "/blog/video-chat-no-signup"
)
for post in "${HIDDEN_POSTS[@]}"; do
  resp_headers=$(curl -s -k -I -L "$BASE_URL$post")
  if echo "$resp_headers" | grep -qi "X-Robots-Tag:.*noindex"; then
    record_result "PASS" "Hidden post: $post" "Found X-Robots-Tag: noindex"
  else
    record_result "FAIL" "Hidden post: $post" "Missing X-Robots-Tag: noindex"
  fi
done

# -----------------------------------------------------------------------------
# 6. Check /ads.txt returns HTTP 200
# -----------------------------------------------------------------------------
ads_code=$(curl -s -k -o /dev/null -w "%{http_code}" "$BASE_URL/ads.txt")
if [ "$ads_code" = "200" ]; then
  record_result "PASS" "/ads.txt availability" "HTTP 200 OK"
else
  record_result "FAIL" "/ads.txt availability" "Expected 200, got $ads_code"
fi

# -----------------------------------------------------------------------------
# 7. Check /sitemap.xml and /robots.txt return HTTP 200
# -----------------------------------------------------------------------------
sitemap_code=$(curl -s -k -o /dev/null -w "%{http_code}" "$BASE_URL/sitemap.xml")
if [ "$sitemap_code" = "200" ]; then
  record_result "PASS" "/sitemap.xml availability" "HTTP 200 OK"
else
  record_result "FAIL" "/sitemap.xml availability" "Expected 200, got $sitemap_code"
fi

robots_code=$(curl -s -k -o /dev/null -w "%{http_code}" "$BASE_URL/robots.txt")
if [ "$robots_code" = "200" ]; then
  record_result "PASS" "/robots.txt availability" "HTTP 200 OK"
else
  record_result "FAIL" "/robots.txt availability" "Expected 200, got $robots_code"
fi

# -----------------------------------------------------------------------------
# 8. Check IndexNow key file returns 200 and matches file contents
# -----------------------------------------------------------------------------
INDEXNOW_KEY="902d1d9dc4e41ddc387811ffd6b99f38"
indexnow_resp=$(curl -s -k -L "$BASE_URL/${INDEXNOW_KEY}.txt")
indexnow_code=$(curl -s -k -o /dev/null -w "%{http_code}" "$BASE_URL/${INDEXNOW_KEY}.txt")

if [ "$indexnow_code" = "200" ] && echo "$indexnow_resp" | grep -q "$INDEXNOW_KEY"; then
  record_result "PASS" "IndexNow key verification" "HTTP 200 and key matches"
else
  record_result "FAIL" "IndexNow key verification" "Expected 200 + matching key (got $indexnow_code)"
fi

# -----------------------------------------------------------------------------
# 9. Verify Security Headers exist
# -----------------------------------------------------------------------------
root_headers=$(curl -s -k -I -L "$BASE_URL/")

check_sec_header() {
  local header_name="$1"
  if echo "$root_headers" | grep -qi "^${header_name}:"; then
    record_result "PASS" "Security header: $header_name" "Header present"
  else
    record_result "FAIL" "Security header: $header_name" "Header missing"
  fi
}

check_sec_header "Content-Security-Policy"
check_sec_header "X-Content-Type-Options"
check_sec_header "X-Frame-Options"
check_sec_header "Referrer-Policy"
check_sec_header "Permissions-Policy"

# -----------------------------------------------------------------------------
# 10. Verify NO hidden post appears in sitemap.xml
# -----------------------------------------------------------------------------
sitemap_content=$(curl -s -k "$BASE_URL/sitemap.xml")
hidden_in_sitemap=0
for hidden in "omegle-alternative" "random-video-chat-india" "stranger-chat-india" "video-chat-no-signup"; do
  if echo "$sitemap_content" | grep -q "$hidden"; then
    hidden_in_sitemap=1
    break
  fi
done

if [ "$hidden_in_sitemap" -eq 0 ]; then
  record_result "PASS" "Sitemap audit" "No hidden posts present in sitemap.xml"
else
  record_result "FAIL" "Sitemap audit" "Hidden post found in sitemap.xml!"
fi

# -----------------------------------------------------------------------------
# Summary Table Output
# -----------------------------------------------------------------------------
echo ""
echo "================================================================================"
echo " SMOKE TEST RESULTS SUMMARY"
echo "================================================================================"
printf "%-8s | %-42s | %-24s\n" "STATUS" "CHECK ITEM" "DETAIL"
echo "--------------------------------------------------------------------------------"
for row in "${TABLE_ROWS[@]}"; do
  echo "$row"
done
echo "================================================================================"
echo " TOTAL CHECKS: $((PASS_COUNT + FAIL_COUNT)) | PASSED: $PASS_COUNT | FAILED: $FAIL_COUNT"
echo "================================================================================"

if [ "$FAIL_COUNT" -gt 0 ]; then
  echo "❌ SMOKE TEST FAILED with $FAIL_COUNT failures."
  exit 1
else
  echo "✅ ALL SMOKE TESTS PASSED."
  exit 0
fi

