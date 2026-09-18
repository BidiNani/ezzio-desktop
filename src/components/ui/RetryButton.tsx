import React from 'react';

interface Props {
  onRetry: () => void;
  message?: string;
  retrying?: boolean;
}

export function RetryButton({ onRetry, message = 'Une erreur est survenue', retrying = false }: Props) {
  return (
    <div style={{
      padding: 16, background: 'var(--bg-card)',
      border: '1px solid color-mix(in srgb, var(--status-error) 40%, transparent)',
      borderRadius: 8, display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', gap: 12,
    }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--status-error)', marginBottom: 4 }}>
          {message}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
          Vérifie que le backend tourne sur {`http://127.0.0.1:8001`}
        </div>
      </div>
      <button
        onClick={onRetry}
        disabled={retrying}
        style={{
          padding: '8px 16px', borderRadius: 6, fontSize: 12, fontWeight: 600,
          cursor: retrying ? 'wait' : 'pointer', border: 'none',
          background: 'var(--accent-blue)', color: '#fff',
        }}
      >
        {retrying ? 'Nouvel essai…' : 'Réessayer'}
      </button>
    </div>
  );
}