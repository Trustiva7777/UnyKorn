const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();
const r = express.Router();

// POST /trustlines/request { spaceId, address, tokenId, note? }
r.post('/trustlines/request', async (req, res) => {
  try {
    const body = z.object({ spaceId: z.string(), address: z.string().min(25), tokenId: z.string(), note: z.string().optional() }).parse(req.body || {});
    const token = await prisma.token.findUnique({ where: { id: body.tokenId } });
    if (!token) return res.status(404).json({ error: 'Token not found' });
    const tl = await prisma.trustlineRequest.create({ data: body });
    res.json(tl);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Invalid payload' });
  }
});

// GET /trustlines/requests?status=pending
r.get('/trustlines/requests', async (req, res) => {
  try {
    const status = String(req.query.status || 'pending');
    const list = await prisma.trustlineRequest.findMany({ where: { status }, orderBy: { createdAt: 'desc' }, include: { token: true } });
    res.json(list);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Failed to list' });
  }
});

// POST /trustlines/:id/approve { decision }
r.post('/trustlines/:id/approve', async (req, res) => {
  try {
    const { decision } = z.object({ decision: z.enum(['approved', 'rejected']) }).parse(req.body || {});
    const tl = await prisma.trustlineRequest.update({ where: { id: req.params.id }, data: { status: decision, decidedAt: new Date() }, include: { token: true } });
    res.json(tl);
  } catch (e) {
    res.status(400).json({ error: e.message || 'Approval failed' });
  }
});

module.exports = r;
