import { useEffect, useState } from 'react';

export default function Issuer() {
  const [issuer, setIssuer] = useState(null);
  const [org, setOrg] = useState('Unykorn 7777');
  const [domain, setDomain] = useState('unykorn.org');
  const [resp, setResp] = useState(null);

  useEffect(() => { fetch('http://localhost:4000/issuer').then(r => r.json()).then(setIssuer); }, []);
  const init = async () => {
    const r = await fetch('http://localhost:4000/issuer/init', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ org, domain })
    });
    const j = await r.json(); setResp(j); setIssuer(j.issuer);
  };

  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>Issuer Setup</h1>
      {issuer ? (
        <div>
          <p><b>Org:</b> {issuer.org}</p>
          <p><b>Cold:</b> {issuer.coldAddress}</p>
          <p><b>Hot:</b> {issuer.hotAddress}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8, maxWidth: 480 }}>
          <input value={org} onChange={e => setOrg(e.target.value)} placeholder="Org" />
          <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="Domain (optional)" />
          <button onClick={init}>Initialize Issuer (dev/test)</button>
        </div>
      )}
      {resp?.secrets && <pre style={{ background:'#f6f6f6', padding:12, marginTop:12 }}>{JSON.stringify(resp.secrets, null, 2)}</pre>}
    </main>
  );
}
