#!/usr/bin/env node
/**
 * GoDaddy DNS helper
 * Commands:
 *   node scripts/godaddy-dns.js show --domain trustiva.io
 *   node scripts/godaddy-dns.js setup-pages --domain trustiva.io [--mode apex|www] [--ghio <user>.github.io]
 *   node scripts/godaddy-dns.js set-api --domain trustiva.io --target api.trustiva.host OR --target 203.0.113.10
 *   node scripts/godaddy-dns.js verify --domain trustiva.io [--env prod|ote]
 *   node scripts/godaddy-dns.js domain-info --domain trustiva.io [--env prod|ote]
 *
 * Env (alternative to flags):
 *   GODADDY_API_KEY, GODADDY_API_SECRET, DOMAIN, GODADDY_ENV=prod|ote
 */

const { argv, exit } = require('node:process');

function getArg(name) {
  const i = argv.indexOf(`--${name}`);
  if (i >= 0 && argv[i + 1]) return argv[i + 1];
  return undefined;
}

function required(v, msg) {
  if (!v) throw new Error(msg);
  return v;
}

const API_KEY = process.env.GODADDY_API_KEY || getArg('key');
const API_SECRET = process.env.GODADDY_API_SECRET || getArg('secret');
const DOMAIN = process.env.DOMAIN || getArg('domain');
const ENV = (getArg('env') || process.env.GODADDY_ENV || 'prod').toLowerCase(); // prod | ote

function apiBase() {
  return ENV === 'ote' ? 'https://api.ote-godaddy.com/v1' : 'https://api.godaddy.com/v1';
}

