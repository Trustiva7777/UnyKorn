#!/usr/bin/env bash
set -e

DOMAIN="${DOMAIN:-unykorn.org}"
API_SUB="${API_SUB:-api}"

echo "== Public check for domain: ${DOMAIN} =="

check_dns() {
  local host=$1
  echo "-- DNS for ${host}"
  if command -v dig >/dev/null 2>&1; then
    dig +short ${host} A || true
    dig +short ${host} AAAA || true
    dig +short ${host} CNAME || true
  else
    getent ahosts ${host} || echo "(no resolver entry)"
  fi
}

check_http() {
  local url=$1
  echo "-- HTTP(S) ${url}"
  code=$(curl -sS -o /dev/null -w "%{http_code}" --max-time 10 "$url" || true)
  echo "${code}"
}

echo "\n[DNS]"
check_dns "${DOMAIN}"
check_dns "www.${DOMAIN}"
check_dns "${API_SUB}.${DOMAIN}"

echo "\n[HTTP]"
check_http "http://${DOMAIN}"
check_http "https://${DOMAIN}"
check_http "http://www.${DOMAIN}"
check_http "https://www.${DOMAIN}"
check_http "http://${API_SUB}.${DOMAIN}/health"
check_http "https://${API_SUB}.${DOMAIN}/health"

echo "\nTips:"
echo "- If DNS is empty, run the Cloudflare setup in Unykorn-Ignite.ipynb (Section 3)."
echo "- If HTTPS shows 404/000 but DNS exists, wait for propagation or configure hosting."
echo "- If api.* /health fails over HTTPS, ensure your API host provides TLS or use a proxy (Cloudflare proxied=true)."
