import { useState, useEffect } from 'react';

const API = 'http://127.0.0.1:8001';

interface Approval {
  id: string;
  title?: string;
  description?: string;
  status: string;
  decision?: string;
  created_at: string;
}

export function ApprovalsScreen() {
  const [items, setItems] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const r = await fetch(`${API}/api/approvals`);
    const d = await r.json();
    setItems(d.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const decide = async (id: string, decision: string) => {
    await fetch(`${API}/api/approvals/${id}/decide`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ decision }),
    });
    load();
  };

  return (
    <div style={{ padding: 24, maxWidth: 900, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 16 }}>Approbations</h2>

      {loading && <div style={{ opacity: 0.6 }}>Chargement…</div>}

      {!loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: 40, opacity: 0.5 }}>
          Aucune action en attente d'approbation
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items.map(a => (
          <div key={a.id} style={{ padding: 16, background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>{a.title || 'Action'}</div>
            {a.description && <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 12 }}>{a.description}</div>}
            {a.status === 'decided' ? (
              <div style={{ fontSize: 12, color: a.decision === 'approve' ? 'var(--status-running)' : 'var(--status-error)' }}>
                {a.decision === 'approve' ? '✓ Approuvé' : '✗ Refusé'}
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => decide(a.id, 'approve')} className="btn-primary">✓ Approuver</button>
                <button onClick={() => decide(a.id, 'reject')} className="btn-secondary">✗ Refuser</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}