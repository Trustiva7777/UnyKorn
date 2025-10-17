export default function AdminHome() {
  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>Admin</h1>
      <section>
        <h2>Invitations</h2>
        <p><a href="/invitations">Create &amp; manage invites</a></p>
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Finance</h2>
        <p><a href="/finance">XRPL wallets, faucet, trustlines</a></p>
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Issuer & Tokens</h2>
        <p><a href="/issuer">Issuer Setup</a> · <a href="/tokens">Currencies</a> · <a href="/trustlines">Trustlines</a> · <a href="/holders">Holders</a></p>
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>DEX</h2>
        <p><a href="/dex">Quotes & Offers</a></p>
      </section>
      <section style={{ marginTop: 24 }}>
        <h2>Onboarding</h2>
        <p><a href="/onboard">Connect Wallet (Xumm)</a></p>
      </section>
      <p style={{ marginTop: 24 }}>
        <a href="http://localhost:3000" target="_blank" rel="noreferrer">Open Web</a>
      </p>
    </main>
  );
}
