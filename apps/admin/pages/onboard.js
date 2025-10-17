import { useEffect, useRef, useState } from 'react';

const API = 'http://localhost:4000';

export default function Onboard() {
  const [account, setAccount] = useState('');
  const [qr, setQr] = useState('');
  const [link, setLink] = useState('');
  const [tQr, setTQr] = useState('');
  const [tLink, setTLink] = useState('');
  const [status, setStatus] = useState('');
  const [network, setNetwork] = useState('');
  const [balance, setBalance] = useState({ xrp: 0, issued: [] });
  const [issuer, setIssuer] = useState(null);
  const [tokens, setTokens] = useState([]);
  const [issueTokenId, setIssueTokenId] = useState('');
  const [issueValue, setIssueValue] = useState('10');
  const [hotSeed, setHotSeed] = useState('');
  const [txHash, setTxHash] = useState('');
  const pollRef = useRef(null);

  const poll = async (uuid, cb) => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(async () => {
      try {
        const r = await fetch(`${API}/onboard/result/${uuid}`);
        const j = await r.json();
        if (j.signed) {
          clearInterval(pollRef.current);
          cb(j);
        }
      } catch {}
    }, 1500);
  };

  const connect = async () => {
    setStatus(''); setTxHash('');
    setAccount(''); setQr(''); setLink('');
    const r = await fetch(`${API}/onboard/start`, { method: 'POST' });
    const j = await r.json();
    if (j.error) { setStatus(j.error); return; }
    setQr(j.qrPng); setLink(j.next);
    poll(j.uuid, async (out) => {
      const acc = out.account || '';
      setAccount(acc);
      setStatus('Connected');
      if (acc) await refreshBalance(acc);
    });
  };

  const trust = async () => {
    setStatus(''); setTxHash(''); setTQr(''); setTLink('');
    const issuerAddr = issuer?.coldAddress || (await fetch(`${API}/issuer`).then(r=>r.json()).then(j=>j?.coldAddress));
    if (!issuerAddr) { setStatus('Issuer not initialized'); return; }
    const r = await fetch(`${API}/onboard/trustline`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ currency: 'UNZ', issuer: issuerAddr, limit: '1000000' }) });
    const j = await r.json();
    if (j.error) { setStatus(j.error); return; }
    setTQr(j.qrPng); setTLink(j.next);
    poll(j.uuid, async (out) => {
      setStatus(out.txid ? `Trustline set.` : 'Done');
      setTxHash(out.txid || '');
      if (account) await refreshBalance(account);
    });
  };

  const refreshBalance = async (addr) => {
    if (!addr) return;
    try {
      const r = await fetch(`${API}/wallets/xrpl/balance/${addr}`);
      const j = await r.json();
      if (!j.error) setBalance(j);
    } catch {}
  };

  const fund = async () => {
    if (!account) return;
    setStatus(''); setTxHash('');
    try {
      const r = await fetch(`${API}/wallets/xrpl/faucet`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ address: account }) });
      const j = await r.json();
      if (j?.result?.payment?.result) {
        const eng = j.result.payment.result?.engine_result ?? j.result.payment?.engine_result ?? j.result.payment?.result?.meta?.TransactionResult;
        const hash = j.result.payment.result?.tx_json?.hash ?? j.result.payment.result?.hash;
        setStatus(`Funded: ${eng || ''}`);
        setTxHash(hash || '');
      } else if (j?.funded === false) {
        setStatus(j.note || 'Faucet not available');
      } else if (j.error) {
        setStatus(j.error);
      }
      await refreshBalance(account);
    } catch (e) {
      setStatus('Faucet failed');
    }
  };

  const issue = async () => {
    if (!account || !issueTokenId || !hotSeed) { setStatus('Missing fields'); return; }
    setStatus(''); setTxHash('');
    try {
      const r = await fetch(`${API}/tokens/${issueTokenId}/issue`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ seed: hotSeed, destination: account, value: issueValue || '10' }) });
      const j = await r.json();
      if (j.error) { setStatus(j.error); return; }
      setStatus(j.engine_result || 'Submitted');
      setTxHash(j.hash || '');
      await refreshBalance(account);
    } catch {
      setStatus('Issue failed');
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const net = await fetch(`${API}/xrpl/network`).then(r=>r.json()).catch(()=>null);
        if (net?.network) setNetwork(net.network);
      } catch {}
      try {
        const i = await fetch(`${API}/issuer`).then(r=>r.json()).catch(()=>null);
        if (i) setIssuer(i);
      } catch {}
      try {
        const t = await fetch(`${API}/tokens`).then(r=>r.json()).catch(()=>[]);
        setTokens(Array.isArray(t) ? t : []);
        if (Array.isArray(t) && t.length) setIssueTokenId(t[0].id);
      } catch {}
    })();
    return () => clearInterval(pollRef.current);
  }, []);

  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>Onboard (Xumm)</h1>
      {network && <p style={{ opacity: 0.7 }}>XRPL Network: {network}</p>}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        <div>
          <h3>1) Connect</h3>
          <button onClick={connect}>Connect with Xumm</button>
          {qr && (
            <div style={{ marginTop: 8 }}>
              <img alt="qr" src={qr} style={{ maxWidth: 240 }} />
              <div><a href={link} target="_blank" rel="noreferrer">Open in Xumm</a></div>
            </div>
          )}
          {account && <p>Account: <span style={{ fontFamily: 'monospace' }}>{account}</span></p>}
          {account && (
            <div style={{ marginTop: 8, fontSize: 14 }}>
              <div>Balance: {balance.xrp} XRP</div>
              {balance.issued?.length ? (
                <div style={{ marginTop: 4 }}>
                  <div>Issued Lines:</div>
                  <ul>
                    {balance.issued.map((l, idx) => (
                      <li key={idx}>{l.currency}:{l.issuer.slice(0,6)}… — {l.balance}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </div>

        <div>
          <h3>2) Trustline</h3>
          <button onClick={trust} disabled={!account}>Add Trustline (UNZ)</button>
          {tQr && (
            <div style={{ marginTop: 8 }}>
              <img alt="qr2" src={tQr} style={{ maxWidth: 240 }} />
              <div><a href={tLink} target="_blank" rel="noreferrer">Open in Xumm</a></div>
            </div>
          )}
        </div>

        <div>
          <h3>Dev: Fund XRP</h3>
          <button onClick={fund} disabled={!account || network === 'mainnet'}>Fund (dev faucet)</button>
          {network === 'mainnet' && <div style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>Hidden on mainnet</div>}
        </div>

        <div>
          <h3>3) Issue Welcome Amount</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 280 }}>
            <label>
              Token:
              <select value={issueTokenId} onChange={e=>setIssueTokenId(e.target.value)} style={{ marginLeft: 8 }}>
                {tokens.map(t => (<option key={t.id} value={t.id}>{t.code} — {t.name}</option>))}
              </select>
            </label>
            <label>
              Value: <input value={issueValue} onChange={e=>setIssueValue(e.target.value)} placeholder="10" />
            </label>
            <label>
              Hot Seed: <input value={hotSeed} onChange={e=>setHotSeed(e.target.value)} placeholder="s████…" />
            </label>
            <button onClick={issue} disabled={!account || !issueTokenId}>Issue</button>
          </div>
        </div>
      </div>
      {(status || txHash) && (
        <div style={{ marginTop: 12 }}>
          {status && <p style={{ margin: 0 }}>{status}</p>}
          {txHash && <p style={{ margin: 0 }}>Tx: <span style={{ fontFamily: 'monospace' }}>{txHash}</span></p>}
        </div>
      )}

      <p style={{ marginTop: 24 }}><a href="/">← Back</a></p>
    </main>
  );
}