async function gd(path, { method = 'GET', body } = {}) {
  const url = `${apiBase()}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `sso-key ${required(API_KEY, 'Missing GODADDY_API_KEY')}:${required(API_SECRET, 'Missing GODADDY_API_SECRET')}`,
  };
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  if (!res.ok) {
    let bodyText = await res.text().catch(() => '');
    let info = {};
    try { info = JSON.parse(bodyText); } catch {}
    const code = info.code || info.error || '';
    const msg = info.message || res.statusText;
    // Friendlier diagnostics for common auth mistakes
    if (String(code).includes('UNABLE_TO_AUTHENTICATE') || res.status === 401 || res.status === 403 || res.status === 400) {
      const hints = [];
      hints.push(`GoDaddy responded: ${res.status} ${msg} ${code ? '('+code+')' : ''}`);
      hints.push(`Using environment: ${ENV} (${apiBase()})`);
      hints.push('Checklist:');
      hints.push('- Ensure you are using a Developer API Key/Secret (not OAuth UI login tokens).');
      hints.push('- If you created an OTE (test) key, use --env ote; production keys use --env prod (default).');
      hints.push('- Verify the key belongs to the account that owns the domain.');
      hints.push(`- Quick test: curl -s -u "$GODADDY_API_KEY:$GODADDY_API_SECRET" "${apiBase().replace('/v1','')}/v1/domains/${DOMAIN || '<your-domain>'}"`);
      throw new Error(hints.join('\n'));
    }
    throw new Error(`${method} ${path} -> ${res.status} ${res.statusText} ${bodyText}`);
  }
  const ct = res.headers.get('content-type') || '';
  if (ct.includes('application/json')) return res.json();
  return res.text();
}

async function show() {
  const domain = required(DOMAIN, 'Missing DOMAIN or --domain');
  const recs = await gd(`/domains/${domain}/records`);
  const keep = recs.filter(r => ['A','AAAA','CNAME'].includes(r.type) && ['@','www','api'].includes(r.name));
  console.log(JSON.stringify(keep, null, 2));
}

async function upsertGroup(type, name, records) {
  const domain = required(DOMAIN, 'Missing DOMAIN or --domain');
  const payload = records.map(r => ({ type, name, data: r.data, ttl: r.ttl || 600 }));
  await gd(`/domains/${domain}/records/${type}/${encodeURIComponent(name)}`, { method: 'PUT', body: payload });
}

const PAGES_A = ['185.199.108.153','185.199.109.153','185.199.110.153','185.199.111.153'];
const PAGES_AAAA = ['2606:50c0:8000::153','2606:50c0:8001::153','2606:50c0:8002::153','2606:50c0:8003::153'];

async function setupPages() {
  const domain = required(DOMAIN, 'Missing DOMAIN or --domain');
  const mode = (getArg('mode') || process.env.PAGES_MODE || 'apex').toLowerCase();
  const ghio = getArg('ghio') || process.env.PAGES_GHIO_HOST; // e.g., username.github.io
  if (mode !== 'apex' && mode !== 'www') throw new Error('mode must be apex|www');

  if (mode === 'apex') {
    // Apex trustiva.io serves Pages (A+AAAA records); www CNAME -> apex
    await upsertGroup('A', '@', PAGES_A.map(ip => ({ data: ip })));
    await upsertGroup('AAAA', '@', PAGES_AAAA.map(ip => ({ data: ip })));
    await upsertGroup('CNAME', 'www', [{ data: domain }]);
    console.log('Configured GitHub Pages on apex with A/AAAA and www CNAME -> apex');
  } else {
    // www serves Pages via CNAME to <user>.github.io ; apex can be A/AAAA + redirect in Pages
    if (!ghio) throw new Error('Provide --ghio <user>.github.io for mode=www');
    await upsertGroup('CNAME', 'www', [{ data: ghio }] );
    // Optionally point apex also to Pages IPs, then enable redirect in Pages settings
    await upsertGroup('A', '@', PAGES_A.map(ip => ({ data: ip })));
    await upsertGroup('AAAA', '@', PAGES_AAAA.map(ip => ({ data: ip })));
    console.log('Configured GitHub Pages on www with CNAME to GH IO and apex A/AAAA');
  }
}

function isIPv4(s) { return /^\d+\.\d+\.\d+\.\d+$/.test(String(s)); }

async function setApi() {
  const target = required(getArg('target') || process.env.API_TARGET, 'Missing --target or API_TARGET');
  if (isIPv4(target)) {
    await upsertGroup('A', 'api', [{ data: target }]);
    console.log('Set A api ->', target);
  } else {
    await upsertGroup('CNAME', 'api', [{ data: target }]);
    console.log('Set CNAME api ->', target);
  }
}

async function verify() {
  const domain = required(DOMAIN, 'Missing DOMAIN or --domain');
  console.log(`Environment: ${ENV} (${apiBase()})`);
  // List domains visible to this key
  try {
    const domains = await gd('/domains');
    const names = Array.isArray(domains) ? domains.map(d => d.domain || d.domainId || d).filter(Boolean) : [];
    console.log('Domains visible to this key:', names);
    if (!names.find(n => String(n).toLowerCase() === domain.toLowerCase())) {
      console.warn(`Warning: ${domain} not found in key-visible domains. The key may be for a different account.`);
    }
  } catch (e) {
    console.error('Failed listing domains:', e.message || e);
  }
  // Get domain info
  try {
    const info = await gd(`/domains/${domain}`);
    console.log('Domain info:', JSON.stringify(info, null, 2));
  } catch (e) {
    console.error('Failed fetching domain info:', e.message || e);
  }
}

async function domainInfo() {
  const domain = required(DOMAIN, 'Missing DOMAIN or --domain');
  const info = await gd(`/domains/${domain}`);
  console.log(JSON.stringify(info, null, 2));
}

async function main() {
  try {
    const cmd = argv[2];
    if (!cmd || ['-h','--help','help'].includes(cmd)) {
      console.log(`Usage:
  node scripts/godaddy-dns.js show --domain trustiva.io
  node scripts/godaddy-dns.js setup-pages --domain trustiva.io [--mode apex|www] [--ghio <user>.github.io]
  node scripts/godaddy-dns.js set-api --domain trustiva.io --target api.host.tld OR --target 203.0.113.10
  node scripts/godaddy-dns.js verify --domain trustiva.io [--env prod|ote]
  node scripts/godaddy-dns.js domain-info --domain trustiva.io [--env prod|ote]
Env: GODADDY_API_KEY, GODADDY_API_SECRET, DOMAIN, GODADDY_ENV=prod|ote`);
      return;
    }
    if (cmd === 'show') return await show();
    if (cmd === 'setup-pages') return await setupPages();
    if (cmd === 'set-api') return await setApi();
    if (cmd === 'verify') return await verify();
    if (cmd === 'domain-info') return await domainInfo();
    throw new Error('Unknown command');
  } catch (e) {
    console.error('Error:', e.message || e);
    exit(1);
  }
}

main();
