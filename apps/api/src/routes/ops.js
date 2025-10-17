const express = require('express');
const { PrismaClient } = require('@prisma/client');

const r = express.Router();
const prisma = new PrismaClient();

// GET /spaces → all spaces (id, name, createdAt)
r.get('/spaces', async (_req, res) => {
  try {
    const spaces = await prisma.space.findMany({ orderBy: { createdAt: 'desc' } });
    res.json(spaces);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to list spaces' });
  }
});

// GET /wallets?spaceId=... → wallets in a space (chain/label/address)
r.get('/wallets', async (req, res) => {
  try {
    const spaceId = String(req.query.spaceId || '');
    if (!spaceId) return res.status(400).json({ error: 'spaceId required' });
    const wallets = await prisma.wallet.findMany({ where: { spaceId }, orderBy: { createdAt: 'desc' } });
    res.json(wallets);
  } catch (e) {
    res.status(500).json({ error: e.message || 'Failed to list wallets' });
  }
});

module.exports = r;
