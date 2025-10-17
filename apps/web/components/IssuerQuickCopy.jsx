import { useEffect, useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function IssuerQuickCopy() {
  const [issuer, setIssuer] = useState(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await fetch(`${API}/issuer`);
        if (!res.ok) return;
        const j = await res.json();
        if (mounted && j && j.coldAddress && j.hotAddress) setIssuer(j);
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  const copy = async (label, value) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(label);
      setTimeout(() => setCopied(''), 1200);
    } catch {}
  };

  if (!issuer) return null;

  const short = (a) => `${a.slice(0,6)}…${a.slice(-4)}`;

  return (
    <div style={{ display:'flex', gap:8, alignItems:'center', fontSize:12 }}>
      <span style={{ opacity:0.7 }}>Issuer:</span>
      <button onClick={() => copy('cold', issuer.coldAddress)}
              title={issuer.coldAddress}
              style={{ padding:'4px 8px', borderRadius:6, border:'1px solid #e5e7eb', background:'#fff' }}>
        Cold {short(issuer.coldAddress)} {copied==='cold' ? '✓' : '⧉'}
      </button>
      <button onClick={() => copy('hot', issuer.hotAddress)}
              title={issuer.hotAddress}
              style={{ padding:'4px 8px', borderRadius:6, border:'1px solid #e5e7eb', background:'#fff' }}>
        Hot {short(issuer.hotAddress)} {copied==='hot' ? '✓' : '⧉'}
      </button>
    </div>
  );
}
