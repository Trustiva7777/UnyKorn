import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  const BRAND = process.env.NEXT_PUBLIC_BRAND || 'Unykorn';
  return (
    <>
      <Head>
        <title>{`${BRAND} — Digital Assets & Wallet`}</title>
      </Head>
      <main style={{ fontFamily: 'ui-sans-serif, system-ui', padding: 24, lineHeight: 1.6 }}>
        <h1>{BRAND}</h1>
        <p style={{ color:'#475467', maxWidth: 820 }}>
          Unykorn provides the full stack for digital assets and XRPL onboarding. Trustiva is our customer-facing wallet portal where clients connect with Xumm, fund on dev/test networks, manage trustlines, and view status.
        </p>
        <div style={{ display:'flex', gap: 12, flexWrap:'wrap', marginTop: 16 }}>
          <Link href="/connect" style={{ background:'#111827', color:'#fff', padding:'10px 14px', borderRadius:8, textDecoration:'none' }}>Open Wallet (Trustiva)</Link>
          <Link href="/company" style={{ padding:'10px 14px', border:'1px solid #e5e7eb', borderRadius:8 }}>Company</Link>
          <Link href="/products" style={{ padding:'10px 14px', border:'1px solid #e5e7eb', borderRadius:8 }}>Products</Link>
          <Link href="/status" style={{ padding:'10px 14px', border:'1px solid #e5e7eb', borderRadius:8 }}>Status</Link>
        </div>
        <div style={{ marginTop: 28 }}>
          <h3>Quick Links</h3>
          <ul>
            <li><Link href="/wallet">Wallet</Link></li>
            <li><Link href="/join">Onboard (Xumm)</Link></li>
            <li><Link href="/fund">Fund (Dev/Test)</Link></li>
          </ul>
        </div>
      </main>
    </>
  );
}
