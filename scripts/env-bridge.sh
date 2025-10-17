#!/usr/bin/env bash
# Map common Codespaces secret names to expected env vars for this repo
# Usage: source scripts/env-bridge.sh

# Xumm/Xaman
if [[ -z "$XUMM_API_KEY" && -n "$XAMANAPI" ]]; then export XUMM_API_KEY="$XAMANAPI"; fi
if [[ -z "$XUMM_API_SECRET" && -n "$XAMANKEY" ]]; then export XUMM_API_SECRET="$XAMANKEY"; fi

# Cloudflare token/zone
if [[ -z "$CF_API_TOKEN" && -n "$CLOUDFLARE_API_TOKEN" ]]; then export CF_API_TOKEN="$CLOUDFLARE_API_TOKEN"; fi
if [[ -z "$CF_API_TOKEN" && -n "$CLOUDFAREWORKERAPI" ]]; then export CF_API_TOKEN="$CLOUDFAREWORKERAPI"; fi
if [[ -z "$CF_ZONE_ID" && -n "$CLOUDFLARE_ZONE_ID" ]]; then export CF_ZONE_ID="$CLOUDFLARE_ZONE_ID"; fi

# Domain default
if [[ -z "$DOMAIN" ]]; then export DOMAIN="unykorn.org"; fi

echo "[env-bridge] Using DOMAIN=$DOMAIN"
echo "[env-bridge] CF_API_TOKEN set: $( [[ -n "$CF_API_TOKEN" ]] && echo yes || echo no )"
echo "[env-bridge] CF_ZONE_ID set: $( [[ -n "$CF_ZONE_ID" ]] && echo yes || echo no )"
echo "[env-bridge] XUMM_API_KEY set: $( [[ -n "$XUMM_API_KEY" ]] && echo yes || echo no )"
echo "[env-bridge] XUMM_API_SECRET set: $( [[ -n "$XUMM_API_SECRET" ]] && echo yes || echo no )"
