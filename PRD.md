# Planning Guide

Unykorn Global Finance is a sovereign-grade blockchain infrastructure interface that establishes digital and real-world asset convergence under one compliant protocol, projecting institutional credibility and futuristic confidence.

**Experience Qualities**:
1. **Sovereign Authority** - Every element should feel cryptographically deliberate, audited, and verified, projecting calm institutional power rather than typical crypto startup energy.
2. **Precision Minimalism** - Ultra-clean interface where every pixel serves a purpose, echoing the exactness of financial infrastructure and compliance-grade systems.
3. **Futuristic Sophistication** - Subtle cosmic elements and fluid micro-interactions that feel like accessing a living financial mainframe, balancing BlackRock's institutional minimalism with Blade Runner's technological elegance.

**Complexity Level**: Light Application (multiple features with basic state)
- Multi-page navigation with distinct sections (Home, Join, Wallet, Status, Partners, Admin)
- Wallet integration simulation and status dashboards
- Interactive proof verification and compliance displays
- The scope focuses on establishing credibility through design rather than complex backend logic

## Essential Features

### Hero Landing Experience
- **Functionality**: Immersive introduction establishing Unykorn as a global trust computer with animated constellation grid background and sovereign messaging
- **Purpose**: Immediately communicate institutional-grade credibility and technological sophistication to investors and high-net-worth clients
- **Trigger**: User arrives at homepage
- **Progression**: View animated constellation grid → Read sovereign messaging ("The Future of Sovereign Finance") → Observe value flow diagram (Vault → Oracle → XRPL → Compliance → Yield → Proof) → Choose action via CTA
- **Success criteria**: User perceives Unykorn as infrastructure-level (not startup-level), understands core value proposition within 5 seconds

### Multi-Page Navigation System
- **Functionality**: Clean tab-based navigation between Home, Join, Wallet, Status, Partners, and Admin sections
- **Purpose**: Organize different stakeholder experiences (investors, institutions, administrators) while maintaining sovereign design language
- **Trigger**: User clicks navigation items
- **Progression**: Click nav item → Smooth page transition with subtle animation → New content loads with contextual layout → Navigation state updates
- **Success criteria**: Zero friction navigation, each page feels like part of unified sovereign system

### XRPL Wallet Connection Simulation
- **Functionality**: Join page with Xumm QR code simulation and wallet dashboard preview showing vault status and compliance badges
- **Purpose**: Demonstrate decentralized onboarding flow and vault-based identity system
- **Trigger**: User navigates to Join page and initiates connection
- **Progression**: View QR widget → Simulate wallet connection → Dashboard reveals with progress animation → Display vault address, status, tokenized assets
- **Success criteria**: Flow feels secure, professional, and sovereign-grade (not typical Web3 chaos)

### Real-Time Status Dashboard
- **Functionality**: Interactive proof-of-reserve dashboard showing chain status, XRPL connectivity, vault registry sync, and Chainlink attestations
- **Purpose**: Transparency and verification - demonstrating "auditable by design" philosophy to regulators and institutions
- **Trigger**: User navigates to Status page
- **Progression**: Load dashboard → Display live status indicators (animated) → Show proof verification badges → Reveal IPFS attestation access
- **Success criteria**: Conveys operational excellence, compliance-ready infrastructure, cryptographic verifiability

### Institutional Partner Showcase
- **Functionality**: Credibility page displaying partner logos, compliance frameworks (ISO-20022, Basel III, FATF, SEC), and institutional onboarding CTA
- **Purpose**: Establish trust with enterprise clients and sovereign wealth funds through regulatory alignment and partnership signals
- **Trigger**: User navigates to Partners page
- **Progression**: View compliance badges → Read institutional benefits → See partner showcase → Access institutional contact form
- **Success criteria**: Page communicates "we don't follow compliance — we define it"

### Admin Command Hub
- **Functionality**: Gated administrative interface with tabs for Clients, Vaults, DNS/API management, and AI logs with terminal-style command execution
- **Purpose**: Private cockpit for system operators to manage onboarded accounts, verify proofs, and execute infrastructure commands
- **Trigger**: Admin user accesses admin section (simulated auth state)
- **Progression**: Toggle admin mode → Navigate command hub tabs → View client/vault data tables → Execute terminal commands with syntax-highlighted output
- **Success criteria**: Feels like sovereign mainframe control panel, professional and powerful

## Edge Case Handling

- **Empty Wallet State** - Dashboard shows elegant zero-state with clear onboarding prompts rather than errors
- **Connection Failures** - Status indicators gracefully show offline states with last-known-good timestamps
- **Mobile Viewport** - Responsive collapse of complex dashboards into stacked card views without losing data hierarchy
- **Slow Network** - Skeleton loaders with gold shimmer maintain sovereign aesthetic during data fetch
- **Unauthorized Admin Access** - Clean authentication gate with wallet signature prompt, no harsh error messages

## Design Direction

The design should feel like logging into a sovereign financial mainframe — projecting wealth, precision, intelligence, and inevitability. The interface balances ultra-clean institutional minimalism (BlackRock) with subtle futuristic elements (Blade Runner), creating calm authority that whispers "programmable trust, real-world wealth" rather than marketing fluff. Minimal interface with purposeful micro-interactions that reward attention.

## Color Selection

**Custom Palette** - Obsidian foundation with precious metal accents creating a sovereign wealth aesthetic that transcends typical crypto branding and positions Unykorn as infrastructure-level credibility.

