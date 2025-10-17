# Public Web (Next.js)

This app is ready to deploy as a static site (Next.js static export). You can host it on GitHub Pages, Vercel, Netlify, or any static host.

## Configure API base

Set the public API base so the web can reach your API:

```
NEXT_PUBLIC_API_BASE=https://api.yourdomain.com
NEXT_PUBLIC_BRAND=Trustiva
NEXT_PUBLIC_NETWORK_LABEL=devnet
# Optional: hide the Check page link (page still accessible directly)
NEXT_PUBLIC_HIDE_CHECK_NAV=true
```

For local dev:

```
NEXT_PUBLIC_API_BASE=http://localhost:4000
```

## Build & export

```
npm ci
npm run build
npm run export
```

This generates a static site in `apps/web/out`.

## Deploy to GitHub Pages

- Create a repo for your site. If using a project page (recommended), set it to `<org>/<repo>` and enable Pages for the `gh-pages` branch.
- Push the contents of `apps/web/out/` to the `gh-pages` branch of your repo.
- If deploying to a project page, the site will be served at `https://<org>.github.io/<repo>`.

The config is set to `output: 'export'` with a dynamic `basePath` that adapts to GitHub Pages.

Tip: For organization/user pages (`<org>.github.io` main site), keep `basePath` empty and host the static export at the repo root.

## Useful pages

- `/connect` — Show network + issuer copy, entry to Wallet
- `/wallet` — Xumm connect, balance, faucet (dev/test), trustline
- `/status` — Health, config, issuer, tokens, TOML & CSV links
- `/check` — One-click system check with pass/fail and issuer copy
