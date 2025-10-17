import Head from 'next/head';
import Link from 'next/link';

export default function Company() {
  const BRAND = process.env.NEXT_PUBLIC_BRAND || 'Unykorn';
  return (
    <>
      <Head>
        <title>{`${BRAND} — Company`}</title>
      </Head>
      <main style={{ fontFamily: 'ui-sans-serif, system-ui', padding: 24, lineHeight: 1.6 }}>
        <h1>About {BRAND}</h1>
        <p style={{ color:'#475467', maxWidth: 800 }}>
          {BRAND} builds digital asset infrastructure and wallet onboarding experiences on the XRPL. We support dev/test/main networks, Xumm-based authentication, trustlines, issuer tooling, reporting, and DNS/deployment automation.
        </p>
        <p>
          Looking for the wallet experience? Try <Link href="/connect">Connect</Link> or view <Link href="/status">Status</Link>.
        </p>
      </main>
    </>
  );
}
