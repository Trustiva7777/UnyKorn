require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { BRAND_NAME } = require('@unykorn/shared');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const invitationsRouter = require('./routes/invitations');
const xrplRouter = require('./routes/xrpl');
const opsRouter = require('./routes/ops');
const issuerRouter = require('./routes/issuer');
const tokensRouter = require('./routes/tokens');
const trustlinesRouter = require('./routes/trustlines');
const holdersRouter = require('./routes/holders');
const dexRouter = require('./routes/dex');
const onboardRouter = require('./routes/onboard');
const { ensureXumm } = require('./xumm');
const xrplHelper = require('../xrpl');
const { encodeCurrencyCode } = require('../xrpl');
let rateLimit;
try { rateLimit = require('express-rate-limit'); } catch {}

const app = express();
const corsOrigins = (process.env.CORS_ORIGINS || '').split(',').map(s => s.trim()).filter(Boolean);
if (corsOrigins.length) {
  app.use(cors({ origin: corsOrigins, credentials: true }));
} else {
  app.use(cors());
}
app.use(express.json());

const prisma = new PrismaClient();
const PORT = process.env.PORT || 4000;

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'api', brand: BRAND_NAME });
});

app.get('/', (req, res) => {
  res.send(`${BRAND_NAME} API is running`);
});

// Public org config (generic)
app.get('/public/config', (_req, res) => {
  const xummConfigured = Boolean(process.env.XUMM_API_KEY && process.env.XUMM_API_SECRET);
  res.json({
    brand: process.env.BRAND || 'XRPL Demo',
    orgs: ['Unykorn 7777'],
    contact: {
      email: process.env.ORG_CONTACT_EMAIL || process.env.PUBLIC_CONTACT_EMAIL || 'admin@example.com',
      address: process.env.ORG_ADDRESS || process.env.PUBLIC_CONTACT_ADDRESS || '123 Main St, Anytown, USA'
    },
    networkLabel: process.env.NETWORK_LABEL || process.env.XRPL_NETWORK || 'devnet',
    xummConfigured,
    orgContactEmail: process.env.ORG_CONTACT_EMAIL || process.env.PUBLIC_CONTACT_EMAIL || 'admin@example.com',
    orgAddress: process.env.ORG_ADDRESS || process.env.PUBLIC_CONTACT_ADDRESS || '123 Main St, Anytown, USA'
  });
});

// Combined status for the web app
app.get('/status', async (_req, res) => {
  const xummConfigured = Boolean(process.env.XUMM_API_KEY && process.env.XUMM_API_SECRET);
  const network = String(process.env.XRPL_NETWORK || 'devnet').toLowerCase();
  const brand = process.env.BRAND || BRAND_NAME;
  const contact = {
    email: process.env.ORG_CONTACT_EMAIL || process.env.PUBLIC_CONTACT_EMAIL || 'admin@example.com',
    address: process.env.ORG_ADDRESS || process.env.PUBLIC_CONTACT_ADDRESS || '123 Main St, Anytown, USA',
  };
  let issuer = null;
  let tokens = [];
  let xrplHealthy = false;
  let xumm = null;
  try { issuer = await prisma.issuer.findFirst({ orderBy: { createdAt: 'desc' } }); } catch {}
  try { tokens = await prisma.token.findMany({ orderBy: { createdAt: 'asc' } }); } catch {}
  try {
    await xrplHelper.withClient(async () => {});
    xrplHealthy = true;
  } catch { xrplHealthy = false; }
  if (xummConfigured) {
    try { xumm = await ensureXumm().ping(); } catch (e) { xumm = { error: e?.message || 'xumm ping failed' }; }
  }
  res.json({
    health: { status: 'ok', service: 'api', brand },
    config: { brand, contact, networkLabel: process.env.NETWORK_LABEL || network, xummConfigured },
    xrpl: { network, healthy: xrplHealthy },
    issuer, tokens, xumm
  });
});

