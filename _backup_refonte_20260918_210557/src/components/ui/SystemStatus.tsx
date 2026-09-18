import React from 'react';

interface SystemStatusProps {
  connected: boolean;
  model?: string;
  provider?: string;
  compact?: boolean;
}

export const SystemStatus: React.FC<SystemStatusProps> = ({
  connected,
  model = 'Auto',
  provider = 'E-ZZIO',
  compact = false,
}) => {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        padding: compact ? '2px 8px' : '4px 10px',
        borderRadius: '20px',
        fontSize: compact ? '11px' : '12px',
        fontFamily: 'var(--font-mono)',
        background: connected
          ? 'color-mix(in srgb, var(--status-running) 12%, transparent)'
          : 'color-mix(in srgb, var(--status-error) 12%, transparent)',
        color: connected ? 'var(--status-running)' : 'var(--status-error)',
        border: `1px solid ${
          connected
            ? 'color-mix(in srgb, var(--status-running) 30%, transparent)'
            : 'color-mix(in srgb, var(--status-error) 30%, transparent)'
        }`,
      }}
    >
      <span
        style={{
          width: 7,
          height: 7,
          borderRadius: '50%',
          background: connected ? 'var(--status-running)' : 'var(--status-error)',
          animation: connected ? 'pulse-dot 2s infinite' : 'none',
        }}
      />
      <span>
        {connected ? `${model} · ${provider} · LIVE` : 'OFFLINE'}
      </span>
    </div>
  );
};
