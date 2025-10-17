import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function Events() {
  const [items, setItems] = useState([]);
  const [type, setType] = useState('');
  const [account, setAccount] = useState('');
  const [limit, setLimit] = useState(100);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true); setError('');
    try {
      const qs = new URLSearchParams();
      if (type) qs.set('type', type);
      if (account) qs.set('account', account);
      if (limit) qs.set('limit', String(limit));
      const r = await fetch(`${API}/events?${qs.toString()}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed');
      setItems(j);
    } catch (e) { setError(e.message || 'Error'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>Recent Events</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <input placeholder="type (e.g., xumm_signin, issue)" value={type} onChange={e=>setType(e.target.value)} />
        <input placeholder="account" value={account} onChange={e=>setAccount(e.target.value)} style={{width:380}}/>
        <input placeholder="limit" type="number" value={limit} onChange={e=>setLimit(Number(e.target.value))} style={{width:100}}/>
        <button onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button>
      </div>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      <div style={{ display:'grid', gap:8 }}>
        {items.map(e => (
          <div key={e.id} style={{ border:'1px solid #eee', padding:12 }}>
            <div style={{ fontSize:12, color:'#475467' }}>{new Date(e.createdAt).toLocaleString()} · {e.type} · {e.route}</div>
            <div style={{ fontFamily:'monospace', fontSize:13 }}>acct={e.account} dest={e.destination} tok={e.tokenId} cur={e.currency} val={e.value}</div>
            {(e.hash || e.engineResult) && <div style={{ fontFamily:'monospace', fontSize:13 }}>hash={e.hash} res={e.engineResult}</div>}
          </div>
        ))}
      </div>
    </main>
  );
}
