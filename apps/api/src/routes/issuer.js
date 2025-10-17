const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const xrpl = require('../../xrpl');

const prisma = new PrismaClient();
const r = express.Router();

// POST /issuer/init { org, domain? } -> create cold+hot, faucet on dev/test, return seeds once
r.post('/issuer/init', async (req, res) => {
  try {
    const { org, domain } = z.object({ org: z.string().min(3), domain: z.string().optional() }).parse(req.body || {});
    const cold = xrpl.generateWallet();
    const hot = xrpl.generateWallet();
    // fund on dev/test
    await xrpl.faucetFund(cold.classicAddress);
    await xrpl.faucetFund(hot.classicAddress);
    // Set RegularKey so hot can sign for cold; enable DefaultRipple by default on dev/test
    try {
      await xrpl.setRegularKey(cold.seed, hot.classicAddress);
      await xrpl.setIssuerFlags(cold.seed, { defaultRipple: true });
    } catch (e) {
      // Non-fatal in dev: continue even if these fail
      console.warn('Issuer post-setup warning:', e?.message || e);
    }
    const issuer = await prisma.issuer.create({ data: { org, domain: domain || null, coldAddress: cold.classicAddress, hotAddress: hot.classicAddress } });
    res.json({ issuer, secrets: { coldSeed: cold.seed, hotSeed: hot.seed } });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Invalid payload' });
  }
});

// GET /issuer -> latest issuer
r.get('/issuer', async (_req, res) => {
  const i = await prisma.issuer.findFirst({ orderBy: { createdAt: 'desc' } });
  res.json(i || null);
});

// GET /xrpl/network
r.get('/xrpl/network', (_req, res) => {
  res.json({ network: String(process.env.XRPL_NETWORK || 'devnet').toLowerCase() });
});

module.exports = r;
