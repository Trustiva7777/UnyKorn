import { useEffect, useState } from 'react';

export default function Wallets() {
  const [addr, setAddr] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');

  const check = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const r = await fetch(`http://localhost:4000/wallets/xrpl/balance/${addr}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || 'Failed');
      setResult(j);
    } catch (e:any) {
      setError(e.message || 'Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>XRPL Wallets</h1>
      <div style={{ display: 'flex', gap: 8 }}>
        <input placeholder="classic address" value={addr} onChange={e=>setAddr(e.target.value)} style={{width:420}}/>
        <button onClick={check} disabled={!addr || loading}>{loading ? 'Checking…' : 'Check Balance'}</button>
      </div>
      {error && <p style={{ color: 'crimson' }}>{error}</p>}
      {result && <pre style={{ background:'#f6f6f6', padding:12, marginTop:12 }}>{JSON.stringify(result, null, 2)}</pre>}
      <p style={{marginTop:24}}><a href="/">← Back</a></p>
    </main>
  );
}
