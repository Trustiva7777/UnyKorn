# Unykorn 7777 Team AI System

Welcome to the Unykorn 7777 platform. This monorepo powers your business, project management, AI agents, and XRPL wallet integration for your team.

## Structure
- `apps/` — Frontend, backend, admin, and user apps
- `packages/` — Shared libraries, AI agent modules, wallet integration
- `docs/` — Documentation and onboarding
- `.github/` — Project instructions and workflows

## Getting Started
1. Copy `.env.example` to `.env` (root) and adjust values
2. In `apps/api/`, copy `.env.example` to `.env` and set:
	- DATABASE_URL (matches docker-compose Postgres)
	- XRPL_NETWORK (devnet | testnet | mainnet)
	- XUMM_API_KEY / XUMM_API_SECRET (from Xumm Console)
3. Install dependencies
4. Start Postgres (docker-compose)
5. Run Prisma generate/migrate and seed
6. Run dev servers (web + api + admin)

### Quick Commands
```bash
# install deps
npm install

# start database (docker)
docker compose up -d db

# generate prisma client & migrate schema
npm run -w @unykorn/api prisma:generate
npm run -w @unykorn/api prisma:migrate

# optional: seed demo data
npm run -w @unykorn/api seed

# build all
npm run build

# start dev (web:3000, api:4000)
npm run dev
```

## Unykorn Ignite (first-run notebook)

For a one-click bootstrap in GitHub Codespaces, use the notebook at `Unykorn-Ignite.ipynb`. It documents, configures, verifies, and deploys key parts of the stack in the right order:

- Bridges and verifies secrets (via `scripts/env-bridge.sh` with masked output)
- Restarts and validates the API (`/health` and `/xumm/ping`)
- Provisions Cloudflare DNS for your domain (e.g., `unykorn.org`)
- Shows DNS records and prints a success banner when complete

How to use it:
1) Open `Unykorn-Ignite.ipynb` in VS Code’s Notebook view.
2) Run from top to bottom. If Codespaces secrets weren’t injected, use the “1b) Manual shim” cell, then re-run “1a) Bridge and inspect environment”.
3) In the Cloudflare section, replace the placeholder API `--target` host (e.g., `api.fly.dev`) with your real API hostname before running that cell.
4) The last cell prints a green check if all systems are lit.

Safe to re-run:
- The notebook is idempotent and safe to re-run. It masks secrets in output and retries harmless checks.

Pre-reqs (Codespaces Secrets):
- `XAMANAPI`, `XAMANKEY` (Xumm), and one of `CF_API_TOKEN` / `CLOUDFLARE_API_TOKEN` / `CLOUDFAREWORKERAPI` (Cloudflare). Optionally `CLOUDFLARE_ZONE_ID`.
- Ensure secrets are assigned to this repository (not “0 repositories”), then restart the Codespace so they’re injected.

Troubleshooting:
- Port 4000 busy: use the notebook’s API reset step (or `npm run api:stop` then `npm run api:start`).
- Missing Xumm keys in `/xumm/ping`: export them in the same shell as the API and re-run the API reset cell.
- Cloudflare auth errors: confirm `CF_API_TOKEN` (or aliases) is present; use the env-bridge or manual shim cells.
- CORS in prod: set `CORS_ORIGINS` to include your domains (e.g., `https://unykorn.org,https://www.unykorn.org,https://trustiva.io,https://www.trustiva.io`).

### Useful Scripts
- `npm run dev:web` — run web only (port 3000)
- `npm run dev:api` — run api only (port 4000)
- `npm run dev:admin` — run admin only (port 3001)
- `npm run dev:reset` — free ports 3000/3001/4000 if stuck

### XRPL & Xumm
- Ping: GET `http://localhost:4000/xumm/ping`
- Public config: GET `http://localhost:4000/public/config`
- Onboarding:
	- POST `/onboard/start` — Xumm SignIn payload
	- GET `/onboard/result/:uuid` — poll signing result
	- POST `/onboard/trustline` — create TrustSet payload

### Web Pages
- Public: http://localhost:3000/
- Connect: http://localhost:3000/connect
- Wallet: http://localhost:3000/wallet
- Join: http://localhost:3000/join
- Status: http://localhost:3000/status
- Admin: http://localhost:3001/
- Fund (QR for issuer cold/hot): http://localhost:3000/fund
- Admin: http://localhost:3001/

### Troubleshooting
- Ports busy: run `npm run dev:reset`
- DB not reachable: ensure `docker compose up -d db` and `DATABASE_URL` matches
- Xumm not configured: set `XUMM_API_KEY` and `XUMM_API_SECRET` in `apps/api/.env`, restart API
- CORS in dev: set `CORS_ORIGINS` in `apps/api/.env` or leave blank to allow all in dev

