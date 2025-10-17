import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function Onboard() {
  const BRAND = process.env.NEXT_PUBLIC_BRAND || 'XRPL Demo';
  const [cfg, setCfg] = useState(null);
  const [issuer, setIssuer] = useState(null);
  const [network, setNetwork] = useState('');
  const [tokens, setTokens] = useState([]);
  const [events, setEvents] = useState([]);
  const [qr, setQr] = useState('');
  const [link, setLink] = useState('');
  const [uuid, setUuid] = useState('');
  const [status, setStatus] = useState('');
  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState(null);
  const pollRef = useRef(null);

  const isMainnet = useMemo(() => String(network).toLowerCase() === 'mainnet', [network]);
  const primaryToken = tokens[0] || null;

  useEffect(() => {
    (async () => {
      try { setCfg(await fetch(`${API}/public/config`).then(r=>r.json())); } catch {}
      try { setIssuer(await fetch(`${API}/issuer`).then(r=>r.json())); } catch {}
      try { setNetwork(await fetch(`${API}/xrpl/network`).then(r=>r.json()).then(j=>j.network)); } catch {}
      try { setTokens(await fetch(`${API}/tokens`).then(r=>r.json())); } catch {}
      try { const saved = window.localStorage.getItem('xrpl_account'); if (saved) setAccount(saved); } catch {}
      try { const ev = await fetch(`${API}/events?limit=10`).then(r=>r.json()); if (Array.isArray(ev)) setEvents(ev); } catch {}
    })();
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => { if (account) { try { window.localStorage.setItem('xrpl_account', account); } catch {}; refreshBalance(account); } }, [account]);

  const poll = (u) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`${API}/onboard/result/${u}`);
        const j = await r.json();
        if (j.signed) {
          clearInterval(pollRef.current);
          if (j.account) setAccount(j.account);
          setStatus('Connected');
          try { const ev = await fetch(`${API}/events?limit=10`).then(r=>r.json()); if (Array.isArray(ev)) setEvents(ev); } catch {}
        }
      } catch {}
    }, 1500);
  };

  const startConnect = async () => {
    setStatus(''); setQr(''); setLink(''); setUuid('');
    try {
      const r = await fetch(`${API}/onboard/start`, { method: 'POST' });
      const j = await r.json();
      if (j.error) { setStatus(j.error); return; }
      setQr(j.qrPng); setLink(j.next); setUuid(j.uuid);
      poll(j.uuid);
    } catch (e) { setStatus('Failed to start connect'); }
  };

  const refreshBalance = async (addr) => {
    if (!addr) return;
    try {
      const j = await fetch(`${API}/wallets/xrpl/balance/${addr}`).then(r=>r.json());
      if (!j.error) setBalance(j);
    } catch {}
  };

  const faucet = async () => {
    if (!account || isMainnet) return;
    setStatus('Funding…');
    try {
      const j = await fetch(`${API}/wallets/xrpl/faucet`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify({ address: account }) }).then(r=>r.json());
      if (j.error) setStatus(j.error); else setStatus('Funded (dev/test)');
      refreshBalance(account);
    } catch { setStatus('Faucet failed'); }
  };

  const trustline = async () => {
    if (!account || !issuer || !primaryToken) return;
    setStatus('Creating trustline…');
    try {
      const body = { currency: primaryToken.code, issuer: issuer.coldAddress, limit: '1000000' };
      const j = await fetch(`${API}/onboard/trustline`, { method:'POST', headers:{ 'Content-Type':'application/json' }, body: JSON.stringify(body) }).then(r=>r.json());
      if (j.error) { setStatus(j.error); return; }
      setQr(j.qrPng); setLink(j.next); setUuid(j.uuid);
      poll(j.uuid);
    } catch { setStatus('Trustline failed'); }
  };

  const copy = async (txt) => { try { await navigator.clipboard.writeText(txt); setStatus('Copied'); setTimeout(()=>setStatus(''), 800); } catch {} };

  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui', lineHeight: 1.5 }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>{BRAND} — XRPL Onboarding</h1>
        <p style={{ color: '#475467', marginTop: 6 }}>Non‑custodial via Xumm · {String(network || cfg?.networkLabel || '').toUpperCase()}</p>
      </header>

      <section style={{ display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', alignItems:'start' }}>
        {/* Connect card */}
        <Card title="Connect" subtitle="Non‑custodial via Xumm" right={cfg?.xummConfigured ? Badge('Xumm') : Badge('Xumm not set', 'red')}>
          {!account ? (
            <div style={{ display:'flex', gap:16, alignItems:'center' }}>
              <div>
                {qr ? <img alt="qr" src={qr} style={{ width:200, height:200 }} /> : <QrPlaceholder />}
                {link && <div style={{ marginTop: 6 }}><a href={link} target="_blank" rel="noreferrer">Open in Xumm</a></div>}
              </div>
              <div style={{ display:'grid', gap:8, fontSize:14 }}>
                <button onClick={startConnect} disabled={!cfg?.xummConfigured} style={btnPrimary()}>Connect with Xumm</button>
                <div style={{ color:'#6b7280', fontSize:12 }}>Status: {status || (uuid ? 'awaiting signature…' : 'idle')}</div>
              </div>
            </div>
          ) : (
            <div style={{ fontSize:14 }}>
              <div>Connected</div>
              <div style={{ fontFamily:'monospace' }}>{account}</div>
              <div style={{ marginTop:8, display:'flex', gap:8 }}>
                {!isMainnet && <button onClick={faucet} style={btnPrimary()}>Faucet 20 XRP</button>}
                <button onClick={() => refreshBalance(account)} style={btn()}>Refresh</button>
                <button onClick={() => { setAccount(''); setBalance(null); setQr(''); setLink(''); setUuid(''); }} style={btn()}>Disconnect</button>
              </div>
              {balance && <div style={{ marginTop:8, color:'#111827' }}>XRP balance: {balance.xrp}</div>}
            </div>
          )}
        </Card>

        {/* Issuer card */}
        <Card title="Issuer wallets" subtitle={issuer?.domain || ''} right={Badge('copy')}>
          {issuer ? (
            <div style={{ fontSize:14 }}>
              <div style={{ fontWeight:600 }}>Cold (treasury)</div>
              <div style={{ fontFamily:'monospace', wordBreak:'break-all' }}>{issuer.coldAddress}</div>
              <div style={{ marginTop:6 }}>
                <button onClick={() => copy(issuer.coldAddress)} style={btn()}>Copy cold</button>
                <Link href="/fund" style={linkBtn()}>QR / Download</Link>
              </div>
              <div style={{ marginTop:12, fontWeight:600 }}>Hot (signer)</div>
              <div style={{ fontFamily:'monospace', wordBreak:'break-all' }}>{issuer.hotAddress}</div>
              <div style={{ marginTop:6 }}>
                <button onClick={() => copy(issuer.hotAddress)} style={btn()}>Copy hot</button>
                <Link href="/fund" style={linkBtn()}>QR / Download</Link>
              </div>
            </div>
          ) : <p style={{ color:'#6b7280' }}>No issuer configured.</p>}
        </Card>

        {/* Network card */}
        <Card title="Network" subtitle="Environment">
          <div style={{ display:'grid', gap:6, fontSize:14 }}>
            <div>XRPL: <b>{network || cfg?.networkLabel || 'unknown'}</b></div>
            <div style={{ color:'#6b7280', fontSize:12 }}>API base: {API}</div>
            <div style={{ marginTop:6 }}>
              <Link href="/status" style={linkBtn()}>View status</Link>
            </div>
          </div>
        </Card>
      </section>

      <section style={{ display:'grid', gap:16, gridTemplateColumns:'repeat(auto-fit,minmax(260px,1fr))', marginTop:16 }}>
        {/* Trustline card */}
        <Card title="Trustline" subtitle={primaryToken ? `${primaryToken.code} • Issuer verified` : 'No token configured'}>
          {primaryToken ? (
            <div style={{ fontSize:14 }}>
              <div style={{ color:'#475467' }}>Set trustline to receive <span style={{ fontFamily:'monospace' }}>{primaryToken.code}</span>.</div>
              <div style={{ marginTop:8 }}>
                <button onClick={trustline} disabled={!account} style={btnPrimary()}>Add trustline via Xumm</button>
              </div>
              <div style={{ marginTop:6, fontSize:12, color:'#6b7280' }}>Limit: 1,000,000 • Precision: {primaryToken.precision}</div>
            </div>
          ) : <p style={{ color:'#6b7280' }}>Ask ops to add a token in Admin.</p>}
        </Card>

        {/* Activity card */}
        <Card title="Activity" subtitle="Recent">
          <ul style={{ paddingLeft:16, margin:0 }}>
            {(events || []).slice(0,8).map(e => (
              <li key={e.id || e.createdAt} style={{ fontSize:14, color:'#374151', marginBottom:6 }}>
                {symbolFor(e.type)} {e.type} — <span style={{ color:'#6b7280', fontSize:12 }}>{new Date(e.createdAt).toLocaleString()}</span>
              </li>
            ))}
            {!events?.length && <li style={{ color:'#6b7280' }}>No recent activity.</li>}
          </ul>
        </Card>
      </section>

      <p style={{ marginTop:24 }}><Link href="/">← Back</Link></p>
    </main>
  );
}

