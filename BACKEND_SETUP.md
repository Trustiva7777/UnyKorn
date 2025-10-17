# Backend Integration Guide for Unykorn

This document explains how to connect the Unykorn Spark frontend to your backend API running in Codespaces, Render, Fly.io, or Cloudflare Workers.

## 🎯 Architecture Overview

```
┌─────────────────────────────────────┐
│  Spark Frontend (GitHub Pages)     │
│  https://unykorn.org                │
│  - Static HTML/JS/CSS               │
│  - Client-side React app            │
│  - Makes HTTPS API calls            │
└──────────────┬──────────────────────┘
               │
               │ HTTPS
               ▼
┌─────────────────────────────────────┐
│  Backend API (Codespaces/Cloud)     │
│  https://api.unykorn.org            │
│  - Express/Node.js server           │
│  - Xumm integration                 │
│  - Database (PostgreSQL/SQLite)     │
│  - Cloudflare DNS automation        │
└─────────────────────────────────────┘
```

## 📋 Current State

Your Spark frontend is **ready for backend integration** with:

✅ API client configured (`/src/lib/api.ts`)  
✅ Environment variables support (`.env`)  
✅ Simulation mode for offline development  
✅ Real-time status monitoring  
✅ Xumm wallet integration flow  
✅ Onboarding with QR code polling  

## 🔧 Configuration

### Frontend Environment Variables

These go in your `.env` file (for local dev) or GitHub Actions Variables (for deployment):

```bash
# Backend API endpoint (your Codespace or production API)
VITE_API_BASE=https://api.unykorn.org

# Brand configuration
VITE_BRAND=Unykorn
VITE_NETWORK_LABEL=XRPL Mainnet

# Enable simulation mode when backend is offline
VITE_ENABLE_SIMULATION=true
```

### Backend Environment Variables (Codespaces Secrets)

These are **server-side only** and should never be exposed to the frontend:

```bash
# Xumm Integration
XUMM_API_KEY=your-xumm-api-key
XUMM_API_SECRET=your-xumm-api-secret

# Cloudflare DNS Automation
CF_API_TOKEN=your-cloudflare-api-token
CLOUDFLARE_ZONE_ID=your-zone-id

# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname

# Server Config
PORT=4000
DOMAIN=unykorn.org
NODE_ENV=production

# CORS (allow your Spark site)
CORS_ORIGINS=https://unykorn.org,https://www.unykorn.org
```

## 🛠️ Required Backend Endpoints

Your backend API needs to implement these endpoints that the frontend expects:

### 1. Health Check
```
GET /health
Response: { "status": "ok" }
```

### 2. Xumm Status
```
GET /xumm/ping
Response: {
  "app": "Unykorn",
  "network": "XRPL Mainnet",
  "status": "ok"
}
```

### 3. Onboarding Start
```
POST /onboard/start
Response: {
  "uuid": "550e8400-e29b-41d4-a716-446655440000",
  "qr": "https://xumm.app/sign/550e8400...",
  "deeplink": "xumm://xumm.app/sign/550e8400..."
}
```

### 4. Onboarding Result (Poll)
```
GET /onboard/result/:uuid
Response: {
  "signed": true,
  "account": "rN7n7otQDd6FczFgLdllMGMK6Z8eJaFYsL"
}
```

### 5. Wallet Details
```
GET /wallet/:address
Response: {
  "address": "rN7n7otQDd6FczFgLdllMGMK6Z8eJaFYsL",
  "balance": "1000.00 XRP",
  "created": "2024-01-15",
  "network": "XRPL Mainnet"
}
```

### 6. Admin Endpoints (Protected)
```
GET /admin/clients
Response: [
  {
    "id": "1",
    "address": "rN7n7otQDd6FczFgLdllMGMK6Z8eJaFYsL",
    "status": "Active",
    "created": "2024-01-15",
    "kyc": true
  }
]

GET /admin/vaults
Response: [
  {
    "id": "1",
    "address": "rN7n7otQDd6FczFgLdllMGMK6Z8eJaFYsL",
    "collateral": "$2.5M",
    "assets": 12,
    "verified": true
  }
]
```

## 🚀 Deployment Steps

### Option A: Codespaces (Development)

1. **Add Secrets to Codespaces**
   - Go to your repo → Settings → Secrets → Codespaces
   - Add: `XUMM_API_KEY`, `XUMM_API_SECRET`, `CF_API_TOKEN`, etc.

2. **Create Backend Server**
   ```bash
   cd /workspaces/your-repo
   mkdir backend
   cd backend
   npm init -y
   npm install express cors xumm-sdk
   ```

