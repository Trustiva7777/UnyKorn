# Auth → Session → Cookie → CSRF (v0.1.1)

This app uses Xaman (Xumm) OAuth2 PKCE for sign-in, then converts the verified Xumm JWT into a server-side session.

## Flow overview

1. PKCE Auth (frontend)

- The frontend initiates PKCE with `xumm-oauth2-pkce` and receives a short-lived Xumm JWT after user approval.

2. Create Session (server)

- Frontend fetches `GET /auth/csrf` to obtain a CSRF token cookie/value.
- Frontend POSTs `POST /auth/session` with header `Authorization: Bearer <xumm_jwt>` and `X-CSRF-Token: <csrf>`.
- Server verifies the JWT against Xumm JWKS and sets a `sid` HTTP-only cookie (SameSite=Lax, Secure). Response: `{ ok: true, exp }`.

3. Use Cookie Session

- Authenticated calls use only the cookie. `GET /me` verifies the `sid` cookie and returns claims (including `exp`).
- Bearer tokens are not accepted on `/me` anymore (security hardening).

4. CSRF Enforcement

- All mutating routes (POST/PUT/PATCH/DELETE) require `X-CSRF-Token` header matching the `csrf` cookie (double-submit cookie pattern).
- `GET /auth/csrf` is exempt to allow obtaining a token.

## Client guidance

- Do not store the Bearer token. It’s used once to create the cookie session.
- To logout, call `GET /auth/csrf` then `POST /auth/logout` with `X-CSRF-Token`.
- Pre-expiry refresh: the client schedules a re-auth roughly two minutes before session expiry to keep users signed in.

## Backend notes

- `/me` is cookie-only, rate limited, and rejects Bearer-only requests.
- CORS allows `Content-Type, Authorization, X-CSRF-Token` and `credentials: true` to support cookie usage.
- Session cookie name: `sid`. CSRF cookie name: `csrf` (non-HTTP-only by design for double-submit pattern).

## Relevant code

- Backend: `backend/server.js`
  - Cookie sessions: `/auth/session`, `/auth/logout`
  - CSRF token endpoint: `/auth/csrf`
  - CSRF enforcement middleware for mutating methods
  - Cookie-only `/me`
- Frontend:
  - Session/refresh logic: `src/hooks/use-xumm-auth.ts`
  - API helpers: `src/lib/api.ts`
