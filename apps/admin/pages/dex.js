import { useEffect, useMemo, useState } from 'react';

const API = 'http://localhost:4000';

export default function Dex() {
  const [tokens, setTokens] = useState([]);
  const [base, setBase] = useState('XRP');
  const [quote, setQuote] = useState('');
  const [book, setBook] = useState(null);
  const [seed, setSeed] = useState('');
  const [side, setSide] = useState('buy');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [status, setStatus] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch(API + '/tokens');
      const list = await res.json();
      setTokens(list);
      if (list[0]) setQuote(`${list[0].code}:${list[0].issuer.coldAddress}`);
    })();
  }, []);

  const load = async () => {
    setStatus('');
    const url = `${API}/dex/book?base=${encodeURIComponent(base)}&quote=${encodeURIComponent(quote)}`;
    const res = await fetch(url);
    const json = await res.json();
    setBook(json);
  };

  useEffect(() => { if (quote) load(); }, [base, quote]);

  const createOffer = async () => {
    setStatus('Submitting…');
    try {
      const res = await fetch(API + '/dex/offer/create', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed, base, quote, side, amount, price })
      });
      const out = await res.json();
      const ok = out.engine_result === 'tesSUCCESS' || out?.raw?.result?.meta?.TransactionResult === 'tesSUCCESS';
      setStatus(ok ? 'tesSUCCESS' : JSON.stringify(out));
      await load();
    } catch (e) { setStatus(e.message || 'OfferCreate failed'); }
  };

  const bids = useMemo(() => book?.bids || book?.offers?.filter(o => Number(o.quality) < 1) || [], [book]);
  const asks = useMemo(() => book?.asks || book?.offers?.filter(o => Number(o.quality) >= 1) || [], [book]);

  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>DEX</h1>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label>Base</label>
        <input value={base} onChange={e => setBase(e.target.value)} style={{ width: 120 }} />
        <label>Quote</label>
        <select value={quote} onChange={e => setQuote(e.target.value)}>
          {tokens.map(t => (
            <option key={t.id} value={`${t.code}:${t.issuer.coldAddress}`}>{t.code}:{t.issuer.coldAddress.slice(0,8)}…</option>
          ))}
        </select>
        <button onClick={load}>Refresh Book</button>
      </div>

      <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <h3>Asks</h3>
          <pre style={{ background: '#f7f7f7', padding: 8, maxHeight: 240, overflow: 'auto' }}>{JSON.stringify(asks, null, 2)}</pre>
        </div>
        <div>
          <h3>Bids</h3>
          <pre style={{ background: '#f7f7f7', padding: 8, maxHeight: 240, overflow: 'auto' }}>{JSON.stringify(bids, null, 2)}</pre>
        </div>
      </div>

      <h2 style={{ marginTop: 24 }}>Create Offer (dev)</h2>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <label>Seed</label><input value={seed} onChange={e => setSeed(e.target.value)} style={{ width: 280 }} placeholder="dev seed" />
        <label>Side</label>
        <select value={side} onChange={e => setSide(e.target.value)}>
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
        </select>
        <label>Amount</label><input value={amount} onChange={e => setAmount(e.target.value)} style={{ width: 100 }} />
        <label>Price</label><input value={price} onChange={e => setPrice(e.target.value)} style={{ width: 100 }} />
        <button onClick={createOffer}>Submit</button>
        <span>{status}</span>
      </div>

      <p style={{ marginTop: 24 }}><a href="/">← Back</a></p>
    </main>
  );
}