function symbolFor(t){
  if (t === 'signin' || t === 'xumm_signin') return '✔';
  if (t === 'trustline' || t === 'xumm_trustline') return '—';
  return '•';
}

function Badge(text, tone='indigo'){
  const bg = tone==='red' ? '#fee2e2' : '#e0e7ff';
  const fg = tone==='red' ? '#991b1b' : '#3730a3';
  return (
    <span style={{ background:bg, color:fg, borderRadius:999, padding:'2px 8px', fontSize:12 }}>{text}</span>
  );
}

function QrPlaceholder(){
  return (
    <div style={{ width:200, height:200, border:'1px solid #e5e7eb', borderRadius:8, background:'linear-gradient(135deg,#f8fafc,#eef2ff)', display:'grid', placeItems:'center', color:'#6b7280' }}>QR</div>
  );
}

function Card({ title, subtitle, right, children }){
  return (
    <div style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:16, background:'#fff' }}>
      <div style={{ display:'flex', justifyContent:'space-between', gap:12, marginBottom:8 }}>
        <div>
          <div style={{ fontWeight:600 }}>{title}</div>
          {subtitle ? <div style={{ fontSize:12, color:'#6b7280' }}>{subtitle}</div> : null}
        </div>
        {right}
      </div>
      {children}
    </div>
  );
}

function btn(){ return { background:'#f3f4f6', color:'#111827', border:'1px solid #e5e7eb', borderRadius:8, padding:'6px 10px', cursor:'pointer', textDecoration:'none' }; }
function linkBtn(){ return btn(); }
function btnPrimary(){ return { background:'#111827', color:'#fff', border:'1px solid #111827', borderRadius:8, padding:'6px 10px', cursor:'pointer' }; }
