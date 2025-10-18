# Unykorn — Sovereign Infrastructure for Global Finance

A sovereign-grade blockchain infrastructure platform featuring XRPL wallet integration, real-time status monitoring, and institutional-grade design.

## 🚀 Quick Start

**Want to get running in 5 minutes?** → [QUICKSTART.md](./QUICKSTART.md)

### Local Development
```bash
# Install and start frontend
npm install
npm run dev

# In another terminal, start backend
cd backend
npm install
npm start
```

Visit http://localhost:5173 to see the app.

## 📚 Documentation

| Guide | Purpose |
|-------|---------|
| **[QUICKSTART.md](./QUICKSTART.md)** | Get running in 5 minutes |
| **[CODESPACES_SECRETS_FIX.md](./CODESPACES_SECRETS_FIX.md)** | 🔧 Fix Codespaces secrets not found |
| **[BACKEND_SETUP.md](./BACKEND_SETUP.md)** | Complete backend integration guide |
| **[DEPLOYMENT.md](./DEPLOYMENT.md)** | Production deployment (Pages + Cloud) |
| **[PRD.md](./PRD.md)** | Product requirements & design philosophy |
| **[INTEGRATION.md](./INTEGRATION.md)** | Legacy integration notes |
| **[CHANGELOG.md](./CHANGELOG.md)** | Release notes and validation checklists |
| **[AUTH-SESSION-CSRF.md](./docs/AUTH-SESSION-CSRF.md)** | v0.1.1 Auth → Session → Cookie → CSRF |

## 🌟 Overview

This application presents the Unykorn ecosystem through a beautiful, institutional-grade interface featuring:

- **Constellation-based cosmic UI** with animated backgrounds
- **Multi-page navigation** (Home, Join, Wallet, Status, Partners, Admin)
- **Real XRPL/Xumm wallet integration** for decentralized onboarding
- **Backend API connectivity** with automatic fallback to simulation mode
- **Real-time status monitoring** with proof-of-reserve dashboards
- **Compliance showcase** (ISO-20022, Basel III, FATF)
- **Institutional partner presentation**

## 🏗️ Architecture

```
┌────────────────────┐         ┌────────────────────────┐
│  Spark Frontend    │◄───────►│  Backend API           │
│  (GitHub Pages)    │  HTTPS  │  (Render/Fly/Workers)  │
│  unykorn.org       │         │  api.unykorn.org       │
└────────────────────┘         └────────────────────────┘
```

**Frontend:** Static React app deployed to GitHub Pages  
**Backend:** Node.js/Express API with Xumm SDK integration

## ✨ Features

### 🏠 Home Page
- Immersive constellation grid background
- Sovereign messaging and brand positioning
- Value flow diagram (Vault → Oracle → XRPL → Compliance)
- Call-to-action pathways

### 🚀 Join Page
- **Real Xumm integration** when backend is connected
- QR code generation for wallet sign-in
- Automatic polling for signature confirmation
- Fallback simulation mode for demos
- Progressive onboarding flow with completion tracking

### 💼 Wallet Page
- Connected XRPL address display
- Vault status and compliance badges
- Tokenized asset registry
- Proof attestation links (IPFS, Chainlink)

### 📊 Status Page
- **Live API backend monitoring**
- **Xumm integration status**
- XRPL connectivity indicators
- Network metrics (uptime, TPS, active vaults)
- Recent verification log

### 🤝 Partners Page
- Institutional compliance framework showcase
- Partner logos and trust signals
- Enterprise onboarding pathways

### 🛠️ Admin Page
- Command hub interface
- Client/vault management tables
- Terminal-style command execution
- DNS/API configuration tools

## 🎨 Design Philosophy

**Obsidian foundation with precious metal accents** — creating a sovereign wealth aesthetic:

- **Deep obsidian black** backgrounds (institutional seriousness)
- **Brushed gold** interactive elements (real-world asset backing)
- **Electric violet** accents (futuristic technology)
- **Platinum silver** text (precision and sophistication)

**Typography:**
- Inter (headlines, UI) — geometric precision
- IBM Plex Mono (data, numbers) — cryptographic exactness

**Motion:**
- Constellation drift (ambient)
- Value flow diagrams (educational)
- Micro-interactions (functional feedback)

## 🔧 Tech Stack

### Frontend
- **React 19** + TypeScript
- **Vite** build system
- **Tailwind CSS** + shadcn/ui components
- **Framer Motion** animations
- **Phosphor Icons**
- **Spark KV** for persistent state

### Backend
- **Node.js** + Express
- **Xumm SDK** for XRPL wallet integration
- **CORS** configured for frontend
- **Environment-based** configuration

## 📁 Project Structure

