import '../styles/globals.css';
import Link from 'next/link';
import IssuerQuickCopy from '../components/IssuerQuickCopy';

export default function App({ Component, pageProps }) {
  const BRAND = process.env.NEXT_PUBLIC_BRAND || 'XRPL Demo';
  const NET = process.env.NEXT_PUBLIC_NETWORK_LABEL || '';
  const HIDE_CHECK = String(process.env.NEXT_PUBLIC_HIDE_CHECK_NAV || '').toLowerCase() === 'true';
  return (
    <>
      <header className="site-header">
        <div className="container">
          <div className="brand">
            <Link href="/">{BRAND}</Link>
            {NET ? <span className="badge">{NET}</span> : null}
          </div>
          <nav>
            <Link href="/connect">Connect</Link>
            <Link href="/onboard">Onboard</Link>
            <Link href="/wallet">Wallet</Link>
            <Link href="/company">Company</Link>
            <Link href="/products">Products</Link>
            <Link href="/join">Join</Link>
            <Link href="/status">Status</Link>
            <Link href="/fund">Fund</Link>
            {!HIDE_CHECK && <Link href="/check">Check</Link>}
          </nav>
          <div style={{ marginLeft:'auto' }}>
            <IssuerQuickCopy />
          </div>
        </div>
      </header>
      <Component {...pageProps} />
      <footer className="site-footer">
        <div className="container">© {new Date().getFullYear()} {BRAND}</div>
      </footer>
    </>
  );
}
