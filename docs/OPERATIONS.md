# Unykorn XRPL Operations Runbook

This is your step-by-step guide to running issuance and onboarding with the Unykorn stack (API + Web + XRPL + Xaman/Xumm).

## 0) Prerequisites
- API running at http://localhost:4000 (or your host)
- Web running at http://localhost:3000 (or your host)
- Network: devnet/testnet for dry runs; mainnet for production
- Optional (recommended for prod): set `XUMM_API_KEY`/`XUMM_API_SECRET` in `apps/api/.env`

## 1) Create or fetch the Issuer
- Endpoint: POST `/issuer/init` (dev/test: auto-faucet; mainnet: no faucet)
- Returns: Cold/Hot addresses and seeds (seeds shown once; store securely)
- Verify latest issuer: GET `/issuer`

Notes:
- Cold account owns the issued currency; Hot account is the RegularKey signer.
- On dev/test, we set DefaultRipple and RegularKey automatically. On mainnet, plan to do the same but ensure you’ve funded both accounts first via an exchange or Xaman.

## 2) Fund Issuer Accounts (Cold & Hot)
Use the web UI at `/fund` to get QR codes and copyable addresses for both Cold and Hot.
- From Xaman (Xumm), send XRP to those addresses.
- Ensure enough XRP for base reserve and operations (fees + trustlines).
- Rule of thumb: fund Hot with a few XRP for fees; fund Cold sufficiently to cover reserve and any additional ledger objects over time.

## 3) Create a Token
- Endpoint: POST `/tokens` with body `{ code: "UNZ", name: "Unykorn Z", precision?: 6 }`
- Verify tokens: GET `/tokens`

## 4) Establish Trustlines
There are two flows:
- Operator (dev/test): POST `/wallets/xrpl/trustline` with `{ seed, currency, issuer, limit }` (disabled on mainnet)
- Users (prod-friendly): use Xaman via the web
  - Visit `/onboard` or `/wallet`
  - Click Connect with Xaman (Sign In)
  - Click Trust for the token (creates a Xumm TrustSet payload)

Tip: If issuance returns `tecPATH_DRY`, establish the trustline first.

## 5) Issue Tokens
- Dev/Test (seed-based): POST `/tokens/:id/issue` with `{ seed: HOT_SEED, destination: r..., value: "100" }`
  - Disabled on mainnet for safety. Use Xumm or an HSM/KMS-based signer for production.
- Verify balances:
  - GET `/wallets/xrpl/balance/:address`
  - Web: `/wallet` shows XRP and issued balances for the connected account

## 6) Redeem Tokens
- Dev/Test only: POST `/tokens/:id/redeem` with `{ holderSeed, value }`
- In production, redeem via Xumm (payload builder not included here yet) or a custodial off-ramp flow.

## 7) Reporting & Audit
- Status: GET `/status` (aggregated health + config + latest issuer/tokens)
- Holders CSV: GET `/reports/holders.csv?issuer=<cold>&currency=<code>`
- Transactions CSV: GET `/reports/tx.csv?from=ISO&to=ISO&tokenId=...&type=...&account=...`
- XRPL TOML: GET `/.well-known/xrp-ledger.toml`

## 8) Airdrop (Dev/Test)
```
API_BASE=http://localhost:4000 HOT_SEED=... TOKEN_CODE=UNZ \
node scripts/airdrop.js scripts/recipients.sample.csv
```
- Reads CSV of `address,amount`
- Calls `/tokens/:id/issue` sequentially

## 9) Web Frontend
- Home: `/`
- Connect: `/connect`
- Wallet: `/wallet`
- Onboard: `/onboard`
- Fund (QR): `/fund`
- Status: `/status`
- System Check: `/check`

For static deploys, `next build` outputs static pages (Next 14 `output: 'export'`).

## 10) Configuration Cheatsheet
- API (`apps/api/.env`):
  - `PORT=4000`
  - `DATABASE_URL=postgresql://...`
  - `XRPL_NETWORK=devnet|testnet|mainnet`
  - `XUMM_API_KEY` / `XUMM_API_SECRET` (enable Xaman flows)
  - `CORS_ORIGINS=https://your.site`
- Web (`apps/web/.env.local`):
  - `NEXT_PUBLIC_API_BASE=http://api.your.site`
  - `NEXT_PUBLIC_HIDE_CHECK_NAV=true` (optional)

## 11) Mainnet Guidance
- No faucet. Fund both issuer accounts from a verified source.
- Seed-based endpoints are disabled; use Xumm or a secure signer.
- Ensure CORS is locked down to your production domain.
- Keep seeds offline and never commit them.

---
If you need Xumm issuance payloads (mainnet-friendly), we can add an `/onboard/issue` payload builder next.
