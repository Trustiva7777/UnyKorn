#!/usr/bin/env node
/**
 * Cloudflare DNS helper
 * Commands:
 *   node scripts/cloudflare-dns.js verify --domain unykorn.org
 *   node scripts/cloudflare-dns.js show --domain unykorn.org
 *   node scripts/cloudflare-dns.js setup-pages --domain unykorn.org [--mode apex|www] [--ghio <user>.github.io] [--proxied true|false]
 *   node scripts/cloudflare-dns.js set-api --domain unykorn.org --target api.host.tld|203.0.113.10 [--proxied true|false]
 *   node scripts/cloudflare-dns.js domain-info --domain unykorn.org
 *
 * Env (alternative to flags):
 *   CF_API_TOKEN (Zone.DNS:Edit, Zone:Read), DOMAIN, CF_ZONE_ID (optional), CF_ENV (unused, reserved)
 */

const { argv, exit } = require('node:process');

function getArg(name) {
  const i = argv.indexOf(`--${name}`);
  if (i >= 0 && argv[i + 1]) return argv[i + 1];
  return undefined;
}

function required(v, msg) { if (!v) throw new Error(msg); return v; }

// Support both CF_* and CLOUDFLARE_* env names
const API_TOKEN = process.env.CF_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN || process.env.CLOUDFAREWORKERAPI || getArg('token');
const DOMAIN = process.env.DOMAIN || getArg('domain');
let ZONE_ID = process.env.CF_ZONE_ID || process.env.CLOUDFLARE_ZONE_ID || getArg('zone');

