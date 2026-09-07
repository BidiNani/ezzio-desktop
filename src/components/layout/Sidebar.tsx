import React from 'react';
import { MessageCircle, ListChecks, ShieldCheck, Target, Activity, Settings, Square } from 'lucide-react';

interface SidebarProps {
  active: string;
  onNavigate: (tab: string) => void;
  pendingApprovals: number;
  onKillSwitch: () => void;
}

const NAV_ITEMS = [
  { id: 'chat', label: 'Chat', icon: MessageCircle },
  { id: 'missions', label: 'Missions', icon: ListChecks },
  { id: 'approvals', label: 'Approbations', icon: ShieldCheck },
  { id: 'goals', label: 'Objectifs', icon: Target },
  { id: 'health', label: 'Sante', icon: Activity },
  { id: 'settings', label: 'Reglages', icon: Settings },
];

export const Sidebar: React.FC<SidebarProps> = ({ active, onNavigate, pendingApprovals, onKillSwitch }) => (
  <nav
    style={{
      width: 200,
      flexShrink: 0,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-subtle)',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 12px',
      gap: 2,
    }}
  >
    <div style={{ fontWeight: 700, fontSize: 16, padding: '0 8px 16px', marginBottom: 8, borderBottom: '1px solid var(--border-subtle)' }}>
      E-zzio
    </div>

    {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
      <button
        key={id}
        onClick={() => onNavigate(id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '8px 10px',
          borderRadius: 'var(--radius-sm)',
          border: 'none',
          background: active === id ? 'var(--bg-card)' : 'transparent',
          color: active === id ? 'var(--text-primary)' : 'var(--text-secondary)',
          cursor: 'pointer',
          textAlign: 'left',
          fontSize: 13,
        }}
      >
        <Icon size={16} aria-hidden="true" />
        <span>{label}</span>
        {id === 'approvals' && pendingApprovals > 0 && (
          <span
            style={{
              marginLeft: 'auto',
              fontSize: 11,
              background: 'color-mix(in srgb, var(--status-pending) 20%, transparent)',
              color: 'var(--status-pending)',
              padding: '1px 6px',
              borderRadius: 8,
            }}
          >
            {pendingApprovals}
          </span>
        )}
      </button>
    ))}

    <button
      onClick={onKillSwitch}
      style={{
        marginTop: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '8px 10px',
        borderRadius: 'var(--radius-sm)',
        border: 'none',
        background: 'transparent',
        color: 'var(--status-error)',
        cursor: 'pointer',
        fontSize: 13,
        fontWeight: 500,
      }}
    >
      <Square size={16} aria-hidden="true" />
      Kill switch
    </button>
  </nav>
);
