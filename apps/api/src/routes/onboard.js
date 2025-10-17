const express = require('express');
const { z } = require('zod');
const { createPayload, getResult } = require('../xumm');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { encodeCurrencyCode } = require('../../xrpl');

const r = express.Router();

// Start Xumm SignIn
r.post('/onboard/start', async (_req, res) => {
  try {
    const payload = await createPayload({ TransactionType: 'SignIn' });
    try { await prisma.event.create({ data: { type: 'xumm_signin', route: '/onboard/start', raw: payload } }); } catch {}
    res.json(payload);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Failed to start onboarding' });
  }
});

// Start Trustline (user signs TrustSet in Xumm)
r.post('/onboard/trustline', async (req, res) => {
  try {
    const { currency, issuer, limit } = z.object({ currency: z.string().min(3), issuer: z.string().min(25), limit: z.string().default('1000000') }).parse(req.body || {});
    const tx = { TransactionType: 'TrustSet', LimitAmount: { currency: encodeCurrencyCode(currency), issuer, value: String(limit) } };
    const payload = await createPayload(tx);
    try { await prisma.event.create({ data: { type: 'xumm_trustline', route: '/onboard/trustline', issuerCold: issuer, currency, value: String(limit), raw: payload } }); } catch {}
    res.json(payload);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Failed to create trustline payload' });
  }
});

// Poll result by UUID
r.get('/onboard/result/:uuid', async (req, res) => {
  try {
    const { uuid } = z.object({ uuid: z.string().min(8) }).parse(req.params);
    const out = await getResult(uuid);
    try { await prisma.event.create({ data: { type: 'xumm_result', route: '/onboard/result/:uuid', account: out.account || undefined, raw: out } }); } catch {}
    // If signed and a txid exists, write a TxLog entry (idempotent by unique txHash)
    try {
      if (out?.signed && out?.txid) {
        await prisma.txLog.upsert({
          where: { txHash: out.txid },
          update: {},
          create: { txHash: out.txid, type: 'xumm', payloadUuid: uuid },
        });
      }
    } catch {}
    res.json(out);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Failed to fetch result' });
  }
});

module.exports = r;

// Xumm Issuance (seedless, mainnet-safe): create a Payment payload
// Body: { currency: string, destination: string, value: string, memos?: string[] }
// Requires: existing Issuer (uses latest), Xumm API keys configured
// Behavior: Builds Payment from issuer cold Account to destination for IOU amount;
//           relies on RegularKey (hot) if configured; sets submit: true so Xumm submits.
// Notes: On XRPL, Account is the cold issuer; the hot RegularKey may sign this tx.
r.post('/onboard/issue', async (req, res) => {
  try {
    const body = z.object({
      currency: z.string().min(3),
      destination: z.string().min(25),
      value: z.string().regex(/^\d+(\.\d+)?$/),
      memos: z.array(z.string()).optional(),
    }).parse(req.body || {});

    const issuer = await prisma.issuer.findFirst({ orderBy: { createdAt: 'desc' } });
    if (!issuer) return res.status(400).json({ error: 'Issuer not initialized' });

    const txjson = {
      TransactionType: 'Payment',
      Account: issuer.coldAddress,
      Destination: body.destination,
      Amount: {
        currency: encodeCurrencyCode(body.currency),
        issuer: issuer.coldAddress,
        value: String(body.value),
      },
      Memos: body.memos?.length ? body.memos.map(m => ({ Memo: { MemoData: Buffer.from(m, 'utf8').toString('hex') } })) : undefined,
    };

    // Ask Xumm to submit this transaction when signed
    const payload = await createPayload(txjson, { submit: true });
    try {
      await prisma.event.create({
        data: {
          type: 'xumm_issue',
          route: '/onboard/issue',
          issuerCold: issuer.coldAddress,
          currency: body.currency,
          destination: body.destination,
          value: String(body.value),
          memos: body.memos ? body.memos : undefined,
          raw: payload,
        },
      });
    } catch {}
    res.json(payload);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Failed to create issuance payload' });
  }
});