app.use('/invitations', invitationsRouter);
app.use('/', xrplRouter);
app.use('/', opsRouter);
app.use('/', issuerRouter);
app.use('/', tokensRouter);
app.use('/', trustlinesRouter);
app.use('/', holdersRouter);
app.use('/', dexRouter);
// Rate-limit sensitive routes if library is available
if (rateLimit) {
  const onboardLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 60, standardHeaders: true, legacyHeaders: false });
  app.use('/onboard', onboardLimiter);
  const faucetLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 30 });
  app.use('/wallets/xrpl/faucet', faucetLimiter);
}
app.use('/', onboardRouter);

// Simple Xumm ping/info
app.get('/xumm/ping', async (_req, res) => {
  try {
    const xumm = ensureXumm();
    const pong = await xumm.ping();
    res.json({ pong });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Xumm not configured' });
  }
});

// CSV: /reports/holders.csv?issuer=<cold>&currency=<code>
app.get('/reports/holders.csv', async (req, res) => {
  try {
    const { issuer, currency, includeZero } = req.query;
    if (!issuer) return res.status(400).send('issuer is required');
    const xrpl = require('../xrpl');
    const out = await xrpl.withClient(async (client) => {
      const lines = await client.request({ command: 'account_lines', account: issuer }).catch(() => ({ result: { lines: [] } }));
      return lines?.result?.lines || [];
    });
    const enc = currency ? encodeCurrencyCode(currency) : null;
    let lines = out;
    if (enc) lines = lines.filter(l => l.currency.toUpperCase() === enc.toUpperCase() || l.currency === currency);
    if (String(includeZero).toLowerCase() !== 'true') lines = lines.filter(l => Number(l.balance) !== 0);
    const rows = ['holder,currency,balance,limit'];
    for (const l of lines) rows.push([l.account, l.currency, l.balance, l.limit].map(v => String(v)).join(','));
    res.setHeader('Content-Type', 'text/csv');
    res.send(rows.join('\n'));
  } catch (e) {
    res.status(400).send(`error,${e.message || 'failed'}`);
  }
});

// Serve xrp-ledger.toml for issuer attestation (basic)
app.get('/.well-known/xrp-ledger.toml', async (_req, res) => {
  try {
    const issuer = await prisma.issuer.findFirst({ orderBy: { createdAt: 'desc' } });
    res.setHeader('Content-Type', 'text/plain');
    if (!issuer) return res.send(`# XRPL TOML\nNETWORK="${String(process.env.XRPL_NETWORK||'devnet')}"\n`);
    res.send(`# XRPL TOML\nNETWORK="${String(process.env.XRPL_NETWORK||'devnet')}"\n[ACCOUNTS]\naddress="${issuer.coldAddress}"\n[ACCOUNTS]\naddress="${issuer.hotAddress}"\n`);
  } catch {
    res.setHeader('Content-Type', 'text/plain');
    res.send('NETWORK="devnet"');
  }
});

