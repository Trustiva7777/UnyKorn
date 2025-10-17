import { useEffect, useState } from 'react';

export default function Invitations() {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('ops');
  const [list, setList] = useState([]);
  const [creating, setCreating] = useState(false);
  const [msg, setMsg] = useState('');

  const load = async () => {
    try {
      const r = await fetch('http://localhost:4000/invitations');
      const j = await r.json();
      setList(Array.isArray(j) ? j : []);
    } catch {
      setList([]);
    }
  };
  useEffect(() => { load(); }, []);

  const createInvite = async () => {
    setCreating(true);
    setMsg('');
    try {
      const r = await fetch('http://localhost:4000/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      const j = await r.json();
      if (j.error) throw new Error(j.error);
      setMsg('Invite created.');
      setEmail('');
      await load();
    } catch (e) {
      setMsg(e.message || 'Failed to create invite');
    } finally {
      setCreating(false);
    }
  };

  return (
    <main style={{padding:24, fontFamily:'ui-sans-serif, system-ui'}}>
      <h1>Invitations</h1>
      <p>Create an invitation and share the link with the teammate.</p>
      <div style={{display:'grid', gap:10, maxWidth:480}}>
        <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
        <select value={role} onChange={e=>setRole(e.target.value)}>
          <option value="founder">founder</option>
          <option value="ops">ops</option>
          <option value="finance">finance</option>
          <option value="legal">legal</option>
          <option value="sales">sales</option>
          <option value="engineering">engineering</option>
          <option value="design">design</option>
        </select>
        <button onClick={createInvite} disabled={creating || !email.includes('@')}>
          {creating ? 'Creating…' : 'Create Invite'}
        </button>
        {msg && <p>{msg}</p>}
      </div>

      <h2 style={{marginTop:24}}>Recent Invites</h2>
      <table style={{borderCollapse:'collapse', width:'100%', maxWidth:900}}>
        <thead>
          <tr>
            <th align="left">Email</th>
            <th align="left">Role</th>
            <th align="left">Link</th>
            <th align="left">Status</th>
            <th align="left">Created</th>
          </tr>
        </thead>
        <tbody>
          {list.map((i) => (
            <tr key={i.id}>
              <td>{i.email}</td>
              <td>{i.role}</td>
              <td><a href={`http://localhost:3000/invite/${i.token}`} target="_blank" rel="noreferrer">open</a></td>
              <td>{i.consumedAt ? 'used' : 'pending'}</td>
              <td>{new Date(i.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{marginTop:24}}><a href="/">← Back</a></p>
    </main>
  );
}
