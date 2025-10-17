const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { generateWallet, faucetFund, accountState, submitPayment, setTrustline } = require('../../xrpl');

const prisma = new PrismaClient();
const r = express.Router();

// Create XRPL wallet: store address only, return secrets once
r.post('/wallets/xrpl/new', async (req, res) => {
  try {
    const { spaceId, userId, label } = z.object({
      spaceId: z.string(),
      userId: z.string().optional(),
      label: z.string().default('XRPL Primary'),
    }).parse(req.body || {});

    const space = await prisma.space.findUnique({ where: { id: spaceId } });
    if (!space) return res.status(404).json({ error: 'Space not found' });

    const w = generateWallet();
    const record = await prisma.wallet.create({
      data: { label, chain: 'xrpl', address: w.classicAddress, spaceId, userId: userId || null },
    });
    res.json({ wallet: record, secrets: { seed: w.seed, publicKey: w.publicKey, privateKey: w.privateKey } });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Invalid payload' });
  }
});

// Balance: keep existing shape
r.get('/wallets/xrpl/balance/:address', async (req, res) => {
  try {
    const { address } = z.object({ address: z.string().min(25) }).parse(req.params);
    const info = await accountState(address);
    res.json({ xrp: info.xrp, issued: info.issued });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Failed to fetch balance' });
  }
});

r.post('/wallets/xrpl/faucet', async (req, res) => {
  try {
    const net = String(process.env.XRPL_NETWORK || 'devnet').toLowerCase();
    if (net === 'mainnet') return res.status(403).json({ error: 'Faucet is disabled on mainnet' });
    const { address } = z.object({ address: z.string().min(25) }).parse(req.body || {});
    const out = await faucetFund(address);
    res.json(out);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Faucet failed' });
  }
});

r.post('/wallets/xrpl/payment', async (req, res) => {
  try {
    const net = String(process.env.XRPL_NETWORK || 'devnet').toLowerCase();
    if (net === 'mainnet') return res.status(403).json({ error: 'Direct seed-based payments disabled on mainnet. Use Xumm or KMS.' });
    const { seed, destination, drops, memos } = z.object({
      seed: z.string().min(16),
      destination: z.string().min(25),
      drops: z.string().regex(/^\d+$/),
      memos: z.array(z.string()).optional(),
    }).parse(req.body || {});
  const out = await submitPayment({ seed, destination, drops, memos });
  const engine = out?.result?.engine_result ?? out?.engine_result ?? out?.result?.meta?.TransactionResult ?? null;
  const hash = out?.result?.tx_json?.hash ?? out?.result?.hash ?? out?.hash ?? null;
  try {
    await prisma.event.create({ data: { type: 'payment', route: '/wallets/xrpl/payment', account: 'seed', destination, value: drops, hash, engineResult: engine, memos: memos ? memos : undefined, raw: out } });
  } catch {}
  res.json({ engine_result: engine, hash, raw: out });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Payment failed' });
  }
});

r.post('/wallets/xrpl/trustline', async (req, res) => {
  try {
    const net = String(process.env.XRPL_NETWORK || 'devnet').toLowerCase();
    if (net === 'mainnet') return res.status(403).json({ error: 'Direct seed-based trustlines disabled on mainnet. Use Xumm.' });
    const { seed, currency, issuer, limit } = z.object({
      seed: z.string().min(16),
      currency: z.string().min(3),
      issuer: z.string().min(25),
      limit: z.string().optional(),
    }).parse(req.body || {});
    const out = await setTrustline({ seed, currency, issuer, limit });
  const engine = out?.result?.engine_result ?? out?.engine_result ?? out?.result?.meta?.TransactionResult ?? null;
    const hash = out?.result?.tx_json?.hash ?? out?.result?.hash ?? out?.hash ?? null;
    try {
      await prisma.event.create({ data: { type: 'trustline', route: '/wallets/xrpl/trustline', account: 'seed', issuerCold: issuer, currency, value: String(limit || ''), hash, engineResult: engine, raw: out } });
    } catch {}
    res.json({ engine_result: engine, hash, raw: out });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Trustline failed' });
  }
});

module.exports = r;
