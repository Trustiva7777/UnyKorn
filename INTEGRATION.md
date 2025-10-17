# Unykorn Integration Guide

This Spark app is now configured to connect to your UnyKorn backend API for real XRPL/Xumm functionality.

## 🔌 API Integration

### Configuration

The app connects to your backend via environment variables:

```bash
# .env (or production environment)
VITE_API_BASE=https://api.unykorn.org
```

For local development with your backend running on port 4000:
```bash
VITE_API_BASE=http://localhost:4000
```

### API Endpoints Used

The frontend now calls these backend endpoints:

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/xumm/ping` | GET | Verify Xumm connection |
| `/onboard/start` | POST | Generate Xumm QR code |
| `/onboard/result/:uuid` | GET | Poll for wallet signature |

### How It Works

**Status Page (`/status`)**
- Real-time API health monitoring
- Displays backend connection status
- Shows Xumm integration status
- Falls back gracefully when offline

**Join Page (`/join`)**
- Attempts to connect to backend first
- If backend is online:
  - Generates real Xumm QR code
  - Polls for wallet signature
  - Stores wallet address in Spark KV on success
- If backend is offline:
  - Falls back to simulation mode
  - Still demonstrates the UX flow

**Wallet Page (`/wallet`)**
- Reads wallet data from Spark KV storage
- Displays connected XRPL address
- Shows vault compliance status

## 🚀 Deployment Options

### Option 1: Separate Deployment (Recommended)

Deploy the Spark frontend and your Node.js backend separately:

**Frontend (This Spark App):**
- Deploys to GitHub Pages, Vercel, Netlify, etc.
- Set `VITE_API_BASE` to your production API URL

**Backend (Your UnyKorn Repo):**
- Deploy to Render, Fly.io, Railway, etc.
- Configure CORS to allow your frontend domain

**Example CORS setup in your backend:**
```typescript
// In your Express/Node backend
app.use(cors({
  origin: [
    'https://unykorn.org',
    'https://www.unykorn.org',
    'http://localhost:5173', // Spark dev
  ],
  credentials: true
}))
```

### Option 2: Local Development

Run both simultaneously:

**Terminal 1 - Backend:**
```bash
cd /path/to/UnyKorn
npm run dev:api
# API running on http://localhost:4000
```

**Terminal 2 - Frontend (this Spark app):**
```bash
# In this directory
VITE_API_BASE=http://localhost:4000 npm run dev
# Frontend running on http://localhost:5173
```

## 🔐 Environment Variables

### Frontend (.env in this Spark app)
```bash
# Required: Your backend API URL
VITE_API_BASE=https://api.unykorn.org

# Optional: For GitHub Pages deployment
PAGES_CNAME=unykorn.org
```

### Backend (Your UnyKorn repo)
```bash
# From your GO-LIVE.md checklist:
XUMM_API_KEY=your-key
XUMM_API_SECRET=your-secret
CF_API_TOKEN=your-cloudflare-token
DATABASE_URL=your-postgres-url
CORS_ORIGINS=https://unykorn.org,https://www.unykorn.org
```

## 📡 Testing the Integration

1. **Start your backend** (UnyKorn repo):
   ```bash
   npm run dev:api
   ```

2. **Verify backend is running**:
   ```bash
   curl http://localhost:4000/health
   # Should return: {"status":"ok"}
   
   curl http://localhost:4000/xumm/ping
   # Should return Xumm app details
   ```

3. **Start this Spark frontend**:
   ```bash
   VITE_API_BASE=http://localhost:4000 npm run dev
   ```

4. **Test the flow**:
   - Visit http://localhost:5173/status
   - Should show "API Backend: Connected ✓"
   - Should show "Xumm Integration: Connected ✓"
   - Visit http://localhost:5173/join
   - Click "Connect with Xumm"
   - Should generate real QR code
   - Scan with Xumm app
   - Sign the transaction
   - Should redirect to wallet page with your address

## 🎯 Production Deployment

### Deploy Backend First

1. Deploy your UnyKorn backend to Render/Fly.io
2. Get your production API URL (e.g., `https://api.unykorn.org`)
3. Configure DNS: `api.unykorn.org` → your hosting provider
4. Set all backend environment variables in Render/Fly

### Deploy Frontend Second

1. In this Spark app, update `.env`:
   ```bash
   VITE_API_BASE=https://api.unykorn.org
   ```

2. Deploy via GitHub Pages, Vercel, or Netlify:
   ```bash
   npm run build
   # Deploy the dist/ folder
   ```

3. Configure DNS: `unykorn.org` → your frontend host

### Verify Integration

```bash
# Check frontend
curl https://unykorn.org

# Check backend
curl https://api.unykorn.org/health

# Check Xumm
curl https://api.unykorn.org/xumm/ping
```

## 🛠️ Troubleshooting

**"API Backend: Offline"**
- Backend not running or wrong `VITE_API_BASE`
- Check: `curl $VITE_API_BASE/health`

**"Xumm Integration: Offline"**
- Backend running but Xumm not configured
- Check backend env: `XUMM_API_KEY` and `XUMM_API_SECRET`
- Check: `curl $VITE_API_BASE/xumm/ping`

**CORS Errors**
- Backend needs to allow frontend domain in CORS
- Set `CORS_ORIGINS` in backend env

**QR Code Not Generating**
- Backend `/onboard/start` endpoint not working
- Check backend logs
- Falls back to simulation mode automatically

## 🔄 Fallback Behavior

The frontend is resilient and works in multiple modes:

1. **Full Integration Mode**: Backend online, Xumm configured → Real QR codes
2. **Simulation Mode**: Backend offline → Demo flow with simulated data
3. **Hybrid Mode**: Backend online but Xumm not configured → Status shows warning

This ensures the site always functions for demonstration purposes even without the full backend stack.

## 📚 Next Steps

Once integration is working:

1. ✅ Test end-to-end flow (Join → Wallet)
2. ✅ Verify Status page shows all green
3. ✅ Deploy backend to production
4. ✅ Deploy frontend with production API URL
5. ✅ Configure DNS for both domains
6. ✅ Test production integration
7. 🚀 Go live!

See your UnyKorn repo's `GO-LIVE.md` for the complete deployment checklist.
