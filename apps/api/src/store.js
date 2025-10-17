// Simple in-memory store (replace with DB/Prisma later)
const cuid = () => Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);

const users = new Map(); // key: id or email
const agents = new Map(); // key: userId/email
const wallets = new Map(); // key: userId/email
const spaces = new Map(); // key: id
const spacesByName = new Map(); // key: name
const invitations = []; // array of { id, email, role, spaceId, token, createdAt, consumedAt }

function findUserByIdOrEmail(idOrEmail) {
  // try direct key
  if (users.has(idOrEmail)) return users.get(idOrEmail);
  // search by email value
  for (const u of users.values()) {
    if (u.email === idOrEmail) return u;
  }
  return null;
}

function ensureSpaceByName(name) {
  if (spacesByName.has(name)) return spacesByName.get(name);
  const id = cuid();
  const space = { id, name, createdAt: new Date().toISOString() };
  spaces.set(id, space);
  spacesByName.set(name, space);
  return space;
}

function getSpaceById(id) {
  return spaces.get(id) || null;
}

function addInvitation({ email, role, spaceId, token }) {
  const inv = { id: cuid(), email, role, spaceId, token, createdAt: new Date().toISOString(), consumedAt: null };
  invitations.push(inv);
  return inv;
}

function getInvitationByToken(token) {
  return invitations.find(i => i.token === token) || null;
}

function listInvitations() {
  return invitations.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
}

module.exports = {
  users,
  agents,
  wallets,
  spaces,
  spacesByName,
  invitations,
  findUserByIdOrEmail,
  ensureSpaceByName,
  getSpaceById,
  addInvitation,
  getInvitationByToken,
  listInvitations,
  cuid,
};