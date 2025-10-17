import { useEffect, useState } from 'react';

const API = 'http://localhost:4000';

export default function Holders() {
  const [tokens, setTokens] = useState([]);
  const [selected, setSelected] = useState('');
  const [data, setData] = useState(null);
  const [includeZero, setIncludeZero] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const res = await fetch(API + '/tokens');
      const list = await res.json();
      setTokens(list);
      if (list.length) setSelected(list[0].id);
    })();
  }, []);

  const load = async () => {
    if (!selected) return;
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API}/tokens/${selected}/holders?includeZero=${includeZero}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      setData(json);
    } catch (e) {
      setError(e.message || 'Failed to load');
    } finally { setLoading(false); }
  };

  useEffect(() => { if (selected) load(); }, [selected, includeZero]);

  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>Holders</h1>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <label>Token:</label>
        <select value={selected} onChange={e => setSelected(e.target.value)}>
          {tokens.map(t => (
            <option key={t.id} value={t.id}>{t.code} — {t.name}</option>
          ))}
        </select>
        <button onClick={load} disabled={!selected || loading}>{loading ? 'Loading…' : 'Refresh'}</button>
        <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={includeZero} onChange={e => setIncludeZero(e.target.checked)} /> include zero-balances
        </label>
      </div>
      {error && <div style={{ color: 'crimson' }}>{error}</div>}
      {data && (
        <div>
          <div style={{ marginBottom: 8 }}>
            Issuer: <span style={{ fontFamily: 'monospace' }}>{data.issuer}</span> · Currency: {typeof data.currency === 'object' ? (
              <span title={data.currency.hex || ''}>{data.currency.human}{data.currency.hex ? ' (hex)' : ''}</span>
            ) : data.currency} · Count: {data.count}
          </div>
          <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 1000 }}>
            <thead>
              <tr>
                <th align="left">Holder</th>
                <th align="right">Balance</th>
                <th align="right">Limit</th>
                <th align="left">Flags</th>
              </tr>
            </thead>
            <tbody>
              {(data.holders || []).map((h, i) => (
                <tr key={h.holder + '-' + i}>
                  <td style={{ fontFamily: 'monospace' }}>{h.holder}</td>
                  <td align="right">{h.balance}</td>
                  <td align="right">{h.limit}</td>
                  <td>{h.no_ripple ? 'no_ripple' : ''}</td>
                </tr>
              ))}
              {!data.holders?.length && (
                <tr><td colSpan={4} style={{ opacity: 0.7 }}>No holders yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
      <p style={{ marginTop: 24 }}><a href="/">← Back</a></p>
    </main>
  );
}
