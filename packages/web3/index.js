const { BRAND_NAME } = require('@unykorn/shared');

// XRPL helpers
function xrplWsFor(network) {
  const n = (network || process.env.XRPL_NETWORK || 'devnet').toLowerCase();
  return n; // placeholder mapping
}

async function getXrplBalance(address, { network } = {}) {
  // Placeholder: without xrpl lib, return 0 for now.
  return { xrp: 0 };
}

function generateXrplWallet() {
  // Deterministic placeholder for demo (not for production)
  const rnd = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
  return {
    address: `r${rnd}`,
    secrets: {
      seed: Math.random().toString(36).slice(2),
      publicKey: Math.random().toString(36).slice(2),
      privateKey: Math.random().toString(36).slice(2),
    },
  };
}

// Legacy polygon placeholder retained for compatibility
function createUserWallet({ userId }) {
  return {
    address: `wallet_${userId}`,
    network: process.env.WEB3_NETWORK || 'polygon',
    brand: BRAND_NAME,
  };
}

module.exports = {
  createUserWallet,
  generateXrplWallet,
  getXrplBalance,
  xrplWsFor,
};
