# Codespaces Secrets Configuration Fix

## Problem
Your Codespace secrets are configured, but the backend can't find them because the **secret names don't match** what the code expects.

## Solution
The backend has been updated to check for **multiple environment variable names** to handle different naming conventions.

## Supported Environment Variable Names

The backend now checks these names in order (first found wins):

### For API Key:
1. `XUMM_API_KEY` (recommended)
2. `XUMM_KEY`
3. `API_KEY`

### For API Secret:
1. `XUMM_API_SECRET` (recommended)
2. `XUMM_SECRET`
3. `API_SECRET`

## How to Configure Codespaces Secrets

### Option 1: Use Recommended Names (Best Practice)
Go to your repo → **Settings** → **Secrets and variables** → **Codespaces**

Add secrets with these exact names:
- **Name:** `XUMM_API_KEY` → **Value:** your actual Xumm API key
- **Name:** `XUMM_API_SECRET` → **Value:** your actual Xumm API secret

### Option 2: Use Alternative Names
If your secrets are already named differently, the backend will find them automatically:
- `XUMM_KEY` will be found and used as the API key
- `XUMM_SECRET` will be found and used as the API secret
- `API_KEY` will be found and used as the API key
- `API_SECRET` will be found and used as the API secret

## Verifying Your Setup

### 1. Check Secret Names
In your Codespace terminal, check which environment variables are available:

```bash
echo "Checking for API keys..."
env | grep -E "XUMM|API_KEY|API_SECRET"
```

This will show you which variables are set.

### 2. Start the Backend Server
```bash
cd backend
npm install
npm start
```

Look for this output:
```
🚀 Unykorn API Server running on port 4000
📡 CORS enabled for: ...
🔐 Xumm configured: true  ← Should be TRUE if secrets are found
🔑 Looking for keys: XUMM_API_KEY, XUMM_KEY, or API_KEY
🔑 Looking for secrets: XUMM_API_SECRET, XUMM_SECRET, or API_SECRET
🌐 Environment: development
```

If `🔐 Xumm configured: false`, the secrets aren't being found.

### 3. Test the API
```bash
curl http://localhost:4000/xumm/ping
```

Should return:
```json
{
  "app": "YourAppName",
  "network": "XRPL Mainnet",
  "status": "ok"
}
```

## Troubleshooting

### Secrets Not Found After Setting
1. **Rebuild the Codespace:** Secrets are only loaded when the Codespace starts
   - Go to your Codespace → Click three dots (⋮) → "Rebuild Container"
   - Or close and reopen the Codespace

2. **Check Secret Scope:** Make sure secrets are set for:
   - The correct repository
   - Not User secrets (those have different behavior)
   - Codespaces specifically (not Actions secrets)

3. **Verify Secret Names:** Secrets are case-sensitive
   - `XUMM_API_KEY` ✅
   - `xumm_api_key` ❌
   - `Xumm_Api_Key` ❌

### Still Having Issues?

Enable debug mode to see what the backend is receiving:

```bash
# Add to backend/server.js after dotenv.config()
console.log('Environment variables:', {
  XUMM_API_KEY: process.env.XUMM_API_KEY ? 'SET' : 'NOT SET',
  XUMM_KEY: process.env.XUMM_KEY ? 'SET' : 'NOT SET',
  API_KEY: process.env.API_KEY ? 'SET' : 'NOT SET',
  XUMM_API_SECRET: process.env.XUMM_API_SECRET ? 'SET' : 'NOT SET',
  XUMM_SECRET: process.env.XUMM_SECRET ? 'SET' : 'NOT SET',
  API_SECRET: process.env.API_SECRET ? 'SET' : 'NOT SET'
})
```

Then restart the server and check the output.

## Common Secret Name Issues

| Your Secret Name | Will It Work? | Why |
|-----------------|---------------|-----|
| `XUMM_API_KEY` | ✅ Yes | Perfect! |
| `XUMM_KEY` | ✅ Yes | Supported alternative |
| `API_KEY` | ✅ Yes | Supported alternative |
| `xumm-api-key` | ❌ No | Hyphens and lowercase don't work |
| `XummApiKey` | ❌ No | Underscores required |
| `XUMM_KEY_API` | ❌ No | Wrong order |

## Best Practices

1. **Use the recommended names:** `XUMM_API_KEY` and `XUMM_API_SECRET`
2. **Never commit secrets** to your repository
3. **Don't hardcode secrets** in code
4. **Test locally first** with a `.env` file before deploying

## Quick Fix Checklist

- [ ] Secrets are added in correct location (Codespaces, not Actions)
- [ ] Secret names match one of the supported patterns
- [ ] Codespace has been rebuilt after adding secrets
- [ ] Backend server shows "Xumm configured: true" on startup
- [ ] `/xumm/ping` endpoint returns real app data (not simulation)

## Production Deployment

For production (Render, Fly.io, etc.), use the same environment variable names:

**Render.com:**
Dashboard → Environment → Add:
- `XUMM_API_KEY`
- `XUMM_API_SECRET`

**Fly.io:**
```bash
fly secrets set XUMM_API_KEY=your-key XUMM_API_SECRET=your-secret
```

**Cloudflare Workers:**
```bash
wrangler secret put XUMM_API_KEY
wrangler secret put XUMM_API_SECRET
```

---

**Still stuck?** The backend will run in simulation mode if secrets aren't found, so you can develop and test the UI while troubleshooting the configuration.