```
spark-template/
├── src/                          # Frontend React app
│   ├── components/
│   │   ├── pages/               # Page components
│   │   │   ├── HomePage.tsx
│   │   │   ├── JoinPage.tsx     # Xumm integration
│   │   │   ├── WalletPage.tsx   # Wallet display
│   │   │   ├── StatusPage.tsx   # API monitoring
│   │   │   ├── PartnersPage.tsx
│   │   │   └── AdminPage.tsx
│   │   └── ui/                  # shadcn components
│   ├── hooks/
│   │   └── use-api-status.ts    # Backend health check
│   ├── lib/
│   │   ├── api.ts               # API client
│   │   └── config.ts            # Configuration
│   └── index.css                # Theme
├── backend/                      # Backend API server
│   ├── server.js                # Express server
│   ├── package.json
│   └── README.md
├── .github/workflows/
│   └── deploy.yml               # Auto-deploy to Pages
├── PRD.md                       # Design specifications
├── QUICKSTART.md                # Quick start guide
├── BACKEND_SETUP.md             # Backend guide
├── DEPLOYMENT.md                # Deployment guide
└── README.md                    # This file
```

## 🔐 Environment Variables

### Frontend (.env or GitHub Actions Variables)
```bash
VITE_API_BASE=https://api.unykorn.org  # Backend API URL
VITE_XUMM_CLIENT_ID=your-xumm-oauth2-client-id
VITE_BASE_URL=https://unykorn.org      # Origin used in PKCE redirect
VITE_BRAND=Unykorn                     # Brand name
VITE_NETWORK_LABEL=XRPL Mainnet        # Network label
VITE_ENABLE_SIMULATION=false           # Simulation mode
```

### Backend (Codespaces Secrets or Cloud Provider)
```bash
# The backend checks multiple environment variable names for flexibility:
# For API key: XUMM_API_KEY → XUMM_KEY → API_KEY
# For API secret: XUMM_API_SECRET → XUMM_SECRET → API_SECRET

XUMM_API_KEY=your-key                  # Xumm API key (recommended name)
XUMM_API_SECRET=your-secret            # Xumm API secret (recommended name)
CORS_ORIGINS=https://unykorn.org,https://www.unykorn.org  # Allowed origins (add any others)
XUMM_CLIENT_ID=your-xumm-oauth2-client-id  # Optional: enforce JWT audience
SESSION_SECRET=generate-a-strong-random     # For cookie session signing
PORT=4000                              # Server port
```

**Secrets not working in Codespaces?** → [CODESPACES_SECRETS_FIX.md](./CODESPACES_SECRETS_FIX.md)

## 🧪 Development

```bash
# Install dependencies
npm install

# Start dev server (frontend)
npm run dev

# Start backend (separate terminal)
cd backend
npm install
npm start

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🚀 Deployment

### Frontend (GitHub Pages)
1. Push to main branch
2. GitHub Actions automatically builds and deploys
3. Configure custom domain in repo settings

### Backend (Render/Fly/Workers)
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete instructions.

**Quick option - Render.com:**
1. Create Web Service
2. Connect repo
3. Root Directory: `backend`
4. Add environment variables
5. Deploy

## 📡 API Integration

The frontend is **ready for backend integration** with these features:

✅ API client with automatic fallback (`/src/lib/api.ts`)  
✅ Environment variable support  
✅ Real-time status monitoring  
✅ Simulation mode for offline development  
✅ CORS handling  
✅ Error handling with toast notifications

**Backend endpoints expected:**
- `GET /health` - Health check
- `GET /xumm/ping` - Xumm status
- `POST /onboard/start` - Generate QR code
- `GET /onboard/result/:uuid` - Poll for signature

See [BACKEND_SETUP.md](./BACKEND_SETUP.md) for complete API documentation.

## 🔗 Related Resources

- **Xumm Developer Portal:** https://apps.xumm.dev
- **XRPL Documentation:** https://xrpl.org
- **shadcn/ui Components:** https://ui.shadcn.com

## 🆘 Troubleshooting

**Codespaces secrets not working?**
- See [CODESPACES_SECRETS_FIX.md](./CODESPACES_SECRETS_FIX.md) for detailed fix
- Backend now checks multiple secret names: `XUMM_API_KEY`, `XUMM_KEY`, `API_KEY`
- Rebuild Codespace after adding secrets

**API shows "Offline"?**
- Check VITE_API_BASE is correct
- Verify backend is running
- Check Status page for details

**Build fails?**
- Delete node_modules and package-lock.json
- Run npm install
- Check GitHub Actions logs

**CORS errors?**
- Add frontend domain to backend CORS_ORIGINS
- Ensure HTTPS matches (http vs https)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for more troubleshooting.

## 📄 License

See [LICENSE](./LICENSE)

---

**🎯 Ready to get started?** Follow the [QUICKSTART.md](./QUICKSTART.md) guide!

**Built with sovereignty. Powered by XRPL. Designed for institutions.**
