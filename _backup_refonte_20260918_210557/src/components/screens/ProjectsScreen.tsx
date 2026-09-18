import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:8001';
interface Project { id: string; name: string; path: string; status: string; auto?: boolean; }

export function ProjectsScreen() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');

  const load = async () => {
    try {
      const r = await fetch(`${API}/api/projects`);
      const d = await r.json();
      setProjects(d.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!newName.trim()) return;
    await fetch(`${API}/api/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, status: 'active' }),
    });
    setNewName(''); load();
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Projets</h2>
      <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 8, border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
        <input type="text" placeholder="Nom du projet" value={newName}
          onChange={(e) => setNewName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && create()}
          className="input-field" style={{ marginBottom: 8, width: '100%' }} />
        <button onClick={create} className="btn-primary">+ Ajouter</button>
      </div>
      {loading && <div style={{ opacity: 0.6 }}>Chargement…</div>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
        {projects.map(p => (
          <div key={p.id} style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{p.name}</div>
            {p.path && <div style={{ fontSize: 11, opacity: 0.5, marginTop: 4, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{p.path}</div>}
            <div style={{ fontSize: 11, marginTop: 8 }}>
              <span style={{ color: p.status === 'active' ? 'var(--status-running)' : 'var(--text-muted)' }}>● {p.status}</span>
              {p.auto && <span style={{ marginLeft: 8, opacity: 0.5 }}>auto</span>}
            </div>
          </div>
        ))}
        {!loading && projects.length === 0 && <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>Aucun projet</div>}
      </div>
    </div>
  );
}