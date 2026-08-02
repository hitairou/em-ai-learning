#!/usr/bin/env bash
set -euo pipefail

PUBLIC_URL="${PUBLIC_URL:?PUBLIC_URL is required}"
BASE_URL="${PUBLIC_URL%/}"
STAMP="$(date -u +%Y%m%d-%H%M%S)"
TMP_ROOT="${RUNNER_TEMP:-/tmp}/em-ai-learning-public-root-${STAMP}.html"
TMP_LOGIN="${RUNNER_TEMP:-/tmp}/em-ai-learning-public-login-${STAMP}.html"
TMP_CSS="${RUNNER_TEMP:-/tmp}/em-ai-learning-public-css-${STAMP}.txt"
TMP_TERMS="${RUNNER_TEMP:-/tmp}/em-ai-learning-public-terms-${STAMP}.html"
TMP_PRIVACY="${RUNNER_TEMP:-/tmp}/em-ai-learning-public-privacy-${STAMP}.html"

cleanup() {
  rm -f "$TMP_ROOT" "$TMP_LOGIN" "$TMP_CSS" "$TMP_TERMS" "$TMP_PRIVACY" >/dev/null 2>&1 || true
}
trap cleanup EXIT

fetch_with_retry() {
  local url="$1"
  local output="$2"
  local label="$3"
  local attempts="${4:-12}"
  for attempt in $(seq 1 "$attempts"); do
    if curl -fsS --max-time 20 "$url" -o "$output"; then
      return 0
    fi
    if [ "$attempt" -lt "$attempts" ]; then
      sleep 5
    fi
  done
  echo "ERROR: ${label} did not return HTTP 200 after ${attempts} attempts: ${url}" >&2
  return 1
}

check_html_assets() {
  local base_url="$1"
  local html_file="$2"
  local label="$3"
  local css_path
  local js_path
  css_path="$(grep -Eo '/_next/static/[^"]+\.css[^"]*' "$html_file" | head -n 1 | sed 's/&amp;/\&/g' || true)"
  js_path="$(grep -Eo '/_next/static/[^"]+\.js[^"]*' "$html_file" | head -n 1 | sed 's/&amp;/\&/g' || true)"
  if [ -z "$css_path" ] || [ -z "$js_path" ]; then
    echo "ERROR: Next.js CSS or JavaScript asset link was not found in ${label} HTML." >&2
    return 1
  fi
  fetch_with_retry "${base_url}${css_path}" "$TMP_CSS" "${label} stylesheet" 3
  fetch_with_retry "${base_url}${js_path}" /dev/null "${label} JavaScript asset" 3
  if ! grep -qi 'katex' "$TMP_CSS"; then
    echo "ERROR: KaTeX CSS was not found in the ${label} stylesheet." >&2
    return 1
  fi
}

fetch_with_retry "${BASE_URL}/api/health" /dev/null "public health"
fetch_with_retry "$BASE_URL" "$TMP_ROOT" "public root"
fetch_with_retry "${BASE_URL}/login" "$TMP_LOGIN" "public login"
fetch_with_retry "${BASE_URL}/terms" "$TMP_TERMS" "terms"
fetch_with_retry "${BASE_URL}/privacy" "$TMP_PRIVACY" "privacy"
grep -q '2026-08-02' "$TMP_TERMS"
grep -q 'OpenAI API' "$TMP_PRIVACY"
grep -q '非公式' "$TMP_ROOT"
if grep -q 'TOKUSHIMA UNIVERSITY / ELECTROMAGNETISM' "$TMP_ROOT"; then echo "ERROR: university-specific landing copy remains" >&2; exit 1; fi
check_html_assets "$BASE_URL" "$TMP_ROOT" "public root"
check_html_assets "$BASE_URL" "$TMP_LOGIN" "public login"

echo "PUBLIC_VERIFY_RESULT status=success public_url=${BASE_URL} health=200 root=200 login=200 next_assets=present katex_css=present"
