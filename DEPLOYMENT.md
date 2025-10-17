# Unykorn Deployment Guide

Complete guide for deploying both the frontend (Spark/GitHub Pages) and backend (Codespaces/Cloud) for the Unykorn platform.

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────┐
│                  GitHub Repository                    │
│  ┌─────────────────┐      ┌────────────────────────┐ │
│  │  Frontend (src) │      │  Backend (backend/)    │ │
│  │  - React/TS     │      │  - Express.js          │ │
│  │  - Tailwind     │      │  - Xumm SDK            │ │
│  │  - shadcn/ui    │      │  - API endpoints       │ │
│  └────────┬────────┘      └─────────┬──────────────┘ │
└───────────┼───────────────────────────┼───────────────┘
            │                           │
            │ GitHub Actions            │ Deploy to
            │ (Deploy to Pages)         │ Render/Fly/Workers
            ▼                           ▼
   ┌────────────────────┐      ┌────────────────────────┐
   │  GitHub Pages      │      │  Cloud Provider        │
   │  unykorn.org       │◄────►│  api.unykorn.org       │
   │  (Static Frontend) │ HTTPS │  (Backend API)         │
   └────────────────────┘      └────────────────────────┘
```

## 📦 Part 1: Frontend Deployment (Spark → GitHub Pages)

### Step 1: Configure Repository

1. **Enable GitHub Pages**
   - Go to repo Settings → Pages
   - Source: GitHub Actions
   - Custom domain: `unykorn.org` (if applicable)

2. **Add Repository Variables**
   - Go to Settings → Secrets and variables → Actions → Variables
   - Add these variables:

   ```
   VITE_API_BASE = https://api.unykorn.org
   VITE_BRAND = Unykorn
   VITE_NETWORK_LABEL = XRPL Mainnet
   VITE_ENABLE_SIMULATION = false
   ```

### Step 2: GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build with environment variables
        env:
          VITE_API_BASE: ${{ vars.VITE_API_BASE }}
          VITE_BRAND: ${{ vars.VITE_BRAND }}
          VITE_NETWORK_LABEL: ${{ vars.VITE_NETWORK_LABEL }}
          VITE_ENABLE_SIMULATION: ${{ vars.VITE_ENABLE_SIMULATION }}
        run: npm run build
      
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

### Step 3: Custom Domain (Optional)

If using custom domain like `unykorn.org`:

1. Add `CNAME` file to `/public/CNAME`:
   ```
   unykorn.org
   ```

2. Configure DNS:
   ```
   Type  Name  Value
   A     @     185.199.108.153
   A     @     185.199.109.153
   A     @     185.199.110.153
   A     @     185.199.111.153
   CNAME www   yourusername.github.io
   ```

3. Enable HTTPS in Pages settings

### Step 4: Deploy Frontend

```bash
git add .
git commit -m "Configure frontend deployment"
git push origin main
```

GitHub Actions will automatically build and deploy to Pages.

## 🖥️ Part 2: Backend Deployment

### Option A: Codespaces (Development/Testing)

#### Step 1: Configure Codespaces Secrets

1. Go to repo Settings → Secrets → Codespaces
2. Add secrets:
   ```
   XUMM_API_KEY = your-xumm-api-key
   XUMM_API_SECRET = your-xumm-api-secret
   CF_API_TOKEN = your-cloudflare-token
   CLOUDFLARE_ZONE_ID = your-zone-id
   DATABASE_URL = postgresql://...
   CORS_ORIGINS = https://unykorn.org,https://www.unykorn.org
   ```

#### Step 2: Start Codespace

1. Open Codespace from GitHub
2. Run backend:
   ```bash
   cd backend
   npm install
   npm install xumm-sdk  # If you want real Xumm integration
   npm start
   ```

#### Step 3: Expose Port

1. In Codespaces, go to Ports tab
2. Forward port 4000
3. Set visibility to Public
4. Note the forwarded URL (e.g., `https://xxx-4000.preview.app.github.dev`)

#### Step 4: Update Frontend

Update frontend to use Codespaces URL temporarily:
```bash
# In .env
VITE_API_BASE=https://xxx-4000.preview.app.github.dev
```

### Option B: Render.com (Production - Recommended)

#### Step 1: Create Web Service

