import { useState } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:4000';

export default function Users() {
  const [userId, setUserId] = useState('alice');
  const [role, setRole] = useState('Ops');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function provision(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch(`${API_BASE}/provision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Request failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ fontFamily: 'sans-serif', padding: 24 }}>
      <h1>Users</h1>
      <form onSubmit={provision} style={{ display: 'grid', gap: 8, maxWidth: 420 }}>
        <label>
          User ID
          <input value={userId} onChange={(e) => setUserId(e.target.value)} required />
        </label>
        <label>
          Role
          <input value={role} onChange={(e) => setRole(e.target.value)} />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Provisioning…' : 'Provision'}
        </button>
      </form>

      {error && (
        <p style={{ color: 'crimson' }}>Error: {error}</p>
      )}

      {result && (
        <pre style={{ background: '#f6f6f6', padding: 12, marginTop: 16 }}>
{JSON.stringify(result, null, 2)}
        </pre>
      )}
    </main>
  );
}
