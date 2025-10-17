# Unykorn — Sovereign Infrastructure for Global Finance

A sovereign-grade blockchain infrastructure interface showcasing digital and real-world asset convergence under one compliant protocol.

## 🌟 Overview

This application presents the Unykorn ecosystem through a beautiful, institutional-grade interface featuring:

- **Constellation-based cosmic UI** with animated backgrounds
- **Multi-page navigation** (Home, Join, Wallet, Status, Partners, Admin)
- **XRPL/Xumm wallet integration** for decentralized onboarding
- **Real-time status monitoring** with proof-of-reserve dashboards
- **Compliance showcase** (ISO-20022, Basel III, FATF)
- **Institutional partner presentation**

## 🔌 Backend Integration

**This Spark app is the frontend.** It connects to your separate UnyKorn backend API for real XRPL/Xumm functionality.

### Quick Setup

1. **Configure API endpoint:**
   ```bash
   # .env
   VITE_API_BASE=http://localhost:4000
   ```

2. **Start your backend** (from UnyKorn repo):
   ```bash
   npm run dev:api
   ```

3. **Start this frontend**:
   ```bash
   npm run dev
   ```

4. **Visit the app:**
   - Status: http://localhost:5173/status (shows API connection)
   - Join: http://localhost:5173/join (generates Xumm QR)
   - Wallet: http://localhost:5173/wallet (shows connected wallet)

### Deployment

**Frontend (this app):** Deploy to GitHub Pages, Vercel, Netlify  
**Backend (UnyKorn repo):** Deploy to Render, Fly.io, Railway

Set `VITE_API_BASE` to your production API URL (e.g., `https://api.unykorn.org`)

📖 **Full integration guide:** See [INTEGRATION.md](./INTEGRATION.md)

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
- Tokenized asset registry (placeholder)
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

## 🏗️ Architecture

### Tech Stack
- **React 19** + TypeScript
- **Vite** build system
- **Tailwind CSS** + shadcn/ui components
- **Framer Motion** animations
- **Phosphor Icons**
- **Spark KV** for persistent state

### Project Structure
```
src/
├── App.tsx                    # Main router
├── components/
│   ├── ConstellationBackground.tsx
│   ├── Navigation.tsx
│   ├── ValueFlowDiagram.tsx
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── JoinPage.tsx      # Xumm integration
│   │   ├── WalletPage.tsx    # Connected wallet display
│   │   ├── StatusPage.tsx    # API monitoring
│   │   ├── PartnersPage.tsx
│   │   └── AdminPage.tsx
│   └── ui/                    # shadcn components
├── hooks/
│   ├── use-mobile.ts
│   └── use-api-status.ts      # Backend health monitoring
├── lib/
│   ├── utils.ts
│   └── api.ts                 # Backend API client
└── index.css                  # Theme configuration
```

## 🔐 Data Persistence

Uses **Spark KV** (key-value storage) for wallet data:

```typescript
import { useKV } from '@github/spark/hooks'

const [walletAddress, setWalletAddress] = useKV<string | null>('wallet-address', null)
```

Data persists between sessions — no localStorage or external databases needed.

## 🚀 Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 📡 API Endpoints

The frontend calls these backend endpoints (when configured):

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/health` | GET | Health check |
| `/xumm/ping` | GET | Verify Xumm connection |
| `/onboard/start` | POST | Generate Xumm QR code |
| `/onboard/result/:uuid` | GET | Poll for signature |

## 🎯 Environment Variables

```bash
# Required for backend integration
VITE_API_BASE=https://api.unykorn.org

# Optional for GitHub Pages
PAGES_CNAME=unykorn.org
```

## 📚 Documentation

- [PRD.md](./PRD.md) — Product requirements and design specifications
- [INTEGRATION.md](./INTEGRATION.md) — Backend integration guide
- UnyKorn Backend Repo — [GO-LIVE.md](https://github.com/Trustiva7777/UnyKorn/blob/main/GO-LIVE.md)

## 🔗 Related Repositories

- **Frontend (this repo):** Spark-based React UI
- **Backend:** [UnyKorn](https://github.com/Trustiva7777/UnyKorn) — Node.js API with XRPL/Xumm

## 🌐 Domains

- **Production:** unykorn.org (frontend) + api.unykorn.org (backend)
- **Alt Domain:** trustiva.io

## 📄 License

See [LICENSE](./LICENSE)

---

**Built with sovereignty. Powered by XRPL. Designed for institutions.**