1. Go to [render.com](https://render.com)
2. New → Web Service
3. Connect your GitHub repo
4. Configure:
   - **Name**: unykorn-api
   - **Region**: Choose closest to users
   - **Branch**: main
   - **Root Directory**: backend
   - **Build Command**: `npm install && npm install xumm-sdk`
   - **Start Command**: `npm start`
   - **Instance Type**: Free (or paid for production)

#### Step 2: Add Environment Variables

In Render dashboard, add:
```
PORT = 4000
NODE_ENV = production
XUMM_API_KEY = xxx
XUMM_API_SECRET = yyy
CORS_ORIGINS = https://unykorn.org,https://www.unykorn.org
CF_API_TOKEN = zzz
CLOUDFLARE_ZONE_ID = aaa
DATABASE_URL = postgresql://...
VITE_BRAND = Unykorn
VITE_NETWORK_LABEL = XRPL Mainnet
```

#### Step 3: Configure Custom Domain

1. In Render, go to Settings → Custom Domains
2. Add: `api.unykorn.org`
3. Update DNS:
   ```
   Type   Name  Value
   CNAME  api   yourapp.onrender.com
   ```

#### Step 4: Deploy

Render auto-deploys on git push to main. Or manually trigger deploy in dashboard.

### Option C: Fly.io (Production)

#### Step 1: Install Fly CLI

```bash
curl -L https://fly.io/install.sh | sh
fly auth login
```

#### Step 2: Initialize App

```bash
cd backend
fly launch
```

Answer prompts:
- App name: `unykorn-api`
- Region: Choose closest
- Postgres: Yes (if you need database)

#### Step 3: Set Secrets

```bash
fly secrets set \
  XUMM_API_KEY=xxx \
  XUMM_API_SECRET=yyy \
  CF_API_TOKEN=zzz \
  CLOUDFLARE_ZONE_ID=aaa \
  CORS_ORIGINS=https://unykorn.org
```

#### Step 4: Deploy

```bash
fly deploy
```

#### Step 5: Custom Domain

```bash
fly certs create api.unykorn.org
```

Update DNS:
```
Type   Name  Value
A      api   [IP from fly]
AAAA   api   [IPv6 from fly]
```

### Option D: Cloudflare Workers (Advanced)

Convert Express app to Workers format or use Node.js compatibility:

```bash
cd backend
npm create cloudflare@latest
```

Follow prompts and configure wrangler.toml for deployment.

## 🔗 Part 3: Connect Frontend to Backend

### Step 1: Update Frontend Variables

Once backend is deployed with a stable URL, update frontend variables:

**Local development (.env):**
```bash
VITE_API_BASE=http://localhost:4000
VITE_ENABLE_SIMULATION=false
```

**Production (GitHub Actions Variables):**
```
VITE_API_BASE = https://api.unykorn.org
VITE_ENABLE_SIMULATION = false
```

### Step 2: Rebuild and Deploy

```bash
npm run build
# Or push to trigger GitHub Actions
git push origin main
```

### Step 3: Test Integration

1. Visit `https://unykorn.org/status`
2. Verify "API Backend" shows "Connected"
3. Verify "Xumm Integration" shows "Connected"
4. Test onboarding flow on Join page

## ✅ Verification Checklist

### Frontend
- [ ] Site loads at https://unykorn.org
- [ ] All pages render correctly
- [ ] Navigation works smoothly
- [ ] Styles load properly
- [ ] No console errors

### Backend
- [ ] API responds at https://api.unykorn.org/health
- [ ] CORS allows frontend domain
- [ ] Xumm integration works (/xumm/ping)
- [ ] Onboarding flow completes
- [ ] Environment variables loaded

### Integration
- [ ] Status page shows "Connected"
- [ ] QR codes generate on Join page
- [ ] Wallet connection works end-to-end
- [ ] Data persists across sessions
- [ ] Error handling works (offline mode)

## 🔐 Security Best Practices

### Frontend
- ✅ No secrets in source code
- ✅ Environment variables for config only
- ✅ HTTPS enabled
- ✅ Content Security Policy set

### Backend
- ✅ All secrets in environment variables
- ✅ CORS properly configured
- ✅ Rate limiting enabled
- ✅ Input validation on all endpoints
- ✅ HTTPS only (no HTTP)
- ✅ Database queries parameterized
- ✅ Authentication for admin endpoints

## 📊 Monitoring

### Frontend
- GitHub Actions logs for build failures
- Browser console for runtime errors
- Status page for API connectivity

### Backend
- Render/Fly logs for server errors
- Health endpoint monitoring
- Database connection monitoring
- Error tracking (Sentry, etc.)

## 🐛 Troubleshooting

### Frontend Not Loading
1. Check GitHub Actions build logs
2. Verify custom domain DNS
3. Check browser console for errors
4. Ensure CNAME file is present

### Backend Not Responding
1. Check server logs in cloud provider
2. Verify environment variables set
3. Test health endpoint directly
4. Check CORS configuration

### API Connection Failed
1. Verify VITE_API_BASE is correct
2. Check backend CORS_ORIGINS includes frontend domain
3. Test with curl from command line
4. Check Status page for details

### CORS Errors
1. Add frontend domain to backend CORS_ORIGINS
2. Ensure protocol matches (https)
3. Restart backend after changes
4. Clear browser cache

## 🚀 Going to Production

### Pre-launch Checklist
- [ ] Backend on paid tier (not free)
- [ ] Database backups enabled
- [ ] SSL certificates valid
- [ ] Monitoring set up
- [ ] Error tracking configured
- [ ] Rate limiting enabled
- [ ] Admin authentication working
- [ ] Load testing completed
- [ ] Security audit done
- [ ] Documentation updated

### Launch Steps
1. Deploy backend to production
2. Update frontend variables
3. Deploy frontend
4. Test all flows
5. Monitor for errors
6. Announce launch

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Fly.io Documentation](https://fly.io/docs)
- [GitHub Pages Guide](https://docs.github.com/pages)
- [Xumm SDK Docs](https://xumm.readme.io/)
- [XRPL Documentation](https://xrpl.org/)

## 🆘 Support

If you encounter issues:
1. Check Status page in the app
2. Review BACKEND_SETUP.md
3. Check GitHub Actions logs
4. Review cloud provider logs
5. Test endpoints with curl

---

**Ready to deploy?** Start with Codespaces for testing, then move to Render for production!
