#!/usr/bin/env node
/*
  Dev/Test airdrop helper: issues IOUs to a CSV list via API /tokens/:id/issue
  Env:
    API_BASE   (default http://localhost:4000)
    HOT_SEED   (issuer hot wallet seed; must match /issuer.hotAddress)
    TOKEN_CODE (optional; if missing, uses the first token)
  Usage:
    node scripts/airdrop.js recipients.csv
  CSV format (no header):
    rADDRESS1,123.45
    rADDRESS2,10
*/
const fs = require('fs');
const path = require('path');

const API = process.env.API_BASE || 'http://localhost:4000';
const HOT_SEED = process.env.HOT_SEED || '';
const TOKEN_CODE = process.env.TOKEN_CODE || '';

async function main(){
  try {
    const csvPath = process.argv[2];
    if (!csvPath) throw new Error('Usage: node scripts/airdrop.js <recipients.csv>');
    if (!HOT_SEED || HOT_SEED.length < 16) throw new Error('HOT_SEED env is required (issuer hot wallet seed)');

    // Ensure not on mainnet
    const net = await fetchJson(`${API}/xrpl/network`).catch(()=>({ network:'unknown' }));
    if (String(net.network).toLowerCase() === 'mainnet') {
      throw new Error('Airdrop disabled on mainnet. Use a secure signer flow.');
    }

    // Resolve token
    const tokens = await fetchJson(`${API}/tokens`).catch(()=>[]);
    if (!Array.isArray(tokens) || tokens.length === 0) throw new Error('No tokens found. Create one via POST /tokens');
    let token = tokens[0];
    if (TOKEN_CODE) {
      token = tokens.find(t => String(t.code).toUpperCase() === String(TOKEN_CODE).toUpperCase()) || token;
    }
    console.log(`[airdrop] Using token ${token.code} (${token.id})`);

    // Read recipients
    const raw = fs.readFileSync(path.resolve(csvPath), 'utf8');
    const rows = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean).map(l => l.split(',').map(s=>s.trim()));
    const jobs = rows.map(([address, value]) => ({ address, value }));
    console.log(`[airdrop] Loaded ${jobs.length} recipients from ${csvPath}`);

    // Fire sequentially with small delay
    for (const j of jobs) {
      process.stdout.write(`→ Issue ${j.value} to ${j.address} ... `);
      try {
        const res = await postJson(`${API}/tokens/${token.id}/issue`, { seed: HOT_SEED, destination: j.address, value: String(j.value), memos: ['airdrop'] });
        const eng = res.engine_result || res.result?.engine_result || res.result?.meta?.TransactionResult || 'ok';
        console.log(eng);
      } catch (e) {
        console.log(`error: ${e.message || e}`);
      }
      await wait(500);
    }
    console.log('[airdrop] done');
  } catch (e) {
    console.error('[airdrop] failed:', e.message || e);
    process.exit(1);
  }
}

function wait(ms){ return new Promise(r => setTimeout(r, ms)); }
async function fetchJson(url){ const r = await fetch(url); if (!r.ok) throw new Error(`${r.status} ${url}`); return r.json(); }
async function postJson(url, body){ const r = await fetch(url, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) }); const j = await r.json(); if (!r.ok || j.error) throw new Error(j.error || `${r.status}`); return j; }

main();
