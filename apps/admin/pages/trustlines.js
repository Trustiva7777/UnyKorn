import { useEffect, useState } from 'react';

export default function Trustlines() {
  const [pending, setPending] = useState([]);

  const load = async () => setPending(await (await fetch('http://localhost:4000/trustlines/requests?status=pending')).json());
  useEffect(() => { load(); }, []);

  const decide = async (id, decision) => {
    await fetch('http://localhost:4000/trustlines/' + id + '/approve', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision })
    });
    load();
  };

  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>Trustline Requests</h1>
      <table style={{ borderCollapse: 'collapse', width: '100%', maxWidth: 1000 }}>
        <thead>
          <tr><th align="left">Token</th><th align="left">Address</th><th align="left">Space</th><th align="left">Note</th><th></th></tr>
        </thead>
        <tbody>
          {pending.map(p => (
            <tr key={p.id}>
              <td>{p.token?.code}</td>
              <td style={{ fontFamily: 'monospace' }}>{p.address}</td>
              <td>{p.spaceId}</td>
              <td>{p.note || ''}</td>
              <td>
                <button onClick={() => decide(p.id, 'approved')}>Approve</button>{' '}
                <button onClick={() => decide(p.id, 'rejected')}>Reject</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p style={{ marginTop: 24 }}><a href="/">← Back</a></p>
    </main>
  );
}
