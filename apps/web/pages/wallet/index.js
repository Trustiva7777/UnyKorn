import { useEffect, useRef, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function Wallet() {
  const [network, setNetwork] = useState('');
  const [xummConfigured, setXummConfigured] = useState(false);
  const [issuer, setIssuer] = useState(null);
  const [tokens, setTokens] = useState([]);

  const [account, setAccount] = useState('');
  const [balance, setBalance] = useState(null);

  const [qr, setQr] = useState('');
  const [link, setLink] = useState('');
  const [uuid, setUuid] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const pollRef = useRef(null);

  const pollResult = async (uuid) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`${API}/onboard/result/${uuid}`);
        const j = await r.json();
        if (j.signed) {
          clearInterval(pollRef.current);
          if (j.account) setAccount(j.account);
          setStatus('Connected');
          setQr(''); setLink(''); setUuid('');
          refreshBalance(j.account || account);
        }
      } catch {}
    }, 1500);
  };

  const connect = async () => {
    try {
      setBusy(true); setStatus('');
      setQr(''); setLink(''); setUuid('');
      const r = await fetch(`${API}/onboard/start`, { method: 'POST' });
      const j = await r.json();
      if (j.error) throw new Error(j.error);
      setQr(j.qrPng); setLink(j.next); setUuid(j.uuid);
      pollResult(j.uuid);
    } catch (e) {
      setStatus(e.message || 'Failed to start Xumm');
    } finally { setBusy(false); }
  };

  const faucet = async () => {
    if (!account) return;
    try {
      setBusy(true); setStatus('');
      if (network === 'mainnet') { setStatus('Faucet disabled on mainnet'); return; }
      const r = await fetch(`${API}/wallets/xrpl/faucet`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: account })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Faucet failed');
      setStatus('Funded (devnet faucet)');
      refreshBalance();
    } catch (e) {
      setStatus(e.message || 'Faucet failed');
    } finally { setBusy(false); }
  };

  const trust = async (code) => {
    if (!issuer) return;
    try {
      setBusy(true); setStatus('');
      const r = await fetch(`${API}/onboard/trustline`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currency: code, issuer: issuer.coldAddress, limit: '1000000' })
      });
      const j = await r.json();
      if (j.error) throw new Error(j.error);
      setQr(j.qrPng); setLink(j.next); setUuid(j.uuid);
      setStatus(`Approve trustline for ${code} in Xumm`);
      pollResult(j.uuid);
    } catch (e) {
      setStatus(e.message || 'Trustline failed');
    } finally { setBusy(false); }
  };

  const refreshBalance = async (addr) => {
    const a = addr || account;
    if (!a) return;
    try {
      const r = await fetch(`${API}/wallets/xrpl/balance/${a}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Balance failed');
      setBalance(j);
    } catch (e) {
      setStatus(e.message || 'Balance failed');
    }
  };

  const copy = async (text) => {
    try { await navigator.clipboard.writeText(text); setStatus('Copied'); setTimeout(()=>setStatus(''), 1200); } catch {}
  };

  useEffect(() => {
    (async () => {
      try { const net = await fetch(`${API}/xrpl/network`).then(r=>r.json()); setNetwork(net.network); } catch {}
      try { const cfg = await fetch(`${API}/public/config`).then(r=>r.json()); setXummConfigured(Boolean(cfg.xummConfigured)); } catch {}
      try { const i = await fetch(`${API}/issuer`).then(r=>r.json()); setIssuer(i); } catch {}
      try { const t = await fetch(`${API}/tokens`).then(r=>r.json()); setTokens(Array.isArray(t)?t:[]); } catch {}
    })();
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => { refreshBalance(); }, [account]);

  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui', lineHeight: 1.5 }}>
      <h1 style={{ marginBottom: 4 }}>Wallet</h1>
      <div style={{ color: '#475467', fontSize: 14, marginBottom: 16 }}>XRPL Network: {network || '…'}</div>

      {status && <div style={{ marginBottom: 12, color: '#0f766e' }}>{status}</div>}

      <section style={{ display: 'grid', gap: 16, gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))' }}>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3>Connect</h3>
          <p style={{ color: '#475467', fontSize: 14 }}>Sign in with Xumm to view your balances and manage trustlines.</p>
          <button onClick={connect} disabled={!xummConfigured || busy} style={{ marginTop: 8 }}>
            {xummConfigured ? (busy ? 'Starting…' : 'Connect with Xumm') : 'Xumm not configured'}
          </button>
          {qr && (
            <div style={{ marginTop: 12 }}>
              <img alt="qr" src={qr} style={{ maxWidth: 220, borderRadius: 8 }} />
              <div><a href={link} target="_blank" rel="noreferrer">Open in Xumm</a></div>
            </div>
          )}
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3>Account</h3>
          {account ? (
            <>
              <div style={{ fontFamily: 'monospace', wordBreak: 'break-all' }}>{account}</div>
              <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                <button onClick={() => copy(account)}>Copy</button>
                <button onClick={() => refreshBalance()} disabled={busy}>Refresh</button>
              </div>
              <div style={{ marginTop: 12 }}>
                <div>XRP: {balance ? balance.xrp : '…'}</div>
                <div style={{ marginTop: 8 }}>
                  <div style={{ color: '#475467', fontSize: 14 }}>Issued Balances</div>
                  <ul style={{ margin: 0, paddingLeft: 16 }}>
                    {(balance?.issued || []).map((i, idx) => (
                      <li key={idx}>{i.balance} {i.currency} (issuer: <span style={{ fontFamily:'monospace' }}>{i.issuer}</span>)</li>
                    ))}
                    {!balance?.issued?.length && <li style={{ color: '#6b7280' }}>None</li>}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div style={{ color: '#6b7280' }}>Not connected</div>
          )}
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3>Actions</h3>
          <div style={{ display:'flex', gap: 8, flexWrap: 'wrap' }}>
            <button onClick={faucet} disabled={!account || busy || network === 'mainnet'}>
              Faucet 20 XRP {network === 'mainnet' ? '(disabled)' : ''}
            </button>
          </div>
        </div>

        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
          <h3>Trustlines</h3>
          <p style={{ color: '#475467', fontSize: 14 }}>Establish a trustline for an issued token.</p>
          {issuer && tokens.length ? (
            <ul style={{ margin: 0, paddingLeft: 16 }}>
              {tokens.map(t => (
                <li key={t.id} style={{ display:'flex', alignItems:'center', gap:8, marginBottom:6 }}>
                  <span title={t.name}>{t.code}</span>
                  <button onClick={() => trust(t.code)} disabled={!account || busy}>Trust</button>
                </li>
              ))}
            </ul>
          ) : (
            <div style={{ color: '#6b7280' }}>No tokens available</div>
          )}
        </div>
      </section>

      <p style={{ marginTop: 24 }}><a href="/">← Back</a></p>
    </main>
  );
}
