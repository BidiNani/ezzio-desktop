import React from 'react';

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

const STATUS_CONFIG: Record<string, { label: string; color: string; pulse?: boolean }> = {
  running: { label: 'En cours', color: 'var(--status-running)', pulse: true },
  pending: { label: 'A approuver', color: 'var(--status-pending)' },
  completed: { label: 'Terminee', color: 'var(--status-completed)' },
  failed: { label: 'Echouee', color: 'var(--status-error)' },
  paused: { label: 'En pause', color: 'var(--status-offline)' },
  cancelled: { label: 'Annulee', color: 'var(--status-offline)' },
  on_track: { label: 'En bonne voie', color: 'var(--status-running)' },
  at_risk: { label: 'A risque', color: 'var(--status-pending)' },
  delayed: { label: 'Retardee', color: 'var(--status-error)' },
  online: { label: 'En ligne', color: 'var(--status-running)' },
  degraded: { label: 'Degrade', color: 'var(--status-pending)' },
  offline: { label: 'Hors ligne', color: 'var(--status-offline)' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const config = STATUS_CONFIG[status] ?? { label: status, color: 'var(--text-muted)' };
  const padding = size === 'sm' ? '2px 8px' : '4px 12px';
  const fontSize = size === 'sm' ? '10px' : '11px';

  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding,
        borderRadius: '20px',
        fontSize,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        background: `color-mix(in srgb, ${config.color} 15%, transparent)`,
        color: config.color,
        border: `1px solid color-mix(in srgb, ${config.color} 35%, transparent)`,
      }}
    >
      <span
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: config.color,
          animation: config.pulse ? 'pulse-dot 2s infinite' : 'none',
          flexShrink: 0,
        }}
      />
      {config.label}
    </span>
  );
};
