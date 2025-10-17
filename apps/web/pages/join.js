import { useEffect, useRef, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function Join() {
  const [qr, setQr] = useState('');
  const [link, setLink] = useState('');
  const [uuid, setUuid] = useState('');
  const [account, setAccount] = useState('');
  const [network, setNetwork] = useState('');
  const [status, setStatus] = useState('');
  const [balance, setBalance] = useState(null);
  const [issuer, setIssuer] = useState(null);
  const pollRef = useRef(null);

  const poll = async (uuid) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`${API}/onboard/result/${uuid}`);
        const j = await r.json();
        if (j.signed) {
          clearInterval(pollRef.current);
          setAccount(j.account || '');
          setStatus('Connected');
        }
      } catch {}
    }, 1500);
  };

  const start = async () => {
    setStatus(''); setAccount(''); setQr(''); setLink('');
    const r = await fetch(`${API}/onboard/start`, { method: 'POST' });
    const j = await r.json();
    if (j.error) { setStatus(j.error); return; }
    setQr(j.qrPng); setLink(j.next); setUuid(j.uuid);
    poll(j.uuid);
  };

  const faucet = async () => {
    if (!account) return;
    setStatus('');
    const r = await fetch(`${API}/wallets/xrpl/faucet`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: account }) });
    const j = await r.json();
    if (j.error) setStatus(j.error); else setStatus('Funded (devnet)');
    refreshBalance();
  };

  const trust = async () => {
    if (!issuer) return;
    setStatus('');
    const r = await fetch(`${API}/onboard/trustline`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currency: 'UNZ', issuer: issuer.coldAddress, limit: '1000000' }) });
    const j = await r.json();
    if (j.error) { setStatus(j.error); return; }
    setQr(j.qrPng); setLink(j.next); setUuid(j.uuid);
    poll(j.uuid);
  };

  const refreshBalance = async () => {
    if (!account) return;
    const r = await fetch(`${API}/wallets/xrpl/balance/${account}`);
    const j = await r.json();
    if (!j.error) setBalance(j);
  };

  useEffect(() => {
    (async () => {
      try { const net = await fetch(`${API}/xrpl/network`).then(r=>r.json()); setNetwork(net.network); } catch {}
      try { const i = await fetch(`${API}/issuer`).then(r=>r.json()); setIssuer(i); } catch {}
    })();
    return () => clearInterval(pollRef.current);
  }, []);

  useEffect(() => { refreshBalance(); }, [account]);

  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>Join Unykorn</h1>
      {network && <p style={{ opacity: 0.7 }}>XRPL Network: {network}</p>}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <h3>Connect</h3>
          <button onClick={start}>Connect with Xumm</button>
          {qr && (
            <div style={{ marginTop: 8 }}>
              <img alt="qr" src={qr} style={{ maxWidth: 240 }} />
              <div><a href={link} target="_blank" rel="noreferrer">Open in Xumm</a></div>
            </div>
          )}
          {account && <p>Account: <span style={{ fontFamily: 'monospace' }}>{account}</span></p>}
          {balance && <p>Balance: {balance.xrp} XRP</p>}
        </div>
        <div>
          <h3>Fund (devnet)</h3>
          <button disabled={!account || network === 'mainnet'} onClick={faucet}>Faucet 20 XRP</button>
        </div>
        <div>
          <h3>Trustline</h3>
          <button disabled={!account || !issuer} onClick={trust}>Trust UNZ</button>
        </div>
      </div>
      <p style={{ marginTop: 24 }}><a href="/">← Back</a></p>
    </main>
  );
}
