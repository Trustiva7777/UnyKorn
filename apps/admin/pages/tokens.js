import { useEffect, useState } from 'react';

export default function Tokens() {
  const [list, setList] = useState([]);
  const [code, setCode] = useState('UNY');
  const [name, setName] = useState('Unykorn Token');

  const load = async () => setList(await (await fetch('http://localhost:4000/tokens')).json());
  useEffect(() => { load(); }, []);

  const create = async () => {
    await fetch('http://localhost:4000/tokens', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code, name })
    });
    load();
  };

  return (
    <main style={{ padding: 24, fontFamily: 'ui-sans-serif, system-ui' }}>
      <h1>Tokens</h1>
      <div style={{ display: 'flex', gap: 8 }}>
        <input value={code} onChange={e => setCode(e.target.value)} placeholder="Code (e.g., UNY)" />
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
        <button onClick={create}>Add</button>
      </div>
      <ul>
        {list.map(t => (
          <li key={t.id}>{t.code} — {t.name} (issuer {t.issuer?.coldAddress?.slice(0, 8)}…)</li>
        ))}
      </ul>
    </main>
  );
}