## Deploying the front-facing site (GitHub Pages + custom domain)

We ship the public site as a static export via GitHub Pages. The Connect/Wallet UI talks to your API via `NEXT_PUBLIC_API_BASE`.

1) Configure build-time variables (recommended)
- In the repo: Settings → Variables → Actions → New variables:
	- `NEXT_PUBLIC_API_BASE` → your API HTTPS URL (e.g., https://api.unykorn.org)
	- `NEXT_PUBLIC_BRAND` → Unykorn
	- `NEXT_PUBLIC_NETWORK_LABEL` → Mainnet | Testnet | Devnet
	- `NEXT_PUBLIC_HIDE_CHECK_NAV` → false
	- `PAGES_CNAME` → unykorn.org (optional; overrides the `public/CNAME` file)

2) Push to main — CI builds and publishes `apps/web/out/` to GitHub Pages.

3) Custom domain (trustiva.io or unykorn.org)
- An A or CNAME record must point at GitHub Pages:
	- Apex (trustiva.io): create A records to GitHub’s Pages IPs
		- 185.199.108.153
		- 185.199.109.153
		- 185.199.110.153
		- 185.199.111.153
	- Or use a CNAME from `www.trustiva.io` → `<your-username>.github.io` and then redirect apex.
- A `CNAME` file is included at `apps/web/public/CNAME`. Update it to your canonical domain (e.g., `unykorn.org`), or set the `PAGES_CNAME` repository variable and CI will write it during the build.

4) DNS propagation may take up to 24–48h. After it resolves, enable HTTPS in the Pages settings.

## Automate GoDaddy DNS (optional)

We included a helper to manage common DNS records via GoDaddy’s API.

Setup:
	- GODADDY_API_KEY, GODADDY_API_SECRET, DOMAIN=trustiva.io

Examples:
```bash
# show current A/AAAA/CNAME for @, www, api
node scripts/godaddy-dns.js show --domain trustiva.io

# configure GitHub Pages on apex + www
node scripts/godaddy-dns.js setup-pages --domain trustiva.io --mode apex

# or configure Pages on www using your <user>.github.io
node scripts/godaddy-dns.js setup-pages --domain trustiva.io --mode www --ghio yourname.github.io

# point api.trustiva.io
node scripts/godaddy-dns.js set-api --domain trustiva.io --target api.your-host.tld
# or to an IP
node scripts/godaddy-dns.js set-api --domain trustiva.io --target 203.0.113.10
```

## Automate Cloudflare DNS (optional)

If your domain is on Cloudflare (e.g., unykorn.org), use the Cloudflare helper.

Setup:
- Create an API token with permissions: Zone:Read and DNS:Edit for your zone
- Export env vars:
	- CF_API_TOKEN, DOMAIN=unykorn.org
	- Optional: CF_ZONE_ID to skip zone lookup

Examples:
```bash
# verify access and zone
npm run cf:verify -- --domain unykorn.org

# show basic records (@, www, api)
npm run cf:show -- --domain unykorn.org

# configure GitHub Pages on apex + www
npm run cf:pages:apex -- --domain unykorn.org --proxied true

# or configure Pages on www using your <user>.github.io
npm run cf:pages:www -- --domain unykorn.org --ghio yourname.github.io --proxied true

# point api.unykorn.org
npm run cf:set:api -- --domain unykorn.org --target api.your-host.tld --proxied true
# or to an IP
npm run cf:set:api -- --domain unykorn.org --target 203.0.113.10 --proxied true
```

- Don’t interrupt servers: run curls in a different terminal tab than the one running the server; Ctrl+C in the same pane will stop it

### Optional: hide System Check from nav
Set this in `apps/web/.env.local` (or your hosting env) to hide the Check link from the header while the page remains directly reachable:

```
NEXT_PUBLIC_HIDE_CHECK_NAV=true
```

### Operations Runbook
See `docs/OPERATIONS.md` for a step-by-step operator guide covering issuer init, funding, trustlines, issuance, reporting, and mainnet guidance.

### API Endpoints (initial)
- GET `http://localhost:4000/health` — health check
- POST `http://localhost:4000/provision` — body: `{ "userId": "alice", "role": "Ops" }`
- GET `http://localhost:4000/users/:userId` — fetch user, agent, wallet

## Next Steps
- Backend, frontend, and AI agent scaffolding
- Web3 wallet integration
- Team onboarding and documentation

### Admin → Invitations
- Open Admin at http://localhost:3001 and go to Invitations.
- Create an invite; share the open link.
- The user accepts at `/invite/{token}` → Space + Agent + Wallet provisioned.

---
*Replace this README as the project evolves.*