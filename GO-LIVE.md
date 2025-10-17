# GO LIVE: Onboarding with Xumm

Use this quick checklist to share your public onboarding link and sanity-check the stack.

## Share this

- Public onboarding link (web):
  - Prod: https://join.trustiva.io/join
  - Local: http://localhost:3000/join
- Optional xApp (inside Xaman):
  - Deeplink/QR: https://xumm.app/detect/xapp:sandbox.d6a728799ff5

## 60-second smoke test

1) API health & config

- GET /health
- GET /public/config (check brand, orgContactEmail, orgAddress, xummConfigured: true)

2) Xumm connectivity

- GET /xumm/ping (shows your Xumm app name)

3) Onboarding start

- POST /onboard/start (expect { uuid, next, qrPng })

4) Trustline via Xumm

- Use /join page → Add Trustline → approve in Xumm

## Mainnet posture

- Rotate Xumm secret if exposed; update API env; restart
- Fund issuer cold, then hot
- Set RegularKey (cold→hot), enable DefaultRipple, set AccountSet.Domain
- Host TOML at https://yourdomain/.well-known/xrp-ledger.toml
- Faucet/seed routes are auto-blocked on mainnet

## Required env

API (.env):
- XRPL_NETWORK=devnet|testnet|mainnet
- XUMM_API_KEY=...
- XUMM_API_SECRET=...
- ORG_CONTACT_EMAIL=admin@trustiva.io
- ORG_ADDRESS=5655 Peachtree Pkwy, Norcross, GA 30099
- CORS_ORIGINS=https://join.trustiva.io,https://admin.trustiva.io,https://trustiva.io

Web (.env):
- NEXT_PUBLIC_API_BASE=https://api.trustiva.io
- NEXT_PUBLIC_BRAND=Trustiva
- NEXT_PUBLIC_NETWORK_LABEL=mainnet
