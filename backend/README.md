# Unykorn Backend API Server

Express.js backend server that powers the Unykorn frontend with Xumm wallet integration, XRPL connectivity, and admin management.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your credentials
```

### 3. (Optional) Add Xumm SDK for Real Integration

If you want real Xumm integration (not simulation):

```bash
npm install xumm-sdk
```

Then add your Xumm credentials to `.env`:
```
XUMM_API_KEY=your-actual-key
XUMM_API_SECRET=your-actual-secret
```

### 4. Run Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

Server will start on `http://localhost:4000`

## 🔌 API Endpoints

### Health Check
```http
GET /health
```
Returns server status and uptime.

### Xumm Status
```http
GET /xumm/ping
```
Checks Xumm SDK connection (or returns simulated response).

### Start Onboarding
```http
POST /onboard/start
```
Creates a Xumm payload for wallet connection. Returns QR code and deeplink.

### Get Onboarding Result
```http
GET /onboard/result/:uuid
```
Polls for signed payload result. Returns signed status and wallet address.

### Get Wallet Details
```http
GET /wallet/:address
```
Returns wallet information for a given XRPL address.

### List Clients (Admin)
```http
GET /admin/clients
```
Returns list of onboarded clients with KYC status.

### List Vaults (Admin)
```http
GET /admin/vaults
```
Returns list of vaults with collateral and verification status.

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (default: 4000) | No |
| `NODE_ENV` | Environment (development/production) | No |
| `XUMM_API_KEY` | Xumm API key for real integration | No* |
| `XUMM_API_SECRET` | Xumm API secret | No* |
| `CORS_ORIGINS` | Comma-separated allowed origins | Yes |
| `VITE_BRAND` | Brand name | No |
| `VITE_NETWORK_LABEL` | Network label | No |

*If Xumm credentials not provided, server runs in simulation mode

## 🧪 Testing

### Test Health Endpoint
```bash
curl http://localhost:4000/health
```

### Test Xumm Ping
```bash
curl http://localhost:4000/xumm/ping
```

### Test Onboarding Flow
```bash
# Start onboarding
curl -X POST http://localhost:4000/onboard/start

# Check result (replace UUID)
curl http://localhost:4000/onboard/result/YOUR-UUID-HERE
```

## 🌐 Deployment

### Codespaces
Already configured! Just:
1. Add secrets in repo Settings → Secrets → Codespaces
2. Open Codespace
3. Run `cd backend && npm install && npm start`

### Render.com
1. Create new Web Service
2. Build Command: `cd backend && npm install`
3. Start Command: `cd backend && npm start`
4. Add environment variables in dashboard

### Fly.io
```bash
cd backend
fly launch
fly secrets set XUMM_API_KEY=xxx XUMM_API_SECRET=yyy
fly deploy
```

### Cloudflare Workers
Convert to Workers format or use Node.js compatibility mode.

## 📝 Notes

- **Simulation Mode**: If Xumm credentials not provided, server automatically simulates responses
- **Auto-signing**: In simulation mode, payloads auto-sign after 15 seconds
- **Cleanup**: Expired payloads (>5 min) are automatically cleaned every minute
- **CORS**: Configure CORS_ORIGINS to include your frontend domain

## 🔗 Connect to Frontend

Once running, update frontend `.env`:
```bash
VITE_API_BASE=http://localhost:4000  # or your production URL
VITE_ENABLE_SIMULATION=false
```

## 🆘 Troubleshooting

**Port already in use:**
```bash
# Change PORT in .env or kill existing process
lsof -ti:4000 | xargs kill
```

**CORS errors:**
Add your frontend URL to CORS_ORIGINS in .env

**Xumm not working:**
- Verify API key/secret are correct
- Check npm install xumm-sdk completed
- Test /xumm/ping endpoint

## 📚 Next Steps

- [ ] Add database integration (PostgreSQL/SQLite)
- [ ] Implement authentication/authorization
- [ ] Add Cloudflare DNS automation
- [ ] Set up rate limiting
- [ ] Add request logging
- [ ] Implement proper error handling
- [ ] Add tests
