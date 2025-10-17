import { useEffect, useMemo, useState } from 'react';

export default function Finance() {
  const [spaces, setSpaces] = useState([]);
  const [spaceId, setSpaceId] = useState('');
  const [wallets, setWallets] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [trust, setTrust] = useState({ seed: '', currency: 'USD', issuer: '', limit: '1000000' });
  const [balances, setBalances] = useState({});
  const [createMsg, setCreateMsg] = useState('');
  const [createBusy, setCreateBusy] = useState(false);
  const [sendForm, setSendForm] = useState({ seed: '', destination: '', drops: '1000000', memos: '' });
  const [sendBusy, setSendBusy] = useState(false);
  const [sendMsg, setSendMsg] = useState('');

  useEffect(() => {
    (async () => {
      const r = await fetch('http://localhost:4000/spaces');
      const j = await r.json();
      setSpaces(j);
      if (j.length && !spaceId) setSpaceId(j[0].id);
    })();
  }, []);

  useEffect(() => {
    if (!spaceId) return;
    (async () => {
      const r = await fetch(`http://localhost:4000/wallets?spaceId=${spaceId}`);
      const j = await r.json();
      setWallets(j);
    })();
  }, [spaceId]);

  // fetch balances for XRPL wallets
  useEffect(() => {
    (async () => {
      const xrpls = wallets.filter(w => w.chain === 'xrpl');
      const out = {};
      for (const w of xrpls) {
        try {
          const r = await fetch(`http://localhost:4000/wallets/xrpl/balance/${w.address}`);
          const j = await r.json();
          out[w.id] = { xrp: j.xrp ?? 0 };
        } catch {}
      }
      setBalances(out);
    })();
  }, [wallets]);

  const createXrplWallet = async () => {
    if (!spaceId) { setCreateMsg('Select a space'); return; }
    setCreateBusy(true); setCreateMsg('');
    try {
      const r = await fetch('http://localhost:4000/wallets/xrpl/new', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ spaceId, label: 'XRPL Primary' })
      });
      const j = await r.json();
      if (!r.ok || j.error) throw new Error(j.error || 'Failed to create wallet');
      setCreateMsg(`Created ${j.wallet.address}. Save seed now: ${j.secrets.seed}`);
      // refresh wallets list
      const r2 = await fetch(`http://localhost:4000/wallets?spaceId=${spaceId}`);
      setWallets(await r2.json());
    } catch (e) {
      setCreateMsg(e.message || 'Create failed');
    } finally { setCreateBusy(false); }
  };

  const sendXrp = async () => {
    const memos = sendForm.memos ? sendForm.memos.split('\n').map(s=>s.trim()).filter(Boolean) : [];
    setSendBusy(true); setSendMsg('');
    try {
      const r = await fetch('http://localhost:4000/wallets/xrpl/payment', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: sendForm.seed, destination: sendForm.destination, drops: sendForm.drops, memos })
      });
  const j = await r.json();
  if (!r.ok || j.error) throw new Error(j.error || 'Payment failed');
  const ok = (j.engine_result || j?.raw?.result?.meta?.TransactionResult) === 'tesSUCCESS';
  setSendMsg(ok ? `tesSUCCESS ${j.hash || ''}` : (j.engine_result || 'Submitted'));
      // refresh balance for destination
      try {
        const r2 = await fetch(`http://localhost:4000/wallets/xrpl/balance/${sendForm.destination}`);
        const j2 = await r2.json();
        const w = wallets.find(w => w.address === sendForm.destination);
        if (w) setBalances(s => ({ ...s, [w.id]: { xrp: j2.xrp ?? 0 } }));
      } catch {}
    } catch (e) {
      setSendMsg(e.message || 'Send failed');
    } finally { setSendBusy(false); }
  };

  const faucet = async (address) => {
    setBusy(true); setMsg('');
    try {
      const r = await fetch('http://localhost:4000/wallets/xrpl/faucet', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      });
  const j = await r.json();
  setMsg(j.funded ? 'Faucet funded (dev/test)' : (j.note || 'Faucet not available'));
      // refresh balance
      const r2 = await fetch(`http://localhost:4000/wallets/xrpl/balance/${address}`);
      const j2 = await r2.json();
      const w = wallets.find(w => w.address === address);
      if (w) setBalances(s => ({ ...s, [w.id]: { xrp: j2.xrp ?? 0 } }));
    } catch (e) {
      setMsg(e.message || 'Faucet failed');
    } finally { setBusy(false); }
  };

  const setTrustline = async () => {
    const { seed, currency, issuer, limit } = trust;
    if (!seed || !currency || !issuer) { setMsg('Missing trustline fields'); return; }
    setBusy(true); setMsg('');
    try {
      const r = await fetch('http://localhost:4000/wallets/xrpl/trustline', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed, currency, issuer, limit })
      });
  const j = await r.json();
  const ok = (j.engine_result || j?.raw?.result?.meta?.TransactionResult) === 'tesSUCCESS';
  setMsg(ok ? `tesSUCCESS ${j.hash || ''}` : (j.engine_result || 'Submitted'));
    } catch (e) {
      setMsg(e.message || 'Trustline failed');
    } finally { setBusy(false); }
  };

  return (
    <main style={{padding:24, fontFamily:'ui-sans-serif, system-ui'}}>
      <h1>Finance</h1>
      <p>Manage XRPL wallets per Space. Faucet and trustlines are available on dev/test networks.</p>

      <div style={{display:'flex', gap:12, alignItems:'center', marginBottom:12}}>
        <label>Space:</label>
        <select value={spaceId} onChange={e=>setSpaceId(e.target.value)}>
          {spaces.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <a href="/">← Back</a>
      </div>

      <h2>Wallets</h2>
      <div style={{marginBottom:12}}>
        <button onClick={createXrplWallet} disabled={createBusy || !spaceId}>{createBusy ? '...' : 'Create XRPL Wallet'}</button>
        {createMsg && <p style={{marginTop:8, color:'#0a0'}}>{createMsg}</p>}
      </div>
      <table style={{borderCollapse:'collapse', width:'100%', maxWidth:1000}}>
        <thead>
          <tr><th align="left">Label</th><th align="left">Chain</th><th align="left">Address</th><th align="left">XRPL XRP</th><th align="left">Actions</th></tr>
        </thead>
        <tbody>
          {wallets.map(w => (
            <tr key={w.id}>
              <td>{w.label}</td>
              <td>{w.chain}</td>
              <td style={{fontFamily:'monospace'}}>{w.address}</td>
              <td>{w.chain==='xrpl' ? ((balances[w.id]?.xrp) ?? 0) : '-'}</td>
              <td>
                {w.chain==='xrpl' && (
                  <button disabled={busy} onClick={() => faucet(w.address)}>
                    {busy ? '...' : 'Faucet (dev/test)'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{marginTop:24}}>Set Trustline (XRPL)</h2>
      <div style={{display:'grid', gap:10, maxWidth:640}}>
        <input placeholder="Seed (dev only)" value={trust.seed} onChange={e=>setTrust({...trust, seed:e.target.value})}/>
        <div style={{display:'flex', gap:10}}>
          <input placeholder="Currency (e.g., USD)" value={trust.currency} onChange={e=>setTrust({...trust, currency:e.target.value})}/>
          <input placeholder="Issuer address" value={trust.issuer} onChange={e=>setTrust({...trust, issuer:e.target.value})}/>
          <input placeholder="Limit (e.g., 1000000)" value={trust.limit} onChange={e=>setTrust({...trust, limit:e.target.value})}/>
        </div>
        <button disabled={busy} onClick={setTrustline}>{busy ? '...' : 'Set Trustline'}</button>
        {msg && <p>{msg}</p>}
      </div>

      <h2 style={{marginTop:24}}>Send XRP (dev)</h2>
      <div style={{display:'grid', gap:10, maxWidth:640}}>
        <input placeholder="Seed (dev only)" value={sendForm.seed} onChange={e=>setSendForm({...sendForm, seed:e.target.value})}/>
        <div style={{display:'flex', gap:10}}>
          <input placeholder="Destination address" value={sendForm.destination} onChange={e=>setSendForm({...sendForm, destination:e.target.value})}/>
          <input placeholder="Drops (1 XRP = 1,000,000)" value={sendForm.drops} onChange={e=>setSendForm({...sendForm, drops:e.target.value})}/>
        </div>
        <textarea placeholder="Memos (one per line)" value={sendForm.memos} onChange={e=>setSendForm({...sendForm, memos:e.target.value})} rows={3}/>
        <button onClick={sendXrp} disabled={sendBusy}>{sendBusy ? '...' : 'Send XRP'}</button>
        {sendMsg && <p>{sendMsg}</p>}
      </div>
    </main>
  );
}
