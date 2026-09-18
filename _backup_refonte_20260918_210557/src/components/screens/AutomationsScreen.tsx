import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:8001';
interface Automation { id: string; name: string; schedule: string; command: string; enabled: boolean; }

export function AutomationsScreen() {
  const [items, setItems] = useState<Automation[]>([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newSchedule, setNewSchedule] = useState('0 * * * *');
  const [newCommand, setNewCommand] = useState('');

  const load = async () => {
    try {
      const r = await fetch(`${API}/api/automations`);
      const d = await r.json();
      setItems(d.data || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const create = async () => {
    if (!newName.trim() || !newCommand.trim()) return;
    await fetch(`${API}/api/automations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newName, schedule: newSchedule, command: newCommand, enabled: true }),
    });
    setNewName(''); setNewCommand(''); load();
  };

  const toggle = async (a: Automation) => {
    await fetch(`${API}/api/automations/${a.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !a.enabled }),
    });
    load();
  };

  const remove = async (id: string) => {
    await fetch(`${API}/api/automations/${id}`, { method: 'DELETE' });
    load();
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Automatisations</h2>
      <div style={{ background: 'var(--bg-card)', padding: 16, borderRadius: 8, border: '1px solid var(--border-subtle)', marginBottom: 16 }}>
        <input type="text" placeholder="Nom" value={newName} onChange={(e) => setNewName(e.target.value)}
          className="input-field" style={{ marginBottom: 8, width: '100%' }} />
        <input type="text" placeholder="Schedule (cron)" value={newSchedule} onChange={(e) => setNewSchedule(e.target.value)}
          className="input-field" style={{ marginBottom: 8, width: '100%', fontFamily: 'var(--font-mono)' }} />
        <input type="text" placeholder="Commande" value={newCommand} onChange={(e) => setNewCommand(e.target.value)}
          className="input-field" style={{ marginBottom: 8, width: '100%', fontFamily: 'var(--font-mono)' }} />
        <button onClick={create} className="btn-primary">+ Créer</button>
      </div>
      {loading && <div style={{ opacity: 0.6 }}>Chargement…</div>}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(a => (
          <div key={a.id} style={{ padding: 12, background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{a.name}</div>
                <div style={{ fontSize: 11, opacity: 0.5, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{a.schedule} → {a.command}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => toggle(a)} className="btn-secondary">
                  {a.enabled ? '⏸' : '▶'}
                </button>
                <button onClick={() => remove(a.id)} style={{ background: 'none', border: 'none', color: 'var(--status-error)', cursor: 'pointer', fontSize: 16 }}>×</button>
              </div>
            </div>
          </div>
        ))}
        {!loading && items.length === 0 && <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>Aucune automatisation</div>}
      </div>
    </div>
  );
}