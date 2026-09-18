import { useBackendStatus } from '../../hooks/useBackendStatus';

export function StatusIndicator() {
  const { online, lastCheck, latency } = useBackendStatus(10000);

  const color = online ? 'var(--status-running)' : 'var(--status-error)';
  const label = online ? 'En ligne' : 'Hors ligne';
  const tip = lastCheck
    ? `${label}${latency ? ` · ${latency} ms` : ''} · ${lastCheck.toLocaleTimeString('fr-FR')}`
    : label;

  return (
    <div
      title={tip}
      style={{
        display: 'flex', alignItems: 'center', gap: 6,
        fontSize: 11, color: 'var(--text-muted)',
        padding: '4px 10px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 6,
      }}
    >
      <span
        style={{
          width: 8, height: 8, borderRadius: '50%',
          background: color,
          boxShadow: online ? `0 0 8px ${color}` : 'none',
          transition: 'all 0.3s',
        }}
      />
      <span style={{ fontWeight: 600 }}>{label}</span>
      {online && latency !== null && (
        <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
          {latency}ms
        </span>
      )}
    </div>
  );
}