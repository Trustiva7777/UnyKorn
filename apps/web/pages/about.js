export default function About() {
  const BRAND = process.env.NEXT_PUBLIC_BRAND || 'XRPL Demo';
  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui', lineHeight: 1.5 }}>
      <h1>About</h1>
      <p>{BRAND} is a minimal, self-hosted site to demonstrate XRPL onboarding with Xumm, devnet faucet, trustlines, and status.</p>
      <p style={{ marginTop: 16 }}>
        <a href="/join">Join</a> · <a href="/status">Status</a> · <a href="/">Home</a>
      </p>
    </main>
  );
}
