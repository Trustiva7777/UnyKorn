#!/usr/bin/env bash
set -euo pipefail
API_BASE="${1:-http://localhost:4000}"

cyan() { printf "\033[36m%s\033[0m\n" "$*"; }

cyan "API: $API_BASE"

echo "1) GET /health" && curl -sS "$API_BASE/health" | jq . || true

echo "2) GET /public/config" && curl -sS "$API_BASE/public/config" | jq . || true

echo "3) GET /xumm/ping" && curl -sS "$API_BASE/xumm/ping" | jq . || true

echo "4) GET /issuer" && curl -sS "$API_BASE/issuer" | jq . || true

echo "5) GET /tokens" && curl -sS "$API_BASE/tokens" | jq . || true

echo "6) GET /.well-known/xrp-ledger.toml" && curl -sS "$API_BASE/.well-known/xrp-ledger.toml" | sed -e 's/^/    /' || true

echo "Done."