const { XummSdk } = require('xumm-sdk');

function ensureXumm() {
  // Support Codespaces secret aliases: XAMANAPI / XAMANKEY
  const key = process.env.XUMM_API_KEY || process.env.XAMANAPI;
  const secret = process.env.XUMM_API_SECRET || process.env.XAMANKEY;
  if (!key || !secret) throw new Error('Missing XUMM_API_KEY / XUMM_API_SECRET');
  return new XummSdk(key, secret);
}

async function createPayload(txjson, options = {}) {
  const xumm = ensureXumm();
  const payload = await xumm.payload.create({ txjson, options: { submit: false, ...options } });
  return { uuid: payload.uuid, next: payload.next.always, qrPng: payload.refs.qr_png };
}

async function getResult(uuid) {
  const xumm = ensureXumm();
  const res = await xumm.payload.get(uuid);
  return {
    signed: res?.meta?.resolved === true && res?.meta?.signed === true,
    txid: res?.response?.txid || null,
    account: res?.response?.account || null,
    raw: res
  };
}

module.exports = { ensureXumm, createPayload, getResult };
