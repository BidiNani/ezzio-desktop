import React from 'react';
import { Mission } from '../../types';
import { StatusBadge } from './StatusBadge';

interface MissionCardProps {
  mission: Mission;
  onClick?: () => void;
  compact?: boolean;
}

export const MissionCard: React.FC<MissionCardProps> = ({ mission, onClick, compact = false }) => {
  const completed = mission.subtasks.filter((s) => s.completed).length;
  const total = mission.subtasks.length;

  return (
    <div
      onClick={onClick}
      // .card-interactive porte le hover reel (defini en CSS dans tokens.css) -
      // un objet de style inline ne peut pas exprimer :hover en React.
      className={onClick ? 'card-interactive' : undefined}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-md)',
        padding: 'var(--spacing-lg)',
        border: mission.isCritical
          ? '2px solid var(--status-critical)'
          : '1px solid var(--border-subtle)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <h3 style={{ fontSize: compact ? 14 : 16, fontWeight: 600 }}>{mission.title}</h3>
        <StatusBadge status={mission.status} size="sm" />
      </div>

      {!compact && (
        <p
          style={{
            color: 'var(--text-secondary)',
            fontSize: 13,
            marginBottom: 12,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {mission.description}
        </p>
      )}

      <div style={{ marginTop: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>
          <span>Progression</span>
          <span>{Math.round(mission.progress)}%</span>
        </div>
        <div style={{ height: 4, background: 'var(--bg-secondary)', borderRadius: 2, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${Math.min(100, Math.max(0, mission.progress))}%`,
              background: mission.status === 'failed' ? 'var(--status-error)' : 'var(--accent-blue)',
              borderRadius: 2,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {!compact && total > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-muted)' }}>
          {completed}/{total} sous-taches
        </div>
      )}
    </div>
  );
};
