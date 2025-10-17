const { Router } = require('express');
const { PrismaClient } = require('@prisma/client');
const { z } = require('zod');

const prisma = new PrismaClient();
const r = Router();

function tokenGen(len = 48) {
  const abc = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += abc[Math.floor(Math.random() * abc.length)];
  return out;
}

// List invitations (desc by createdAt)
r.get('/', async (_req, res) => {
  const list = await prisma.invitation.findMany({ orderBy: { createdAt: 'desc' } });
  res.json(list);
});

// Create an invitation
r.post('/', async (req, res) => {
  try {
    const schema = z.object({ email: z.string().email(), role: z.string().default('ops') });
    const { email, role } = schema.parse(req.body);

    // Ensure an "Org" space for generic invites
    let org = await prisma.space.findFirst({ where: { name: 'Org' } });
    if (!org) org = await prisma.space.create({ data: { name: 'Org' } });

    const token = tokenGen();
    const invite = await prisma.invitation.create({ data: { email, role, spaceId: org.id, token } });

    res.status(201).json({ invite, link: `/invite/${token}` });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Invalid payload' });
  }
});

// Get invitation by token
r.get('/:token', async (req, res) => {
  const inv = await prisma.invitation.findUnique({ where: { token: req.params.token } });
  if (!inv) return res.status(404).json({ error: 'Not found' });
  res.json(inv);
});

// Accept invitation
r.post('/:token/accept', async (req, res) => {
  try {
    const schema = z.object({ name: z.string().min(1).default('New User') });
    const { name } = schema.parse(req.body || {});
    const inv = await prisma.invitation.findUnique({ where: { token: req.params.token } });
    if (!inv) return res.status(404).json({ error: 'Invite not found' });
    if (inv.consumedAt) return res.status(409).json({ error: 'Invite already used' });

    // User space named by email (idempotent)
    let space = await prisma.space.findFirst({ where: { name: inv.email } });
    if (!space) space = await prisma.space.create({ data: { name: inv.email } });

    // Upsert user
    let user = await prisma.user.findUnique({ where: { email: inv.email } });
    if (!user) {
      user = await prisma.user.create({ data: { email: inv.email, name, role: inv.role, spaceId: space.id } });
    } else {
      user = await prisma.user.update({ where: { id: user.id }, data: { name, role: inv.role, spaceId: space.id } });
    }

    await prisma.invitation.update({ where: { id: inv.id }, data: { consumedAt: new Date() } });

    res.json({ ok: true, user, space });
  } catch (e) {
    res.status(400).json({ error: e.message || 'Invalid payload' });
  }
});

module.exports = r;