3. **Create API Server** (`backend/server.js`)
   ```javascript
   const express = require('express');
   const cors = require('cors');
   const { XummSdk } = require('xumm-sdk');
   
   const app = express();
   const xumm = new XummSdk(
     process.env.XUMM_API_KEY,
     process.env.XUMM_API_SECRET
   );
   
   app.use(cors({ origin: process.env.CORS_ORIGINS?.split(',') }));
   app.use(express.json());
   
   app.get('/health', (req, res) => {
     res.json({ status: 'ok' });
   });
   
   app.get('/xumm/ping', async (req, res) => {
     const ping = await xumm.ping();
     res.json({
       app: ping.application.name,
       network: 'XRPL Mainnet',
       status: 'ok'
     });
   });
   
   app.post('/onboard/start', async (req, res) => {
     const payload = await xumm.payload.create({
       txjson: {
         TransactionType: 'SignIn'
       }
     });
     res.json({
       uuid: payload.uuid,
       qr: payload.refs.qr_png,
       deeplink: payload.next.always
     });
   });
   
   app.get('/onboard/result/:uuid', async (req, res) => {
     const payload = await xumm.payload.get(req.params.uuid);
     res.json({
       signed: payload.meta.signed,
       account: payload.response?.account
     });
   });
   
   app.listen(process.env.PORT || 4000, () => {
     console.log('Unykorn API running on port', process.env.PORT || 4000);
   });
   ```

4. **Run Server**
   ```bash
   node server.js
   ```

5. **Update Frontend**
   ```bash
   # In .env file
   VITE_API_BASE=http://localhost:4000
   ```

### Option B: Production Deployment (Render/Fly/Workers)

#### Render.com
1. Create new Web Service
2. Connect your GitHub repo
3. Build Command: `cd backend && npm install`
4. Start Command: `node backend/server.js`
5. Add Environment Variables in Render dashboard
6. Custom Domain: `api.unykorn.org`

#### Fly.io
```bash
cd backend
fly launch
fly secrets set XUMM_API_KEY=xxx XUMM_API_SECRET=yyy
fly deploy
```

#### Cloudflare Workers
```bash
cd backend
npm create cloudflare@latest
# Deploy as Worker
```

## 🔗 Connecting Frontend to Backend

### For Local Development
```bash
# .env
VITE_API_BASE=http://localhost:4000
VITE_ENABLE_SIMULATION=false
```

### For Production (GitHub Pages)
1. Go to your repo → Settings → Secrets and variables → Actions
2. Click "Variables" tab
3. Add Repository Variables:
   - `VITE_API_BASE` = `https://api.unykorn.org`
   - `VITE_BRAND` = `Unykorn`
   - `VITE_NETWORK_LABEL` = `XRPL Mainnet`
   - `VITE_ENABLE_SIMULATION` = `false`

## ✅ Testing Integration

1. **Check Backend is Running**
   ```bash
   curl https://api.unykorn.org/health
   # Should return: {"status":"ok"}
   ```

2. **Check Xumm Connection**
   ```bash
   curl https://api.unykorn.org/xumm/ping
   # Should return app info
   ```

3. **Test from Frontend**
   - Open DevTools → Console
   - Navigate to Status page
   - Check if "API Backend" shows "Connected"
   - Check if "Xumm Integration" shows "Connected"

## 🔐 Security Checklist

- [ ] Never commit `.env` file to git
- [ ] Use HTTPS for all API calls (no HTTP in production)
- [ ] Set proper CORS origins (not `*`)
- [ ] Use environment variables for all secrets
- [ ] Enable rate limiting on API endpoints
- [ ] Implement authentication for admin endpoints
- [ ] Validate all user inputs
- [ ] Use prepared statements for database queries

## 📊 Monitoring

The frontend includes:
- Real-time API status monitoring (`/src/hooks/use-api-status.ts`)
- Automatic fallback to simulation mode
- Toast notifications for errors
- Status dashboard showing connection health

## 🐛 Troubleshooting

### Frontend shows "Offline"
- Check VITE_API_BASE is correct
- Verify backend server is running
- Check CORS is configured properly
- Look at Network tab in DevTools

### Xumm QR not generating
- Verify XUMM_API_KEY and XUMM_API_SECRET are set
- Check Xumm SDK is installed (`npm list xumm-sdk`)
- Test `/xumm/ping` endpoint directly

### CORS errors
- Add your Spark domain to CORS_ORIGINS
- Ensure backend allows your frontend origin
- Check preflight OPTIONS requests are handled

## 📚 Additional Resources

- [Xumm SDK Documentation](https://xumm.readme.io/)
- [XRPL Documentation](https://xrpl.org/)
- [Express.js Guide](https://expressjs.com/)
- [Render Deployment Guide](https://render.com/docs)
- [Fly.io Documentation](https://fly.io/docs/)

## 🎉 Next Steps

Once backend is connected:

1. ✅ Test onboarding flow end-to-end
2. ✅ Verify wallet creation and storage
3. ✅ Test admin dashboard with real data
4. ✅ Set up database for persistent storage
5. ✅ Implement Cloudflare DNS automation
6. ✅ Add proper authentication/authorization
7. ✅ Enable analytics and monitoring
8. ✅ Set up automated backups

---

**Need Help?** Check the Status page in the app to see real-time connection status.
