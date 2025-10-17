require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const { generateXrplWallet } = require('@unykorn/web3');

const prisma = new PrismaClient();

async function ensureSpace(name) {
  let space = await prisma.space.findFirst({ where: { name } });
  if (!space) space = await prisma.space.create({ data: { name } });
  return space;
}

async function ensureUser(email, role, spaceId) {
  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({ data: { email, name: email.split('@')[0], role, spaceId } });
  } else if (user.spaceId !== spaceId || user.role !== role) {
    user = await prisma.user.update({ where: { id: user.id }, data: { spaceId, role } });
  }
  return user;
}

async function ensureXrplWallet(label, spaceId, userId) {
  const where = { spaceId, label, chain: 'xrpl', userId: userId || null };
  const existing = await prisma.wallet.findFirst({ where });
  if (existing) return existing;
  const gen = generateXrplWallet();
  return prisma.wallet.create({ data: { label, chain: 'xrpl', address: gen.address, userId: userId || null, spaceId } });
}

async function main() {
  const unykorn = await ensureSpace('Unykorn 7777');

  const alice = await ensureUser('alice@example.com', 'founder', unykorn.id);
  const bob = await ensureUser('bob@example.com', 'ops', unykorn.id);

  await ensureXrplWallet('XRPL Primary', unykorn.id, alice.id);
  await ensureXrplWallet('XRPL Primary', unykorn.id, bob.id);

  console.log('Seed complete:', { unykorn: unykorn.id });
}

main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
