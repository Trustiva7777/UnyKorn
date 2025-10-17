import { useEffect, useState } from 'react';
import Link from 'next/link';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function Status() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
  try { setData(await fetch(`${API}/status`).then(r=>r.json())); } catch (e) { setError('Status failed'); }
    })();
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>Status</h1>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      <div style={{ marginBottom: 12 }}>
        <div>Health: {data?.health ? 'ok' : '…'}</div>
        <div>Network: {data?.xrpl?.network || '…'}</div>
        <div>Xumm: {data?.config?.xummConfigured ? (data?.xumm?.application?.name || data?.xumm?.pong?.application?.name || 'configured') : 'not configured'}</div>
        {data?.config && (
          <div style={{ marginTop: 8, fontSize: 14, color: '#475467' }}>
            <div>Brand: {data.config.brand}</div>
            <div>Contact: <a href={`mailto:${data.config.contact?.email}`}>{data.config.contact?.email}</a></div>
            <div>Address: {data.config.contact?.address}</div>
          </div>
        )}
      </div>
      <div style={{ marginBottom: 12 }}>
        <div>Issuer: {data?.issuer ? (
          <span style={{ fontFamily: 'monospace' }}>{data.issuer.coldAddress}</span>
        ) : '…'}</div>
        <div>Hot: {data?.issuer ? (
          <span style={{ fontFamily: 'monospace' }}>{data.issuer.hotAddress}</span>
        ) : '…'}</div>
      </div>
      <div>
        <div>Tokens ({data?.tokens?.length || 0}):</div>
        <ul>
          {(data?.tokens || []).map(t => (
            <li key={t.id}>{t.code} — {t.name}</li>
          ))}
        </ul>
      </div>
      {/* Issuer (Cold/Hot) card for funding reference */}
      <section style={{ marginTop: 24, padding: 16, border: '1px solid #e5e7eb', borderRadius: 12 }}>
        <h2 style={{ margin: 0, fontSize: 18 }}>Issuer (fund these on mainnet)</h2>
        <IssuerCard />
      </section>
      <div style={{ marginTop: 16 }}>
        <a href={`${API}/.well-known/xrp-ledger.toml`} target="_blank" rel="noreferrer">xrp-ledger.toml</a> ·{' '}
  <Link href="/join">Join</Link> ·{' '}
        <a href={`${API}/reports/holders.csv${data?.issuer ? `?issuer=${data.issuer.coldAddress}` : ''}`} target="_blank" rel="noreferrer">Holders CSV</a> ·{' '}
        <a href={`${API}/reports/tx.csv`} target="_blank" rel="noreferrer">Tx CSV</a>
      </div>
  <p style={{ marginTop: 24 }}><Link href="/">← Back</Link></p>
    </main>
  );
}

function IssuerCard() {
  const [issuer, setIssuer] = useState(null);
  const [net, setNet] = useState('');
  useEffect(() => {
    (async () => {
      try { const i = await fetch(`${API}/issuer`).then(r=>r.ok ? r.json() : null); setIssuer(i); } catch {}
      try { const n = await fetch(`${API}/xrpl/network`).then(r=>r.ok ? r.json() : null); setNet(n?.network || ''); } catch {}
    })();
  }, []);
  if (!issuer) return <p style={{ color: '#6b7280', marginTop: 8 }}>Loading issuer…</p>;
  const copy = async (txt) => { try { await navigator.clipboard.writeText(txt); } catch {} };
  const cold = issuer.coldAddress;
  const hot = issuer.hotAddress;
  return (
    <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
      <div style={{ fontSize: 14, color: '#6b7280' }}>Network: <b>{net || (process.env.NEXT_PUBLIC_NETWORK_LABEL || '')}</b></div>
      <div>
        <div style={{ fontWeight: 600 }}>Cold (treasury)</div>
        <code style={{ display: 'block', marginTop: 4, wordBreak: 'break-all' }}>{cold}</code>
        <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
          <button onClick={() => copy(cold)} style={btn()}>Copy</button>
          <a href={`${API}/wallets/xrpl/balance/${cold}`} target="_blank" rel="noreferrer" style={linkBtn()}>Balance API</a>
        </div>
      </div>
      <div>
        <div style={{ fontWeight: 600 }}>Hot (operational signer)</div>
        <code style={{ display: 'block', marginTop: 4, wordBreak: 'break-all' }}>{hot}</code>
        <div style={{ marginTop: 6, display: 'flex', gap: 8 }}>
          <button onClick={() => copy(hot)} style={btn()}>Copy</button>
          <a href={`${API}/wallets/xrpl/balance/${hot}`} target="_blank" rel="noreferrer" style={linkBtn()}>Balance API</a>
        </div>
      </div>
      <div style={{ fontSize: 12, color: '#6b7280', marginTop: 6 }}>
        Fund <b>Cold first</b>, then <b>Hot</b>. Don’t run <code>/issuer/init</code> again in a live env—always read <code>/issuer</code>.
      </div>
    </div>
  );
}

function btn(){ return { background:'#111827', color:'#fff', border:'none', borderRadius:8, padding:'6px 10px', cursor:'pointer' }; }
function linkBtn(){ return { background:'#f3f4f6', color:'#111827', border:'1px solid #e5e7eb', borderRadius:8, padding:'6px 10px', textDecoration:'none' }; }
