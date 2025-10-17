# Public Site & API Deploy Guide (Generic)

This guide covers deploying the public onboarding site and API without any third-party site builders.

## 1) API environment (apps/api/.env)

Required:
- PORT=4000
- DATABASE_URL=postgres://…
- XRPL_NETWORK=devnet | testnet | mainnet
- XRPL_RPC_* (optional overrides)
- XUMM_API_KEY=...
- XUMM_API_SECRET=...
- CORS_ORIGINS= (comma-separated origins; leave empty in local dev)
- BRAND=XRPL Demo
- NETWORK_LABEL=devnet
- PUBLIC_CONTACT_EMAIL=admin@example.com
- PUBLIC_CONTACT_ADDRESS=123 Main St, Anytown, USA

## 2) Web env (apps/web/.env)

Local dev:
- NEXT_PUBLIC_API_BASE=http://localhost:4000
- NEXT_PUBLIC_BRAND=XRPL Demo
- NEXT_PUBLIC_NETWORK_LABEL=devnet

## 3) Run locally

In one terminal:
- Start Postgres (docker-compose up -d) if not running
- Apply Prisma migrations
- Start API: npm run -w @unykorn/api start

In another terminal:
- Start Web: npm run -w @unykorn/web start

Visit http://localhost:3000

## 4) XRPL issuer onboarding (dev/test)

1. POST /issuer/init (dev/test only) to set RegularKey & flags
2. POST /tokens { code, name }
3. Serve TOML at /.well-known/xrp-ledger.toml (API provides a basic version)

## 5) Mainnet posture

- Faucet and seed-based routes are blocked on mainnet
- Use Xumm for end-user signing and KMS/HSM for treasury
- Rate-limit onboarding routes
