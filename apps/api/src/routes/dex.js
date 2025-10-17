const express = require('express');
const { z } = require('zod');
const { withClient, encodeCurrencyCode } = require('../../xrpl');

const r = express.Router();

// GET /dex/book?base=XRP&quote=UNY:rf...&limit=20
r.get('/dex/book', async (req, res) => {
  try {
    const { base, quote, limit } = z.object({ base: z.string(), quote: z.string(), limit: z.string().optional() }).parse(req.query || {});
    const parseSide = (s) => {
      if (s.toUpperCase() === 'XRP') return { currency: 'XRP' };
      const [cur, issuer] = s.split(':');
      return { currency: encodeCurrencyCode(cur), issuer };
    };
    const taker_gets = parseSide(base);
    const taker_pays = parseSide(quote);
    const out = await withClient(async (client) => client.request({ command: 'book_offers', taker_gets, taker_pays, limit: limit ? Number(limit) : undefined }));
    res.json(out?.result || out);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Failed to fetch order book' });
  }
});

// POST /dex/offer/create { seed, takerGets, takerPays, flags? }
r.post('/dex/offer/create', async (req, res) => {
  try {
    const { seed, takerGets, takerPays, flags } = z.object({
      seed: z.string().min(16),
      takerGets: z.union([z.string(), z.object({ currency: z.string(), issuer: z.string().optional(), value: z.string().optional() })]),
      takerPays: z.union([z.string(), z.object({ currency: z.string(), issuer: z.string().optional(), value: z.string().optional() })]),
      flags: z.number().optional()
    }).parse(req.body || {});
    const xrpl = require('xrpl');
    const { withClient } = require('../../xrpl');
    const wallet = xrpl.Wallet.fromSeed(seed);
    const normAmt = (a) => {
      if (typeof a === 'string') return a; // drops
      if (a.currency.toUpperCase() === 'XRP') return a.value ? String(Math.round(Number(a.value) * 1_000_000)) : undefined;
      return { currency: encodeCurrencyCode(a.currency), issuer: a.issuer, value: a.value };
    };
    const out = await withClient(async (client) => {
      const tx = { TransactionType: 'OfferCreate', Account: wallet.address, TakerGets: normAmt(takerGets), TakerPays: normAmt(takerPays), Flags: flags };
      const prepared = await client.autofill(tx);
      const signed = wallet.sign(prepared);
      return client.submitAndWait(signed.tx_blob);
    });
    res.json({ engine_result: out?.result?.engine_result ?? out?.result?.meta?.TransactionResult ?? null, hash: out?.result?.tx_json?.hash ?? null, raw: out });
  } catch (e) {
    res.status(400).json({ error: e.message || 'OfferCreate failed' });
  }
});

// POST /dex/offer/cancel { seed, offerSequence }
r.post('/dex/offer/cancel', async (req, res) => {
  try {
    const { seed, offerSequence } = z.object({ seed: z.string().min(16), offerSequence: z.number().int().min(1) }).parse(req.body || {});
    const xrpl = require('xrpl');
    const wallet = xrpl.Wallet.fromSeed(seed);
    const out = await withClient(async (client) => {
      const tx = { TransactionType: 'OfferCancel', Account: wallet.address, OfferSequence: offerSequence };
      const prepared = await client.autofill(tx);
      const signed = wallet.sign(prepared);
      return client.submitAndWait(signed.tx_blob);
    });
    res.json({ engine_result: out?.result?.engine_result ?? out?.result?.meta?.TransactionResult ?? null, hash: out?.result?.tx_json?.hash ?? null, raw: out });
  } catch (e) {
    res.status(400).json({ error: e.message || 'OfferCancel failed' });
  }
});

module.exports = r;
