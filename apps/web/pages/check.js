import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function SystemCheck() {
  const [res, setRes] = useState({});
  const [loading, setLoading] = useState(false);

  const probe = async (path, opts={}) => {
    const url = `${API}${path}`;
    try {
      const r = await fetch(url, opts);
      const ct = r.headers.get('content-type') || '';
      const data = ct.includes('application/json') ? await r.json() : await r.text();
      return { ok: r.ok, url, data, status: r.status };
    } catch (e) {
      return { ok:false, url, error:String(e) };
    }
  };

  const run = async () => {
    setLoading(true);
    const checks = await Promise.all([
      probe('/health'),
      probe('/public/config'),
      probe('/xumm/ping'),
      probe('/issuer'),
      probe('/tokens'),
      probe('/.well-known/xrp-ledger.toml')
    ]);
    setRes({
      health: checks[0],
      config: checks[1],
      xumm:   checks[2],
      issuer: checks[3],
      tokens: checks[4],
      toml:   checks[5],
    });
    setLoading(false);
  };

  useEffect(() => { run(); }, []);

  const Dot = ({ok}) => (
    <span style={{
      display:'inline-block', width:10, height:10, borderRadius:999,
      background: ok ? '#16a34a' : '#ef4444', marginRight:8
    }} />
  );

  const Row = ({label, item}) => (
    <div style={{ display:'grid', gridTemplateColumns:'20px 140px 1fr', gap:12,
                  padding:'8px 0', borderBottom:'1px solid #eee' }}>
      <Dot ok={!!item?.ok} />
      <strong>{label}</strong>
      <div style={{ fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize:12, overflowX:'auto' }}>
        <div style={{ opacity:0.7 }}>{item?.url}</div>
        <div>Status: {item?.status ?? '-'}</div>
        {item?.error && <div style={{ color:'#ef4444' }}>{item.error}</div>}
        {item?.data && (
          <pre style={{ whiteSpace:'pre-wrap', margin:0, background:'#fafafa', padding:8, borderRadius:6 }}>
            {typeof item.data === 'string' ? item.data.slice(0,600) : JSON.stringify(item.data, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );

  const cfg = res.config?.data || {};
  const issuer = res.issuer?.data || {};
  const xummName = res.xumm?.data?.application?.name || (cfg.xummConfigured ? 'Configured' : 'Not configured');

  return (
    <main style={{ padding:24, maxWidth:960, margin:'0 auto' }}>
      <h1 style={{ marginBottom:4 }}>System Check</h1>
      <p style={{ color:'#475467', marginTop:0 }}>Quick probes for API, Xumm, issuer & token registry.</p>
      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        <button onClick={run} disabled={loading}
                style={{ padding:'8px 12px', borderRadius:8, background:'#111827', color:'#fff' }}>
          {loading ? 'Running…' : 'Run checks'}
        </button>
        <a href="/status" style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #e5e7eb' }}>Status</a>
        <a href="/wallet" style={{ padding:'8px 12px', borderRadius:8, border:'1px solid #e5e7eb' }}>Wallet</a>
      </div>

      <section style={{ margin:'12px 0', padding:12, border:'1px solid #eee', borderRadius:8 }}>
        <div style={{ fontSize:14, marginBottom:8 }}>
          <strong>Network:</strong> {cfg.networkLabel || 'unknown'} &nbsp;|&nbsp; <strong>Xumm:</strong> {xummName}
        </div>
        {issuer?.coldAddress && issuer?.hotAddress && (
          <div style={{ display:'flex', gap:12, flexWrap:'wrap', fontSize:14 }}>
            <CopyField label="Cold" value={issuer.coldAddress} />
            <CopyField label="Hot" value={issuer.hotAddress} />
          </div>
        )}
      </section>

      <Row label="Health" item={res.health} />
      <Row label="Config" item={res.config} />
      <Row label="Xumm" item={res.xumm} />
      <Row label="Issuer" item={res.issuer} />
      <Row label="Tokens" item={res.tokens} />
      <Row label="TOML" item={res.toml} />
    </main>
  );
}

function CopyField({label, value}) {
  const [ok, setOk] = useState(false);
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
      <span>{label}:</span>
      <code>{value.slice(0,6)}…{value.slice(-4)}</code>
      <button
        onClick={async () => { await navigator.clipboard.writeText(value); setOk(true); setTimeout(()=>setOk(false), 1000); }}
        style={{ padding:'4px 8px', border:'1px solid #e5e7eb', borderRadius:6, background:'#fff' }}
        title={value}
      >
        {ok ? 'Copied ✓' : 'Copy'}
      </button>
    </div>
  );
}