async function cf(path, { method = 'GET', body } = {}) {
  const url = `https://api.cloudflare.com/client/v4${path}`;
  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${required(API_TOKEN, 'Missing CF_API_TOKEN')}`,
  };
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const txt = await res.text().catch(() => '');
  let json;
  try { json = JSON.parse(txt); } catch { json = null; }
  if (!res.ok || (json && json.success === false)) {
    const errs = (json && json.errors) ? JSON.stringify(json.errors) : `${res.status} ${res.statusText}`;
    const msg = `Cloudflare API error: ${errs}`;
    throw new Error(msg);
  }
  return json || txt;
}

async function resolveZoneId(domain) {
  if (ZONE_ID) return ZONE_ID;
  const resp = await cf(`/zones?name=${encodeURIComponent(required(domain,'Missing domain'))}`);
  const zones = resp && resp.result ? resp.result : [];
  if (!zones.length) throw new Error(`Zone not found for ${domain}`);
  ZONE_ID = zones[0].id;
  return ZONE_ID;
}

async function listBasicRecords(domain) {
  const zid = await resolveZoneId(domain);
  const resp = await cf(`/zones/${zid}/dns_records?per_page=100`);
  const recs = resp.result || [];
  return recs.filter(r => ['A','AAAA','CNAME'].includes(r.type) && ['@', domain, 'www', 'api'].includes(r.name.replace(`${domain}`, domain)));
}

async function upsertRecord({ type, name, content, ttl = 300, proxied = true }) {
  const domain = required(DOMAIN, 'Missing DOMAIN or --domain');
  const zid = await resolveZoneId(domain);
  // Normalize root name
  const fqdn = (name === '@' || name === domain) ? domain : `${name}.${domain}`.replace(`.${domain}.${domain}`, `.${domain}`);
  // Look up existing
  const existingResp = await cf(`/zones/${zid}/dns_records?type=${type}&name=${encodeURIComponent(fqdn)}`);
  const existing = (existingResp.result || [])[0];
  const payload = { type, name: fqdn, content, ttl, proxied };
  if (!existing) {
    const created = await cf(`/zones/${zid}/dns_records`, { method: 'POST', body: payload });
    return created.result;
  }
  // Only patch if changed
  if (existing.content === content && (existing.ttl === ttl || existing.ttl === 1) && (typeof existing.proxied === 'boolean' ? existing.proxied === proxied : true)) {
    return existing;
  }
  const updated = await cf(`/zones/${zid}/dns_records/${existing.id}`, { method: 'PUT', body: payload });
  return updated.result;
}

const PAGES_A = ['185.199.108.153','185.199.109.153','185.199.110.153','185.199.111.153'];
const PAGES_AAAA = ['2606:50c0:8000::153','2606:50c0:8001::153','2606:50c0:8002::153','2606:50c0:8003::153'];

async function setupPages() {
  const domain = required(DOMAIN, 'Missing DOMAIN or --domain');
  const mode = (getArg('mode') || 'apex').toLowerCase();
  const ghio = getArg('ghio');
  const proxied = String(getArg('proxied') ?? 'true').toLowerCase() === 'true';
  if (!['apex','www'].includes(mode)) throw new Error('mode must be apex|www');

  if (mode === 'apex') {
    // Apex: A/AAAA to GitHub Pages; www -> CNAME apex
    for (const ip of PAGES_A) await upsertRecord({ type:'A', name:'@', content: ip, proxied });
    for (const ip6 of PAGES_AAAA) await upsertRecord({ type:'AAAA', name:'@', content: ip6, proxied });
    await upsertRecord({ type:'CNAME', name:'www', content: domain, proxied });
    console.log('Configured GitHub Pages on apex with A/AAAA and www CNAME -> apex');
  } else {
    // www: CNAME to <user>.github.io; apex can be A/AAAA (and optionally redirect via Pages)
    if (!ghio) throw new Error('Provide --ghio <user>.github.io for mode=www');
    await upsertRecord({ type:'CNAME', name:'www', content: ghio, proxied });
    for (const ip of PAGES_A) await upsertRecord({ type:'A', name:'@', content: ip, proxied });
    for (const ip6 of PAGES_AAAA) await upsertRecord({ type:'AAAA', name:'@', content: ip6, proxied });
    console.log('Configured GitHub Pages on www with CNAME to GH IO and apex A/AAAA');
  }
}

function isIPv4(s) { return /^\d+\.\d+\.\d+\.\d+$/.test(String(s)); }

async function setApi() {
  const target = required(getArg('target') || process.env.API_TARGET, 'Missing --target or API_TARGET');
  const proxied = String(getArg('proxied') ?? 'true').toLowerCase() === 'true';
  if (isIPv4(target)) {
    await upsertRecord({ type:'A', name:'api', content: target, proxied });
    console.log('Set A api ->', target);
  } else {
    await upsertRecord({ type:'CNAME', name:'api', content: target, proxied });
    console.log('Set CNAME api ->', target);
  }
}

async function show() {
  const domain = required(DOMAIN, 'Missing DOMAIN or --domain');
  const recs = await listBasicRecords(domain);
  console.log(JSON.stringify(recs.map(r => ({ type:r.type, name:r.name, content:r.content, proxied:r.proxied, ttl:r.ttl })), null, 2));
}

async function verify() {
  const domain = required(DOMAIN, 'Missing DOMAIN or --domain');
  const zid = await resolveZoneId(domain);
  const zone = await cf(`/zones/${zid}`);
  console.log('Zone:', JSON.stringify(zone.result || zone, null, 2));
}

async function domainInfo() {
  const domain = required(DOMAIN, 'Missing DOMAIN or --domain');
  const zid = await resolveZoneId(domain);
  const zone = await cf(`/zones/${zid}`);
  console.log(JSON.stringify(zone.result || zone, null, 2));
}

async function main() {
  try {
    const cmd = argv[2];
    if (!cmd || ['-h','--help','help'].includes(cmd)) {
      console.log(`Usage:
  node scripts/cloudflare-dns.js verify --domain unykorn.org
  node scripts/cloudflare-dns.js show --domain unykorn.org
  node scripts/cloudflare-dns.js setup-pages --domain unykorn.org [--mode apex|www] [--ghio <user>.github.io] [--proxied true|false]
  node scripts/cloudflare-dns.js set-api --domain unykorn.org --target api.host.tld|203.0.113.10 [--proxied true|false]
  node scripts/cloudflare-dns.js domain-info --domain unykorn.org
Env: CF_API_TOKEN, DOMAIN, CF_ZONE_ID`);
      return;
    }
    if (cmd === 'verify') return await verify();
    if (cmd === 'show') return await show();
    if (cmd === 'setup-pages') return await setupPages();
    if (cmd === 'set-api') return await setApi();
    if (cmd === 'domain-info') return await domainInfo();
    throw new Error('Unknown command');
  } catch (e) {
    console.error('Error:', e.message || e);
    exit(1);
  }
}

main();
