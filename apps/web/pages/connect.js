import { useEffect, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function Connect() {
  const BRAND = process.env.NEXT_PUBLIC_BRAND || 'XRPL Demo';
  const [cfg, setCfg] = useState(null);
  const [issuer, setIssuer] = useState(null);
  const [copied, setCopied] = useState('');
  function copy(text) {
    try { navigator.clipboard.writeText(text); setCopied(text); setTimeout(()=>setCopied(''), 1200); } catch {}
  }
  useEffect(() => {
    (async () => {
      try { setCfg(await fetch(`${API}/public/config`).then(r=>r.json())); } catch {}
      try { setIssuer(await fetch(`${API}/issuer`).then(r=>r.json())); } catch {}
    })();
  }, []);
  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui', lineHeight: 1.5 }}>
      <h1 style={{ marginBottom: 8 }}>{BRAND} — Connect</h1>
      <p style={{ color: '#475467' }}>Connect a non-custodial XRPL wallet (Xumm) to view balances and set trustlines.</p>
      <div style={{ marginTop: 16 }}>
        <Link href="/wallet" style={{ background:'#111827', color:'#fff', padding:'8px 12px', borderRadius:8, textDecoration:'none' }}>Open Wallet</Link>
      </div>
      {cfg && (
        <div style={{ marginTop: 16, fontSize: 14, color:'#6b7280' }}>
          <div>Network: {cfg.networkLabel}</div>
          <div>Xumm: {cfg.xummConfigured ? 'configured' : 'not configured'}</div>
        </div>
      )}
      {issuer && (
        <div style={{ marginTop: 20, padding:12, border:'1px solid #e5e7eb', borderRadius:8 }}>
          <div style={{ fontWeight:600, marginBottom:6 }}>Issuer wallets to fund (mainnet)</div>
          <div style={{ fontSize:14, color:'#475467', marginBottom:8 }}>Fund these two XRPL accounts. Cold first, then Hot.</div>
          <div style={{ fontFamily:'monospace', fontSize:13, display:'grid', gap:6 }}>
            <div>
              Cold: <span>{issuer.coldAddress}</span>
              <button style={{ marginLeft:8 }} onClick={()=>copy(issuer.coldAddress)}>Copy</button>
              {copied === issuer.coldAddress && <span style={{ marginLeft:6, color:'#059669' }}>Copied</span>}
            </div>
            <div>
              Hot: <span>{issuer.hotAddress}</span>
              <button style={{ marginLeft:8 }} onClick={()=>copy(issuer.hotAddress)}>Copy</button>
              {copied === issuer.hotAddress && <span style={{ marginLeft:6, color:'#059669' }}>Copied</span>}
            </div>
          </div>
        </div>
      )}
  <p style={{ marginTop: 24 }}><Link href="/">← Back</Link></p>
    </main>
  );
}
