import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function InviteAccept() {
  const router = useRouter();
  const { token } = router.query;
  const [name, setName] = useState('');
  const [msg, setMsg] = useState('');
  const [accepted, setAccepted] = useState(null);

  async function accept() {
    setMsg('Accepting invite...');
    try {
      const r = await fetch(`${API_BASE}/invitations/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name })
      });
      const j = await r.json();
      if (j.error) throw new Error(j.error);
      setAccepted(j);
      setMsg('Accepted. Provisioning...');
      // Auto-provision agent+wallet using user email as id
      if (j.user?.email) {
        await fetch(`${API_BASE}/provision`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: j.user.email, role: j.user.role || 'Member' })
        });
      }
      setMsg('Done. Welcome aboard!');
    } catch (e) {
      setMsg(e.message || 'Failed');
    }
  }

  useEffect(() => {
    if (!token) return;
  }, [token]);

  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>Accept Invitation</h1>
      <p>Token: {token}</p>
      <div style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <input placeholder="Your Name" value={name} onChange={e=>setName(e.target.value)} />
        <button onClick={accept} disabled={!name || !token}>Accept</button>
        {msg && <p>{msg}</p>}
      </div>
      {accepted && (
        <pre style={{ background: '#f6f6f6', padding: 12, marginTop: 16 }}>
{JSON.stringify(accepted, null, 2)}
        </pre>
      )}
    </main>
  );
}
