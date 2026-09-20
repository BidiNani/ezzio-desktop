import { useState } from 'react';

type KillResult = { ok: boolean; error?: string; [key: string]: unknown };

const API = 'http://127.0.0.1:8001';

export function KillSwitchScreen() {
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<KillResult | null>(null);

  const trigger = async () => {
    if (confirm !== 'ARRÊTER') return;
    setLoading(true);
    try {
      const r = await fetch(`${API}/api/kill`, { method: 'POST' });
      const d = await r.json();
      setResult(d);
    } catch (e: unknown) {
      setResult({ ok: false, error: e instanceof Error ? e.message : String(e) });
    } finally {
      setLoading(false);
      setConfirm('');
    }
  };

  return (
    <div style={{ padding: 24, maxWidth: 700, margin: '0 auto' }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 8, color: 'var(--status-error)' }}>
        ⚠️ Kill Switch
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
        Cette action enregistre une demande d'arrêt d'urgence. Toutes les opérations en cours
        peuvent être interrompues. Un superviseur externe peut réagir à cet événement.
      </p>

      <div style={{ background: 'var(--bg-card)', padding: 20, borderRadius: 8, border: '2px solid var(--status-error)' }}>
        <div style={{ fontSize: 13, marginBottom: 12, color: 'var(--text-primary)' }}>
          Tapez <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--status-error)' }}>ARRÊTER</strong> pour confirmer :
        </div>
        <input type="text" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          placeholder="ARRÊTER"
          className="input-field"
          style={{ width: '100%', marginBottom: 16, fontFamily: 'var(--font-mono)', textAlign: 'center' }} />
        <button
          onClick={trigger}
          disabled={confirm !== 'ARRÊTER' || loading}
          style={{
            width: '100%', padding: '12px 16px',
            background: confirm === 'ARRÊTER' ? 'var(--status-error)' : 'var(--bg-secondary)',
            color: confirm === 'ARRÊTER' ? '#fff' : 'var(--text-muted)',
            border: 'none', borderRadius: 6, cursor: confirm === 'ARRÊTER' ? 'pointer' : 'not-allowed',
            fontWeight: 600, fontSize: 14
          }}
        >
          {loading ? 'Envoi…' : '⛔ Déclencher le kill switch'}
        </button>
      </div>

      {result && (
        <div style={{ marginTop: 16, padding: 12, background: 'var(--bg-card)', borderRadius: 6, border: '1px solid var(--border-subtle)' }}>
          <pre style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: result.ok ? 'var(--status-running)' : 'var(--status-error)' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}