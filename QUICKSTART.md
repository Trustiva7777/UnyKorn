# Unykorn Quick Start Guide

Get the Unykorn platform running in 5 minutes.

## 🎯 What You're Building

A sovereign-grade financial infrastructure platform with:
- **Frontend**: React app hosted on GitHub Pages (unykorn.org)
- **Backend**: Express API with Xumm wallet integration
- **Features**: Real wallet onboarding, status monitoring, admin dashboard

## ⚡ Quick Start (Local Development)

### 1. Clone and Install
```bash
git clone <your-repo-url>
cd spark-template
npm install
```

### 2. Start Frontend
```bash
npm run dev
```
Frontend runs at http://localhost:5173

### 3. Start Backend (Separate Terminal)
```bash
cd backend
npm install
npm start
```
Backend runs at http://localhost:4000

### 4. Open Browser
Visit http://localhost:5173

✅ Status page should show "Connected" for API Backend

## 🚀 Deploy to Production (5 Steps)

### Step 1: Get Xumm API Keys
1. Go to https://apps.xumm.dev
2. Create an application
3. Copy API Key and Secret

### Step 2: Configure Backend Secrets

**For Codespaces:**
- Repo → Settings → Secrets → Codespaces
- Add: `XUMM_API_KEY`, `XUMM_API_SECRET`

**For Render.com:**
- Create Web Service → Connect repo
- Root Directory: `backend`
- Add environment variables in dashboard

### Step 3: Deploy Backend

**Codespaces:**
```bash
cd backend
npm install
npm install xumm-sdk
npm start
```
Forward port 4000 as Public, note URL

**Render.com:**
Just push to main branch, auto-deploys

### Step 4: Configure Frontend
Repo → Settings → Secrets and variables → Actions → Variables

Add:
```
VITE_API_BASE = https://api.unykorn.org  (or your backend URL)
VITE_BRAND = Unykorn
VITE_NETWORK_LABEL = XRPL Mainnet
VITE_ENABLE_SIMULATION = false
```

### Step 5: Deploy Frontend
```bash
git push origin main
```

GitHub Actions auto-deploys to Pages.

## 🧪 Testing

### Test Backend
```bash
curl http://localhost:4000/health
curl http://localhost:4000/xumm/ping
```

### Test Frontend
1. Visit Status page
2. Check "API Backend" = Connected
3. Check "Xumm Integration" = Connected
4. Try Join page → Connect with Xumm
5. QR code should appear

## 📋 Simulation Mode

Don't have Xumm keys yet? No problem!

The app runs in **simulation mode** by default:
- ✅ All UI works perfectly
- ✅ Onboarding flow simulates wallet connection
- ✅ Data persists locally
- ✅ Perfect for development/demos

To enable simulation:
```bash
# .env
VITE_ENABLE_SIMULATION=true
```

## 🎨 What's Included

### Frontend Features
- 🌌 Animated constellation background
- 🔗 6 pages: Home, Join, Wallet, Status, Partners, Admin
- 💳 Xumm wallet integration
- 📊 Real-time status monitoring
- 🎯 Admin dashboard
- 📱 Fully responsive

### Backend Features
- ✅ Health check endpoint
- 🔐 Xumm SDK integration
- 📡 CORS configured
- 🔄 Auto-cleanup expired sessions
- 🎭 Simulation fallback
- 🔒 Environment-based config

### Tech Stack
- **Frontend**: React 19, TypeScript, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: Node.js, Express, Xumm SDK
- **Storage**: spark.kv (persistent state)
- **Deployment**: GitHub Pages + Render/Fly/Workers

## 📁 Project Structure

```
spark-template/
├── src/                    # Frontend source
│   ├── components/         # React components
│   │   ├── pages/         # Page components
│   │   └── ui/            # shadcn components
│   ├── hooks/             # Custom hooks
│   ├── lib/               # Utilities & API client
│   └── index.css          # Theme & styles
├── backend/               # Backend API
│   ├── server.js         # Express server
│   ├── package.json      # Backend deps
│   └── .env.example      # Config template
├── .github/workflows/    # GitHub Actions
│   └── deploy.yml        # Auto-deploy config
├── PRD.md                # Product requirements
├── BACKEND_SETUP.md      # Backend guide
├── DEPLOYMENT.md         # Full deployment guide
└── QUICKSTART.md         # This file
```

## 🎯 Key Files

- `src/App.tsx` - Main React component
- `src/lib/api.ts` - API client with simulation
- `src/lib/config.ts` - Configuration
- `backend/server.js` - Express API server
- `.env` - Local environment config

## 🔧 Common Tasks

### Change API URL
```bash
# .env
VITE_API_BASE=https://your-api-url.com
```

### Enable/Disable Simulation
```bash
# .env
VITE_ENABLE_SIMULATION=true  # or false
```

### Add Xumm Integration
```bash
cd backend
npm install xumm-sdk

# Add to .env or Codespaces secrets
XUMM_API_KEY=your-key
XUMM_API_SECRET=your-secret
```

### View Logs
**Frontend:** Browser DevTools → Console  
**Backend:** Terminal where server is running

## 🆘 Troubleshooting

### "API Backend: Offline" on Status page
- Check backend is running
- Verify VITE_API_BASE matches backend URL
- Check CORS in backend .env

### CORS errors
```bash
# backend/.env
CORS_ORIGINS=http://localhost:5173,https://unykorn.org
```

### QR code not generating
- Check Xumm keys are set
- Try simulation mode first
- Check backend logs

### Build fails
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

## 📚 Next Steps

1. ✅ Get it running locally (above)
2. 📖 Read [BACKEND_SETUP.md](./BACKEND_SETUP.md) for backend details
3. 🚀 Read [DEPLOYMENT.md](./DEPLOYMENT.md) for production deploy
4. 🎨 Customize colors in `src/index.css`
5. 📝 Review [PRD.md](./PRD.md) for design philosophy
6. 🔐 Add real Xumm integration
7. 💾 Set up database
8. 🌐 Configure custom domain

## 💡 Pro Tips

- **Start in simulation mode** - Get familiar with the UI first
- **Use Codespaces** - Zero setup, secrets built-in
- **Check Status page** - Always shows connection health
- **Read console logs** - Frontend & backend both log helpful info
- **Test locally first** - Before deploying to production

## 🎉 You're Ready!

The app should now be running. Visit:
- Frontend: http://localhost:5173
- Backend: http://localhost:4000
- Status: http://localhost:5173 (click Status in nav)

**Need help?** Check the detailed guides:
- Backend setup → `BACKEND_SETUP.md`
- Deployment → `DEPLOYMENT.md`
- Design philosophy → `PRD.md`

---

**Happy building! 🚀**
