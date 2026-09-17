import React from 'react';
import { ApprovalRequest } from '../../types';
import { Shield, AlertTriangle, Check, X } from 'lucide-react';

interface ApprovalsScreenProps {
  approvals: ApprovalRequest[];
  onApprove: (id: string) => Promise<void>;
  onReject: (id: string) => Promise<void>;
}

export const ApprovalsScreen: React.FC<ApprovalsScreenProps> = ({
  approvals,
  onApprove,
  onReject,
}) => {
  return (
    <div style={{ padding: '24px 16px', maxWidth: 850, margin: '0 auto', width: '100%' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 20,
          gap: 12,
        }}
      >
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: '0 0 4px', color: 'var(--text-primary)' }}>
            Approbations Human-in-the-Loop
          </h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0 }}>
            Actions sensibles nécessitant l'accord explicite d'un opérateur
          </p>
        </div>

        <span
          style={{
            padding: '4px 12px',
            borderRadius: 'var(--radius-sm)',
            fontSize: 12,
            fontFamily: 'var(--font-mono)',
            background: approvals.length > 0
              ? 'color-mix(in srgb, var(--status-pending) 20%, transparent)'
              : 'color-mix(in srgb, var(--status-running) 20%, transparent)',
            color: approvals.length > 0 ? 'var(--status-pending)' : 'var(--status-running)',
            border: `1px solid ${
              approvals.length > 0
                ? 'color-mix(in srgb, var(--status-pending) 40%, transparent)'
                : 'color-mix(in srgb, var(--status-running) 40%, transparent)'
            }`,
            fontWeight: 600,
          }}
        >
          {approvals.length} EN ATTENTE
        </span>
      </div>

      {approvals.length === 0 ? (
        <div
          style={{
            padding: 48,
            textAlign: 'center',
            background: 'var(--bg-card)',
            borderRadius: 'var(--radius-md)',
            border: '1px dashed var(--border-subtle)',
          }}
        >
          <Shield
            style={{
              width: 40,
              height: 40,
              color: 'var(--status-running)',
              marginBottom: 12,
            }}
          />
          <h3 style={{ fontSize: 16, margin: 0, color: 'var(--text-primary)' }}>
            Aucune approbation en attente
          </h3>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: '6px 0 0' }}>
            Toutes les actions sensibles ont été traitées.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {approvals.map((req) => (
            <div
              key={req.id}
              style={{
                padding: 20,
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                border: '1px solid color-mix(in srgb, var(--status-pending) 40%, transparent)',
                boxShadow: 'var(--shadow-card)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                  marginBottom: 10,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={16} color="var(--status-pending)" />
                  <span
                    style={{
                      fontSize: 12,
                      fontFamily: 'var(--font-mono)',
                      color: 'var(--status-pending)',
                      fontWeight: 600,
                    }}
                  >
                    HITL · {req.missionTitle}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 11,
                    fontFamily: 'var(--font-mono)',
                    color: 'var(--text-muted)',
                  }}
                >
                  {req.id}
                </span>
              </div>

              <p
                style={{
                  fontSize: 14,
                  color: 'var(--text-primary)',
                  margin: '0 0 8px',
                  lineHeight: 1.5,
                  fontWeight: 500,
                }}
              >
                {req.requestedAction}
              </p>

              <p
                style={{
                  fontSize: 13,
                  color: 'var(--text-secondary)',
                  margin: '0 0 16px',
                  lineHeight: 1.5,
                }}
              >
                {req.context}
              </p>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button
                  onClick={() => void onReject(req.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--bg-card-hover)',
                    color: 'var(--status-error)',
                    border: '1px solid color-mix(in srgb, var(--status-error) 30%, transparent)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 500,
                  }}
                >
                  <X size={14} />
                  Rejeter
                </button>

                <button
                  onClick={() => void onApprove(req.id)}
                  style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-sm)',
                    background: 'var(--status-running)',
                    color: '#000',
                    border: 'none',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                  }}
                >
                  <Check size={14} />
                  Approuver
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
