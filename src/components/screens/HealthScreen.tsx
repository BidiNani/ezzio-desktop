import React from 'react';
import { SystemHealth } from '../../types';
import { Cpu, ShieldAlert, CheckCircle2, RefreshCw } from 'lucide-react';
import { StatusBadge } from '../ui/StatusBadge';

interface HealthScreenProps {
  health: SystemHealth | null;
  connected: boolean;
  onRefresh?: () => void;
}

export const HealthScreen: React.FC<HealthScreenProps> = ({
  health,
  connected,
  onRefresh,
}) => {
  return (
    <div style={{ padding: '24px 16px', maxWidth: 900, margin: '0 auto', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            Santé & Diagnostic Système
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Fédération des modèles, audit ledger et risques détectés
          </p>
        </div>

        {onRefresh && (
          <button
            onClick={onRefresh}
            className="btn-secondary"
            title="Rafraîchir l'état du système"
          >
            <RefreshCw size={14} />
            Rafraîchir
          </button>
        )}
      </div>

      {!connected && (
        <div
          style={{
            padding: 16,
            borderRadius: 'var(--radius-md)',
            background: 'color-mix(in srgb, var(--status-error) 15%, transparent)',
            border: '1px solid var(--status-error)',
            color: 'var(--status-error)',
            marginBottom: 20,
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <ShieldAlert size={18} />
          Le backend E-ZZIO est hors ligne ou inaccessible sur le port configuré.
        </div>
      )}

      {health && (
        <>
          {/* Summary Cards */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 14,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                padding: 16,
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                World Model
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--status-running)',
                  marginTop: 4,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <CheckCircle2 size={16} />
                {health.worldModelFreshness.toUpperCase()}
              </div>
            </div>

            <div
              style={{
                padding: 16,
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Providers Surveillés
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: 'var(--accent-blue)',
                  marginTop: 4,
                }}
              >
                {health.providers.length} actifs
              </div>
            </div>

            <div
              style={{
                padding: 16,
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-muted)',
                  textTransform: 'uppercase',
                  fontFamily: 'var(--font-mono)',
                }}
              >
                Risques Système
              </div>
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: health.risks.length > 0 ? 'var(--status-pending)' : 'var(--status-running)',
                  marginTop: 4,
                }}
              >
                {health.risks.length} détecté(s)
              </div>
            </div>
          </div>

          {/* Providers List */}
          <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
            Fédération des Modèles & Providers
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {health.providers.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: 12 }}>
                Aucun provider rapporté par l'API.
              </div>
            ) : (
              health.providers.map((p) => (
                <div
                  key={p.name}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '12px 16px',
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Cpu size={16} color="var(--text-secondary)" />
                    <span style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 500 }}>
                      {p.name}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {p.latencyMs !== undefined && (
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--accent-blue)' }}>
                        {p.latencyMs} ms
                      </span>
                    )}
                    <StatusBadge status={p.status} size="sm" />
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Risks Section if any */}
          {health.risks.length > 0 && (
            <div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 12 }}>
                Avertissements & Risques
              </h3>
              {health.risks.map((risk) => (
                <div
                  key={risk.id}
                  style={{
                    padding: 14,
                    background: 'var(--bg-card)',
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid color-mix(in srgb, var(--status-pending) 40%, transparent)',
                    marginBottom: 10,
                  }}
                >
                  <div style={{ fontSize: 11, color: 'var(--status-pending)', fontFamily: 'var(--font-mono)', fontWeight: 600 }}>
                    SEV={risk.severity.toUpperCase()}
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-primary)', marginTop: 4 }}>
                    {risk.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};
