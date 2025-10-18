# Changelog

All notable changes to this project will be documented in this file.

## 🦄 UnyKorn v0.1.1 – Stabilization & Security Release (2025-10-18)

### 🔐 Core Changes / Security Upgrades

- Cookie-only authentication — `/me` now validates the signed session cookie (`sid`) exclusively. Bearer JWTs are rejected, eliminating client-side token storage.
- Full CSRF protection — Middleware enforces `X-CSRF-Token` on all mutating routes (`POST / PUT / PATCH / DELETE`). `GET /auth/csrf` remains open for token retrieval.
- CORS policy tightened — Allows `Content-Type`, `Authorization`, `X-CSRF-Token`; credentials enabled.
- Session integrity — `SESSION_SECRET`-signed cookies; 60 s JWT clock tolerance; rate-limited `/me`; Prometheus metrics at `/metrics`.

### 🖥️ Frontend & Client Flow

- Migrated `use-xumm-auth` to `xumm-oauth2-pkce v2` (event/state API).
- Session creation: `GET /auth/csrf → POST /auth/session` with Bearer + CSRF header → sets HTTP-only cookie.
- Auto-refresh: Session refreshes ~2 minutes before expiry via `xumm.authorize()`.
- Removed all `localStorage` JWT usage.
- App guard and Wallet now read `sessionExp` for protection and expiry countdown.

### 📘 Docs & DevOps

- Added `docs/AUTH-SESSION-CSRF.md` explaining Auth → Session → Cookie → CSRF flow; linked in README.
- Added `redeploy-backend.yml` for manual Render redeploys.
- Pushed tag `v0.1.1` to GitHub (main branch synced and verified).
- Build (Vite) ✅   Typecheck ✅   Lint ✅   Tests (not yet added).

### ✅ Post-Deploy Validation Checklist

Repository:

```bash
git fetch --tags origin && git status
git pull --rebase origin main
```

Backend Endpoints:

```bash
# unauthenticated
curl -i https://api.unykorn.org/me  # → 401

# after PKCE + /auth/session (cookie set)
curl -i --cookie "sid=<cookie>" https://api.unykorn.org/me  # → 200 { ok:true }

# CSRF
curl -X POST https://api.unykorn.org/auth/logout  # → 403
curl -X GET  https://api.unykorn.org/auth/csrf
curl -X POST https://api.unykorn.org/auth/logout -H "X-CSRF-Token:<token>"  # → 200 { ok:true }

# metrics
curl -s https://api.unykorn.org/metrics | head
```

Frontend:

- Connect flow sets HTTP-only cookie (no JWT visible).
- Wallet is session-protected and shows countdown.
- Auto-refresh runs ~2 min before expiry.

CI / Deploy:

- GitHub Pages continues frontend deploys.
- To auto-redeploy backend, add secret `RENDER_DEPLOY_HOOK` in repo settings.
- Or trigger Actions → Redeploy Backend manually.

### 🔄 Next for v0.1.2 (candidates)

- Lightweight integration tests (`/auth/csrf`, `/auth/session`, `/me`).
- Optional backend auto-deploy hook enablement.
- README format polish and lint rule setup.
