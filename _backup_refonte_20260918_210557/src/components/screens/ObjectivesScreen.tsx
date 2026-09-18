import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:8001';
interface Objective { id: string; title: string; key_results: string[]; progress: number; created_at: string; }

export function ObjectivesScreen() {
  const [items, setItems] = useState<Objective[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTitle, setNewTitle] = useState('');

  const load = async () => {
    try {
      const r = await fetch(`${API}/api/objectives`);
      const d = await r.json();
      setItems(d.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!newTitle.trim()) return;
    await fetch(`${API}/api/objectives`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle, key_results: [], progress: 0 }),
    });
    setNewTitle(''); load();
  };

  const remove = async (id: string) => {
    await fetch(`${API}/api/objectives/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Objectifs</h2>
      <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 8, border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
        <input type="text" placeholder="Titre de l'objectif (OKR)" value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && create()}
          className="input-field" style={{ marginBottom: 8, width: '100%' }} />
        <button onClick={create} className="btn-primary">+ Créer l'objectif</button>
      </div>
      {loading && <div style={{ opacity: 0.6 }}>Chargement…</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(o => (
          <div key={o.id} style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{o.title}</div>
              <button onClick={() => remove(o.id)} style={{ background: 'none', border: 'none', color: 'var(--status-error)', cursor: 'pointer', fontSize: 16 }}>×</button>
            </div>
            <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4, color: 'var(--text-secondary)' }}>Progression : {o.progress}%</div>
          </div>
        ))}
        {!loading && items.length === 0 && <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>Aucun objectif</div>}
      </div>
    </div>
  );
}