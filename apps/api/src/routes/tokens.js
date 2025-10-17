const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');
const { withClient } = require('../../xrpl');
const xrplLib = require('xrpl');

const prisma = new PrismaClient();
const r = express.Router();

// POST /tokens { code, name, precision? }
r.post('/tokens', async (req, res) => {
  try {
    const { code, name, precision } = z.object({ code: z.string().min(3), name: z.string().min(2), precision: z.number().int().min(0).max(15).optional() }).parse(req.body || {});
    const issuer = await prisma.issuer.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!issuer) return res.status(400).json({ error: 'Issuer not initialized' });
    const token = await prisma.token.create({ data: { code, name, precision: precision ?? 6, issuerId: issuer.id } });
    res.json(token);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Invalid payload' });
  }
});

// GET /tokens
r.get('/tokens', async (_req, res) => {
  const list = await prisma.token.findMany({ orderBy: { createdAt: 'desc' }, include: { issuer: true } });
  res.json(list);
});

// POST /tokens/:id/issue { seed, destination, value, memos? }
r.post('/tokens/:id/issue', async (req, res) => {
  try {
    const net = String(process.env.XRPL_NETWORK || 'devnet').toLowerCase();
    if (net === 'mainnet') return res.status(403).json({ error: 'Direct seed-based issuance disabled on mainnet. Use Xumm or a KMS signer.' });
    const { seed, destination, value, memos } = z.object({ seed: z.string().min(16), destination: z.string().min(25), value: z.string().regex(/^\d+(\.\d+)?$/), memos: z.array(z.string()).optional() }).parse(req.body || {});
    const token = await prisma.token.findUnique({ where: { id: req.params.id }, include: { issuer: true } });
    if (!token) return res.status(404).json({ error: 'Token not found' });
    const currency = token.code;
    const issuerAddr = token.issuer.coldAddress;
    // Dev guard: ensure provided seed corresponds to issuer hot signer
    try {
      const hotCheck = xrplLib.Wallet.fromSeed(seed);
      if (hotCheck.address !== token.issuer.hotAddress) {
        return res.status(400).json({ error: `Signer mismatch: token ${currency} issuer is ${issuerAddr} (hot ${token.issuer.hotAddress}), but you signed as ${hotCheck.address}` });
      }
    } catch {}
    const out = await withClient(async (client) => {
      // Issue from issuer (cold) account, signed by hot via RegularKey
      const hot = xrplLib.Wallet.fromSeed(seed);
      const tx = { TransactionType: 'Payment', Account: issuerAddr, Destination: destination, Amount: { currency, issuer: issuerAddr, value }, Memos: memos?.length ? memos.map(m => ({ Memo: { MemoData: Buffer.from(m, 'utf8').toString('hex') } })) : undefined };
      const prepared = await client.autofill(tx);
      const signed = hot.sign(prepared);
      return client.submitAndWait(signed.tx_blob);
    });
    const engine = out?.result?.engine_result ?? out?.engine_result ?? out?.result?.meta?.TransactionResult ?? null;
    const hash = out?.result?.tx_json?.hash ?? out?.result?.hash ?? out?.hash ?? null;
    try {
      await prisma.event.create({ data: { type: 'issue', route: '/tokens/:id/issue', account: issuerAddr, destination, tokenId: token.id, issuerCold: issuerAddr, currency, value, hash, engineResult: engine, memos: memos ? memos : undefined, raw: out } });
    } catch {}
    res.json({ engine_result: engine, hash, raw: out });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Issue failed' });
  }
});

// POST /tokens/:id/redeem { holderSeed, value }
r.post('/tokens/:id/redeem', async (req, res) => {
  try {
    const net = String(process.env.XRPL_NETWORK || 'devnet').toLowerCase();
    if (net === 'mainnet') return res.status(403).json({ error: 'Direct seed-based redemption disabled on mainnet. Use Xumm.' });
    const { holderSeed, value } = z.object({ holderSeed: z.string().min(16), value: z.string().regex(/^\d+(\.\d+)?$/) }).parse(req.body || {});
    const token = await prisma.token.findUnique({ where: { id: req.params.id }, include: { issuer: true } });
    if (!token) return res.status(404).json({ error: 'Token not found' });
    const currency = token.code;
    const issuerAddr = token.issuer.coldAddress;
    const out = await withClient(async (client) => {
      // Redeem: holder sends IOU back to issuer
      const holder = xrplLib.Wallet.fromSeed(holderSeed);
      const tx = { TransactionType: 'Payment', Account: holder.address, Destination: issuerAddr, Amount: { currency, issuer: issuerAddr, value } };
      const prepared = await client.autofill(tx);
      const signed = holder.sign(prepared);
      return client.submitAndWait(signed.tx_blob);
    });
    const engine = out?.result?.engine_result ?? out?.engine_result ?? out?.result?.meta?.TransactionResult ?? null;
    const hash = out?.result?.tx_json?.hash ?? out?.result?.hash ?? out?.hash ?? null;
    try {
      await prisma.event.create({ data: { type: 'redeem', route: '/tokens/:id/redeem', account: issuerAddr, destination: issuerAddr, tokenId: token.id, issuerCold: issuerAddr, currency, value, hash, engineResult: engine, raw: out } });
    } catch {}
    res.json({ engine_result: engine, hash, raw: out });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Redeem failed' });
  }
});

module.exports = r;
