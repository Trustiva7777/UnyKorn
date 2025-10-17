import Head from 'next/head';
import Link from 'next/link';

export default function Products() {
  const BRAND = process.env.NEXT_PUBLIC_BRAND || 'Unykorn';
  return (
    <>
      <Head>
        <title>{`${BRAND} — Products`}</title>
      </Head>
      <main style={{ fontFamily: 'ui-sans-serif, system-ui', padding: 24, lineHeight: 1.6 }}>
        <h1>Products</h1>
        <ul>
          <li>
            <strong>Trustiva Wallet Portal</strong> — A client-facing wallet-like site using Xumm for sign-in, trustlines, and funding.
            <div><Link href="/connect">Open Trustiva</Link></div>
          </li>
          <li>
            <strong>XRPL Issuer Toolkit</strong> — Flags, trustlines, issuance, and reporting (CSV exports, TOML) via our API.
          </li>
          <li>
            <strong>DNS + Deployment Automation</strong> — Scripts for GoDaddy and Cloudflare to wire GitHub Pages and API records.
          </li>
        </ul>
      </main>
    </>
  );
}
