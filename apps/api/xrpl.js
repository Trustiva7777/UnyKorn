const xrpl = require('xrpl');

function rpcAndNet() {
  const net = String(process.env.XRPL_NETWORK || 'devnet').toLowerCase();
  const url =
    net === 'mainnet' ? (process.env.XRPL_RPC_MAINNET || 'wss://s1.ripple.com') :
    net === 'testnet' ? (process.env.XRPL_RPC_TESTNET || 'wss://s.altnet.rippletest.net:51233') :
                        (process.env.XRPL_RPC_DEVNET || 'wss://s.devnet.rippletest.net:51233');
  return { net, url };
}

async function withClient(fn) {
  const { url, net } = rpcAndNet();
  const client = new xrpl.Client(url);
  await client.connect();
  try { return await fn(client, net); }
  finally { try { await client.disconnect(); } catch {}
  }
}

function generateWallet() {
  const w = xrpl.Wallet.generate();
  return { classicAddress: w.classicAddress, seed: w.seed, publicKey: w.publicKey, privateKey: w.privateKey };
}

async function faucetFund(address) {
  return withClient(async (client, net) => {
    if (net === 'mainnet') return { funded: false, note: 'No faucet on mainnet' };
    // Create and fund a temporary faucet wallet, then send XRP to destination
    const faucet = await client.fundWallet();
    const faucetWallet = xrpl.Wallet.fromSeed(faucet.wallet.seed);
    const tx = {
      TransactionType: 'Payment',
      Account: faucetWallet.classicAddress,
      Destination: address,
      Amount: String(20_000_000), // 20 XRP to reliably activate account
    };
    const prepared = await client.autofill(tx);
    const signed = faucetWallet.sign(prepared);
    const paymentResult = await client.submitAndWait(signed.tx_blob);
    return { funded: true, result: { faucet: { classicAddress: faucet.wallet.classicAddress, seed: faucet.wallet.seed }, payment: paymentResult } };
  });
}

async function accountState(address) {
  return withClient(async (client) => {
    const info = await client.request({ command: 'account_info', account: address, ledger_index: 'validated' }).catch(() => null);
    const lines = await client.request({ command: 'account_lines', account: address }).catch(() => ({ result: { lines: [] } }));
    const xrp = info?.result?.account_data?.Balance ? Number(info.result.account_data.Balance) / 1_000_000 : 0;
    const issued = (lines?.result?.lines || []).map(l => ({ currency: l.currency, issuer: l.account, balance: Number(l.balance) }));
    return { xrp, issued, raw: { info, lines } };
  });
}

async function submitPayment({ seed, destination, drops, memos }) {
  return withClient(async (client) => {
    const wallet = xrpl.Wallet.fromSeed(seed);
    const tx = {
      TransactionType: 'Payment',
      Account: wallet.classicAddress,
      Destination: destination,
      Amount: String(drops),
      Memos: memos?.length ? memos.map(m => ({ Memo: { MemoData: Buffer.from(m, 'utf8').toString('hex') } })) : undefined
    };
    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    return client.submitAndWait(signed.tx_blob);
  });
}

async function setTrustline({ seed, currency, issuer, limit = '1000000000' }) {
  return withClient(async (client) => {
    const wallet = xrpl.Wallet.fromSeed(seed);
    const tx = { TransactionType: 'TrustSet', Account: wallet.classicAddress, LimitAmount: { currency: encodeCurrencyCode(currency), issuer, value: String(limit) } };
    const prepared = await client.autofill(tx);
    const signed = wallet.sign(prepared);
    return client.submitAndWait(signed.tx_blob);
  });
}

// Set RegularKey: allow a hot wallet to sign for the cold issuer account
async function setRegularKey(coldSeed, hotAddress) {
  return withClient(async (client) => {
    const cold = xrpl.Wallet.fromSeed(coldSeed);
    const tx = { TransactionType: 'SetRegularKey', Account: cold.classicAddress, RegularKey: hotAddress };
    const prepared = await client.autofill(tx);
    const signed = cold.sign(prepared);
    return client.submitAndWait(signed.tx_blob);
  });
}

// Optionally set issuer account flags (DefaultRipple, RequireAuth)
async function setIssuerFlags(coldSeed, { defaultRipple = true, requireAuth = false } = {}) {
  return withClient(async (client) => {
    const cold = xrpl.Wallet.fromSeed(coldSeed);
    const txs = [];
    if (defaultRipple) {
      txs.push({ TransactionType: 'AccountSet', Account: cold.classicAddress, SetFlag: xrpl.AccountSetAsfFlags.asfDefaultRipple });
    }
    if (requireAuth) {
      txs.push({ TransactionType: 'AccountSet', Account: cold.classicAddress, SetFlag: xrpl.AccountSetAsfFlags.asfRequireAuth });
    }
    let last;
    for (const tx of txs) {
      const prepared = await client.autofill(tx);
      const signed = cold.sign(prepared);
      last = await client.submitAndWait(signed.tx_blob);
    }
    return last || { note: 'No flags changed' };
  });
}

// Encode currency code to XRPL format: 3-char ASCII stays literal; longer strings -> 20-byte hex (padded)
function encodeCurrencyCode(code) {
  const c = String(code);
  if (/^[A-Z0-9]{3}$/.test(c)) return c;
  const bytes = Buffer.from(c, 'utf8');
  if (bytes.length > 20) throw new Error('Currency code too long (>20 bytes)');
  const padded = Buffer.concat([bytes, Buffer.alloc(20 - bytes.length, 0x00)]);
  return padded.toString('hex').toUpperCase();
}

module.exports = { generateWallet, faucetFund, accountState, submitPayment, setTrustline, withClient, setRegularKey, setIssuerFlags, encodeCurrencyCode };