// CSV: /reports/tx.csv?from=ISO&to=ISO&tokenId=...&type=...&account=...
app.get('/reports/tx.csv', async (req, res) => {
  try {
    const qs = z.object({ from: z.string().optional(), to: z.string().optional(), tokenId: z.string().optional(), type: z.string().optional(), account: z.string().optional() }).parse(req.query || {});
    const where = {};
    if (qs.tokenId) where.tokenId = qs.tokenId;
    if (qs.type) where.type = qs.type;
    if (qs.account) where.account = qs.account;
    if (qs.from || qs.to) {
      where.createdAt = {};
      if (qs.from) where.createdAt.gte = new Date(qs.from);
      if (qs.to) where.createdAt.lte = new Date(qs.to);
    }
    const items = await prisma.event.findMany({ where, orderBy: { createdAt: 'desc' }, take: 5000 });
    const header = ['timestamp','type','route','account','destination','tokenId','issuerCold','currency','value','hash','engineResult','memos'];
    const rows = [header.join(',')];
    for (const e of items) {
      const cells = [
        e.createdAt.toISOString(), e.type||'', e.route||'', e.account||'', e.destination||'', e.tokenId||'', e.issuerCold||'', e.currency||'', e.value||'', e.hash||'', e.engineResult||'', e.memos ? JSON.stringify(e.memos).replaceAll('"','""') : ''
      ];
      rows.push(cells.map(v => {
        const s = String(v ?? '');
        return /[",\n]/.test(s) ? '"' + s.replace(/"/g,'""') + '"' : s;
      }).join(','));
    }
    res.setHeader('Content-Type', 'text/csv');
    res.send(rows.join('\n'));
  } catch (e) {
    res.status(400).send(`error,${e.message || 'failed'}`);
  }
});

// Recent events: /events?limit=100&type=issue&account=...
app.get('/events', async (req, res) => {
  try {
    const { limit, type, account } = req.query || {};
    const where = {};
    if (type) where.type = String(type);
    if (account) where.account = String(account);
    const take = Math.min(Math.max(parseInt(limit || '100', 10) || 100, 1), 1000);
    const items = await prisma.event.findMany({ where, orderBy: { createdAt: 'desc' }, take });
    res.json(items);
  } catch (e) {
    res.status(400).json({ error: e.message || 'failed' });
  }
});

// Provision a user: agent + wallet
app.post('/provision', async (req, res) => {
  try {
    const { userId, role } = z.object({ userId: z.string().min(1), role: z.string().default('ops') }).parse(req.body || {});

    // ensure space
    let space = await prisma.space.findFirst({ where: { name: userId } });
    if (!space) space = await prisma.space.create({ data: { name: userId } });

    // upsert user by email or id-as-email
    let user = await prisma.user.findUnique({ where: { email: userId } });
    if (!user) {
      user = await prisma.user.create({ data: { email: userId, name: userId, role, spaceId: space.id } });
    } else if (!user.spaceId || user.role !== role) {
      user = await prisma.user.update({ where: { id: user.id }, data: { spaceId: space.id, role } });
    }

    // ensure placeholder wallet
    let wallet = await prisma.wallet.findFirst({ where: { spaceId: space.id } });
    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: {
          label: 'Primary (Polygon)',
          chain: 'polygon',
          address: '0x0000000000000000000000000000000000000000',
          userId: user.id,
          spaceId: space.id,
        },
      });
    }

    const agent = {
      name: `${user.name || user.email} Assistant`,
      role: role.toLowerCase(),
      tools: ['projects.read', 'projects.write', 'contacts.manage', 'wallets.view'],
      guardrails: [
        'No PII exfiltration',
        'Respect role permissions',
        'Never move funds without an approved instruction',
      ],
    };

    res.json({ user, agent, wallet, space });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Invalid payload' });
  }
});

// Basic lookups
app.get('/users/:userId', async (req, res) => {
  const idOrEmail = req.params.userId;
  const user = await prisma.user.findFirst({ where: { OR: [{ id: idOrEmail }, { email: idOrEmail }] } });
  if (!user) return res.status(404).json({ error: 'User not found' });
  const [space, wallet] = await Promise.all([
    user.spaceId ? prisma.space.findUnique({ where: { id: user.spaceId } }) : null,
    prisma.wallet.findFirst({ where: { userId: user.id } }),
  ]);
  const agent = {
    name: `${user.name || user.email} Assistant`,
    role: (user.role || 'ops').toLowerCase(),
    tools: ['projects.read', 'projects.write', 'contacts.manage', 'wallets.view'],
    guardrails: [
      'No PII exfiltration',
      'Respect role permissions',
      'Never move funds without an approved instruction',
    ],
  };
  res.json({ user, agent, wallet, space });
});

// XRPL routes are now provided by xrplRouter

app.listen(PORT, () => {
  console.log(`[api] ${BRAND_NAME} API listening on port ${PORT}`);
});
