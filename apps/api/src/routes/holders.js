const express = require('express');
const { z } = require('zod');
const { withClient } = require('../../xrpl');

const r = express.Router();

// GET /tokens/:id/holders?includeZero=true
// Or GET /issuer/:cold/holders?currency=...
r.get(['/tokens/:id/holders', '/issuer/:cold/holders'], async (req, res) => {
  try {
    const qs = z.object({ currency: z.string().min(3).optional(), includeZero: z.string().optional() }).parse(req.query || {});
    const byToken = !!req.params.id;
    let issuerCold = req.params.cold;
    let currency = qs.currency;
    if (byToken) {
      const { PrismaClient } = require('@prisma/client');
      const prisma = new PrismaClient();
      const token = await prisma.token.findUnique({ where: { id: req.params.id }, include: { issuer: true } });
      if (!token) return res.status(404).json({ error: 'Token not found' });
      issuerCold = token.issuer.coldAddress;
      currency = token.code;
    }
    const out = await withClient(async (client) => {
      const lines = await client.request({ command: 'account_lines', account: issuerCold }).catch(() => ({ result: { lines: [] } }));
      return lines;
    });
    const { encodeCurrencyCode } = require('../../xrpl');
    const encoded = currency ? encodeCurrencyCode(currency) : undefined;
    const isHex = encoded ? /^[A-F0-9]{40}$/i.test(encoded) : false;
    const includeZero = (qs.includeZero || '').toLowerCase() === 'true';
    const decodeCurrency = (cur) => {
      if (/^[A-F0-9]{40}$/i.test(cur)) {
        const buf = Buffer.from(cur, 'hex');
        const stripped = buf.toString('utf8').replace(/\u0000+$/g, '');
        return { human: stripped, hex: cur };
      }
      return { human: cur, hex: null };
    };
    const norm = (l) => ({ holder: l.account, currency: decodeCurrency(l.currency), balance: l.balance, limit: l.limit, no_ripple: !!(l.no_ripple), quality_in: l.quality_in, quality_out: l.quality_out });
    let lines = (out?.result?.lines || []);
    if (encoded) {
      lines = lines.filter(l => l.currency.toUpperCase() === encoded.toUpperCase() || l.currency === currency);
    }
    if (!includeZero) {
      lines = lines.filter(l => Number(l.balance) !== 0);
    }
    const holders = lines.map(norm);
    res.json({ issuer: issuerCold, currency: currency || '(all)', count: holders.length, holders });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Failed to fetch holders' });
  }
});

module.exports = r;
