import { useEffect, useState } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';

const API = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function FundIssuer() {
  const [issuer, setIssuer] = useState(null);
  const [coldQr, setColdQr] = useState('');
  const [hotQr, setHotQr] = useState('');
  const [copied, setCopied] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const j = await fetch(`${API}/issuer`).then(r => r.ok ? r.json() : null);
        if (j && j.coldAddress && j.hotAddress) setIssuer(j);
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!issuer) return;
      try {
        const opts = { errorCorrectionLevel: 'M', margin: 2, scale: 6, color: { dark: '#111111', light: '#FFFFFF' } };
        setColdQr(await QRCode.toDataURL(issuer.coldAddress, opts));
        setHotQr(await QRCode.toDataURL(issuer.hotAddress, opts));
      } catch {}
    })();
  }, [issuer]);

  const copy = async (txt) => {
    try { await navigator.clipboard.writeText(txt); setCopied(txt); setTimeout(() => setCopied(''), 1200); } catch {}
  };

  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>Fund Issuer</h1>
      <p style={{ color:'#475467' }}>Scan a QR to fund the issuer wallets. Fund <b>Cold</b> first, then <b>Hot</b>.</p>

      {!issuer && (
        <p style={{ color:'#6b7280' }}>Loading issuer… Ensure your API has an issuer configured.</p>
      )}

      {issuer && (
        <div style={{ display:'grid', gap:24, gridTemplateColumns:'repeat(auto-fit, minmax(260px, 1fr))', alignItems:'start' }}>
          <WalletCard label="Cold (treasury)" address={issuer.coldAddress} qr={coldQr} onCopy={copy} copied={copied === issuer.coldAddress} />
          <WalletCard label="Hot (signer)" address={issuer.hotAddress} qr={hotQr} onCopy={copy} copied={copied === issuer.hotAddress} />
        </div>
      )}

      <p style={{ marginTop: 24 }}><Link href="/">← Back</Link></p>
    </main>
  );
}

function WalletCard({ label, address, qr, onCopy, copied }) {
  const short = (a) => `${a.slice(0,6)}…${a.slice(-4)}`;
  return (
    <section style={{ border:'1px solid #e5e7eb', borderRadius:12, padding:16 }}>
      <h3 style={{ marginTop:0 }}>{label}</h3>
      {qr ? (
        <img src={qr} alt={`${label} QR`} style={{ width:220, height:220, imageRendering:'pixelated', background:'#fff', borderRadius:8, border:'1px solid #f3f4f6' }} />
      ) : (
        <div style={{ width:220, height:220, display:'grid', placeItems:'center', background:'#fafafa', border:'1px solid #f3f4f6', borderRadius:8 }}>Generating…</div>
      )}
      <div style={{ marginTop:12, fontFamily:'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize:12, wordBreak:'break-all' }}>{address}</div>
      <div style={{ marginTop:10, display:'flex', gap:8, flexWrap:'wrap' }}>
        <button onClick={() => onCopy(address)} style={btn()}>{copied ? 'Copied ✓' : `Copy ${short(address)}`}</button>
        {qr && (
          <a href={qr} download={`${label.replace(/\s+/g,'_').toLowerCase()}_qr.png`} style={linkBtn()}>Download PNG</a>
        )}
      </div>
    </section>
  );
}

function btn(){ return { background:'#111827', color:'#fff', border:'none', borderRadius:8, padding:'6px 10px', cursor:'pointer' }; }
function linkBtn(){ return { background:'#f3f4f6', color:'#111827', border:'1px solid #e5e7eb', borderRadius:8, padding:'6px 10px', textDecoration:'none' }; }