- **Primary Color**: Deep obsidian black (oklch(0.12 0.01 270)) - Communicates institutional seriousness, wealth, and the void of space from which sovereignty emerges
- **Secondary Colors**: 
  - Brushed gold (oklch(0.78 0.12 85)) for interactive elements and value flows - represents real-world asset backing and financial prestige
  - Soft platinum silver (oklch(0.85 0.01 270)) for supporting UI elements - provides precision and technical sophistication
- **Accent Color**: Electric violet (oklch(0.65 0.22 290)) for active states, CTAs, and proof verification - represents futuristic technology and cosmic sovereignty, creates visual interest against obsidian
- **Foreground/Background Pairings**:
  - Background (Deep Obsidian oklch(0.12 0.01 270)): Platinum silver text (oklch(0.85 0.01 270)) - Ratio 6.2:1 ✓
  - Card (Elevated Black oklch(0.18 0.01 270)): Silver text (oklch(0.85 0.01 270)) - Ratio 5.1:1 ✓
  - Primary (Brushed Gold oklch(0.78 0.12 85)): Deep obsidian text (oklch(0.12 0.01 270)) - Ratio 6.8:1 ✓
  - Secondary (Charcoal oklch(0.25 0.01 270)): Platinum text (oklch(0.85 0.01 270)) - Ratio 4.6:1 ✓
  - Accent (Electric Violet oklch(0.65 0.22 290)): White text (oklch(0.98 0 0)) - Ratio 5.4:1 ✓
  - Muted (Deep Gray oklch(0.30 0.01 270)): Silver text (oklch(0.85 0.01 270)) - Ratio 4.2:1 ✓

## Font Selection

Typography should convey geometric precision for headlines (architectural sovereignty) combined with sophisticated readability for body content (institutional trust). **Inter** for headlines provides clean geometric forms with excellent screen optimization, while **IBM Plex Mono** for data/numbers adds cryptographic precision.

- **Typographic Hierarchy**:
  - H1 (Hero Headlines): Inter Bold / 56px / -0.02em letter spacing / 1.1 line height
  - H2 (Section Headers): Inter SemiBold / 36px / -0.01em / 1.2 line height
  - H3 (Card Titles): Inter Medium / 24px / 0em / 1.3 line height
  - Body (Primary): Inter Regular / 16px / 0em / 1.6 line height
  - Body (Secondary/Muted): Inter Regular / 14px / 0em / 1.5 line height
  - Data/Numbers (Wallet, Status): IBM Plex Mono Medium / 14px / 0.01em / 1.4 line height
  - CTA Buttons: Inter SemiBold / 15px / 0.01em / uppercase
  - Navigation: Inter Medium / 14px / 0.02em / uppercase

## Animations

Animations should feel cryptographically deliberate - fluid but restrained, serving functional purposes rather than calling attention to themselves. Motion conveys the sense of a living financial system with slow parallax glows, constellation movements, and value flow diagrams that educate while delighting.

- **Purposeful Meaning**: Constellation grid slow drift establishes cosmic scale, value flow arrows demonstrate system architecture, status indicators pulse to show live verification, gold glow travels across onboarding steps to show progress
- **Hierarchy of Movement**: 
  1. Hero constellation background (slowest, ambient) - establishes space
  2. Value flow diagram (medium pace) - educational focus
  3. Status indicators and micro-interactions (quick, responsive) - functional feedback
  4. Page transitions (smooth, 300-400ms) - maintains spatial continuity

## Component Selection

- **Components**: 
  - **Card** - Foundation for Wallet vault display, Status dashboard panels, Partner showcase items (add dark elevated backgrounds with subtle borders)
  - **Button** - Primary CTAs ("Enter Ecosystem", "For Institutions"), secondary actions (modify with gold primary, violet accent variants)
  - **Tabs** - Navigation system and Admin hub sections (customize with minimal borders, active gold underline)
  - **Badge** - Compliance indicators, status tags, vault states (create gold and violet variants)
  - **Separator** - Section dividers maintaining visual hierarchy
  - **Dialog** - Institutional contact forms, proof attestation viewers
  - **Progress** - Onboarding completion indicator with gold glow
  - **Table** - Admin client/vault data display with monospaced numbers
  - **Scroll Area** - Command terminal output, proof logs
  
- **Customizations**: 
  - Constellation grid background component using Canvas or SVG with animated stars/connections
  - Value flow diagram showing Vault → Oracle → XRPL → Compliance chain with animated arrows
  - Terminal component with syntax highlighting for admin commands
  - QR code widget simulation for Xumm wallet connection
  - Status indicator component with pulsing animations and verification badges
  
- **States**: 
  - Buttons: default obsidian/gold, hover with glow effect, active with slight scale, disabled with reduced opacity
  - Cards: default elevated, hover with subtle gold border glow and slight lift
  - Status badges: animated pulse for active/live states, static for verified, muted for offline
  - Navigation tabs: inactive silver, active gold with underline, hover violet hint
  
- **Icon Selection**: 
  - @phosphor-icons/react for consistent geometric style
  - Vault/safe icon for wallet/vaults, shield for compliance, lightning for XRPL, chart for status, users for partners, terminal for admin
  
- **Spacing**: 
  - Section padding: py-24 for hero, py-16 for standard sections
  - Card padding: p-8 for main cards, p-6 for nested
  - Grid gaps: gap-8 for card grids, gap-4 for lists
  - Button padding: px-8 py-3 for primary CTAs, px-6 py-2 for secondary
  
- **Mobile**: 
  - Hero text scales down to 36px, constellation grid simplified
  - Navigation becomes hamburger menu or bottom tab bar
  - Card grids stack from 3-column to single column
  - Admin tables become card-based views with expandable rows
  - Terminal uses horizontal scroll for long commands
  - Value flow diagram rotates to vertical on mobile
