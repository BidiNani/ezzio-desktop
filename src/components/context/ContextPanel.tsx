import React from 'react';
import { SystemHealth, ServerConfig } from '../../types';
import { Cpu, ShieldCheck, Activity, X, Server } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

interface ContextPanelProps {
  activeModel: string;
  activeProvider: string;
  health: SystemHealth | null;
  serverConfig: ServerConfig;
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
}

export const ContextPanel: React.FC<ContextPanelProps> = ({
  activeModel,
  activeProvider,
  health,
  serverConfig,
  isOpen,
  onClose,
  isMobile,
}) => {
  if (!isOpen) return null;

  const panelStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        background: 'var(--bg-secondary)',
        zIndex: 200,
        padding: 20,
        overflowY: 'auto',
      }
    : {
        width: 280,
        flexShrink: 0,
        background: 'var(--bg-secondary)',
        borderLeft: '1px solid var(--border-subtle)',
        padding: 16,
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        overflowY: 'auto',
      };

  return (
    <aside style={panelStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
          Contexte Workspace
        </h3>
        <button
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            padding: 4,
          }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Active Inference Model */}
      <div
        style={{
          padding: 12,
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>
          Modèle Actuel
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--accent-purple)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Cpu size={14} />
          {activeModel}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
          Provider: {activeProvider}
        </div>
      </div>

      {/* Server & Session Status */}
      <div
        style={{
          padding: 12,
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
          Serveur & Session
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--text-primary)', marginBottom: 4 }}>
          <Server size={14} color="var(--accent-blue)" />
          <span>{serverConfig.address}:{serverConfig.port}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
          <span style={{ color: 'var(--text-muted)' }}>État:</span>
          <StatusBadge status={serverConfig.connected ? 'online' : 'offline'} size="sm" />
        </div>
      </div>

      {/* Security & Audit */}
      <div
        style={{
          padding: 12,
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 6 }}>
          Sécurité & Conformité
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--status-running)' }}>
          <ShieldCheck size={14} />
          Audit Ledger Cryptographique
        </div>
      </div>

      {/* Providers Health Overview */}
      {health && (
        <div
          style={{
            padding: 12,
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', fontFamily: 'var(--font-mono)', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Activity size={12} />
            Providers Invocables ({health.providers.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {health.providers.map((p) => (
              <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                <span style={{ color: 'var(--text-secondary)' }}>{p.name}</span>
                <span style={{ fontFamily: 'var(--font-mono)', color: p.status === 'online' ? 'var(--status-running)' : 'var(--status-error)' }}>
                  {p.latencyMs ? `${p.latencyMs}ms` : p.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </aside>
  );
};